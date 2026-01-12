import * as vscode from 'vscode';

/**
 * StorageManager provides a unified interface for storing data using VS Code's built-in storage APIs.
 */
export class StorageManager {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Store data using VS Code storage
     */
    async store(key: string, content: string, metadata?: Record<string, any>): Promise<void> {
        try {
            await this.storeLocal(key, content, metadata);
            console.log(`Stored ${key} via VS Code storage`);
        } catch (error) {
            console.error(`Failed to store ${key} in VS Code storage:`, error);
            throw new Error(`Storage failed: ${error}`);
        }
    }

    /**
     * Retrieve data from VS Code storage
     */
    async retrieve(key: string): Promise<string | null> {
        try {
            return await this.retrieveLocal(key);
        } catch (error) {
            console.error(`Failed to retrieve ${key}:`, error);
            return null;
        }
    }

    /**
     * List all keys matching a pattern
     */
    async list(pattern?: string): Promise<string[]> {
        try {
            return await this.listLocal(pattern);
        } catch (error) {
            console.error('Failed to list local keys:', error);
            return [];
        }
    }

    /**
     * Delete a stored item
     */
    async delete(key: string): Promise<void> {
        try {
            await this.deleteLocal(key);
        } catch (error) {
            console.warn(`Failed to delete ${key}:`, error);
        }
    }

    // Local storage methods

    private async storeLocal(key: string, content: string, metadata?: Record<string, any>): Promise<void> {
        const storageData = {
            content,
            metadata,
            timestamp: Date.now()
        };

        await this.context.globalState.update(key, storageData);

        // Also maintain a list of all keys for listing
        const allKeys = this.context.globalState.get<string[]>('_all_storage_keys') || [];
        if (!allKeys.includes(key)) {
            allKeys.push(key);
            await this.context.globalState.update('_all_storage_keys', allKeys);
        }
    }

    private async retrieveLocal(key: string): Promise<string | null> {
        const storageData = this.context.globalState.get<{ content: string, metadata?: Record<string, any>, timestamp: number }>(key);
        return storageData?.content || null;
    }

    private async listLocal(pattern?: string): Promise<string[]> {
        const allKeys = this.context.globalState.get<string[]>('_all_storage_keys') || [];

        if (!pattern || pattern === '*') {
            return allKeys;
        }

        // Simple pattern matching (supports * wildcard)
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return allKeys.filter(key => regex.test(key));
    }

    private async deleteLocal(key: string): Promise<void> {
        await this.context.globalState.update(key, undefined);

        // Remove from keys list
        const allKeys = this.context.globalState.get<string[]>('_all_storage_keys') || [];
        const newKeys = allKeys.filter(k => k !== key);
        await this.context.globalState.update('_all_storage_keys', newKeys);
    }

    /**
     * Get storage statistics
     */
    async getStats(): Promise<{ localItemCount: number }> {
        const localItemCount = (this.context.globalState.get<string[]>('_all_storage_keys') || []).length;

        return {
            localItemCount
        };
    }
}
