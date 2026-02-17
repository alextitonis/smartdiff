import * as readline from 'readline';
import { saveGlobalConfig } from './config';
import { Config, ProviderName, FocusArea } from './types';
import chalk from 'chalk';

/**
 * Interactive initialization
 */
export async function initConfig(): Promise<void> {
  console.log(chalk.bold('\n🚀 AI Code Review - Setup\n'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  try {
    // Choose provider
    console.log(chalk.cyan('Which AI provider do you want to use?'));
    console.log('  1. OpenAI (GPT-4, GPT-3.5) - Most popular');
    console.log('  2. Anthropic (Claude) - Great for code');
    console.log('  3. OpenRouter - Access to many models');
    console.log('  4. Ollama - Free local models (requires Ollama installed)');
    const providerChoice = await question(chalk.yellow('\nEnter 1, 2, 3, or 4: '));

    let provider: ProviderName;
    let defaultModel: string;
    let apiKey = '';

    if (providerChoice === '2') {
      provider = 'anthropic';
      defaultModel = 'claude-3-5-sonnet-20241022';
      console.log(chalk.cyan('\nEnter your Anthropic API key:'));
      console.log(chalk.dim('(Get one from https://console.anthropic.com)'));
      apiKey = await question(chalk.yellow('API Key: '));
    } else if (providerChoice === '3') {
      provider = 'openrouter';
      defaultModel = 'anthropic/claude-3.5-sonnet';
      console.log(chalk.cyan('\nEnter your OpenRouter API key:'));
      console.log(chalk.dim('(Get one from https://openrouter.ai/keys)'));
      apiKey = await question(chalk.yellow('API Key: '));
    } else if (providerChoice === '4') {
      provider = 'ollama';
      defaultModel = 'llama2';
      console.log(chalk.cyan('\nUsing Ollama (local models - free!)'));
      console.log(chalk.dim('Make sure Ollama is installed and running:'));
      console.log(chalk.dim('  1. Install: https://ollama.ai'));
      console.log(chalk.dim('  2. Run: ollama serve'));
      console.log(chalk.dim('  3. Pull a model: ollama pull llama2'));
      apiKey = ''; // Ollama doesn't need an API key
    } else {
      provider = 'openai';
      defaultModel = 'gpt-4';
      console.log(chalk.cyan('\nEnter your OpenAI API key:'));
      console.log(chalk.dim('(Get one from https://platform.openai.com)'));
      apiKey = await question(chalk.yellow('API Key: '));
    }

    if (provider !== 'ollama' && (!apiKey || apiKey.trim().length === 0)) {
      throw new Error('API key is required');
    }

    // Choose model
    console.log(chalk.cyan('\nWhich model do you want to use?'));
    if (provider === 'openai') {
      console.log('  1. gpt-4 (recommended)');
      console.log('  2. gpt-4-turbo');
      console.log('  3. gpt-3.5-turbo (faster, cheaper)');
    } else if (provider === 'anthropic') {
      console.log('  1. claude-3-5-sonnet-20241022 (recommended)');
      console.log('  2. claude-3-opus-20240229');
      console.log('  3. claude-3-sonnet-20240229');
    } else if (provider === 'openrouter') {
      console.log('  1. anthropic/claude-3.5-sonnet (recommended)');
      console.log('  2. openai/gpt-4');
      console.log('  3. meta-llama/llama-2-70b');
    } else {
      console.log('  1. llama2 (recommended)');
      console.log('  2. codellama');
      console.log('  3. mistral');
    }

    const modelChoice = await question(chalk.yellow('Enter 1, 2, or 3 (or press Enter for default): '));

    let model = defaultModel;
    if (provider === 'openai') {
      if (modelChoice === '2') model = 'gpt-4-turbo';
      else if (modelChoice === '3') model = 'gpt-3.5-turbo';
    } else if (provider === 'anthropic') {
      if (modelChoice === '2') model = 'claude-3-opus-20240229';
      else if (modelChoice === '3') model = 'claude-3-sonnet-20240229';
    } else if (provider === 'openrouter') {
      if (modelChoice === '2') model = 'openai/gpt-4';
      else if (modelChoice === '3') model = 'meta-llama/llama-2-70b';
    } else if (provider === 'ollama') {
      if (modelChoice === '2') model = 'codellama';
      else if (modelChoice === '3') model = 'mistral';
    }

    // Choose focus areas
    console.log(chalk.cyan('\nWhat should the AI focus on? (enter numbers separated by commas)'));
    console.log('  1. Bugs & logic errors');
    console.log('  2. Security vulnerabilities');
    console.log('  3. Performance issues');
    console.log('  4. Code style & best practices');
    console.log('  5. Better approach suggestions');
    console.log('  6. Explain what changed');
    const focusChoice = await question(chalk.yellow('Enter choices (e.g., 1,2,3) or press Enter for default: '));

    const focusMap: { [key: string]: FocusArea } = {
      '1': 'bugs',
      '2': 'security',
      '3': 'performance',
      '4': 'style',
      '5': 'suggestions',
      '6': 'explanations'
    };

    let focus: FocusArea[] = ['bugs', 'security']; // default
    if (focusChoice.trim()) {
      const choices = focusChoice.split(',').map(c => c.trim());
      const selectedFocus = choices.map(c => focusMap[c]).filter(Boolean);
      if (selectedFocus.length > 0) {
        focus = selectedFocus;
      }
    }

    // Choose output type
    console.log(chalk.cyan('\nDefault output format?'));
    console.log('  1. Terminal (colored, formatted)');
    console.log('  2. Markdown file');
    const outputChoice = await question(chalk.yellow('Enter 1 or 2: '));

    const output = outputChoice === '2' ? 'markdown' : 'terminal';

    // Save configuration
    const config: Partial<Config> = {
      provider,
      model,
      focus,
      output,
      providers: provider === 'ollama'
        ? { [provider]: {} }
        : { [provider]: { apiKey: apiKey.trim() } }
    };

    saveGlobalConfig(config);

    console.log(chalk.green('\n✅ Configuration saved successfully!\n'));
    console.log(chalk.dim('Config location: ~/.config/smartdiff/config.json'));
    console.log(chalk.dim('\n📚 Quick Start:'));
    console.log(chalk.cyan('  smartdiff') + chalk.dim('                    # Review staged changes'));
    console.log(chalk.cyan('  smartdiff hook --install') + chalk.dim('   # Auto-run before commits'));
    console.log(chalk.cyan('  smartdiff pr 123') + chalk.dim('            # Review a GitHub PR'));
    console.log(chalk.dim('\n💡 Tip: Run') + chalk.cyan(' smartdiff --help ') + chalk.dim('to see all options\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Setup failed:'), (error as Error).message);
    process.exit(1);
  } finally {
    rl.close();
  }
}
