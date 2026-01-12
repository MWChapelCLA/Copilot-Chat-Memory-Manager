import * as vscode from 'vscode';
import { StorageManager } from './storageManager';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    workspaceFolder: string;
    timestamp: number;
    messages: ChatMessage[];
    metadata?: Record<string, any>;
}

export class ChatSessionManager {
    private context: vscode.ExtensionContext;
    private storageManager: StorageManager;
    private currentSession: ChatSession | undefined;
    private messageHistory: ChatMessage[] = [];

    constructor(context: vscode.ExtensionContext, storageManager: StorageManager) {
        this.context = context;
        this.storageManager = storageManager;
        this.initializeSession();
        this.setupChatMonitoring();
    }

    private initializeSession(): void {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 'no-workspace';
        this.currentSession = {
            id: this.generateSessionId(),
            workspaceFolder,
            timestamp: Date.now(),
            messages: []
        };
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    private setupChatMonitoring(): void {
        // Monitor for chat interactions by listening to language model events
        // Note: This is a simplified implementation. In practice, you'd need to hook into
        // the GitHub Copilot Chat API when it becomes available

        // For now, we'll use a workaround with the interactive editor
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                this.captureContext(editor);
            }
        });

        // Listen for text changes that might indicate chat activity
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.uri.scheme === 'vscode-chat-history') {
                this.captureChatMessage(event.document);
            }
        });
    }

    private async captureContext(editor: vscode.TextEditor): Promise<void> {
        // Capture context about the file being edited
        const document = editor.document;
        const selection = editor.selection;

        if (!selection.isEmpty) {
            const selectedText = document.getText(selection);
            this.addMessage({
                role: 'system',
                content: `Context: User is working on ${document.fileName}, selected text: ${selectedText.substring(0, 500)}`,
                timestamp: Date.now()
            });
        }
    }

    private async captureChatMessage(document: vscode.TextDocument): Promise<void> {
        // Attempt to capture chat messages
        const content = document.getText();
        if (content.trim()) {
            this.addMessage({
                role: 'user',
                content: content,
                timestamp: Date.now()
            });
        }
    }

    private addMessage(message: ChatMessage): void {
        this.messageHistory.push(message);
        if (this.currentSession) {
            this.currentSession.messages.push(message);
        }
    }

    // Public method to add messages from chat participant
    async addMessageToSession(message: ChatMessage): Promise<void> {
        this.addMessage(message);
    }

    async saveCurrentSession(): Promise<void> {
        if (!this.currentSession || this.currentSession.messages.length === 0) {
            vscode.window.showWarningMessage('No chat session to save');
            return;
        }

        try {
            const sessionKey = `chat_session_${this.currentSession.id}`;
            const sessionData = JSON.stringify(this.currentSession, null, 2);

            await this.storageManager.store(sessionKey, sessionData, {
                type: 'chat_session',
                workspace: this.currentSession.workspaceFolder,
                timestamp: this.currentSession.timestamp,
                messageCount: this.currentSession.messages.length
            });

            // Also save to local storage as backup
            const sessions = this.context.globalState.get<string[]>('savedSessions') || [];
            if (!sessions.includes(sessionKey)) {
                sessions.push(sessionKey);
                await this.context.globalState.update('savedSessions', sessions);
            }

            console.log(`Saved chat session: ${sessionKey}`);
        } catch (error) {
            const errorMsg = `Failed to save chat session: ${error}`;
            vscode.window.showErrorMessage(errorMsg);
            console.error(errorMsg, error);
            throw error;
        }
    }

    async restoreSession(): Promise<void> {
        try {
            const sessions = await this.listSavedSessions();

            if (sessions.length === 0) {
                vscode.window.showInformationMessage('No saved chat sessions found');
                return;
            }

            const selected = await vscode.window.showQuickPick(
                sessions.map(s => ({
                    label: `Session from ${new Date(s.timestamp).toLocaleString()}`,
                    description: `${s.messageCount} messages - ${s.workspace}`,
                    sessionId: s.id
                })),
                {
                    placeHolder: 'Select a chat session to restore'
                }
            );

            if (selected) {
                const sessionKey = `chat_session_${selected.sessionId}`;
                const sessionData = await this.storageManager.retrieve(sessionKey);

                if (sessionData) {
                    const session: ChatSession = JSON.parse(sessionData);
                    this.currentSession = session;
                    this.messageHistory = [...session.messages];

                    // Display session in a new document
                    await this.displaySession(session);

                    vscode.window.showInformationMessage('Chat session restored successfully');
                } else {
                    vscode.window.showErrorMessage('Failed to retrieve session data');
                }
            }
        } catch (error) {
            const errorMsg = `Failed to restore chat session: ${error}`;
            vscode.window.showErrorMessage(errorMsg);
            console.error(errorMsg, error);
        }
    }

    private async displaySession(session: ChatSession): Promise<void> {
        const doc = await vscode.workspace.openTextDocument({
            content: this.formatSessionForDisplay(session),
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
    }

    private formatSessionForDisplay(session: ChatSession): string {
        let output = `# Chat Session: ${session.id}\n\n`;
        output += `**Workspace:** ${session.workspaceFolder}\n`;
        output += `**Date:** ${new Date(session.timestamp).toLocaleString()}\n`;
        output += `**Messages:** ${session.messages.length}\n\n`;
        output += `---\n\n`;

        for (const msg of session.messages) {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            output += `### [${msg.role.toUpperCase()}] ${time}\n\n`;
            output += `${msg.content}\n\n`;
            output += `---\n\n`;
        }

        return output;
    }

    async viewSessions(): Promise<void> {
        try {
            const sessions = await this.listSavedSessions();

            if (sessions.length === 0) {
                vscode.window.showInformationMessage('No saved chat sessions found');
                return;
            }

            const panel = vscode.window.createWebviewPanel(
                'chatMemorySessions',
                'Saved Chat Sessions',
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );

            panel.webview.html = this.getSessionsWebviewContent(sessions);
        } catch (error) {
            const errorMsg = `Failed to view sessions: ${error}`;
            vscode.window.showErrorMessage(errorMsg);
            console.error(errorMsg, error);
        }
    }

    async listSavedSessions(): Promise<Array<{ id: string, timestamp: number, messageCount: number, workspace: string }>> {
        try {
            const sessionKeys = await this.storageManager.list('chat_session_*');
            const sessions = [];

            for (const key of sessionKeys) {
                try {
                    const data = await this.storageManager.retrieve(key);
                    if (data) {
                        const session: ChatSession = JSON.parse(data);
                        sessions.push({
                            id: session.id,
                            timestamp: session.timestamp,
                            messageCount: session.messages.length,
                            workspace: session.workspaceFolder
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to parse session ${key}:`, error);
                }
            }

            return sessions.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('Failed to list saved sessions:', error);
            return [];
        }
    }

    private getSessionsWebviewContent(sessions: Array<{ id: string, timestamp: number, messageCount: number, workspace: string }>): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Saved Chat Sessions</title>
            <style>
                body { padding: 20px; font-family: var(--vscode-font-family); }
                .session { 
                    padding: 15px; 
                    margin: 10px 0; 
                    border: 1px solid var(--vscode-panel-border); 
                    border-radius: 5px;
                    background: var(--vscode-editor-background);
                }
                .session:hover { background: var(--vscode-list-hoverBackground); }
                .session-header { font-weight: bold; margin-bottom: 5px; }
                .session-details { color: var(--vscode-descriptionForeground); font-size: 0.9em; }
            </style>
        </head>
        <body>
            <h1>Saved Chat Sessions</h1>
            <div id="sessions">
                ${sessions.map(s => `
                    <div class="session">
                        <div class="session-header">${new Date(s.timestamp).toLocaleString()}</div>
                        <div class="session-details">
                            ID: ${s.id}<br>
                            Messages: ${s.messageCount}<br>
                            Workspace: ${s.workspace}
                        </div>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>`;
    }

    async autoSave(): Promise<void> {
        if (this.currentSession && this.currentSession.messages.length > 0) {
            try {
                await this.saveCurrentSession();
                console.log('Auto-saved chat session');
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    }
}
