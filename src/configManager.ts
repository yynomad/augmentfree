import * as vscode from 'vscode';

export interface ExtensionConfig {
    autoBackup: boolean;
    confirmBeforeCleanup: boolean;
    showDetailedProgress: boolean;
    pythonPath?: string;
    backupRetentionDays: number;
    enableLogging: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class ConfigManager {
    private static readonly CONFIG_SECTION = 'free-augmentcode';
    
    private static readonly DEFAULT_CONFIG: ExtensionConfig = {
        autoBackup: true,
        confirmBeforeCleanup: true,
        showDetailedProgress: true,
        backupRetentionDays: 30,
        enableLogging: true,
        logLevel: 'info'
    };

    static getConfig(): ExtensionConfig {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        
        return {
            autoBackup: config.get('autoBackup', this.DEFAULT_CONFIG.autoBackup),
            confirmBeforeCleanup: config.get('confirmBeforeCleanup', this.DEFAULT_CONFIG.confirmBeforeCleanup),
            showDetailedProgress: config.get('showDetailedProgress', this.DEFAULT_CONFIG.showDetailedProgress),
            pythonPath: config.get('pythonPath'),
            backupRetentionDays: config.get('backupRetentionDays', this.DEFAULT_CONFIG.backupRetentionDays),
            enableLogging: config.get('enableLogging', this.DEFAULT_CONFIG.enableLogging),
            logLevel: config.get('logLevel', this.DEFAULT_CONFIG.logLevel)
        };
    }

    static async updateConfig(key: keyof ExtensionConfig, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }

    static async resetConfig(): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        
        for (const key of Object.keys(this.DEFAULT_CONFIG) as Array<keyof ExtensionConfig>) {
            await config.update(key, undefined, vscode.ConfigurationTarget.Global);
        }
    }

    static onConfigChanged(callback: (config: ExtensionConfig) => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration(this.CONFIG_SECTION)) {
                callback(this.getConfig());
            }
        });
    }

    static async showConfigurationDialog(): Promise<void> {
        const config = this.getConfig();
        
        const items: vscode.QuickPickItem[] = [
            {
                label: '$(gear) Auto Backup',
                description: config.autoBackup ? 'Enabled' : 'Disabled',
                detail: 'Automatically create backups before cleanup operations'
            },
            {
                label: '$(question) Confirm Before Cleanup',
                description: config.confirmBeforeCleanup ? 'Enabled' : 'Disabled',
                detail: 'Show confirmation dialog before performing cleanup operations'
            },
            {
                label: '$(info) Show Detailed Progress',
                description: config.showDetailedProgress ? 'Enabled' : 'Disabled',
                detail: 'Show detailed progress information during operations'
            },
            {
                label: '$(file-code) Python Path',
                description: config.pythonPath || 'Auto-detect',
                detail: 'Custom Python executable path (leave empty for auto-detection)'
            },
            {
                label: '$(calendar) Backup Retention',
                description: `${config.backupRetentionDays} days`,
                detail: 'Number of days to keep backup files'
            },
            {
                label: '$(output) Enable Logging',
                description: config.enableLogging ? 'Enabled' : 'Disabled',
                detail: 'Enable detailed logging for troubleshooting'
            },
            {
                label: '$(list-selection) Log Level',
                description: config.logLevel.toUpperCase(),
                detail: 'Minimum log level to display'
            },
            {
                label: '$(refresh) Reset to Defaults',
                description: 'Reset all settings',
                detail: 'Restore all configuration options to their default values'
            }
        ];

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a configuration option to modify',
            ignoreFocusOut: true
        });

        if (!selected) {
            return;
        }

        await this.handleConfigSelection(selected.label, config);
    }

    private static async handleConfigSelection(label: string, config: ExtensionConfig): Promise<void> {
        switch (true) {
            case label.includes('Auto Backup'):
                await this.updateConfig('autoBackup', !config.autoBackup);
                vscode.window.showInformationMessage(`Auto backup ${!config.autoBackup ? 'enabled' : 'disabled'}`);
                break;

            case label.includes('Confirm Before Cleanup'):
                await this.updateConfig('confirmBeforeCleanup', !config.confirmBeforeCleanup);
                vscode.window.showInformationMessage(`Confirmation dialog ${!config.confirmBeforeCleanup ? 'enabled' : 'disabled'}`);
                break;

            case label.includes('Show Detailed Progress'):
                await this.updateConfig('showDetailedProgress', !config.showDetailedProgress);
                vscode.window.showInformationMessage(`Detailed progress ${!config.showDetailedProgress ? 'enabled' : 'disabled'}`);
                break;

            case label.includes('Python Path'):
                const pythonPath = await vscode.window.showInputBox({
                    prompt: 'Enter custom Python executable path (leave empty for auto-detection)',
                    value: config.pythonPath || '',
                    placeHolder: '/usr/bin/python3 or C:\\Python\\python.exe'
                });
                
                if (pythonPath !== undefined) {
                    await this.updateConfig('pythonPath', pythonPath || undefined);
                    vscode.window.showInformationMessage('Python path updated');
                }
                break;

            case label.includes('Backup Retention'):
                const retentionInput = await vscode.window.showInputBox({
                    prompt: 'Enter number of days to keep backup files',
                    value: config.backupRetentionDays.toString(),
                    validateInput: (value) => {
                        const num = parseInt(value);
                        if (isNaN(num) || num < 1 || num > 365) {
                            return 'Please enter a number between 1 and 365';
                        }
                        return null;
                    }
                });
                
                if (retentionInput) {
                    await this.updateConfig('backupRetentionDays', parseInt(retentionInput));
                    vscode.window.showInformationMessage(`Backup retention set to ${retentionInput} days`);
                }
                break;

            case label.includes('Enable Logging'):
                await this.updateConfig('enableLogging', !config.enableLogging);
                vscode.window.showInformationMessage(`Logging ${!config.enableLogging ? 'enabled' : 'disabled'}`);
                break;

            case label.includes('Log Level'):
                const logLevels: Array<{label: string; value: ExtensionConfig['logLevel']}> = [
                    { label: 'Debug', value: 'debug' },
                    { label: 'Info', value: 'info' },
                    { label: 'Warning', value: 'warn' },
                    { label: 'Error', value: 'error' }
                ];
                
                const selectedLevel = await vscode.window.showQuickPick(
                    logLevels.map(level => ({
                        label: level.label,
                        description: level.value === config.logLevel ? '(current)' : '',
                        value: level.value
                    })),
                    { placeHolder: 'Select log level' }
                );
                
                if (selectedLevel) {
                    await this.updateConfig('logLevel', selectedLevel.value);
                    vscode.window.showInformationMessage(`Log level set to ${selectedLevel.label}`);
                }
                break;

            case label.includes('Reset to Defaults'):
                const confirm = await vscode.window.showWarningMessage(
                    'Are you sure you want to reset all settings to their default values?',
                    { modal: true },
                    'Yes',
                    'No'
                );
                
                if (confirm === 'Yes') {
                    await this.resetConfig();
                    vscode.window.showInformationMessage('Configuration reset to defaults');
                }
                break;
        }
    }
}
