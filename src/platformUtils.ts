import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export enum Platform {
    Windows = 'win32',
    MacOS = 'darwin',
    Linux = 'linux'
}

export class PlatformUtils {
    static getCurrentPlatform(): Platform {
        return os.platform() as Platform;
    }

    static isWindows(): boolean {
        return this.getCurrentPlatform() === Platform.Windows;
    }

    static isMacOS(): boolean {
        return this.getCurrentPlatform() === Platform.MacOS;
    }

    static isLinux(): boolean {
        return this.getCurrentPlatform() === Platform.Linux;
    }

    static getHomeDirectory(): string {
        return os.homedir();
    }

    static getAppDataDirectory(): string {
        const platform = this.getCurrentPlatform();
        const homeDir = this.getHomeDirectory();

        switch (platform) {
            case Platform.Windows:
                return process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');
            case Platform.MacOS:
                return path.join(homeDir, 'Library', 'Application Support');
            case Platform.Linux:
            default:
                return path.join(homeDir, '.local', 'share');
        }
    }

    static getVSCodeConfigDirectory(): string {
        const platform = this.getCurrentPlatform();
        const homeDir = this.getHomeDirectory();

        switch (platform) {
            case Platform.Windows:
                const appData = process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');
                return path.join(appData, 'Code');
            case Platform.MacOS:
                return path.join(homeDir, 'Library', 'Application Support', 'Code');
            case Platform.Linux:
            default:
                return path.join(homeDir, '.config', 'Code');
        }
    }

    static getVSCodeUserDirectory(): string {
        return path.join(this.getVSCodeConfigDirectory(), 'User');
    }

    static getVSCodeGlobalStorageDirectory(): string {
        return path.join(this.getVSCodeUserDirectory(), 'globalStorage');
    }

    static getVSCodeWorkspaceStorageDirectory(): string {
        return path.join(this.getVSCodeUserDirectory(), 'workspaceStorage');
    }

    static getStorageJsonPath(): string {
        return path.join(this.getVSCodeGlobalStorageDirectory(), 'storage.json');
    }

    static getStateDatabasePath(): string {
        return path.join(this.getVSCodeGlobalStorageDirectory(), 'state.vscdb');
    }

    static getMachineIdPath(): string {
        const platform = this.getCurrentPlatform();
        
        switch (platform) {
            case Platform.Windows:
                return path.join(this.getVSCodeUserDirectory(), 'machineid');
            case Platform.MacOS:
                return path.join(this.getVSCodeConfigDirectory(), 'machineid');
            case Platform.Linux:
            default:
                return path.join(this.getVSCodeUserDirectory(), 'machineid');
        }
    }

    static async checkFileExists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    static async checkDirectoryExists(dirPath: string): Promise<boolean> {
        try {
            const stats = await fs.promises.stat(dirPath);
            return stats.isDirectory();
        } catch {
            return false;
        }
    }

    static async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        } catch (error) {
            throw new Error(`Failed to create directory ${dirPath}: ${error}`);
        }
    }

    static async getFileSize(filePath: string): Promise<number> {
        try {
            const stats = await fs.promises.stat(filePath);
            return stats.size;
        } catch {
            return 0;
        }
    }

    static async isFileWritable(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.W_OK);
            return true;
        } catch {
            return false;
        }
    }

    static getPythonExecutableName(): string {
        return this.isWindows() ? 'python.exe' : 'python3';
    }

    static getPythonCommands(): string[] {
        if (this.isWindows()) {
            return ['python', 'py', 'python3'];
        } else {
            return ['python3', 'python'];
        }
    }

    static getExecutableExtension(): string {
        return this.isWindows() ? '.exe' : '';
    }

    static normalizePath(filePath: string): string {
        return path.normalize(filePath);
    }

    static joinPaths(...paths: string[]): string {
        return path.join(...paths);
    }

    static getRelativePath(from: string, to: string): string {
        return path.relative(from, to);
    }

    static getBasename(filePath: string): string {
        return path.basename(filePath);
    }

    static getDirname(filePath: string): string {
        return path.dirname(filePath);
    }

    static getExtension(filePath: string): string {
        return path.extname(filePath);
    }

    static async validateVSCodeInstallation(): Promise<{isValid: boolean; missingPaths: string[]}> {
        const requiredPaths = [
            this.getVSCodeConfigDirectory(),
            this.getVSCodeUserDirectory(),
            this.getVSCodeGlobalStorageDirectory()
        ];

        const missingPaths: string[] = [];

        for (const requiredPath of requiredPaths) {
            if (!(await this.checkDirectoryExists(requiredPath))) {
                missingPaths.push(requiredPath);
            }
        }

        return {
            isValid: missingPaths.length === 0,
            missingPaths
        };
    }
}
