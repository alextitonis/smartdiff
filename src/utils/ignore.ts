import ignore from 'ignore';

const DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '*.min.js',
  '*.min.css',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.git/**',
  'coverage/**',
  '*.log',
  '.DS_Store'
];

/**
 * Create an ignore filter from patterns
 */
export function createIgnoreFilter(patterns: string[] = []): (path: string) => boolean {
  const ig = ignore().add([...DEFAULT_IGNORE_PATTERNS, ...patterns]);

  return (path: string) => {
    // Remove leading ./ or /
    const normalized = path.replace(/^\.?\//, '');
    return !ig.ignores(normalized);
  };
}

/**
 * Filter a diff string to remove ignored files
 */
export function filterDiff(diff: string, patterns: string[] = []): string {
  if (!patterns || patterns.length === 0) {
    return diff;
  }

  const filter = createIgnoreFilter(patterns);
  const lines = diff.split('\n');
  const result: string[] = [];
  let currentFile: string | null = null;
  let includeCurrentFile = true;

  for (const line of lines) {
    // Check if this is a file header
    if (line.startsWith('diff --git')) {
      // Extract file path
      const match = line.match(/diff --git a\/(.*?) b\//);
      if (match) {
        currentFile = match[1];
        includeCurrentFile = filter(currentFile);
      }
    }

    // Include line if we're including the current file
    if (includeCurrentFile) {
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * Get default ignore patterns
 */
export function getDefaultIgnorePatterns(): string[] {
  return [...DEFAULT_IGNORE_PATTERNS];
}
