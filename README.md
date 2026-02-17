# 🚀 SmartDiff

> AI-powered code review for your git changes - catch bugs, security issues, and get improvement suggestions automatically.

[![npm version](https://badge.fury.io/js/%40alextoti%2Fsmartdiff.svg)](https://www.npmjs.com/package/@alextoti/smartdiff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- 🤖 **Multiple AI Providers** - OpenAI, Anthropic, OpenRouter, or local Ollama models
- 🎯 **Configurable Reviews** - Focus on bugs, security, performance, style, suggestions, or explanations
- 🔗 **GitHub Integration** - Review PRs and post comments directly
- ⚡ **Pre-commit Hooks** - Auto-review before every commit
- 🚫 **Ignore Patterns** - Skip generated files, tests, or anything you want
- 💻 **Beautiful Output** - Terminal colors or markdown reports
- 🔄 **CI/CD Ready** - Exit codes and fail-on flags for pipelines
- 💰 **Free Option** - Use local Ollama models at zero cost

---

## 📦 Installation

```bash
# Install globally via npm
npm install -g @alextoti/smartdiff

# Or use npx (no installation needed)
npx @alextoti/smartdiff
```

---

## 🚀 Quick Start

### 1. Initialize

```bash
smartdiff init
```

Choose your AI provider:
- **OpenAI** (GPT-4) - Most popular, great quality
- **Anthropic** (Claude) - Excellent for code review
- **OpenRouter** - Access to many models with one API
- **Ollama** - Free local models (no API key needed!)

### 2. Review Your Code

```bash
# Make some changes
git add .

# Review staged changes
smartdiff

# That's it!
```

---

## 📖 Usage Guide

### Basic Commands

```bash
# Review staged changes
smartdiff

# Review with specific focus
smartdiff --focus=bugs,security

# Review a diff range
smartdiff --diff=main..feature-branch

# Save review to markdown
smartdiff --output=markdown --file=review.md

# Review and fail on critical issues (for CI/CD)
smartdiff --fail-on=critical,high
```

### GitHub PR Integration

```bash
# Review a PR
smartdiff pr 123

# Post review as comment
smartdiff pr 123 --comment

# Specify repository
smartdiff pr 123 --owner=username --repo=project
```

### Pre-commit Hooks

```bash
# Install hook (auto-reviews before commits)
smartdiff hook --install

# Check status
smartdiff hook --status

# Uninstall
smartdiff hook --uninstall

# Skip hook once
git commit --no-verify
```

### Configuration Management

```bash
# Show current config
smartdiff config --show

# Update API key
smartdiff config --set-key=openai:sk-...
```

---

## ⚙️ Configuration

### Focus Areas

Choose what SmartDiff reviews:

- **bugs** - Logic errors, edge cases, null handling
- **security** - Vulnerabilities, injection risks, unsafe operations
- **performance** - Inefficient code, optimization opportunities
- **style** - Code style, naming, readability
- **suggestions** - Better approaches, design patterns
- **explanations** - What changed and why

### Ignore Patterns

Create `.smartdiff.json` in your project:

```json
{
  "provider": "openai",
  "model": "gpt-4",
  "focus": ["bugs", "security"],
  "ignore": [
    "*.test.ts",
    "**/*.spec.js",
    "dist/**",
    "coverage/**"
  ]
}
```

### Global vs Project Config

**Global**: `~/.config/smartdiff/config.json` (API keys, defaults)
**Project**: `.smartdiff.json` (project-specific settings)

Project config overrides global config.

---

## 🤖 AI Providers

### OpenAI

```bash
smartdiff init  # Choose option 1

# Models:
# - gpt-4 (recommended)
# - gpt-4-turbo (faster)
# - gpt-3.5-turbo (cheaper)
```

**Get API key**: https://platform.openai.com/api-keys

### Anthropic (Claude)

```bash
smartdiff init  # Choose option 2

# Models:
# - claude-3-5-sonnet-20241022 (recommended)
# - claude-3-opus-20240229 (most capable)
# - claude-3-sonnet-20240229 (balanced)
```

**Get API key**: https://console.anthropic.com/

### OpenRouter

```bash
smartdiff init  # Choose option 3

# Access to 100+ models:
# - anthropic/claude-3.5-sonnet
# - openai/gpt-4
# - meta-llama/llama-2-70b
# - And many more!
```

**Get API key**: https://openrouter.ai/keys

### Ollama (Local & Free!)

```bash
# 1. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Start Ollama
ollama serve

# 3. Pull a model
ollama pull llama2

# 4. Configure SmartDiff
smartdiff init  # Choose option 4

# Models:
# - llama2 (7B, fast)
# - codellama (13B, code-focused)
# - mistral (7B, efficient)
```

**Pros**: Free, private, no API costs
**Cons**: Slower than cloud models, requires local resources

---

## 🔧 Advanced Usage

### CI/CD Integration

#### GitHub Actions

```yaml
name: Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @alextoti/smartdiff
      - run: smartdiff config --set-key=openai:${{ secrets.OPENAI_API_KEY }}
      - run: smartdiff --diff=origin/main..HEAD --fail-on=critical,high
```

#### GitLab CI

```yaml
code_review:
  script:
    - npm install -g @alextoti/smartdiff
    - smartdiff config --set-key=openai:$OPENAI_API_KEY
    - smartdiff --diff=main..HEAD --fail-on=critical,high
  only:
    - merge_requests
```

### Custom Workflows

```bash
# Review only JavaScript files
smartdiff --diff=main..HEAD | grep -E '\.(js|ts)$'

# Review and save multiple formats
smartdiff --output=terminal
smartdiff --output=markdown --file=review-$(date +%Y%m%d).md

# Chain with other tools
smartdiff && npm test && git push
```

---

## 💡 Examples

### Example 1: Pre-commit Review

```bash
# Install hook
smartdiff hook --install

# Make changes
echo "function divide(a, b) { return a / b; }" > math.js
git add math.js

# Try to commit - SmartDiff runs automatically
git commit -m "Add divide function"
# Output: ⚠️ Issues found - division by zero not handled
```

### Example 2: PR Review

```bash
# Review PR #42
smartdiff pr 42

# Output shows:
# - Summary of changes
# - Critical/high/medium/low issues
# - Suggestions for improvement

# Post review as comment
smartdiff pr 42 --comment
```

### Example 3: Security-Focused Review

```bash
# Focus only on security
smartdiff --focus=security

# Use in security audit
smartdiff --focus=security --output=markdown --file=security-audit.md
```

---

## 🛠 Troubleshooting

### "No changes to review"

```bash
# Make sure files are staged
git add .

# Or specify a diff range
smartdiff --diff=main..HEAD
```

### "API key not found"

```bash
# Run init again
smartdiff init

# Or set manually
smartdiff config --set-key=openai:sk-your-key-here
```

### Ollama connection failed

```bash
# Make sure Ollama is running
ollama serve

# Check if model is available
ollama list

# Pull the model if needed
ollama pull llama2
```

### GitHub PR review fails

```bash
# Set GitHub token
export GITHUB_TOKEN=ghp_your_token_here

# Or pass directly
smartdiff pr 123 --token=ghp_your_token_here
```

---

## 📊 Cost Considerations

| Provider | Cost | Notes |
|----------|------|-------|
| **Ollama** | Free | Local models, no API costs |
| **OpenAI** | ~$0.01-0.10/review | Depends on diff size and model |
| **Anthropic** | ~$0.01-0.15/review | Similar to OpenAI |
| **OpenRouter** | Varies | Depends on chosen model |

**Tips to reduce costs:**
- Use ignore patterns to skip large generated files
- Use cheaper models (GPT-3.5, Claude Sonnet)
- Review smaller diffs
- Use Ollama for development, cloud models for CI

---

## 🛠 Development

### Running from Source

```bash
# Clone the repository
git clone https://github.com/alextitonis/smartdiff.git
cd smartdiff

# Install dependencies
npm install

# Build TypeScript
npm run build

# Option 1: Run directly
node dist/cli.js --version

# Option 2: Link globally for testing
npm link
smartdiff --version

# Option 3: Development mode (auto-rebuild on changes)
npm run dev
# In another terminal:
node dist/cli.js
```

### Project Structure

```
smartdiff/
├── src/
│   ├── cli.ts           # Main entry point & CLI commands
│   ├── reviewer.ts      # Core review logic
│   ├── config.ts        # Configuration management
│   ├── hooks.ts         # Pre-commit hook system
│   ├── github.ts        # GitHub PR integration
│   └── ai/              # AI provider implementations
│       ├── openai.ts
│       ├── anthropic.ts
│       ├── openrouter.ts
│       └── ollama.ts
├── dist/                # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

### Testing Your Changes

```bash
# Build
npm run build

# Test basic command
node dist/cli.js --version

# Test with actual changes
echo "console.log('test')" > test.js
git add test.js
node dist/cli.js

# Test hook installation
node dist/cli.js hook --install
```

### Publishing to npm

```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Login to npm (first time only)
npm login

# 3. Publish
npm publish

# 4. Test the published package
npx @alextoti/smartdiff@latest --version
```

## 🤝 Contributing

Contributions welcome! Here are some ideas:

- Add support for more AI providers (Google Gemini, Cohere, etc.)
- Improve prompt engineering
- Add auto-fix suggestions
- Create VS Code extension
- Improve test coverage

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Built with:
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [simple-git](https://github.com/steveukx/git-js) - Git operations
- [OpenAI SDK](https://github.com/openai/openai-node), [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Octokit](https://github.com/octokit/rest.js) - GitHub API
- [chalk](https://github.com/chalk/chalk), [ora](https://github.com/sindresorhus/ora), [boxen](https://github.com/sindresorhus/boxen)

---

## 📞 Support

- 🐛 [Report a bug](https://github.com/alextitonis/smartdiff/issues)
- 💬 [Ask a question](https://github.com/alextitonis/smartdiff/discussions)
- ⭐ [Star on GitHub](https://github.com/alextitonis/smartdiff)

---

**Made with ❤️ for developers who care about code quality**
