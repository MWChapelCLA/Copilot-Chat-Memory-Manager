# Chat Memory Manager for VS Code

> 🧠 **Never lose context again!** Save repository context and persist GitHub Copilot chat sessions with intelligent file-based storage.

A powerful VS Code extension that maintains continuous AI context across development sessions by storing repository structure and persisting GitHub Copilot conversations.

---

## ✨ Features

### 🧠 **Intelligent Repository Context**
- 📂 Automatically analyzes and saves your entire repository structure
- 🏷️ Stores file metadata, language information, and code summaries
- 🎯 Provides persistent context for dramatically better AI assistance
- 🔄 Auto-updates context as your project evolves

### 💬 **Persistent Chat Sessions**
- 💾 Saves GitHub Copilot chat sessions automatically
- ⏮️ Restore previous conversations to maintain context continuity
- ⏰ Auto-save functionality with configurable intervals
- 📊 View and browse all saved sessions with metadata

### 🤖 **Seamless GitHub Copilot Integration**
- 🎤 Use `@memory` participant in GitHub Copilot Chat
- ⚡ Quick slash commands: `/save`, `/restore`, `/context`, `/sessions`, `/stats`
- 🔗 Capture and store conversations directly from chat
- 🚀 Zero-friction integration with your existing workflow

### 💾 **Reliable File-Based Storage**
- 🏠 Uses VS Code's built-in globalState for local storage
- 🔒 No external dependencies or servers required
- 🛡️ All data stored securely in VS Code's storage location
- 📦 Portable and self-contained

---

## 📦 Installation

### Method 1: Install from VSIX (Recommended)

1. **Build the VSIX package** (if not already available):
   ```bash
   cd /workspace
   npm install
   npm run compile
   npm run package
   ```

2. **Install the extension**:
   ```bash
   code --install-extension chat-memory-manager-0.0.1.vsix
   ```
   
   Or manually:
   - Open VS Code
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Extensions: Install from VSIX..."
   - Select the `chat-memory-manager-0.0.1.vsix` file

3. **Reload VS Code** when prompted

### Method 2: Install from VS Code Extensions View

1. Open Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
2. Click the `...` menu at the top right
3. Select **"Install from VSIX..."**
4. Navigate to and select `chat-memory-manager-0.0.1.vsix`
5. Click **Reload** when installation completes

### Method 3: Build and Install from Source

```bash
# Clone the repository
git clone <repository-url>
cd chat-memory-manager

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package the extension
npm run package

# Install the generated VSIX
code --install-extension chat-memory-manager-0.0.1.vsix
```

---

## 🚀 Getting Started

### Quick Start Guide

1. **✅ Install the Extension**: Follow installation steps above
2. **🔄 Reload VS Code**: The extension activates automatically on startup
3. **💬 Open GitHub Copilot Chat**: Press `Ctrl+Alt+I` (or `Cmd+Alt+I` on Mac)
4. **🎤 Type `@memory`**: Start using the memory participant!

### First Steps

#### Save Repository Context
```
@memory /context
```
This analyzes your workspace and stores file structure, making AI assistance context-aware.

#### Ask Questions with Context
```
@memory explain the architecture of this project
@memory how do I add a new feature to the chatParticipant?
@memory what files handle session storage?
```

#### Save Important Conversations
```
@memory /save
```
Preserves the current chat session for future reference.

---

## 💡 Usage Examples

### Example 1: Save Repository Context

When you first open a project:

```
@memory /context
```

**Response:**
```
✅ Repository context saved successfully!

Your workspace structure and file metadata have been analyzed and stored.
This helps provide better context for future AI assistance.
```

### Example 2: Ask Context-Aware Questions

With context saved, ask specific questions:

```
@memory how does the chatParticipant.ts integrate with the extension?
```

The `@memory` participant automatically injects repository context, giving Copilot full awareness of your codebase structure.

### Example 3: Save Important Conversations

After a productive chat session:

```
@memory /save
```

