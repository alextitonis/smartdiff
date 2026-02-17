import simpleGit, { SimpleGit, DiffResult } from 'simple-git';
import * as fs from 'fs';

export interface DiffOptions {
  staged?: boolean;
  files?: string[];
  diffRange?: string;
}

/**
 * Get git diff based on options
 */
export async function getDiff(options: DiffOptions = {}): Promise<string> {
  const git: SimpleGit = simpleGit();

  // Check if we're in a git repository
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error('Not a git repository. Run this command from within a git repository.');
  }

  let diff: string;

  if (options.diffRange) {
    // Diff between two commits/branches
    diff = await git.diff([options.diffRange]);
  } else if (options.files && options.files.length > 0) {
    // Diff specific files
    if (options.staged) {
      diff = await git.diff(['--staged', '--', ...options.files]);
    } else {
      diff = await git.diff(['--', ...options.files]);
    }
  } else if (options.staged) {
    // Staged changes
    diff = await git.diff(['--staged']);
  } else {
    // All unstaged changes
    diff = await git.diff();
  }

  if (!diff || diff.trim().length === 0) {
    throw new Error('No changes to review. Stage some changes with "git add" or specify files.');
  }

  return diff;
}

/**
 * Get status of the repository
 */
export async function getStatus(): Promise<string> {
  const git: SimpleGit = simpleGit();
  const status = await git.status();

  const lines: string[] = [];

  if (status.staged.length > 0) {
    lines.push('Staged files:');
    status.staged.forEach(file => lines.push(`  ${file}`));
  }

  if (status.modified.length > 0) {
    lines.push('Modified files:');
    status.modified.forEach(file => lines.push(`  ${file}`));
  }

  if (status.not_added.length > 0) {
    lines.push('Untracked files:');
    status.not_added.forEach(file => lines.push(`  ${file}`));
  }

  return lines.join('\n');
}

/**
 * Validate that files exist
 */
export function validateFiles(files: string[]): void {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      throw new Error(`File not found: ${file}`);
    }
  }
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(): Promise<string> {
  const git: SimpleGit = simpleGit();
  const status = await git.status();
  return status.current || 'unknown';
}

/**
 * Check if there are staged changes
 */
export async function hasStagedChanges(): Promise<boolean> {
  const git: SimpleGit = simpleGit();
  const status = await git.status();
  return status.staged.length > 0;
}

/**
 * Split large diffs into chunks to stay within token limits
 * This is a simple implementation - could be improved to split at file boundaries
 */
export function chunkDiff(diff: string, maxChunkSize: number = 15000): string[] {
  if (diff.length <= maxChunkSize) {
    return [diff];
  }

  const chunks: string[] = [];
  const lines = diff.split('\n');
  let currentChunk: string[] = [];
  let currentSize = 0;

  for (const line of lines) {
    const lineSize = line.length + 1; // +1 for newline

    if (currentSize + lineSize > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push(line);
    currentSize += lineSize;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
}
