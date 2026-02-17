#!/usr/bin/env node

import { Command } from 'commander';
import { initConfig } from './init';
import { showConfig, updateApiKey } from './config';
import { review } from './reviewer';
import { installHook, uninstallHook, checkHookStatus } from './hooks';
import { reviewPR } from './github';
import { ProviderName } from './types';

const program = new Command();

program
  .name('smartdiff')
  .description('AI-powered code review for your git changes')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize configuration')
  .action(async () => {
    await initConfig();
  });

program
  .command('config')
  .description('Manage configuration')
  .option('--show', 'Show current configuration')
  .option('--set-key <keyValue>', 'Set API key (format: provider:key)')
  .action(async (options) => {
    if (options.show) {
      await showConfig();
    } else if (options.setKey) {
      const [provider, key] = options.setKey.split(':');
      if (!provider || !key) {
        console.error('Error: Invalid format. Use: provider:key (e.g., openai:sk-...)');
        process.exit(1);
      }
      await updateApiKey(provider as ProviderName, key);
      console.log(`✅ API key updated for ${provider}`);
    } else {
      console.log('Use --show to display config or --set-key to update API key');
    }
  });

program
  .command('review')
  .description('Review code changes')
  .option('-f, --focus <areas>', 'Focus areas (comma-separated): bugs,security,performance,style,suggestions,explanations')
  .option('-o, --output <type>', 'Output type: terminal or markdown')
  .option('--file <path>', 'Output file path (for markdown)')
  .option('--diff <range>', 'Git diff range (e.g., main..feature)')
  .option('--provider <name>', 'AI provider: openai, anthropic, openrouter, or ollama')
  .option('--model <name>', 'Model name')
  .option('--fail-on <severities>', 'Exit with error if issues found (comma-separated): critical,high,medium,low')
  .action(async (options) => {
    await review(options);
  });

program
  .command('hook')
  .description('Manage git pre-commit hook')
  .option('--install', 'Install pre-commit hook')
  .option('--uninstall', 'Uninstall pre-commit hook')
  .option('--status', 'Check hook status')
  .action(async (options) => {
    if (options.install) {
      await installHook();
    } else if (options.uninstall) {
      await uninstallHook();
    } else if (options.status) {
      await checkHookStatus();
    } else {
      console.log('Use --install, --uninstall, or --status');
    }
  });

program
  .command('pr <number>')
  .description('Review a GitHub Pull Request')
  .option('--token <token>', 'GitHub personal access token (or set GITHUB_TOKEN env var)')
  .option('--owner <owner>', 'Repository owner (auto-detected if not provided)')
  .option('--repo <repo>', 'Repository name (auto-detected if not provided)')
  .option('--comment', 'Post review as PR comment')
  .action(async (number, options) => {
    await reviewPR({
      pr: parseInt(number, 10),
      token: options.token,
      owner: options.owner,
      repo: options.repo,
      comment: options.comment
    });
  });

// Default command (review)
program
  .argument('[files...]', 'Specific files to review')
  .option('-f, --focus <areas>', 'Focus areas')
  .option('-o, --output <type>', 'Output type: terminal or markdown')
  .option('--file <path>', 'Output file path')
  .option('--diff <range>', 'Git diff range')
  .option('--provider <name>', 'AI provider')
  .option('--model <name>', 'Model name')
  .option('--fail-on <severities>', 'Exit with error if issues found')
  .action(async (files, options) => {
    // For now, ignore files parameter (can be added later)
    await review(options);
  });

program.parse(process.argv);
