import { FocusArea } from '../types';

/**
 * Build a code review prompt based on focus areas
 */
export function buildReviewPrompt(diff: string, focusAreas: FocusArea[]): string {
  const focusDescriptions: Record<FocusArea, string> = {
    bugs: 'potential bugs, logic errors, edge cases, null/undefined handling, and correctness issues',
    security: 'security vulnerabilities, injection risks, authentication/authorization issues, data exposure, and unsafe operations',
    performance: 'performance issues, inefficient algorithms, unnecessary computations, memory leaks, and optimization opportunities',
    style: 'code style, formatting, naming conventions, readability, and best practices',
    suggestions: 'better approaches, design patterns, refactoring opportunities, and code improvements',
    explanations: 'what changed and why, the impact of changes, and context for reviewers'
  };

  const focusPoints = focusAreas.map(area => `- ${focusDescriptions[area]}`).join('\n');

  return `You are an expert code reviewer. Review the following git diff and provide a detailed analysis.

Focus on:
${focusPoints}

Git Diff:
\`\`\`diff
${diff}
\`\`\`

Provide your review in the following structured format:

## Summary
[Brief overview of the changes and overall assessment]

## Issues
[List any issues found, if any. For each issue, specify:]
- **Severity**: critical/high/medium/low
- **Category**: bugs/security/performance/style/suggestions
- **Location**: file:line
- **Description**: What's wrong
- **Suggestion**: How to fix it (if applicable)

## Suggestions
[List any general suggestions for improvement]

If no issues are found, say "No issues found" under the Issues section.

Be specific, actionable, and constructive. Focus on the most important issues first.`;
}

/**
 * Parse the AI response into structured data
 * This is a simple parser - could be improved with more sophisticated parsing
 */
export function parseReviewResponse(response: string): {
  summary: string;
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: FocusArea;
    file: string;
    line?: number;
    description: string;
    suggestion?: string;
  }>;
  suggestions: string[];
} {
  // Extract sections
  const summaryMatch = response.match(/## Summary\s+([\s\S]*?)(?=##|$)/i);
  const issuesMatch = response.match(/## Issues\s+([\s\S]*?)(?=##|$)/i);
  const suggestionsMatch = response.match(/## Suggestions\s+([\s\S]*?)(?=$)/i);

  const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary provided';

  const issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: FocusArea;
    file: string;
    line?: number;
    description: string;
    suggestion?: string;
  }> = [];

  // Simple parsing - look for bullet points
  if (issuesMatch && !issuesMatch[1].includes('No issues found')) {
    const issuesText = issuesMatch[1];
    const issueBlocks = issuesText.split(/\n(?=-\s|\*\s|•\s)/);

    for (const block of issueBlocks) {
      if (!block.trim()) continue;

      const severityMatch = block.match(/severity[:\s]+(\w+)/i);
      const categoryMatch = block.match(/category[:\s]+(\w+)/i);
      const locationMatch = block.match(/location[:\s]+([^:\n]+:[^\n]*)/i);
      const descriptionMatch = block.match(/description[:\s]+([^\n]+)/i);
      const suggestionMatch = block.match(/suggestion[:\s]+([^\n]+)/i);

      if (descriptionMatch) {
        const location = locationMatch ? locationMatch[1].trim() : 'unknown';
        const [file, lineStr] = location.split(':');
        const line = lineStr ? parseInt(lineStr, 10) : undefined;

        issues.push({
          severity: (severityMatch?.[1].toLowerCase() as any) || 'medium',
          category: (categoryMatch?.[1].toLowerCase() as any) || 'bugs',
          file: file || 'unknown',
          line: line,
          description: descriptionMatch[1].trim(),
          suggestion: suggestionMatch ? suggestionMatch[1].trim() : undefined
        });
      }
    }
  }

  const suggestions: string[] = [];
  if (suggestionsMatch) {
    const suggestionsText = suggestionsMatch[1];
    const suggestionLines = suggestionsText.split('\n');
    for (const line of suggestionLines) {
      const trimmed = line.replace(/^[-*•]\s*/, '').trim();
      if (trimmed) {
        suggestions.push(trimmed);
      }
    }
  }

  return { summary, issues, suggestions };
}
