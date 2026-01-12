import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('undefined_publisher.chat-memory-manager'));
    });

    test('Should register all commands', async () => {
        const commands = await vscode.commands.getCommands();

        const expectedCommands = [
            'chat-memory-manager.installMCP',
            'chat-memory-manager.saveChatSession',
            'chat-memory-manager.restoreChatSession',
            'chat-memory-manager.saveRepoContext',
            'chat-memory-manager.viewSessions'
        ];

        for (const cmd of expectedCommands) {
            assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`);
        }
    });

    test('Configuration should be available', () => {
        const config = vscode.workspace.getConfiguration('chatMemoryManager');
        assert.ok(config !== undefined);

        // Check default values
        assert.strictEqual(config.get<boolean>('autoSaveSessions'), true);
        assert.strictEqual(config.get<number>('autoSaveInterval'), 300000);
    });
});
