import * as vscode from 'vscode';
import { ChatSessionManager } from './chatSessionManager';
import { RepositoryContextManager } from './repositoryContextManager';
import { StorageManager } from './storageManager';
import { ChatMemoryParticipant } from './chatParticipant';

let storageManager: StorageManager;
let chatSessionManager: ChatSessionManager;
let repoContextManager: RepositoryContextManager;
let chatParticipant: ChatMemoryParticipant;
let autoSaveInterval: NodeJS.Timeout | undefined;

export async function activate(context: vscode.ExtensionContext) {
    console.log('Chat Memory Manager extension is now active');

    try {
        // Initialize managers
        storageManager = new StorageManager(context);
        chatSessionManager = new ChatSessionManager(context, storageManager);
        repoContextManager = new RepositoryContextManager(context, storageManager);

        // Initialize chat participant for @memory integration
        try {
            chatParticipant = new ChatMemoryParticipant(
                context,
                chatSessionManager,
                repoContextManager,
                storageManager
            );
            console.log('Chat participant @memory registered successfully');
        } catch (error) {
            console.error('Failed to register chat participant:', error);
            vscode.window.showWarningMessage('Chat participant @memory could not be registered. GitHub Copilot Chat may not be available.');
        }

        // Register commands with error handling
        context.subscriptions.push(
            vscode.commands.registerCommand('chat-memory-manager.saveChatSession', async () => {
                try {
                    await chatSessionManager.saveCurrentSession();
                    vscode.window.showInformationMessage('Chat session saved successfully');
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to save chat session: ${error}`);
                    console.error('Save chat session error:', error);
                }
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('chat-memory-manager.restoreChatSession', async () => {
                try {
                    await chatSessionManager.restoreSession();
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to restore chat session: ${error}`);
                    console.error('Restore chat session error:', error);
                }
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('chat-memory-manager.saveRepoContext', async () => {
                try {
                    await repoContextManager.saveRepositoryContext();
                    vscode.window.showInformationMessage('Repository context saved successfully');
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to save repository context: ${error}`);
                    console.error('Save repo context error:', error);
                }
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('chat-memory-manager.viewSessions', async () => {
                try {
                    await chatSessionManager.viewSessions();
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to view sessions: ${error}`);
                    console.error('View sessions error:', error);
                }
            })
        );

        // Use file-based storage by default - no MCP server needed
        console.log('Using file-based storage (VS Code globalState) - no MCP server required');
        vscode.window.showInformationMessage('Chat Memory Manager: Ready! Using file-based storage for chat sessions.');

        // Set up auto-save for chat sessions
        const autoSaveConfig = vscode.workspace.getConfiguration('chatMemoryManager');
        if (autoSaveConfig.get<boolean>('autoSaveSessions')) {
            const interval = autoSaveConfig.get<number>('autoSaveInterval') || 300000;
            autoSaveInterval = setInterval(async () => {
                try {
                    await chatSessionManager.autoSave();
                } catch (error) {
                    console.error('Auto-save error:', error);
                }
            }, interval);
        }

        // Save repository context on workspace open
        if (vscode.workspace.workspaceFolders) {
            try {
                await repoContextManager.saveRepositoryContext();
            } catch (error) {
                console.error('Initial repository context save failed:', error);
            }
        }

        // Listen for workspace changes
        context.subscriptions.push(
            vscode.workspace.onDidChangeWorkspaceFolders(async () => {
                try {
                    await repoContextManager.saveRepositoryContext();
                } catch (error) {
                    console.error('Repository context save on workspace change failed:', error);
                }
            })
        );

        vscode.window.showInformationMessage('Chat Memory MCP extension activated successfully!');
    } catch (error) {
        console.error('Extension activation error:', error);
        vscode.window.showErrorMessage(`Chat Memory MCP extension activation failed: ${error}`);
    }
}

export function deactivate() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
}
