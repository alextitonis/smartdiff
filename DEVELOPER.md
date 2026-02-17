# SmartDiff Developer Guide

## 🚀 Quick Start for Contributors

### Setup

```bash
# Clone and setup
git clone https://github.com/yourusername/smartdiff.git
cd smartdiff
npm install

# Build
npm run build

# Test it works
node dist/cli.js --version
```

---

## 🔧 Development Workflows

### **Method 1: npm link (Recommended)**

Best for testing the CLI as users would use it:

```bash
npm run build
npm link

# Now use it anywhere
smartdiff --version
cd /some/other/project
smartdiff init

# Make changes to SmartDiff
# Rebuild and test again
npm run build
smartdiff

# Cleanup when done
npm unlink -g smartdiff
```

### **Method 2: Direct Execution**

Best for quick tests:

```bash
npm run build
node dist/cli.js --version
node dist/cli.js init
node dist/cli.js pr 123
```

### **Method 3: Watch Mode**

Best for active development:

```bash
# Terminal 1: Auto-rebuild on file changes
npm run dev

# Terminal 2: Test your changes
node dist/cli.js
```

---

## 📦 How npm, npx & Global Install Work

### The `bin` Field in package.json

```json
{
  "bin": {
    "smartdiff": "./dist/cli.js"
  }
}
```

This tells npm:
- Command name: `smartdiff`
- Script location: `./dist/cli.js`
- Must have shebang: `#!/usr/bin/env node` (already in cli.ts)

### What Happens on Install

**Global Install (`npm install -g smartdiff`)**:
1. Downloads package from npm registry
2. Runs `prepare` script (builds TypeScript)
3. Creates symlink: `/usr/local/bin/smartdiff` → `node_modules/smartdiff/dist/cli.js`
4. Makes `smartdiff` available system-wide

**Using npx (`npx smartdiff`)**:
1. Checks local `node_modules/.bin/` first
2. If not found, downloads from npm to cache (~/.npm/_npx/)
3. Executes from cache
4. No global installation needed

**Local Install (`npm install smartdiff`)**:
1. Adds to `node_modules/`
2. Creates local bin: `node_modules/.bin/smartdiff`
3. Can run via `npx smartdiff` or in package.json scripts

---

## 🧪 Testing Installation Methods

### Test Global Install

```bash
# Pack locally (creates smartdiff-1.0.0.tgz)
npm pack

# Install globally from tarball
npm install -g ./smartdiff-1.0.0.tgz

# Test
smartdiff --version
smartdiff init

# Cleanup
npm uninstall -g smartdiff
rm smartdiff-1.0.0.tgz
```

### Test npx

```bash
# Pack locally
npm pack

# Test npx with local tarball
npx ./smartdiff-1.0.0.tgz --version

# Or test from published npm (after publishing)
npx smartdiff@latest --version
```

### Test Local Install

```bash
# Create test project
mkdir /tmp/test-smartdiff
cd /tmp/test-smartdiff
npm init -y

# Pack SmartDiff
cd /path/to/smartdiff
npm pack

# Install in test project
cd /tmp/test-smartdiff
npm install /path/to/smartdiff/smartdiff-1.0.0.tgz

# Test
npx smartdiff --version
```

---

## 📤 Publishing to npm

### Prerequisites

```bash
# 1. Create npm account at https://www.npmjs.com
# 2. Login
npm login

# 3. Verify you're logged in
npm whoami
```

### Publishing Steps

```bash
# 1. Make sure everything is committed
git status

# 2. Build
npm run build

# 3. Test the package locally
npm pack
npm install -g ./smartdiff-1.0.0.tgz
smartdiff --version
npm uninstall -g smartdiff
rm smartdiff-1.0.0.tgz

# 4. Update version (automatically commits & tags)
npm version patch  # 1.0.0 → 1.0.1
# or
npm version minor  # 1.0.0 → 1.1.0
# or
npm version major  # 1.0.0 → 2.0.0

# 5. Publish to npm
npm publish

# 6. Push to GitHub
git push && git push --tags

# 7. Test published package
npx smartdiff@latest --version
```

### Version Management

- **Patch** (1.0.0 → 1.0.1): Bug fixes, no new features
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

### What Gets Published

Controlled by `.npmignore` and `package.json` `files` field:

**Included**:
- `dist/` - Compiled JavaScript
- `README.md` - Documentation
- `LICENSE` - License file
- `CHANGELOG.md` - Version history
- `package.json` - Package metadata

**Excluded** (via .npmignore):
- `src/` - TypeScript source
- `node_modules/` - Dependencies (users install these)
- Development files (.git, .github, etc.)
- Example configs

---

## 🔍 Debugging

### Check What Will Be Published

```bash
# See all files that will be included
npm pack --dry-run

# Create tarball and inspect
npm pack
tar -tzf smartdiff-1.0.0.tgz
```

### Common Issues

**"Cannot find module" after install**
- ✅ Run `npm run build` before testing
- ✅ Check `dist/` folder exists
- ✅ Verify `main` and `bin` paths in package.json

**"Command not found" after global install**
- ✅ Check npm global bin path: `npm config get prefix`
- ✅ Ensure path is in $PATH: `echo $PATH`
- ✅ Try reinstalling: `npm uninstall -g smartdiff && npm install -g smartdiff`

**CLI not executable**
- ✅ Check shebang in cli.ts: `#!/usr/bin/env node`
- ✅ Verify file permissions: `chmod +x dist/cli.js`

---

## 📚 Additional Resources

### Scripts Explained

```json
{
  "build": "tsc",                    // Compile TypeScript
  "dev": "tsc --watch",              // Auto-rebuild on changes
  "start": "node dist/cli.js",       // Run the CLI
  "prepare": "npm run build",        // Auto-build on install
  "prepublishOnly": "npm run build"  // Build before publishing
}
```

### Package.json Fields

```json
{
  "main": "dist/index.js",           // Entry point for require()
  "bin": {                           // CLI command mapping
    "smartdiff": "./dist/cli.js"
  },
  "files": ["dist", "README.md"],    // What to publish
  "engines": {                       // Required Node version
    "node": ">=18.0.0"
  }
}
```

### Testing Matrix

Before publishing, test:
- ✅ `npm run build` works
- ✅ `node dist/cli.js --version` works
- ✅ `npm link` → `smartdiff --version` works
- ✅ `npm pack` → install tarball → test works
- ✅ All major commands work (init, review, pr, hook)
- ✅ Works on clean machine (test in Docker or VM)

---

## 🆘 Getting Help

- 📖 [npm CLI docs](https://docs.npmjs.com/cli/)
- 📦 [Publishing packages guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- 🔗 [Creating global npm packages](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#bin)

---

**Happy developing! 🚀**
