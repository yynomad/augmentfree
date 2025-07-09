import * as vscode from 'vscode';
import { Logger } from './utils';

export enum ErrorSeverity {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Critical = 'critical'
}

export interface ErrorDetails {
    code: string;
    message: string;
    severity: ErrorSeverity;
    timestamp: Date;
    context?: any;
    stack?: string;
    userMessage?: string;
    suggestedActions?: string[];
}

export class ErrorHandler {
    private logger: Logger;
    private errorHistory: ErrorDetails[] = [];

    constructor() {
        this.logger = new Logger('Free AugmentCode - Error Handler');
    }

    async handleError(error: Error | string, context?: any, userMessage?: string): Promise<void> {
        const errorDetails = this.createErrorDetails(error, context, userMessage);
        this.errorHistory.push(errorDetails);
        
        // Log the error
        this.logger.error(errorDetails.message, error instanceof Error ? error : undefined);
        
        // Show user-friendly message based on severity
        await this.showUserMessage(errorDetails);
    }

    private createErrorDetails(error: Error | string, context?: any, userMessage?: string): ErrorDetails {
        const message = error instanceof Error ? error.message : error;
        const stack = error instanceof Error ? error.stack : undefined;
        
        return {
            code: this.generateErrorCode(message),
            message,
            severity: this.determineSeverity(message),
            timestamp: new Date(),
            context,
            stack,
            userMessage: userMessage || this.generateUserFriendlyMessage(message),
            suggestedActions: this.generateSuggestedActions(message)
        };
    }

    private generateErrorCode(message: string): string {
        // Generate a simple error code based on message content
        if (message.toLowerCase().includes('python')) return 'PYTHON_ERROR';
        if (message.toLowerCase().includes('permission')) return 'PERMISSION_ERROR';
        if (message.toLowerCase().includes('file not found')) return 'FILE_NOT_FOUND';
        if (message.toLowerCase().includes('database')) return 'DATABASE_ERROR';
        if (message.toLowerCase().includes('network')) return 'NETWORK_ERROR';
        return 'GENERAL_ERROR';
    }

    private determineSeverity(message: string): ErrorSeverity {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('critical') || lowerMessage.includes('fatal')) {
            return ErrorSeverity.Critical;
        }
        if (lowerMessage.includes('permission') || lowerMessage.includes('access denied')) {
            return ErrorSeverity.Error;
        }
        if (lowerMessage.includes('not found') || lowerMessage.includes('missing')) {
            return ErrorSeverity.Warning;
        }
        
        return ErrorSeverity.Error;
    }

    private generateUserFriendlyMessage(message: string): string {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('python')) {
            return 'Python is not installed or not accessible. Please install Python 3.10 or higher.';
        }
        if (lowerMessage.includes('permission') || lowerMessage.includes('access denied')) {
            return 'Permission denied. Please ensure you have the necessary permissions to access VS Code files.';
        }
        if (lowerMessage.includes('file not found')) {
            return 'Required file not found. This might be normal for new VS Code installations.';
        }
        if (lowerMessage.includes('database')) {
            return 'Database operation failed. The VS Code database might be locked or corrupted.';
        }
        
        return 'An unexpected error occurred. Please check the logs for more details.';
    }

    private generateSuggestedActions(message: string): string[] {
        const lowerMessage = message.toLowerCase();
        const actions: string[] = [];
        
        if (lowerMessage.includes('python')) {
            actions.push('Install Python 3.10 or higher from python.org');
            actions.push('Ensure Python is added to your system PATH');
            actions.push('Restart VS Code after installing Python');
        }
        
        if (lowerMessage.includes('permission')) {
            actions.push('Close VS Code completely before running the operation');
            actions.push('Run VS Code as administrator (Windows) or with sudo (Linux/macOS)');
            actions.push('Check file permissions in VS Code configuration directory');
        }
        
        if (lowerMessage.includes('file not found')) {
            actions.push('Ensure VS Code has been run at least once');
            actions.push('Check if VS Code is installed correctly');
            actions.push('Try logging into AugmentCode plugin first');
        }
        
        if (lowerMessage.includes('database')) {
            actions.push('Close VS Code completely');
            actions.push('Wait a few seconds and try again');
            actions.push('Restart your computer if the issue persists');
        }
        
        if (actions.length === 0) {
            actions.push('Check the error logs for more details');
            actions.push('Try restarting VS Code');
            actions.push('Report this issue if it persists');
        }
        
        return actions;
    }

    private async showUserMessage(errorDetails: ErrorDetails): Promise<void> {
        const message = errorDetails.userMessage || errorDetails.message;
        const actions = ['Show Details', 'Show Logs'];
        
        if (errorDetails.suggestedActions && errorDetails.suggestedActions.length > 0) {
            actions.unshift('Show Solutions');
        }
        
        let result: string | undefined;
        
        switch (errorDetails.severity) {
            case ErrorSeverity.Critical:
            case ErrorSeverity.Error:
                result = await vscode.window.showErrorMessage(message, ...actions);
                break;
            case ErrorSeverity.Warning:
                result = await vscode.window.showWarningMessage(message, ...actions);
                break;
            case ErrorSeverity.Info:
                result = await vscode.window.showInformationMessage(message, ...actions);
                break;
        }
        
        if (result === 'Show Details') {
            await this.showErrorDetails(errorDetails);
        } else if (result === 'Show Logs') {
            this.logger.show();
        } else if (result === 'Show Solutions') {
            await this.showSuggestedActions(errorDetails);
        }
    }

    private async showErrorDetails(errorDetails: ErrorDetails): Promise<void> {
        const details = `Error Code: ${errorDetails.code}\n` +
            `Severity: ${errorDetails.severity}\n` +
            `Time: ${errorDetails.timestamp.toLocaleString()}\n` +
            `Message: ${errorDetails.message}\n` +
            (errorDetails.context ? `Context: ${JSON.stringify(errorDetails.context, null, 2)}\n` : '') +
            (errorDetails.stack ? `\nStack Trace:\n${errorDetails.stack}` : '');
        
        await vscode.window.showInformationMessage(
            details,
            { modal: true },
            'Copy to Clipboard',
            'Close'
        ).then(result => {
            if (result === 'Copy to Clipboard') {
                vscode.env.clipboard.writeText(details);
                vscode.window.showInformationMessage('Error details copied to clipboard');
            }
        });
    }

    private async showSuggestedActions(errorDetails: ErrorDetails): Promise<void> {
        if (!errorDetails.suggestedActions || errorDetails.suggestedActions.length === 0) {
            return;
        }
        
        const message = `Suggested solutions for: ${errorDetails.userMessage}\n\n` +
            errorDetails.suggestedActions.map((action, index) => `${index + 1}. ${action}`).join('\n');
        
        await vscode.window.showInformationMessage(
            message,
            { modal: true },
            'Copy Solutions',
            'Close'
        ).then(result => {
            if (result === 'Copy Solutions') {
                vscode.env.clipboard.writeText(message);
                vscode.window.showInformationMessage('Solutions copied to clipboard');
            }
        });
    }

    getErrorHistory(): ErrorDetails[] {
        return [...this.errorHistory];
    }

    clearErrorHistory(): void {
        this.errorHistory = [];
    }

    dispose(): void {
        this.logger.dispose();
    }
}
