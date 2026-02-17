import { FocusArea, ReviewResult, Config } from '../types';

/**
 * Base interface for AI providers
 */
export interface AIProvider {
  name: string;
  review(diff: string, focusAreas: FocusArea[], model: string): Promise<ReviewResult>;
}

/**
 * Get provider instance by name
 */
export async function getProvider(config: Config): Promise<AIProvider> {
  const name = config.provider;
  const providerConfig = config.providers[name];

  if (!providerConfig) {
    throw new Error(`No configuration found for provider: ${name}`);
  }

  switch (name.toLowerCase()) {
    case 'openai':
      const { OpenAIProvider } = await import('./openai');
      if ('apiKey' in providerConfig) {
        return new OpenAIProvider(providerConfig.apiKey);
      }
      throw new Error('OpenAI provider requires apiKey');

    case 'anthropic':
      const { AnthropicProvider } = await import('./anthropic');
      if ('apiKey' in providerConfig) {
        return new AnthropicProvider(providerConfig.apiKey);
      }
      throw new Error('Anthropic provider requires apiKey');

    case 'openrouter':
      const { OpenRouterProvider } = await import('./openrouter');
      if ('apiKey' in providerConfig) {
        return new OpenRouterProvider(providerConfig.apiKey);
      }
      throw new Error('OpenRouter provider requires apiKey');

    case 'ollama':
      const { OllamaProvider } = await import('./ollama');
      const baseUrl = 'baseUrl' in providerConfig ? providerConfig.baseUrl : undefined;
      return new OllamaProvider(baseUrl);

    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}
