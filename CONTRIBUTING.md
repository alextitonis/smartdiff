# Contributing to AI Code Review

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Make your changes** and test them
5. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/ai-code-review.git
cd ai-code-review

# Install dependencies
npm install

# Build the project
npm run build

# Test locally
node dist/cli.js --help
```

## Code Style

- Use TypeScript for all new code
- Follow existing code style and conventions
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names

## Adding New Features

### Adding a New AI Provider

1. Create a new file in `src/ai/` (e.g., `gemini.ts`)
2. Implement the `AIProvider` interface
3. Add it to the provider registry in `src/ai/providers.ts`
4. Update documentation

Example:

```typescript
import { AIProvider } from './providers';
import { FocusArea, ReviewResult } from '../types';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  // ... implementation
}
```

### Adding New Focus Areas

1. Update the `FocusArea` type in `src/types.ts`
2. Add description in `src/ai/prompts.ts`
3. Update documentation

### Adding New Output Formats

1. Create a new formatter in `src/formatters/`
2. Implement the formatting function
3. Update the reviewer to use it
4. Update documentation

## Testing

Currently, the project needs more tests. Contributions to add testing infrastructure are welcome!

To test manually:

1. Create a test repository
2. Make some changes with intentional issues
3. Run `ai-code-review` and verify output
4. Test all CLI commands and options

## Documentation

- Update README.md for new features
- Add code comments for complex logic
- Include examples in documentation
- Update CHANGELOG.md

## Pull Request Process

1. **Update documentation** for any changed functionality
2. **Test your changes** thoroughly
3. **Keep PRs focused** - one feature or fix per PR
4. **Write clear commit messages**
5. **Link related issues** in the PR description

### Commit Message Format

```
type: brief description

Longer explanation if needed

Fixes #issue-number
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### PR Title Format

```
feat: Add Gemini AI provider support
fix: Handle empty git diffs gracefully
docs: Update installation instructions
```

## Code Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Thank you for contributing!

## Ideas for Contributions

Looking for ideas? Here are some areas that need work:

### High Priority
- Add comprehensive tests
- Improve error handling
- Add support for more AI providers (Gemini, local models)
- Implement auto-fix suggestions
- Better parsing of AI responses

### Medium Priority
- GitHub/GitLab integration
- Custom prompt templates
- Token usage tracking and limits
- Configuration validation schema
- Interactive mode for applying fixes

### Low Priority
- Web UI for configuration
- Browser extension
- VS Code extension
- Comparison mode (multiple AI providers)
- Historical tracking of issues

## Questions?

- Open an issue for questions
- Start a discussion on GitHub Discussions
- Check existing issues and PRs for similar work

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

Thank you for making AI Code Review better! 🚀
