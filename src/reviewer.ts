import ora from 'ora';
import * as fs from 'fs';
import { getDiff, DiffOptions, chunkDiff } from './git';
import { loadConfig, parseFocusAreas } from './config';
import { getProvider } from './ai/providers';
import { formatTerminal, formatError } from './formatters/terminal';
import { formatMarkdown } from './formatters/markdown';
import { filterDiff } from './utils/ignore';
import { ReviewOptions, ReviewResult, Config } from './types';

/**
 * Main review function
 */
export async function review(options: ReviewOptions = {}): Promise<void> {
  const spinner = ora('Loading configuration...').start();

  try {
    // Load config
    const config: Config = await loadConfig({
      provider: options.provider,
      model: options.model,
      focus: options.focus ? parseFocusAreas(options.focus) : undefined,
      output: options.output
    });

    spinner.text = 'Getting git diff...';

    // Get diff
    const diffOptions: DiffOptions = {
      staged: !options.diff, // Default to staged if no diff range specified
      diffRange: options.diff
    };

    let diff = await getDiff(diffOptions);

    // Apply ignore patterns
    if (config.ignore && config.ignore.length > 0) {
      spinner.text = 'Filtering ignored files...';
      diff = filterDiff(diff, config.ignore);
    }

    // Check diff size
    const diffSize = diff.length;
    if (diffSize > 50000) {
      spinner.warn('Large diff detected. This may take longer and cost more tokens.');
    }

    spinner.text = `Reviewing with ${config.provider} (${config.model})...`;

    // Get AI provider
    const provider = await getProvider(config);

    // Chunk diff if too large
    const chunks = chunkDiff(diff, 15000);

    if (chunks.length > 1) {
      spinner.text = `Reviewing ${chunks.length} chunks...`;
    }

    // Review each chunk
    const results: ReviewResult[] = [];
    for (let i = 0; i < chunks.length; i++) {
      if (chunks.length > 1) {
        spinner.text = `Reviewing chunk ${i + 1}/${chunks.length}...`;
      }
      const result = await provider.review(chunks[i], config.focus, config.model);
      results.push(result);
    }

    spinner.succeed('Review complete!');

    // Merge results
    const mergedResult: ReviewResult = {
      summary: results.map(r => r.summary).join('\n\n'),
      issues: results.flatMap(r => r.issues),
      suggestions: results.flatMap(r => r.suggestions)
    };

    // Output
    if (config.output === 'markdown') {
      const markdown = formatMarkdown(mergedResult);
      const outputFile = options.file || 'review.md';
      fs.writeFileSync(outputFile, markdown, 'utf-8');
      console.log(`\n✅ Review saved to ${outputFile}`);
    } else {
      console.log(formatTerminal(mergedResult));
    }

    // Check fail-on conditions
    if (options.failOn) {
      const failSeverities = options.failOn.split(',').map(s => s.trim());
      const failingIssues = mergedResult.issues.filter(issue =>
        failSeverities.includes(issue.severity)
      );

      if (failingIssues.length > 0) {
        console.log(`\n❌ Found ${failingIssues.length} issue(s) with severity: ${failSeverities.join(', ')}`);
        process.exit(1);
      }
    }

  } catch (error) {
    spinner.fail('Review failed');
    console.log(formatError(error as Error));
    process.exit(1);
  }
}
