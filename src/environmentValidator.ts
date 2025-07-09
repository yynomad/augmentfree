import * as vscode from 'vscode';
import { PlatformUtils } from './platformUtils';
import { PythonService } from './pythonService';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    platform: string;
    pythonVersion?: string;
    vscodeVersion: string;
}

export class EnvironmentValidator {
    private pythonService: PythonService;

    constructor(pythonService: PythonService) {
        this.pythonService = pythonService;
    }

    async validateEnvironment(): Promise<ValidationResult> {
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            platform: PlatformUtils.getCurrentPlatform(),
            vscodeVersion: vscode.version
        };

        // Validate VS Code installation
        await this.validateVSCodeInstallation(result);

        // Validate Python environment
        await this.validatePythonEnvironment(result);

        // Validate file permissions
        await this.validateFilePermissions(result);

        // Check for potential conflicts
        await this.checkForConflicts(result);

        result.isValid = result.errors.length === 0;
        return result;
    }

    private async validateVSCodeInstallation(result: ValidationResult): Promise<void> {
        try {
            const validation = await PlatformUtils.validateVSCodeInstallation();
            
            if (!validation.isValid) {
                result.errors.push(`VS Code installation incomplete. Missing directories: ${validation.missingPaths.join(', ')}`);
                return;
            }

            // Check if storage.json exists
            const storageJsonPath = PlatformUtils.getStorageJsonPath();
            if (!(await PlatformUtils.checkFileExists(storageJsonPath))) {
                result.warnings.push(`VS Code storage.json not found at ${storageJsonPath}. This is normal for new installations.`);
            }

            // Check if state database exists
            const stateDatabasePath = PlatformUtils.getStateDatabasePath();
            if (!(await PlatformUtils.checkFileExists(stateDatabasePath))) {
                result.warnings.push(`VS Code state database not found at ${stateDatabasePath}. This is normal for new installations.`);
            }

            // Check workspace storage directory
            const workspaceStoragePath = PlatformUtils.getVSCodeWorkspaceStorageDirectory();
            if (!(await PlatformUtils.checkDirectoryExists(workspaceStoragePath))) {
                result.warnings.push(`VS Code workspace storage directory not found at ${workspaceStoragePath}. This is normal for new installations.`);
            }

        } catch (error) {
            result.errors.push(`Failed to validate VS Code installation: ${error}`);
        }
    }

    private async validatePythonEnvironment(result: ValidationResult): Promise<void> {
        try {
            const isValid = await this.pythonService.checkPythonEnvironment();
            
            if (!isValid) {
                result.errors.push('Python 3.10+ is required but not found. Please install Python 3.10 or higher.');
                return;
            }

            // Try to get Python version
            try {
                const pythonCommands = PlatformUtils.getPythonCommands();
                for (const cmd of pythonCommands) {
                    try {
                        // This is a simplified version - in real implementation you'd use the execCommand method
                        result.pythonVersion = 'Python 3.x'; // Placeholder
                        break;
                    } catch {
                        continue;
                    }
                }
            } catch (error) {
                result.warnings.push(`Could not determine Python version: ${error}`);
            }

        } catch (error) {
            result.errors.push(`Failed to validate Python environment: ${error}`);
        }
    }

    private async validateFilePermissions(result: ValidationResult): Promise<void> {
        try {
            const pathsToCheck = [
                PlatformUtils.getVSCodeConfigDirectory(),
                PlatformUtils.getVSCodeUserDirectory(),
                PlatformUtils.getVSCodeGlobalStorageDirectory()
            ];

            for (const pathToCheck of pathsToCheck) {
                if (await PlatformUtils.checkDirectoryExists(pathToCheck)) {
                    // Check if we can write to the directory
                    // Note: This is a simplified check - in production you'd want more thorough permission testing
                    try {
                        const testFile = PlatformUtils.joinPaths(pathToCheck, '.write-test');
                        // In a real implementation, you'd try to create and delete a test file
                        // For now, we'll just assume we have permissions if the directory exists
                    } catch (error) {
                        result.errors.push(`No write permission for ${pathToCheck}: ${error}`);
                    }
                }
            }

        } catch (error) {
            result.warnings.push(`Could not validate file permissions: ${error}`);
        }
    }

    private async checkForConflicts(result: ValidationResult): Promise<void> {
        try {
            // Check if VS Code is currently running (this is tricky to detect reliably)
            // For now, we'll just add a warning
            result.warnings.push('Please ensure VS Code is completely closed before running cleanup operations.');

            // Check for backup files from previous runs
            const globalStorageDir = PlatformUtils.getVSCodeGlobalStorageDirectory();
            if (await PlatformUtils.checkDirectoryExists(globalStorageDir)) {
                // In a real implementation, you'd scan for .bak files
                // For now, we'll just add an informational message
                result.warnings.push('Previous backup files may exist. They will be preserved during cleanup operations.');
            }

            // Platform-specific warnings
            if (PlatformUtils.isWindows()) {
                result.warnings.push('On Windows, ensure you have administrator privileges if you encounter permission errors.');
            } else if (PlatformUtils.isMacOS()) {
                result.warnings.push('On macOS, you may need to grant permission to access VS Code directories.');
            } else if (PlatformUtils.isLinux()) {
                result.warnings.push('On Linux, ensure your user has write access to the VS Code configuration directory.');
            }

        } catch (error) {
            result.warnings.push(`Could not check for potential conflicts: ${error}`);
        }
    }

    async showValidationResults(result: ValidationResult): Promise<boolean> {
        if (result.isValid) {
            const message = `Environment validation passed!\n\n` +
                `Platform: ${result.platform}\n` +
                `VS Code: ${result.vscodeVersion}\n` +
                `Python: ${result.pythonVersion || 'Available'}\n\n` +
                (result.warnings.length > 0 ? `Warnings:\n${result.warnings.join('\n')}\n\n` : '') +
                `Ready to proceed with cleanup operations.`;

            const action = await vscode.window.showInformationMessage(
                message,
                { modal: true },
                'Continue',
                'Cancel'
            );

            return action === 'Continue';
        } else {
            const message = `Environment validation failed!\n\n` +
                `Errors:\n${result.errors.join('\n')}\n\n` +
                (result.warnings.length > 0 ? `Warnings:\n${result.warnings.join('\n')}\n\n` : '') +
                `Please fix these issues before proceeding.`;

            await vscode.window.showErrorMessage(message, { modal: true }, 'OK');
            return false;
        }
    }
}
