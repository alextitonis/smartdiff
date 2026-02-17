import chalk from 'chalk';
import boxen from 'boxen';
import { ReviewResult, Issue } from '../types';

/**
 * Format review result for terminal output
 */
export function formatTerminal(result: ReviewResult): string {
  const output: string[] = [];

  // Header
  output.push(boxen(chalk.bold.cyan('🤖 AI Code Review'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  }));

  // Summary
  output.push(chalk.bold('\n📋 Summary\n'));
  output.push(chalk.white(result.summary));
  output.push('');

  // Issues
  if (result.issues.length > 0) {
    output.push(chalk.bold('\n⚠️  Issues Found\n'));

    // Group by severity
    const critical = result.issues.filter(i => i.severity === 'critical');
    const high = result.issues.filter(i => i.severity === 'high');
    const medium = result.issues.filter(i => i.severity === 'medium');
    const low = result.issues.filter(i => i.severity === 'low');

    const grouped = [
      { label: 'Critical', color: chalk.red.bold, issues: critical },
      { label: 'High', color: chalk.red, issues: high },
      { label: 'Medium', color: chalk.yellow, issues: medium },
      { label: 'Low', color: chalk.blue, issues: low }
    ];

    for (const group of grouped) {
      if (group.issues.length === 0) continue;

      output.push(group.color(`${group.label} (${group.issues.length})`));
      output.push('');

      for (const issue of group.issues) {
        output.push(formatIssue(issue));
      }
    }
  } else {
    output.push(chalk.bold.green('\n✅ No Issues Found\n'));
  }

  // Suggestions
  if (result.suggestions.length > 0) {
    output.push(chalk.bold('\n💡 Suggestions\n'));
    for (const suggestion of result.suggestions) {
      output.push(`  ${chalk.dim('•')} ${chalk.white(suggestion)}`);
    }
    output.push('');
  }

  // Footer
  output.push(chalk.dim('\n' + '─'.repeat(60)));
  output.push(chalk.dim(`Found ${result.issues.length} issue(s) and ${result.suggestions.length} suggestion(s)`));

  return output.join('\n');
}

/**
 * Format a single issue
 */
function formatIssue(issue: Issue): string {
  const lines: string[] = [];

  // Location
  const location = issue.line
    ? chalk.cyan(`${issue.file}:${issue.line}`)
    : chalk.cyan(issue.file);

  // Category badge
  const categoryColors: Record<string, any> = {
    bugs: chalk.red,
    security: chalk.magenta,
    performance: chalk.yellow,
    style: chalk.blue,
    suggestions: chalk.green,
    explanations: chalk.cyan
  };
  const categoryColor = categoryColors[issue.category] || chalk.white;
  const category = categoryColor(`[${issue.category}]`);

  lines.push(`  ${category} ${location}`);
  lines.push(`  ${chalk.white(issue.description)}`);

  if (issue.suggestion) {
    lines.push(`  ${chalk.dim('→')} ${chalk.green(issue.suggestion)}`);
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * Format error message
 */
export function formatError(error: Error): string {
  return boxen(chalk.red.bold('❌ Error\n\n') + chalk.white(error.message), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'red'
  });
}

/**
 * Format success message
 */
export function formatSuccess(message: string): string {
  return boxen(chalk.green.bold('✅ Success\n\n') + chalk.white(message), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green'
  });
}
