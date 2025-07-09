import * as vscode from 'vscode';
import { Logger } from './utils';

export interface OperationStatus {
    isRunning: boolean;
    operation: string;
    startTime?: Date;
    progress?: number;
}

export class StatusManager {
    private statusBarItem: vscode.StatusBarItem;
    private logger: Logger;
    private currentStatus: OperationStatus = { isRunning: false, operation: '' };

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.logger = new Logger('Free AugmentCode');
        this.updateStatusBar();
    }

    startOperation(operation: string): void {
        this.currentStatus = {
            isRunning: true,
            operation: operation,
            startTime: new Date(),
            progress: 0
        };
        this.logger.info(`Started operation: ${operation}`);
        this.updateStatusBar();
    }

    updateProgress(progress: number, message?: string): void {
        if (this.currentStatus.isRunning) {
            this.currentStatus.progress = progress;
            if (message) {
                this.currentStatus.operation = message;
            }
            this.updateStatusBar();
        }
    }

    completeOperation(success: boolean, message?: string): void {
        const duration = this.currentStatus.startTime 
            ? Date.now() - this.currentStatus.startTime.getTime()
            : 0;

        if (success) {
            this.logger.info(`Operation completed successfully in ${duration}ms: ${this.currentStatus.operation}`);
        } else {
            this.logger.error(`Operation failed after ${duration}ms: ${this.currentStatus.operation}`, 
                message ? new Error(message) : undefined);
        }

        this.currentStatus = { isRunning: false, operation: '' };
        this.updateStatusBar();
    }

    private updateStatusBar(): void {
        if (this.currentStatus.isRunning) {
            const progressText = this.currentStatus.progress !== undefined 
                ? ` (${Math.round(this.currentStatus.progress)}%)`
                : '';
            this.statusBarItem.text = `$(sync~spin) ${this.currentStatus.operation}${progressText}`;
            this.statusBarItem.tooltip = `Free AugmentCode: ${this.currentStatus.operation}`;
            this.statusBarItem.show();
        } else {
            this.statusBarItem.text = '$(check) Free AugmentCode';
            this.statusBarItem.tooltip = 'Free AugmentCode: Ready';
            this.statusBarItem.command = 'free-augmentcode.cleanupData';
            this.statusBarItem.show();
        }
    }

    showLogs(): void {
        this.logger.show();
    }

    dispose(): void {
        this.statusBarItem.dispose();
        this.logger.dispose();
    }
}
