import * as vscode from 'vscode';

export async function showProgressWithCancellation<T>(
    title: string,
    task: (progress: vscode.Progress<{increment?: number; message?: string}>, token: vscode.CancellationToken) => Promise<T>
): Promise<T> {
    return vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: title,
            cancellable: true
        },
        task
    );
}

export async function showConfirmationDialog(title: string, message: string): Promise<boolean> {
    const result = await vscode.window.showWarningMessage(
        message,
        { modal: true, detail: title },
        'Yes',
        'No'
    );
    return result === 'Yes';
}

export async function showErrorMessage(message: string): Promise<void> {
    await vscode.window.showErrorMessage(message);
}

export async function showSuccessMessage(message: string, ...actions: string[]): Promise<string | undefined> {
    return await vscode.window.showInformationMessage(message, ...actions);
}

export async function showInputBox(prompt: string, placeholder?: string): Promise<string | undefined> {
    return await vscode.window.showInputBox({
        prompt: prompt,
        placeHolder: placeholder
    });
}

export function formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

export class Logger {
    private outputChannel: vscode.OutputChannel;

    constructor(name: string) {
        this.outputChannel = vscode.window.createOutputChannel(name);
    }

    info(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] INFO: ${message}`);
    }

    error(message: string, error?: Error): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ERROR: ${message}`);
        if (error) {
            this.outputChannel.appendLine(`[${timestamp}] ERROR DETAILS: ${error.message}`);
            if (error.stack) {
                this.outputChannel.appendLine(`[${timestamp}] STACK TRACE: ${error.stack}`);
            }
        }
    }

    warn(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] WARN: ${message}`);
    }

    debug(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] DEBUG: ${message}`);
    }

    show(): void {
        this.outputChannel.show();
    }

    dispose(): void {
        this.outputChannel.dispose();
    }
}
