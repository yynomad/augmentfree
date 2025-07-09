# Publishing Guide for Free AugmentCode Extension

This guide explains how to build, test, and publish the Free AugmentCode VSCode extension.

## Prerequisites

Before publishing, ensure you have:

1. **Node.js** (v16 or higher)
2. **npm** (comes with Node.js)
3. **Python** (3.10 or higher)
4. **VSCode Extension Manager (vsce)**:
   ```bash
   npm install -g vsce
   ```
5. **Visual Studio Marketplace Publisher Account**

## Building the Extension

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build
```

This script will:
- Install all dependencies
- Compile TypeScript code
- Run linting
- Copy Python files to output directory
- Package the extension into a `.vsix` file

### 3. Manual Build Steps (Alternative)
```bash
# Clean previous builds
npm run clean

# Compile TypeScript
npm run compile

# Run linting
npm run lint

# Package extension
npm run package
```

## Testing the Extension

### 1. Local Testing
```bash
# Install the extension locally
code --install-extension free-augmentcode-1.0.0.vsix

# Or use the Extension Development Host
# Press F5 in VSCode to open a new Extension Development Host window
```

### 2. Test Scenarios
- Test on different operating systems (Windows, macOS, Linux)
- Test with different Python versions (3.10, 3.11, 3.12)
- Test all commands:
  - Clean AugmentCode Data
  - Modify Telemetry IDs
  - Clean Database
  - Clean Workspace Storage
  - Show Logs
  - Open Settings
- Test error scenarios (missing Python, permission errors, etc.)
- Test configuration options

### 3. Validation Checklist
- [ ] Extension loads without errors
- [ ] All commands appear in command palette
- [ ] Python environment is detected correctly
- [ ] Backup files are created before operations
- [ ] Progress indicators work correctly
- [ ] Error messages are user-friendly
- [ ] Configuration options work as expected
- [ ] Cross-platform compatibility verified

## Publishing to VSCode Marketplace

### 1. Prepare for Publishing

#### Update Version
```bash
# Update version in package.json
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

#### Update Documentation
- Update `CHANGELOG.md` with new features and fixes
- Update `README.md` if needed
- Ensure all documentation is accurate

#### Final Build
```bash
npm run rebuild
```

### 2. Publish to Marketplace

#### First-time Setup
1. Create a [Visual Studio Marketplace publisher account](https://marketplace.visualstudio.com/manage)
2. Create a Personal Access Token (PAT) in Azure DevOps
3. Login with vsce:
   ```bash
   vsce login <publisher-name>
   ```

#### Publish the Extension
```bash
# Publish directly
vsce publish

# Or publish a specific .vsix file
vsce publish free-augmentcode-1.0.0.vsix
```

### 3. GitHub Release

#### Create Release
1. Push all changes to GitHub
2. Create a new tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. Create a GitHub release with the tag
4. Upload the `.vsix` file to the release
5. Write release notes based on `CHANGELOG.md`

## Publishing Checklist

### Pre-Publishing
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Version number is incremented
- [ ] CHANGELOG.md is updated
- [ ] No sensitive information in code
- [ ] All dependencies are properly declared
- [ ] Extension icon is included
- [ ] README.md has clear installation instructions

### Publishing
- [ ] Extension builds successfully
- [ ] .vsix file is generated
- [ ] Published to VSCode Marketplace
- [ ] GitHub release created
- [ ] Release notes written
- [ ] .vsix file uploaded to GitHub release

### Post-Publishing
- [ ] Extension appears in marketplace
- [ ] Installation works from marketplace
- [ ] All functionality works in published version
- [ ] Monitor for user feedback and issues

## Marketplace Information

### Extension Details
- **Name**: Free AugmentCode
- **Publisher**: free-augmentcode
- **Category**: Other
- **Tags**: augmentcode, cleanup, telemetry, account, reset

### Description
A VSCode extension for cleaning AugmentCode-related data, allowing unlimited logins with different accounts on the same computer.

### Features to Highlight
- One-click cleanup operations
- Cross-platform support
- Automatic backup creation
- Detailed progress reporting
- Comprehensive error handling
- Configurable settings

## Troubleshooting

### Common Issues

#### Build Failures
- Ensure all dependencies are installed
- Check TypeScript compilation errors
- Verify Python files are in correct locations

#### Publishing Failures
- Verify publisher account and PAT
- Check extension manifest (package.json)
- Ensure unique version number
- Verify all required files are included

#### Testing Issues
- Test in clean VSCode environment
- Verify Python installation
- Check file permissions
- Test on target operating systems

### Getting Help
- Check VSCode extension development documentation
- Review vsce command help: `vsce --help`
- Check marketplace publisher dashboard
- Review GitHub issues and discussions

## Maintenance

### Regular Updates
- Monitor user feedback and issues
- Update dependencies regularly
- Test with new VSCode versions
- Update Python compatibility as needed

### Security
- Regularly audit dependencies
- Review code for security issues
- Update any vulnerable packages
- Follow security best practices

### Performance
- Monitor extension startup time
- Optimize Python script execution
- Review memory usage
- Optimize file operations
