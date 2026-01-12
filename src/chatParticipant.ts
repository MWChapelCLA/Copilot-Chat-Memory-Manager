import * as vscode from 'vscode';
import { ChatSessionManager } from './chatSessionManager';
import { RepositoryContextManager } from './repositoryContextManager';
import { StorageManager } from './storageManager';

export class ChatMemoryParticipant {
    private participant: vscode.ChatParticipant;
    private chatSessionManager: ChatSessionManager;
    private repoContextManager: RepositoryContextManager;
    private storageManager: StorageManager;

    constructor(
        context: vscode.ExtensionContext,
        chatSessionManager: ChatSessionManager,
        repoContextManager: RepositoryContextManager,
        storageManager: StorageManager
    ) {
        this.chatSessionManager = chatSessionManager;
        this.repoContextManager = repoContextManager;
        this.storageManager = storageManager;

        try {
            // Create the chat participant
            // Use format: publisher.participant-name (not extension-name.participant)
            this.participant = vscode.chat.createChatParticipant(
                'chat-memory.memory',
                this.handleChatRequest.bind(this)
            );

            // Set participant properties
            this.participant.iconPath = new vscode.ThemeIcon('database');

            context.subscriptions.push(this.participant);

            console.log('Chat participant created with ID: chat-memory.memory');
        } catch (error) {
            console.error('Failed to create chat participant:', error);
            throw new Error(`Chat participant creation failed: ${error}`);
        }
    } private async handleChatRequest(
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        // Capture this interaction for session storage
        await this.captureInteraction(request, context);

        // Handle different commands
        if (request.command === 'save') {
            await this.handleSaveCommand(stream);
        } else if (request.command === 'restore') {
            await this.handleRestoreCommand(stream);
        } else if (request.command === 'context') {
            await this.handleContextCommand(stream);
        } else if (request.command === 'sessions') {
            await this.handleSessionsCommand(stream);
        } else if (request.command === 'stats') {
            await this.handleStatsCommand(stream);
        } else {
            await this.handleDefaultResponse(request, stream);
        }
    }

