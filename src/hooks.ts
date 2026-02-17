import * as fs from 'fs';
import * as path from 'path';
import simpleGit from 'simple-git';
import chalk from 'chalk';

const HOOK_SCRIPT = `#!/bin/sh
# smartdiff pre-commit hook
# Auto-generated - DO NOT EDIT

echo "🤖 Running smartdiff code review..."

# Run smartdiff review
npx smartdiff review --fail-on=critical,high

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ Code review found critical or high severity issues."
  echo "Fix the issues or use 'git commit --no-verify' to skip this check."
  exit 1
fi

echo "✅ Code review passed!"
exit 0
`;

/**
 * Install pre-commit hook
 */
export async function installHook(): Promise<void> {
  const git = simpleGit();

  // Check if in git repo
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error('Not a git repository. Run this command from within a git repository.');
  }

  // Get git directory
  const gitDir = await git.revparse(['--git-dir']);
  const hooksDir = path.join(gitDir.trim(), 'hooks');
  const hookPath = path.join(hooksDir, 'pre-commit');

  // Ensure hooks directory exists
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  // Check if hook already exists
  if (fs.existsSync(hookPath)) {
    const existing = fs.readFileSync(hookPath, 'utf-8');
    if (existing.includes('smartdiff')) {
      console.log(chalk.yellow('⚠️  smartdiff pre-commit hook is already installed.'));
      return;
    } else {
      // Backup existing hook
      const backupPath = hookPath + '.backup';
      fs.copyFileSync(hookPath, backupPath);
      console.log(chalk.dim(`   Backed up existing hook to ${backupPath}`));
    }
  }

  // Write hook script
  fs.writeFileSync(hookPath, HOOK_SCRIPT, { mode: 0o755 });

  console.log(chalk.green('\n✅ Pre-commit hook installed successfully!\n'));
  console.log(chalk.dim('The hook will run automatically before each commit.'));
  console.log(chalk.dim('To skip the hook, use: git commit --no-verify\n'));
}

/**
 * Uninstall pre-commit hook
 */
export async function uninstallHook(): Promise<void> {
  const git = simpleGit();

  // Check if in git repo
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error('Not a git repository.');
  }

  // Get git directory
  const gitDir = await git.revparse(['--git-dir']);
  const hooksDir = path.join(gitDir.trim(), 'hooks');
  const hookPath = path.join(hooksDir, 'pre-commit');

  // Check if hook exists
  if (!fs.existsSync(hookPath)) {
    console.log(chalk.yellow('⚠️  No pre-commit hook found.'));
    return;
  }

  // Check if it's our hook
  const content = fs.readFileSync(hookPath, 'utf-8');
  if (!content.includes('smartdiff')) {
    console.log(chalk.yellow('⚠️  Pre-commit hook exists but was not installed by smartdiff.'));
    return;
  }

  // Remove hook
  fs.unlinkSync(hookPath);

  // Restore backup if exists
  const backupPath = hookPath + '.backup';
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, hookPath);
    console.log(chalk.green('\n✅ smartdiff hook removed and backup restored.\n'));
  } else {
    console.log(chalk.green('\n✅ Pre-commit hook uninstalled.\n'));
  }
}

/**
 * Check hook status
 */
export async function checkHookStatus(): Promise<void> {
  const git = simpleGit();

  // Check if in git repo
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    console.log(chalk.red('❌ Not a git repository.'));
    return;
  }

  // Get git directory
  const gitDir = await git.revparse(['--git-dir']);
  const hookPath = path.join(gitDir.trim(), 'hooks', 'pre-commit');

  if (fs.existsSync(hookPath)) {
    const content = fs.readFileSync(hookPath, 'utf-8');
    if (content.includes('smartdiff')) {
      console.log(chalk.green('✅ smartdiff pre-commit hook is installed'));
    } else {
      console.log(chalk.yellow('⚠️  Pre-commit hook exists but is not from smartdiff'));
    }
  } else {
    console.log(chalk.dim('ℹ️  No pre-commit hook installed'));
  }
}