**Response:**
```
✅ Chat session saved successfully!

Your conversation has been stored for later reference.
To restore it later, use /restore or run:
Chat Memory: Restore Chat Session
```

### Example 4: View Statistics

Check your saved data:

```
@memory /stats
```

**Response:**
```
## 📊 Chat Memory Statistics

### Chat Sessions: 5
### Repository Contexts: 3

### Storage Status
- 📁 Using file-based storage (VS Code globalState)
- ✨ All sessions stored locally

### 🎯 Available Commands
- /save - Save current chat session
- /restore - List and restore saved sessions
- /context - Save repository context
- /sessions - View session statistics
- /stats - Show this help
```

### Example 5: Restore Previous Session

To continue a previous conversation:

```
@memory /restore
```

Then select from the list of saved sessions to restore the full context.

---

## 💬 Chat Commands Reference

Use `@memory` followed by these commands in GitHub Copilot Chat:

| Command | Description | Example |
|---------|-------------|---------|
| `/save` | Save the current chat session | `@memory /save` |
| `/restore` | List and restore saved sessions | `@memory /restore` |
| `/context` | Save repository context and structure | `@memory /context` |
| `/sessions` | View statistics about saved sessions | `@memory /sessions` |
| `/stats` | Show detailed statistics and commands | `@memory /stats` |

### Using @memory for Questions

You can also ask questions directly:

```
@memory what's in the src/chatParticipant.ts file?
@memory how is the storage manager implemented?
@memory explain the session persistence architecture
```

The repository context is automatically injected, providing Copilot with comprehensive project knowledge.

---

## 🎯 VS Code Commands

Access via Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

| Command | Description |
|---------|-------------|
| `Chat Memory: Save Current Chat Session` | Manually save the active chat session |
| `Chat Memory: Restore Chat Session` | Browse and restore saved sessions |
| `Chat Memory: Save Repository Context` | Trigger manual repository analysis |
| `Chat Memory: View Saved Sessions` | View all saved chat sessions |


---

## ⚙️ Configuration

Configure the extension behavior via VS Code settings (`Ctrl+,` or `Cmd+,`):

### Available Settings

```json
{
  // Automatically save chat sessions when they are closed
  "chatMemoryManager.autoSaveSessions": true,
  
  // Auto-save interval in milliseconds (default: 5 minutes = 300000ms)
  "chatMemoryManager.autoSaveInterval": 300000,
  
  // Custom storage location for sessions and context (leave empty for default)
  "chatMemoryManager.storageLocation": ""
}
```

### Setting Details

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `autoSaveSessions` | boolean | `true` | Enable automatic saving of chat sessions |
| `autoSaveInterval` | number | `300000` | Interval between auto-saves (milliseconds) |
| `storageLocation` | string | `""` | Custom storage path (empty = use VS Code default) |

### Configuration Example

To customize auto-save behavior:

1. Open Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "Chat Memory Manager"
3. Adjust settings as needed

Or edit `settings.json` directly:

```json
{
  "chatMemoryManager.autoSaveSessions": true,
  "chatMemoryManager.autoSaveInterval": 600000,  // 10 minutes
  "chatMemoryManager.storageLocation": ""
}
```

---

## 🏗️ How It Works

### Repository Context Analysis

When you run `@memory /context`, the extension:

1. **📂 Scans Workspace**: Recursively analyzes all files
2. **🚫 Filters Intelligently**: Excludes `node_modules`, `.git`, build folders, etc.
3. **📊 Extracts Metadata**: Captures file types, sizes, and structure
4. **💾 Stores Context**: Saves to VS Code globalState
5. **🔄 Updates Automatically**: Refreshes when workspace changes

**What's Captured:**
- File paths and directory structure
- File types and programming languages
- File sizes and modification times
- Project organization patterns

**What's Excluded:**
- `node_modules/`, `.git/`, `dist/`, `build/`, `out/`
- Binary files and compiled artifacts
- Files larger than 1MB
- Files matching `.gitignore` patterns