    private async captureInteraction(
        request: vscode.ChatRequest,
        context: vscode.ChatContext
    ): Promise<void> {
        try {
            // Capture the user's message
            await this.chatSessionManager.addMessageToSession({
                role: 'user',
                content: request.prompt,
                timestamp: Date.now()
            });

            // Capture context if available
            if (context.history && context.history.length > 0) {
                for (const item of context.history) {
                    if (item instanceof vscode.ChatRequestTurn) {
                        await this.chatSessionManager.addMessageToSession({
                            role: 'user',
                            content: item.prompt,
                            timestamp: Date.now()
                        });
                    } else if (item instanceof vscode.ChatResponseTurn) {
                        const responseText = item.response.map(r => {
                            if (r instanceof vscode.ChatResponseMarkdownPart) {
                                return r.value.value;
                            }
                            return '';
                        }).join('');

                        await this.chatSessionManager.addMessageToSession({
                            role: 'assistant',
                            content: responseText,
                            timestamp: Date.now()
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to capture interaction:', error);
        }
    }

    private async handleSaveCommand(stream: vscode.ChatResponseStream): Promise<void> {
        try {
            stream.progress('Saving current chat session...');
            await this.chatSessionManager.saveCurrentSession();

            stream.markdown('✅ **Chat session saved successfully!**\n\n');
            stream.markdown('Your conversation has been stored for later reference.\n\n');
            stream.markdown('To restore it later, use `/restore` or run the command:\n');
            stream.markdown('`Chat Memory: Restore Chat Session`');
        } catch (error) {
            stream.markdown(`❌ Failed to save chat session: ${error}`);
        }
    }

    private async handleRestoreCommand(stream: vscode.ChatResponseStream): Promise<void> {
        try {
            stream.progress('Loading saved sessions...');
            const sessions = await this.chatSessionManager.listSavedSessions();

            if (sessions.length === 0) {
                stream.markdown('ℹ️ No saved chat sessions found.\n\n');
                stream.markdown('Start a conversation and use `/save` to save it!');
                return;
            }

            stream.markdown('## 📚 Saved Chat Sessions\n\n');

            for (let i = 0; i < Math.min(sessions.length, 10); i++) {
                const session = sessions[i];
                const date = new Date(session.timestamp).toLocaleString();
                stream.markdown(`${i + 1}. **${date}**\n`);
                stream.markdown(`   - ${session.messageCount} messages\n`);
                stream.markdown(`   - Workspace: ${session.workspace}\n\n`);
            }

            if (sessions.length > 10) {
                stream.markdown('\n*...and ${sessions.length - 10} more sessions*\n\n');
            }

            stream.markdown('\nTo restore a session, use the Command Palette:\n');
            stream.markdown('`Chat Memory: Restore Chat Session`');
        } catch (error) {
            stream.markdown(`❌ Failed to list sessions: ${error}`);
        }
    }

    private async handleContextCommand(stream: vscode.ChatResponseStream): Promise<void> {
        try {
            stream.progress('Analyzing repository...');

            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                stream.markdown('⚠️ No workspace folder is currently open.');
                return;
            }

            await this.repoContextManager.saveRepositoryContext();

            stream.markdown('✅ **Repository context saved successfully!**\n\n');
            stream.markdown('Your workspace structure and file metadata have been analyzed and stored.\n\n');
            stream.markdown('This helps provide better context for future AI assistance.');
        } catch (error) {
            stream.markdown(`❌ Failed to save repository context: ${error}`);
        }
    }

    private async handleSessionsCommand(stream: vscode.ChatResponseStream): Promise<void> {
        try {
            stream.progress('Gathering statistics...');

            const sessions = await this.chatSessionManager.listSavedSessions();
            const contexts = await this.storageManager.list('repo_context_*');

            stream.markdown('## 📊 Chat Memory Statistics\n\n');
            stream.markdown(`### Chat Sessions: **${sessions.length}**\n`);
            stream.markdown(`### Repository Contexts: **${contexts.length}**\n\n`);

            // Storage status
            stream.markdown('### Storage Status\n');
            stream.markdown('- 📁 Using file-based storage (VS Code globalState)\n');
            stream.markdown('- ✨ All sessions stored locally\n');

            stream.markdown('\n---\n\n');
            stream.markdown('Use `/save` to save the current session or `/context` to update repository context.');
        } catch (error) {
            stream.markdown(`❌ Failed to get statistics: ${error}`);
        }
    }

    private async handleStatsCommand(stream: vscode.ChatResponseStream): Promise<void> {
        await this.handleSessionsCommand(stream);

        stream.markdown('\n\n## 🎯 Available Commands\n\n');
        stream.markdown('- `/save` - Save current chat session\n');
        stream.markdown('- `/restore` - List and restore saved sessions\n');
        stream.markdown('- `/context` - Save repository context\n');
        stream.markdown('- `/sessions` - View session statistics\n');
        stream.markdown('- `/stats` - Show this help (detailed statistics)\n');
    }

    private async handleDefaultResponse(
        request: vscode.ChatRequest,
        stream: vscode.ChatResponseStream
    ): Promise<void> {
        stream.markdown('👋 **Hi! I\'m your Memory Assistant for GitHub Copilot.**\n\n');
        stream.markdown('I help you save and restore chat sessions, and maintain repository context.\n\n');
        stream.markdown('## 🎯 Available Commands\n\n');
        stream.markdown('- `/save` - Save current chat session\n');
        stream.markdown('- `/restore` - List and restore saved sessions\n');
        stream.markdown('- `/context` - Save repository context\n');
        stream.markdown('- `/sessions` - View session statistics\n');
        stream.markdown('- `/stats` - Show detailed statistics\n\n');
        stream.markdown('Try typing `@memory /save` to save this conversation!\n\n');

        if (request.prompt) {
            stream.markdown(`\n*You asked: "${request.prompt}"*\n\n`);
            stream.markdown('I\'m focused on managing your chat memory. For general coding help, use GitHub Copilot without @memory.');
        }
    }
}
