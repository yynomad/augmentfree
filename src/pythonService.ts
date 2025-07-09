import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { PlatformUtils } from './platformUtils';

export interface TelemetryResult {
    old_machine_id: string;
    new_machine_id: string;
    old_device_id: string;
    new_device_id: string;
    storage_backup_path: string;
    machine_id_backup_path: string | null;
}

export interface DatabaseResult {
    db_backup_path: string;
    deleted_rows: number;
}

export interface WorkspaceResult {
    backup_path: string;
    deleted_files_count: number;
}

export class PythonService {
    private context: vscode.ExtensionContext;
    private pythonPath: string = '';
    private serverProcess: ChildProcess | null = null;
    private serverPort: number = 0;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initializePythonPath();
    }

    private async initializePythonPath() {
        // Try to find Python executable using platform-specific commands
        const pythonCommands = PlatformUtils.getPythonCommands();

        for (const pythonCmd of pythonCommands) {
            try {
                const result = await this.execCommand(pythonCmd, ['--version']);
                if (result.includes('Python 3.')) {
                    this.pythonPath = pythonCmd;
                    console.log(`Found Python: ${pythonCmd}`);
                    break;
                }
            } catch (error) {
                // Continue to next python command
            }
        }

        if (!this.pythonPath) {
            throw new Error('Python 3.x not found. Please install Python 3.10 or higher.');
        }
    }

    private execCommand(command: string, args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args);
            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(stderr || `Command failed with code ${code}`));
                }
            });

            process.on('error', (error) => {
                reject(error);
            });
        });
    }

    private async runPythonScript(scriptName: string, functionName: string): Promise<any> {
        const extensionPath = this.context.extensionPath;
        const scriptPath = path.join(extensionPath, 'python', scriptName);
        
        // Check if script exists
        if (!fs.existsSync(scriptPath)) {
            throw new Error(`Python script not found: ${scriptPath}`);
        }

        try {
            const result = await this.execCommand(this.pythonPath, [
                scriptPath,
                functionName
            ]);
            
            return JSON.parse(result);
        } catch (error) {
            console.error(`Error running Python script ${scriptName}:`, error);
            throw error;
        }
    }

    async modifyTelemetryIds(): Promise<TelemetryResult> {
        return await this.runPythonScript('telemetry_service.py', 'modify_telemetry_ids');
    }

    async cleanDatabase(): Promise<DatabaseResult> {
        return await this.runPythonScript('database_service.py', 'clean_augment_data');
    }

    async cleanWorkspaceStorage(): Promise<WorkspaceResult> {
        return await this.runPythonScript('workspace_service.py', 'clean_workspace_storage');
    }

    async checkPythonEnvironment(): Promise<boolean> {
        try {
            await this.initializePythonPath();
            return true;
        } catch (error) {
            console.error('Python environment check failed:', error);
            return false;
        }
    }

    dispose() {
        if (this.serverProcess) {
            this.serverProcess.kill();
            this.serverProcess = null;
        }
    }
}
