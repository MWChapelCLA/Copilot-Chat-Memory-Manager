import * as vscode from 'vscode';
import { StorageManager } from './storageManager';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface RepositoryContext {
    workspaceFolder: string;
    files: FileContext[];
    structure: string;
    timestamp: number;
    metadata?: Record<string, any>;
}

export interface FileContext {
    path: string;
    language: string;
    size: number;
    summary?: string;
}

export class RepositoryContextManager {
    private context: vscode.ExtensionContext;
    private storageManager: StorageManager;
    private excludePatterns: string[] = [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/out/**',
        '**/build/**',
        '**/*.min.js',
        '**/*.map',
        '**/coverage/**',
        '**/.vscode-test/**'
    ];

    constructor(context: vscode.ExtensionContext, storageManager: StorageManager) {
        this.context = context;
        this.storageManager = storageManager;
    }

    async saveRepositoryContext(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            console.log('No workspace folder open');
            return;
        }

        for (const folder of workspaceFolders) {
            try {
                await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: `Analyzing repository: ${folder.name}`,
                        cancellable: false
                    },
                    async (progress) => {
                        progress.report({ increment: 0, message: 'Scanning files...' });

                        const context = await this.analyzeRepository(folder);

                        progress.report({ increment: 50, message: 'Saving context...' });

                        await this.saveContext(context);

                        progress.report({ increment: 100, message: 'Complete' });
                    }
                );
            } catch (error) {
                console.error(`Failed to save repository context for ${folder.name}:`, error);
                vscode.window.showErrorMessage(`Failed to save repository context: ${error}`);
            }
        }
    }

    private async analyzeRepository(folder: vscode.WorkspaceFolder): Promise<RepositoryContext> {
        const files = await this.scanFiles(folder.uri.fsPath);
        const structure = await this.generateStructure(folder.uri.fsPath);

        const context: RepositoryContext = {
            workspaceFolder: folder.uri.fsPath,
            files,
            structure,
            timestamp: Date.now(),
            metadata: {
                name: folder.name,
                fileCount: files.length,
                totalSize: files.reduce((sum, f) => sum + f.size, 0)
            }
        };

        return context;
    }

    private async scanFiles(rootPath: string): Promise<FileContext[]> {
        const files: FileContext[] = [];

        // Use VS Code's file search API
        const fileUris = await vscode.workspace.findFiles(
            '**/*',
            `{${this.excludePatterns.join(',')}}`,
            10000
        );

        for (const uri of fileUris) {
            try {
                const stat = await fs.stat(uri.fsPath);

                // Skip large files (> 1MB)
                if (stat.size > 1024 * 1024) {
                    continue;
                }

                const relativePath = path.relative(rootPath, uri.fsPath);
                const language = this.detectLanguage(uri.fsPath);

                files.push({
                    path: relativePath,
                    language,
                    size: stat.size,
                    summary: await this.generateFileSummary(uri.fsPath, language)
                });
            } catch (error) {
                console.error(`Failed to process file ${uri.fsPath}:`, error);
            }
        }

        return files;
    }

    private async generateStructure(rootPath: string): Promise<string> {
        const structure: string[] = [];

        const buildTree = async (dir: string, prefix: string = ''): Promise<void> => {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (let i = 0; i < entries.length; i++) {
                    const entry = entries[i];
                    const isLast = i === entries.length - 1;
                    const currentPrefix = isLast ? '└── ' : '├── ';
                    const nextPrefix = isLast ? '    ' : '│   ';

                    // Skip excluded directories
                    if (entry.isDirectory() && this.shouldExclude(entry.name)) {
                        continue;
                    }

                    structure.push(`${prefix}${currentPrefix}${entry.name}`);

                    if (entry.isDirectory()) {
                        const subDir = path.join(dir, entry.name);
                        await buildTree(subDir, prefix + nextPrefix);
                    }
                }
            } catch (error) {
                console.error(`Failed to read directory ${dir}:`, error);
            }
        };

        structure.push(path.basename(rootPath));
        await buildTree(rootPath);

        return structure.join('\n');
    }

    private shouldExclude(name: string): boolean {
        const excludeDirs = ['node_modules', '.git', 'dist', 'out', 'build', 'coverage', '.vscode-test'];
        return excludeDirs.includes(name);
    }

    private detectLanguage(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const languageMap: Record<string, string> = {
            '.ts': 'typescript',
            '.js': 'javascript',
            '.jsx': 'javascriptreact',
            '.tsx': 'typescriptreact',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.go': 'go',
            '.rs': 'rust',
            '.rb': 'ruby',
            '.php': 'php',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.json': 'json',
            '.xml': 'xml',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.md': 'markdown',
            '.sh': 'shellscript',
            '.sql': 'sql'
        };

        return languageMap[ext] || 'plaintext';
    }

    private async generateFileSummary(filePath: string, language: string): Promise<string> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');

            // Generate a simple summary based on file type
            const lines = content.split('\n');
            const summary: string[] = [];

            if (language === 'typescript' || language === 'javascript') {
                // Extract exports, classes, and functions
                const exports = lines.filter(l => l.includes('export'));
                const classes = lines.filter(l => l.includes('class '));
                const functions = lines.filter(l => l.includes('function ') || l.includes('const ') && l.includes('=>'));

                if (exports.length > 0) {
                    summary.push(`${exports.length} exports`);
                }
                if (classes.length > 0) {
                    summary.push(`${classes.length} classes`);
                }
                if (functions.length > 0) {
                    summary.push(`${functions.length} functions`);
                }
            } else if (language === 'python') {
                const classes = lines.filter(l => l.trim().startsWith('class '));
                const functions = lines.filter(l => l.trim().startsWith('def '));

                if (classes.length > 0) {
                    summary.push(`${classes.length} classes`);
                }
                if (functions.length > 0) {
                    summary.push(`${functions.length} functions`);
                }
            }

            summary.push(`${lines.length} lines`);

            return summary.join(', ');
        } catch (error) {
            return 'Unable to analyze';
        }
    }

    private async saveContext(context: RepositoryContext): Promise<void> {
        try {
            const workspaceName = path.basename(context.workspaceFolder);
            const contextKey = `repo_context_${workspaceName}_${Date.now()}`;
            const contextData = JSON.stringify(context, null, 2);

            await this.storageManager.store(contextKey, contextData, {
                type: 'repository_context',
                workspace: context.workspaceFolder,
                timestamp: context.timestamp,
                fileCount: context.files.length
            });

            // Also save a "latest" version for quick access
            const latestKey = `repo_context_${workspaceName}_latest`;
            await this.storageManager.store(latestKey, contextData, {
                type: 'repository_context',
                workspace: context.workspaceFolder,
                timestamp: context.timestamp,
                fileCount: context.files.length,
                isLatest: true
            });

            console.log(`Saved repository context: ${contextKey}`);
        } catch (error) {
            console.error('Failed to save repository context:', error);
            throw error;
        }
    }

    async getLatestContext(): Promise<RepositoryContext | null> {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }

        const workspaceName = path.basename(workspaceFolders[0].uri.fsPath);
        const latestKey = `repo_context_${workspaceName}_latest`;

        try {
            const contextData = await this.storageManager.retrieve(latestKey);

            if (contextData) {
                return JSON.parse(contextData);
            }
        } catch (error) {
            console.error('Failed to retrieve latest context:', error);
        }

        return null;
    }
}
