# Change Log

All notable changes to the "Chat Memory Manager" extension will be documented in this file.

## [0.0.1] - 2026-01-12

### Added
- Initial release
- Repository context analysis and storage
- Chat session persistence with save/restore
- GitHub Copilot Chat integration via `@memory` participant
- File-based storage using VS Code's built-in globalState
- Auto-save functionality for chat sessions
- Commands for managing sessions and repository context
- Webview for browsing saved chat sessions
- Comprehensive error handling with graceful fallbacks
- Configuration options for auto-save and storage paths

### Features
- **Storage Manager**: File-based storage interface with VS Code globalState
- **Chat Session Manager**: Capture and persist chat interactions
- **Repository Context Manager**: Analyze and store workspace structure
- **Chat Participant**: Direct integration with GitHub Copilot Chat using `@memory`
- **Error Resilience**: Extension works reliably with local storage

### Known Limitations
- Chat capture is limited by VS Code API availability
- Repository analysis excludes files larger than 1MB
- Basic pattern matching for file exclusions

### Technical Details
- Built with TypeScript 5.3.2
- Targets VS Code 1.85.0+
- Uses @modelcontextprotocol/sdk 0.5.0
- Includes Mocha test framework setup

## [Unreleased]

### Planned Features
- Enhanced chat message capture using improved VS Code APIs
- Real-time session synchronization across instances
- AI-powered session summaries
- Search functionality across saved sessions
- Export/import sessions to JSON
- Timeline view of development activity
- Session tagging and categorization
