# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-17

### 🚀 Major Release

Complete rewrite with extensive new features!

### ✨ Added

**AI Providers:**
- OpenRouter provider support - access to 100+ models
- Ollama provider support - free local models
- Multi-provider architecture for easy extensibility

**Git & GitHub:**
- Pre-commit hook system (`smartdiff hook --install`)
- GitHub PR review integration (`smartdiff pr 123`)
- Post review comments directly on PRs (`--comment` flag)
- Auto-detect GitHub repository from git remotes

**Configuration:**
- Ignore patterns support - skip files you don't want reviewed
- Default ignore patterns for common files (node_modules, dist, etc.)
- Improved configuration system
- Support for project-level and global configs

**CI/CD:**
- `--fail-on` flag to exit with error on specific severities
- Exit codes for CI/CD integration
- GitHub Actions and GitLab CI examples

**UX Improvements:**
- Interactive init supports all 4 providers
- Better error messages with helpful guidance
- Improved terminal output with colors and formatting
- Quick start guide in init completion
- Hook status checking

**Developer Experience:**
- CLI help improvements
- Better TypeScript types
- Modular code structure
- Comprehensive documentation

### 🔄 Changed

- Renamed from `ai-code-review` to `smartdiff`
- Updated to v1.0.0 (stable release)
- Improved provider abstraction
- Enhanced review prompts
- Better config validation

### 📚 Documentation

- Complete README rewrite with all features
- CI/CD integration examples
- Troubleshooting guide
- Cost comparison table
- Usage examples for all features

## [0.1.0] - 2025-02-17

### Initial Release

- Basic CLI interface
- OpenAI and Anthropic support
- Git diff review
- Terminal and markdown output
- Configuration system

---

## [Unreleased]

### Planned Features

- Interactive fix mode - apply AI suggestions automatically
- Watch mode - continuous review while coding
- Cost tracking - monitor API usage
- Comparison mode - compare reviews from multiple providers
- Language-specific prompts
- Review caching
- VS Code extension
- Web dashboard
