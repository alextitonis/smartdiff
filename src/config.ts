import { cosmiconfig } from 'cosmiconfig';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Config, ProviderName, FocusArea, OutputType } from './types';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'smartdiff');
const GLOBAL_CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

export const DEFAULT_CONFIG: Partial<Config> = {
  provider: 'openai',
  model: 'gpt-4',
  focus: ['bugs', 'security'],
  output: 'terminal',
  providers: {}
};

/**
 * Load global configuration from ~/.config/smartdiff/config.json
 */
export async function loadGlobalConfig(): Promise<Partial<Config>> {
  try {
    if (fs.existsSync(GLOBAL_CONFIG_PATH)) {
      const content = fs.readFileSync(GLOBAL_CONFIG_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('Warning: Could not load global config:', (error as Error).message);
  }
  return {};
}

/**
 * Load project configuration from .smartdiff.json or similar
 */
export async function loadProjectConfig(): Promise<Partial<Config>> {
  const explorer = cosmiconfig('smartdiff');
  try {
    const result = await explorer.search();
    if (result && !result.isEmpty) {
      return result.config;
    }
  } catch (error) {
    console.warn('Warning: Could not load project config:', (error as Error).message);
  }
  return {};
}

/**
 * Merge configs with priority: CLI options > Project config > Global config > Defaults
 */
export async function loadConfig(cliOptions: Partial<Config> = {}): Promise<Config> {
  const globalConfig = await loadGlobalConfig();
  const projectConfig = await loadProjectConfig();

  // Filter out undefined values from cliOptions to prevent overwriting
  const cleanCliOptions = Object.fromEntries(
    Object.entries(cliOptions).filter(([_, v]) => v !== undefined)
  );

  const merged = {
    ...DEFAULT_CONFIG,
    ...globalConfig,
    ...projectConfig,
    ...cleanCliOptions,
    // Merge providers separately to avoid overwriting
    providers: {
      ...DEFAULT_CONFIG.providers,
      ...globalConfig.providers,
      ...projectConfig.providers,
      ...(cliOptions.providers || {}),
    }
  };

  return validateConfig(merged);
}

/**
 * Validate configuration
 */
function validateConfig(config: Partial<Config>): Config {
  // Check if config is completely empty - user needs to run init
  if (!config.provider && !config.providers?.openai && !config.providers?.anthropic && !config.providers?.openrouter && !config.providers?.ollama) {
    throw new Error('Configuration not found. Run "smartdiff init" to set up your API keys and preferences.');
  }

  if (!config.provider) {
    throw new Error('Provider is required');
  }

  if (!config.model) {
    throw new Error('Model is required');
  }

  if (!config.focus || config.focus.length === 0) {
    throw new Error('At least one focus area is required');
  }

  if (!config.output) {
    throw new Error('Output type is required');
  }

  // Validate API key for selected provider (except ollama which doesn't need one)
  const providerConfig = config.providers?.[config.provider];
  if (!providerConfig) {
    throw new Error(
      `No configuration found for provider "${config.provider}". Run "smartdiff init" to set it up.`
    );
  }

  // Check API key for providers that need it
  if (config.provider !== 'ollama' && !('apiKey' in providerConfig && providerConfig.apiKey)) {
    throw new Error(
      `API key not found for provider "${config.provider}". Run "smartdiff init" to set it up.`
    );
  }

  return config as Config;
}

/**
 * Save global configuration
 */
export function saveGlobalConfig(config: Partial<Config>): void {
  // Ensure config directory exists
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Update API key for a provider
 */
export async function updateApiKey(provider: ProviderName, apiKey: string): Promise<void> {
  const globalConfig = await loadGlobalConfig();

  const updated: Partial<Config> = {
    ...globalConfig,
    providers: {
      ...globalConfig.providers,
      [provider]: { apiKey }
    }
  };

  saveGlobalConfig(updated);
}

/**
 * Parse focus areas from comma-separated string
 */
export function parseFocusAreas(focusString?: string): FocusArea[] | undefined {
  if (!focusString) return undefined;

  const validFocusAreas: FocusArea[] = ['bugs', 'security', 'performance', 'style', 'suggestions', 'explanations'];
  const areas = focusString.split(',').map(s => s.trim().toLowerCase());

  const parsed = areas.filter(area =>
    validFocusAreas.includes(area as FocusArea)
  ) as FocusArea[];

  if (parsed.length === 0) {
    throw new Error(`Invalid focus areas: ${focusString}. Valid options: ${validFocusAreas.join(', ')}`);
  }

  return parsed;
}

/**
 * Display current configuration
 */
export async function showConfig(): Promise<void> {
  const globalConfig = await loadGlobalConfig();
  const projectConfig = await loadProjectConfig();

  console.log('\n=== Global Config ===');
  console.log(`Location: ${GLOBAL_CONFIG_PATH}`);
  console.log(JSON.stringify(sanitizeConfig(globalConfig), null, 2));

  console.log('\n=== Project Config ===');
  console.log(JSON.stringify(sanitizeConfig(projectConfig), null, 2));

  console.log('\n=== Merged Config ===');
  try {
    const merged = await loadConfig();
    console.log(JSON.stringify(sanitizeConfig(merged), null, 2));
  } catch (error) {
    console.error('Error loading merged config:', (error as Error).message);
  }
}

/**
 * Remove sensitive data from config for display
 */
function sanitizeConfig(config: Partial<Config>): any {
  const sanitized = { ...config };
  if (sanitized.providers) {
    sanitized.providers = Object.entries(sanitized.providers).reduce((acc, [key, value]) => {
      if ('apiKey' in value && value.apiKey) {
        acc[key] = {
          apiKey: '***' + value.apiKey.slice(-4)
        };
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
  }
  return sanitized;
}
