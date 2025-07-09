import * as vscode from 'vscode';
import { PythonService } from './pythonService';
import { showProgressWithCancellation, showConfirmationDialog, showErrorMessage, showSuccessMessage } from './utils';
import { StatusManager } from './statusManager';
import { EnvironmentValidator } from './environmentValidator';
import { ErrorHandler } from './errorHandler';
import { MultiStepProgress, CLEANUP_PROGRESS_STEPS, TELEMETRY_PROGRESS_STEPS, DATABASE_PROGRESS_STEPS, WORKSPACE_PROGRESS_STEPS } from './progressManager';
import { ConfigManager } from './configManager';

let pythonService: PythonService;
let statusManager: StatusManager;
let environmentValidator: EnvironmentValidator;
let errorHandler: ErrorHandler;
let errorHandler: ErrorHandler;

export function activate(context: vscode.ExtensionContext) {
    console.log('Free AugmentCode extension is now active!');

    pythonService = new PythonService(context);
    statusManager = new StatusManager();
    environmentValidator = new EnvironmentValidator(pythonService);
    errorHandler = new ErrorHandler();

    // Register commands
    const cleanupDataCommand = vscode.commands.registerCommand('free-augmentcode.cleanupData', async () => {
        await executeCleanupData();
    });

    const modifyTelemetryIdsCommand = vscode.commands.registerCommand('free-augmentcode.modifyTelemetryIds', async () => {
        await executeModifyTelemetryIds();
    });

    const cleanDatabaseCommand = vscode.commands.registerCommand('free-augmentcode.cleanDatabase', async () => {
        await executeCleanDatabase();
    });

    const cleanWorkspaceCommand = vscode.commands.registerCommand('free-augmentcode.cleanWorkspace', async () => {
        await executeCleanWorkspace();
    });

    // Register show logs command
    const showLogsCommand = vscode.commands.registerCommand('free-augmentcode.showLogs', () => {
        statusManager.showLogs();
    });

    // Register settings command
    const openSettingsCommand = vscode.commands.registerCommand('free-augmentcode.openSettings', async () => {
        await ConfigManager.showConfigurationDialog();
    });

    context.subscriptions.push(
        cleanupDataCommand,
        modifyTelemetryIdsCommand,
        cleanDatabaseCommand,
        cleanWorkspaceCommand,
        showLogsCommand,
        openSettingsCommand,
        statusManager
    );
}

async function validateEnvironmentBeforeOperation(): Promise<boolean> {
    try {
        statusManager.startOperation('Validating environment...');
        const validationResult = await environmentValidator.validateEnvironment();
        statusManager.completeOperation(true);

        return await environmentValidator.showValidationResults(validationResult);
    } catch (error) {
        statusManager.completeOperation(false, `Environment validation failed: ${error}`);
        await errorHandler.handleError(error as Error, { operation: 'environment_validation' });
        return false;
    }
}

async function executeCleanupData() {
    // First validate the environment
    if (!(await validateEnvironmentBeforeOperation())) {
        return;
    }

    const confirmed = await showConfirmationDialog(
        'Clean AugmentCode Data',
        'This will modify telemetry IDs, clean the database, and clean workspace storage. VS Code will need to be restarted after this operation. Continue?'
    );

    if (!confirmed) {
        return;
    }

    try {
        const progressManager = new MultiStepProgress({
            title: 'Cleaning AugmentCode Data',
            cancellable: true,
            steps: CLEANUP_PROGRESS_STEPS
        });

        await progressManager.execute(async (manager, token) => {
            // Step 1: Modify Telemetry IDs
            manager.startStep('telemetry', 'Modifying telemetry IDs...');
            const telemetryResult = await pythonService.modifyTelemetryIds();
            manager.completeStep('telemetry');

            if (token.isCancellationRequested) {
                return;
            }

            // Step 2: Clean Database
            manager.startStep('database', 'Cleaning database...');
            const dbResult = await pythonService.cleanDatabase();
            manager.completeStep('database');

            if (token.isCancellationRequested) {
                return;
            }

            // Step 3: Clean Workspace
            manager.startStep('workspace', 'Cleaning workspace storage...');
            const wsResult = await pythonService.cleanWorkspaceStorage();
            manager.completeStep('workspace');

            // Show results
            const message = `Cleanup completed successfully!\n\n` +
                `Telemetry IDs: Modified (${telemetryResult.new_machine_id.substring(0, 8)}...)\n` +
                `Database: ${dbResult.deleted_rows} rows deleted\n` +
                `Workspace: ${wsResult.deleted_files_count} files deleted\n\n` +
                `Please restart VS Code to complete the process.`;

            await showSuccessMessage(message, 'Restart VS Code');
        });
    } catch (error) {
        await errorHandler.handleError(error as Error, { operation: 'cleanup_data' }, 'Failed to clean AugmentCode data');
    }
}

async function executeModifyTelemetryIds() {
    const confirmed = await showConfirmationDialog(
        'Modify Telemetry IDs',
        'This will modify the telemetry machine ID and device ID. Continue?'
    );

    if (!confirmed) {
        return;
    }

    try {
        await showProgressWithCancellation(
            'Modifying Telemetry IDs',
            async (progress) => {
                progress.report({ increment: 0, message: 'Modifying telemetry IDs...' });
                const result = await pythonService.modifyTelemetryIds();
                progress.report({ increment: 100, message: 'Telemetry IDs modified!' });

                const message = `Telemetry IDs modified successfully!\n\n` +
                    `Old Machine ID: ${result.old_machine_id}\n` +
                    `New Machine ID: ${result.new_machine_id}\n` +
                    `Old Device ID: ${result.old_device_id}\n` +
                    `New Device ID: ${result.new_device_id}`;

                await showSuccessMessage(message);
            }
        );
    } catch (error) {
        await showErrorMessage(`Failed to modify telemetry IDs: ${error}`);
    }
}

async function executeCleanDatabase() {
    const confirmed = await showConfirmationDialog(
        'Clean Database',
        'This will delete all records containing "augment" from the VS Code database. Continue?'
    );

    if (!confirmed) {
        return;
    }

    try {
        await showProgressWithCancellation(
            'Cleaning Database',
            async (progress) => {
                progress.report({ increment: 0, message: 'Cleaning database...' });
                const result = await pythonService.cleanDatabase();
                progress.report({ increment: 100, message: 'Database cleaned!' });

                const message = `Database cleaned successfully!\n\n` +
                    `Deleted ${result.deleted_rows} rows containing 'augment'`;

                await showSuccessMessage(message);
            }
        );
    } catch (error) {
        await showErrorMessage(`Failed to clean database: ${error}`);
    }
}

async function executeCleanWorkspace() {
    const confirmed = await showConfirmationDialog(
        'Clean Workspace Storage',
        'This will delete all files from the VS Code workspace storage directory. Continue?'
    );

    if (!confirmed) {
        return;
    }

    try {
        await showProgressWithCancellation(
            'Cleaning Workspace Storage',
            async (progress) => {
                progress.report({ increment: 0, message: 'Cleaning workspace storage...' });
                const result = await pythonService.cleanWorkspaceStorage();
                progress.report({ increment: 100, message: 'Workspace storage cleaned!' });

                const message = `Workspace storage cleaned successfully!\n\n` +
                    `Deleted ${result.deleted_files_count} files`;

                await showSuccessMessage(message);
            }
        );
    } catch (error) {
        await showErrorMessage(`Failed to clean workspace storage: ${error}`);
    }
}

export function deactivate() {
    if (pythonService) {
        pythonService.dispose();
    }
    if (statusManager) {
        statusManager.dispose();
    }
}
