import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import ora from 'ora';
import simpleGit from 'simple-git';
import { loadConfig } from './config';
import { getProvider } from './ai/providers';
import { ReviewResult } from './types';
import { buildReviewPrompt } from './ai/prompts';

interface PRReviewOptions {
  pr: number;
  token?: string;
  repo?: string;
  owner?: string;
  comment?: boolean;
}

/**
 * Review a GitHub Pull Request
 */
export async function reviewPR(options: PRReviewOptions): Promise<void> {
  const spinner = ora('Initializing GitHub PR review...').start();

  try {
    // Get GitHub token
    const token = options.token || process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error(
        'GitHub token not found. Set GITHUB_TOKEN environment variable or use --token flag.\n' +
        'Create a token at: https://github.com/settings/tokens'
      );
    }

    const octokit = new Octokit({ auth: token });

    // Get repo info
    const git = simpleGit();
    let owner = options.owner;
    let repo = options.repo;

    if (!owner || !repo) {
      spinner.text = 'Detecting repository...';
      const remotes = await git.getRemotes(true);
      const origin = remotes.find(r => r.name === 'origin');

      if (origin && origin.refs.fetch) {
        const match = origin.refs.fetch.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
        if (match) {
          owner = owner || match[1];
          repo = repo || match[2];
        }
      }

      if (!owner || !repo) {
        throw new Error(
          'Could not detect GitHub repository. Specify with --owner and --repo flags.'
        );
      }
    }

    spinner.text = `Fetching PR #${options.pr}...`;

    // Get PR details
    const { data: pr } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: options.pr
    });

    // Get PR diff
    const { data: files } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: options.pr
    });

    spinner.text = 'Analyzing changes...';

    // Build diff from files
    let diff = '';
    for (const file of files) {
      if (file.patch) {
        diff += `diff --git a/${file.filename} b/${file.filename}\n`;
        diff += file.patch + '\n\n';
      }
    }

    if (!diff) {
      spinner.warn('No changes to review in this PR.');
      return;
    }

    spinner.text = 'Running AI review...';

    // Load config and review
    const config = await loadConfig();
    const provider = await getProvider(config);
    const result = await provider.review(diff, config.focus, config.model);

    spinner.succeed('Review complete!');

    // Display results
    console.log(chalk.bold('\n📋 PR Review Summary\n'));
    console.log(chalk.dim(`Repository: ${owner}/${repo}`));
    console.log(chalk.dim(`PR #${options.pr}: ${pr.title}\n`));

    console.log(chalk.white(result.summary));
    console.log('');

    if (result.issues.length > 0) {
      console.log(chalk.yellow(`⚠️  Found ${result.issues.length} issue(s):\n`));
      for (const issue of result.issues) {
        console.log(`  ${chalk.red('•')} [${issue.severity}] ${issue.description}`);
        if (issue.file) {
          console.log(chalk.dim(`    ${issue.file}${issue.line ? ':' + issue.line : ''}`));
        }
      }
      console.log('');
    } else {
      console.log(chalk.green('✅ No issues found!\n'));
    }

    if (result.suggestions.length > 0) {
      console.log(chalk.cyan(`💡 Suggestions:\n`));
      for (const suggestion of result.suggestions) {
        console.log(`  ${chalk.dim('•')} ${suggestion}`);
      }
      console.log('');
    }

    // Post comment if requested
    if (options.comment) {
      spinner.start('Posting review comment...');

      const commentBody = formatPRComment(result, owner, repo, options.pr);

      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: options.pr,
        body: commentBody
      });

      spinner.succeed('Comment posted to PR!');
    }

  } catch (error: any) {
    spinner.fail('PR review failed');
    if (error.status === 401) {
      console.error(chalk.red('\n❌ Invalid GitHub token. Check your token permissions.'));
    } else if (error.status === 404) {
      console.error(chalk.red('\n❌ PR not found. Check owner, repo, and PR number.'));
    } else {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
    }
    process.exit(1);
  }
}

/**
 * Format review result as PR comment
 */
function formatPRComment(result: ReviewResult, owner: string, repo: string, pr: number): string {
  const lines: string[] = [];

  lines.push('## 🤖 SmartDiff Code Review\n');
  lines.push(result.summary);
  lines.push('\n---\n');

  if (result.issues.length > 0) {
    lines.push('### ⚠️ Issues Found\n');

    const critical = result.issues.filter(i => i.severity === 'critical');
    const high = result.issues.filter(i => i.severity === 'high');
    const medium = result.issues.filter(i => i.severity === 'medium');
    const low = result.issues.filter(i => i.severity === 'low');

    if (critical.length > 0) {
      lines.push(`#### 🔴 Critical (${critical.length})\n`);
      critical.forEach(issue => lines.push(formatIssueForComment(issue)));
    }

    if (high.length > 0) {
      lines.push(`#### 🟠 High (${high.length})\n`);
      high.forEach(issue => lines.push(formatIssueForComment(issue)));
    }

    if (medium.length > 0) {
      lines.push(`#### 🟡 Medium (${medium.length})\n`);
      medium.forEach(issue => lines.push(formatIssueForComment(issue)));
    }

    if (low.length > 0) {
      lines.push(`#### 🔵 Low (${low.length})\n`);
      low.forEach(issue => lines.push(formatIssueForComment(issue)));
    }
  } else {
    lines.push('### ✅ No Issues Found\n');
  }

  if (result.suggestions.length > 0) {
    lines.push('\n### 💡 Suggestions\n');
    result.suggestions.forEach(s => lines.push(`- ${s}`));
  }

  lines.push('\n---');
  lines.push('_Generated by [SmartDiff](https://github.com/yourusername/smartdiff)_');

  return lines.join('\n');
}

/**
 * Format a single issue for PR comment
 */
function formatIssueForComment(issue: any): string {
  let line = `- **${issue.category}**: ${issue.description}`;
  if (issue.file) {
    line += `\n  - \`${issue.file}${issue.line ? ':' + issue.line : ''}\``;
  }
  if (issue.suggestion) {
    line += `\n  - 💡 ${issue.suggestion}`;
  }
  line += '\n';
  return line;
}
