import * as vscode from 'vscode';

export interface ProgressStep {
    name: string;
    weight: number;
    message?: string;
}

export interface ProgressOptions {
    title: string;
    location?: vscode.ProgressLocation;
    cancellable?: boolean;
    steps?: ProgressStep[];
}

export class ProgressManager {
    private currentProgress: number = 0;
    private totalWeight: number = 0;
    private completedWeight: number = 0;
    private steps: ProgressStep[] = [];
    private currentStepIndex: number = 0;

    constructor(private options: ProgressOptions) {
        this.steps = options.steps || [];
        this.totalWeight = this.steps.reduce((sum, step) => sum + step.weight, 100);
    }

    async execute<T>(
        task: (progress: vscode.Progress<{increment?: number; message?: string}>, token: vscode.CancellationToken) => Promise<T>
    ): Promise<T> {
        return vscode.window.withProgress(
            {
                location: this.options.location || vscode.ProgressLocation.Notification,
                title: this.options.title,
                cancellable: this.options.cancellable || false
            },
            async (progress, token) => {
                const enhancedProgress = this.createEnhancedProgress(progress);
                return await task(enhancedProgress, token);
            }
        );
    }

    private createEnhancedProgress(
        originalProgress: vscode.Progress<{increment?: number; message?: string}>
    ): vscode.Progress<{increment?: number; message?: string}> {
        return {
            report: (value: {increment?: number; message?: string}) => {
                if (value.increment !== undefined) {
                    this.currentProgress += value.increment;
                }
                
                const message = value.message || this.getCurrentStepMessage();
                const progressPercentage = Math.min(100, Math.max(0, this.currentProgress));
                
                originalProgress.report({
                    increment: value.increment,
                    message: `${message} (${Math.round(progressPercentage)}%)`
                });
            }
        };
    }

    startStep(stepName: string, customMessage?: string): void {
        const step = this.steps.find(s => s.name === stepName);
        if (step) {
            this.currentStepIndex = this.steps.indexOf(step);
            const message = customMessage || step.message || stepName;
            this.reportProgress(0, message);
        }
    }

    completeStep(stepName: string): void {
        const step = this.steps.find(s => s.name === stepName);
        if (step) {
            this.completedWeight += step.weight;
            const progressIncrement = (step.weight / this.totalWeight) * 100;
            this.currentProgress = (this.completedWeight / this.totalWeight) * 100;
            this.reportProgress(progressIncrement, `${stepName} completed`);
        }
    }

    updateStepProgress(stepName: string, percentage: number, message?: string): void {
        const step = this.steps.find(s => s.name === stepName);
        if (step) {
            const stepProgress = (percentage / 100) * step.weight;
            const totalProgress = (this.completedWeight + stepProgress) / this.totalWeight * 100;
            const increment = totalProgress - this.currentProgress;
            this.currentProgress = totalProgress;
            
            const displayMessage = message || step.message || stepName;
            this.reportProgress(increment, `${displayMessage} (${percentage}%)`);
        }
    }

    private reportProgress(increment: number, message: string): void {
        // This would be called by the enhanced progress reporter
        // The actual reporting is handled by the enhanced progress object
    }

    private getCurrentStepMessage(): string {
        if (this.currentStepIndex < this.steps.length) {
            const currentStep = this.steps[this.currentStepIndex];
            return currentStep.message || currentStep.name;
        }
        return 'Processing...';
    }

    reset(): void {
        this.currentProgress = 0;
        this.completedWeight = 0;
        this.currentStepIndex = 0;
    }
}

export class MultiStepProgress {
    private progressManager: ProgressManager;
    private progress: vscode.Progress<{increment?: number; message?: string}> | null = null;

    constructor(private options: ProgressOptions) {
        this.progressManager = new ProgressManager(options);
    }

    async execute<T>(
        task: (manager: MultiStepProgress, token: vscode.CancellationToken) => Promise<T>
    ): Promise<T> {
        return this.progressManager.execute(async (progress, token) => {
            this.progress = progress;
            try {
                return await task(this, token);
            } finally {
                this.progress = null;
            }
        });
    }

    startStep(stepName: string, customMessage?: string): void {
        this.progressManager.startStep(stepName, customMessage);
    }

    completeStep(stepName: string): void {
        this.progressManager.completeStep(stepName);
    }

    updateStepProgress(stepName: string, percentage: number, message?: string): void {
        this.progressManager.updateStepProgress(stepName, percentage, message);
    }

    report(increment: number, message: string): void {
        if (this.progress) {
            this.progress.report({ increment, message });
        }
    }

    reportMessage(message: string): void {
        if (this.progress) {
            this.progress.report({ message });
        }
    }
}

// Predefined progress configurations
export const CLEANUP_PROGRESS_STEPS: ProgressStep[] = [
    { name: 'validation', weight: 10, message: 'Validating environment' },
    { name: 'backup', weight: 20, message: 'Creating backups' },
    { name: 'telemetry', weight: 25, message: 'Modifying telemetry IDs' },
    { name: 'database', weight: 25, message: 'Cleaning database' },
    { name: 'workspace', weight: 20, message: 'Cleaning workspace storage' }
];

export const TELEMETRY_PROGRESS_STEPS: ProgressStep[] = [
    { name: 'validation', weight: 20, message: 'Validating files' },
    { name: 'backup', weight: 30, message: 'Creating backups' },
    { name: 'generate', weight: 25, message: 'Generating new IDs' },
    { name: 'update', weight: 25, message: 'Updating files' }
];

export const DATABASE_PROGRESS_STEPS: ProgressStep[] = [
    { name: 'validation', weight: 15, message: 'Validating database' },
    { name: 'backup', weight: 35, message: 'Creating database backup' },
    { name: 'clean', weight: 50, message: 'Cleaning records' }
];

export const WORKSPACE_PROGRESS_STEPS: ProgressStep[] = [
    { name: 'validation', weight: 10, message: 'Validating workspace' },
    { name: 'backup', weight: 40, message: 'Creating workspace backup' },
    { name: 'clean', weight: 50, message: 'Cleaning workspace files' }
];
