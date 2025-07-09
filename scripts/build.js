#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building Free AugmentCode Extension...\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found. Please run this script from the project root.');
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log(`📦 Building ${packageJson.displayName} v${packageJson.version}`);

// Step 1: Install dependencies
console.log('\n📥 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
} catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
}

// Step 2: Compile TypeScript
console.log('\n🔨 Compiling TypeScript...');
try {
    execSync('npm run compile', { stdio: 'inherit' });
    console.log('✅ TypeScript compiled successfully');
} catch (error) {
    console.error('❌ Failed to compile TypeScript:', error.message);
    process.exit(1);
}

// Step 3: Run linting
console.log('\n🔍 Running linter...');
try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Linting passed');
} catch (error) {
    console.warn('⚠️  Linting warnings detected:', error.message);
    // Don't exit on linting warnings, just continue
}

// Step 4: Copy Python files to out directory
console.log('\n📁 Copying Python files...');
try {
    const outDir = path.join(process.cwd(), 'out');
    const pythonDir = path.join(process.cwd(), 'python');
    const augutilsDir = path.join(process.cwd(), 'augutils');
    const utilsDir = path.join(process.cwd(), 'utils');
    
    // Create directories if they don't exist
    const outPythonDir = path.join(outDir, 'python');
    const outAugutilsDir = path.join(outDir, 'augutils');
    const outUtilsDir = path.join(outDir, 'utils');
    
    if (!fs.existsSync(outPythonDir)) {
        fs.mkdirSync(outPythonDir, { recursive: true });
    }
    if (!fs.existsSync(outAugutilsDir)) {
        fs.mkdirSync(outAugutilsDir, { recursive: true });
    }
    if (!fs.existsSync(outUtilsDir)) {
        fs.mkdirSync(outUtilsDir, { recursive: true });
    }
    
    // Copy Python service files
    if (fs.existsSync(pythonDir)) {
        const pythonFiles = fs.readdirSync(pythonDir);
        pythonFiles.forEach(file => {
            if (file.endsWith('.py')) {
                fs.copyFileSync(
                    path.join(pythonDir, file),
                    path.join(outPythonDir, file)
                );
            }
        });
    }
    
    // Copy augutils directory
    if (fs.existsSync(augutilsDir)) {
        const augutilsFiles = fs.readdirSync(augutilsDir);
        augutilsFiles.forEach(file => {
            if (file.endsWith('.py')) {
                fs.copyFileSync(
                    path.join(augutilsDir, file),
                    path.join(outAugutilsDir, file)
                );
            }
        });
    }
    
    // Copy utils directory
    if (fs.existsSync(utilsDir)) {
        const utilsFiles = fs.readdirSync(utilsDir);
        utilsFiles.forEach(file => {
            if (file.endsWith('.py')) {
                fs.copyFileSync(
                    path.join(utilsDir, file),
                    path.join(outUtilsDir, file)
                );
            }
        });
    }
    
    console.log('✅ Python files copied successfully');
} catch (error) {
    console.error('❌ Failed to copy Python files:', error.message);
    process.exit(1);
}

// Step 5: Package extension
console.log('\n📦 Packaging extension...');
try {
    execSync('npm run package', { stdio: 'inherit' });
    console.log('✅ Extension packaged successfully');
} catch (error) {
    console.error('❌ Failed to package extension:', error.message);
    process.exit(1);
}

// Step 6: Show build summary
console.log('\n🎉 Build completed successfully!');
console.log('\n📋 Build Summary:');
console.log(`   Extension: ${packageJson.displayName} v${packageJson.version}`);
console.log(`   Package: ${packageJson.name}-${packageJson.version}.vsix`);
console.log('\n📖 Next steps:');
console.log('   1. Test the extension: code --install-extension *.vsix');
console.log('   2. Publish to marketplace: vsce publish');
console.log('   3. Create GitHub release with the .vsix file');

// Check if .vsix file was created
const vsixFiles = fs.readdirSync(process.cwd()).filter(file => file.endsWith('.vsix'));
if (vsixFiles.length > 0) {
    console.log(`\n📁 Generated package: ${vsixFiles[0]}`);
} else {
    console.warn('\n⚠️  Warning: No .vsix file found after packaging');
}
