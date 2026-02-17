import { ReviewResult, Issue } from '../types';

/**
 * Format review result as markdown
 */
export function formatMarkdown(result: ReviewResult): string {
  const output: string[] = [];

  // Header
  output.push('# 🤖 AI Code Review\n');
  output.push(`_Generated on ${new Date().toLocaleString()}_\n`);
  output.push('---\n');

  // Summary
  output.push('## 📋 Summary\n');
  output.push(result.summary);
  output.push('\n');

  // Issues
  if (result.issues.length > 0) {
    output.push('## ⚠️ Issues Found\n');

    // Group by severity
    const critical = result.issues.filter(i => i.severity === 'critical');
    const high = result.issues.filter(i => i.severity === 'high');
    const medium = result.issues.filter(i => i.severity === 'medium');
    const low = result.issues.filter(i => i.severity === 'low');

    const grouped = [
      { label: 'Critical', emoji: '🔴', issues: critical },
      { label: 'High', emoji: '🟠', issues: high },
      { label: 'Medium', emoji: '🟡', issues: medium },
      { label: 'Low', emoji: '🔵', issues: low }
    ];

    for (const group of grouped) {
      if (group.issues.length === 0) continue;

      output.push(`### ${group.emoji} ${group.label} (${group.issues.length})\n`);

      for (const issue of group.issues) {
        output.push(formatIssueMarkdown(issue));
      }
    }
  } else {
    output.push('## ✅ No Issues Found\n');
  }

  // Suggestions
  if (result.suggestions.length > 0) {
    output.push('## 💡 Suggestions\n');
    for (const suggestion of result.suggestions) {
      output.push(`- ${suggestion}`);
    }
    output.push('\n');
  }

  // Footer
  output.push('---\n');
  output.push(`**Summary**: Found ${result.issues.length} issue(s) and ${result.suggestions.length} suggestion(s)\n`);

  return output.join('\n');
}

/**
 * Format a single issue as markdown
 */
function formatIssueMarkdown(issue: Issue): string {
  const lines: string[] = [];

  const location = issue.line ? `${issue.file}:${issue.line}` : issue.file;
  const categoryBadge = getCategoryBadge(issue.category);

  lines.push(`#### ${categoryBadge} \`${location}\`\n`);
  lines.push(issue.description);
  lines.push('');

  if (issue.suggestion) {
    lines.push(`**Suggestion**: ${issue.suggestion}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Get category badge emoji
 */
function getCategoryBadge(category: string): string {
  const badges: Record<string, string> = {
    bugs: '🐛',
    security: '🔒',
    performance: '⚡',
    style: '🎨',
    suggestions: '💡',
    explanations: '📝'
  };
  return badges[category] || '•';
}