### Chat Session Persistence

The extension monitors GitHub Copilot Chat:

1. **🎤 Captures Messages**: Records chat interactions in real-time
2. **⏰ Auto-Saves**: Saves at configured intervals (default: 5 minutes)
3. **💾 Manual Save**: Use `/save` command for immediate storage
4. **📋 Metadata Tracking**: Stores timestamps, message counts, participants
5. **🔍 Easy Retrieval**: Browse and restore with `/restore` command

**Session Data Includes:**
- Full conversation history
- Timestamps for each message
- Participant information
- Associated repository context
- Session metadata

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────┐
│           VS Code Extension Host                    │
│  ┌──────────────────────────────────────────────┐   │
│  │      Chat Participant (@memory)              │   │
│  │  • Handles slash commands                    │   │
│  │  • Processes user requests                   │   │
│  │  • Injects repository context                │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │      Chat Session Manager                    │   │
│  │  • Monitors Copilot Chat                     │   │
│  │  • Captures conversations                    │   │
│  │  • Auto-saves sessions                       │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │      Repository Context Manager              │   │
│  │  • Scans workspace files                     │   │
│  │  • Analyzes project structure                │   │
│  │  • Generates context summaries               │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │      Storage Manager                         │   │
│  │  • File-based persistence                    │   │
│  │  • Uses VS Code globalState                  │   │
│  │  • Manages data serialization                │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│        VS Code Global Storage (Local Disk)          │
│  • Chat sessions with metadata                      │
│  • Repository context snapshots                     │
│  • Configuration and state                          │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input → @memory Participant → Command Handler
                                          ↓
                    ┌─────────────────────┴─────────────────────┐
                    ↓                                           ↓
          Chat Session Manager                    Repository Context Manager
                    ↓                                           ↓
                    └─────────────────────┬─────────────────────┘
                                          ↓
                                  Storage Manager
                                          ↓
                                VS Code GlobalState
```

---

## 🛠️ Development

### Prerequisites

- **Node.js**: 20.x or higher
- **VS Code**: 1.85.0 or higher
- **TypeScript**: 5.3.2 or higher
- **npm**: Latest version

### Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd chat-memory-manager

# Install dependencies
npm install

# Compile TypeScript
npm run compile
```

### Development Workflow

1. **Watch Mode** (automatically recompile on changes):
   ```bash
   npm run watch
   ```

2. **Testing the Extension**:
   - Press `F5` in VS Code to launch Extension Development Host
   - Test `@memory` commands in the Copilot Chat
   - Check the Output panel for logs

3. **Debugging**:
   - Set breakpoints in TypeScript files
   - Use VS Code's built-in debugger
   - View logs: `View > Output > Chat Memory Manager`

### Building

```bash
# Lint code
npm run lint

# Compile TypeScript
npm run compile

# Package extension
npm run package

# This creates: chat-memory-manager-0.0.1.vsix
```

### Project Structure

```
chat-memory-manager/
├── src/
│   ├── extension.ts                # Extension entry point
│   ├── chatParticipant.ts         # @memory participant handler
│   ├── chatSessionManager.ts      # Session persistence logic
│   ├── repositoryContextManager.ts # Repository analysis
│   ├── storageManager.ts          # Storage abstraction
│   └── test/                       # Test suite
├── out/                            # Compiled JavaScript
├── package.json                    # Extension manifest
├── tsconfig.json                   # TypeScript config
└── README.md                       # This file
```

### Running Tests

```bash
# Run all tests
npm test

# Run linter
npm run lint
```

---


## 📋 Requirements

- **VS Code**: Version 1.85.0 or higher
- **GitHub Copilot**: Extension installed and active (for chat session features)
- **Node.js/npm**: Required for building from source only

---

## ⚠️ Known Issues

- **Chat Session Capture**: Currently limited by VS Code's Chat API availability
- **Large Repositories**: Projects with >10,000 files may take longer to analyze
- **File Size Limit**: Files larger than 1MB are excluded from repository analysis
- **Binary Files**: Binary and compiled files are automatically excluded

### Workarounds

- For large repos, use `.gitignore` patterns to exclude unnecessary directories
- Break down analysis into smaller workspaces if needed
- Check Output panel for detailed analysis logs

---

## 📄 License

**MIT License** - See [LICENSE](LICENSE) file for full details.

Copyright (c) 2026 Chat Memory Manager

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.

---

## 🔐 Privacy & Data Security

### What Data is Collected?

- **Repository Structure**: File paths, names, types, and metadata
- **Chat Sessions**: Your GitHub Copilot conversations
- **Configuration**: Your extension settings

### Where is Data Stored?

- **100% Local**: All data stored in VS Code's globalState
- **No Cloud**: Nothing sent to external servers
- **No Telemetry**: No usage tracking or analytics

### Data Security

- ✅ All data remains on your local machine
- ✅ Uses VS Code's secure storage APIs
- ✅ Respects `.gitignore` patterns
- ✅ No network requests for data storage
- ✅ You maintain complete control

### Deleting Data

To remove all stored data:
1. Uninstall the extension
2. VS Code automatically clears globalState on uninstall

Or manually clear from Command Palette:
```
Developer: Open User Data Folder
```
Navigate to storage and remove extension data.

---

## 💬 Support & Feedback

### Getting Help

- **📖 Documentation**: Read this README thoroughly
- **🐛 Issues**: File on GitHub for bugs
- **💡 Feature Requests**: Submit as GitHub issues
- **📊 Logs**: Check `View > Output > Chat Memory Manager`

### Community

- **GitHub**: [Repository URL]
- **Issues**: [Issues URL]
- **Discussions**: [Discussions URL]

---

## 🗺️ Roadmap

### Planned Features

- [x] ✅ Repository context storage
- [x] ✅ Chat session persistence
- [x] ✅ @memory chat participant
- [x] ✅ Auto-save functionality
- [ ] 🔜 Enhanced chat capture with official Copilot API
- [ ] 🔜 Semantic search across saved sessions
- [ ] 🔜 Export/import session functionality
- [ ] 🔜 Multi-workspace context management
- [ ] 🔜 Session tagging and organization
- [ ] 🔜 Analytics and insights dashboard
- [ ] 🔜 Cloud sync options (optional)
- [ ] 🔜 Diff view for context changes
- [ ] 🔜 Session merge capabilities
- [ ] 🔜 Custom context filters

### Future Enhancements

- Integration with other AI assistants
- Advanced context analysis and summarization
- Team collaboration features
- Session sharing capabilities
- Context versioning and history

---

## 🎓 Tips & Best Practices

### Maximize Context Quality

1. **Regular Updates**: Run `@memory /context` after major project changes
2. **Clean .gitignore**: Exclude unnecessary files for faster analysis
3. **Organize Files**: Well-structured projects = better context

### Effective Session Management

1. **Save Often**: Use `@memory /save` after important conversations
2. **Descriptive Names**: Name sessions meaningfully when prompted
3. **Regular Cleanup**: Remove old sessions periodically

### Optimize Performance

1. **Auto-Save Interval**: Adjust based on your workflow
2. **Selective Context**: Focus on relevant directories
3. **Monitor Storage**: Check Output panel for storage usage

---

## 📚 FAQ

### Q: Does this work without GitHub Copilot?
**A:** The repository context features work independently, but chat session features require GitHub Copilot.

### Q: Where is my data stored?
**A:** Locally in VS Code's globalState storage. Use Command Palette: `Developer: Open User Data Folder` to locate.

### Q: Can I export my sessions?
**A:** Export functionality is planned for a future release. Currently, data is accessible via VS Code's storage APIs.

### Q: Does this slow down VS Code?
**A:** No. Analysis runs asynchronously and doesn't block the UI. Large repositories may take longer to analyze initially.

### Q: Can I use this in a dev container?
**A:** Yes! The extension works perfectly in dev containers and remote workspaces.


