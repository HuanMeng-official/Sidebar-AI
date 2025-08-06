# Sidebar AI

Sidebar AI is a Chrome extension that provides an AI-powered assistant in your browser's sidebar. It allows you to have conversations with AI models directly from your browser, supporting various providers like OpenAI, Azure, Claude, and local models.

## Features

- **Sidebar Interface**: Access your AI assistant from a convenient sidebar that doesn't interfere with your browsing experience
- **Multi-Provider Support**: Works with OpenAI, Azure OpenAI, Claude, and local AI models
- **Conversation History**: Maintains context within a conversation for more coherent interactions
- **Easy Configuration**: Simple settings interface to configure API endpoints, keys, and models
- **Internationalization**: Supports multiple languages (English, Chinese)

## Project Structure

```
.
├── _locales/                 # Internationalization files
│   ├── en/                   # English translations
│   │   └── messages.json
│   └── zh_CN/                # Chinese translations
│       └── messages.json
├── icons/                    # Extension icons in various sizes
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json             # Extension configuration file
├── popup.css                 # Styles for the popup settings window
├── popup.html                # Popup settings window HTML
├── popup.js                  # Popup settings window functionality
├── sidebar.css               # Styles for the sidebar interface
├── sidebar.html              # Sidebar interface HTML
└── sidebar.js                # Sidebar interface functionality
```

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Configuration

1. Click on the extension icon in the Chrome toolbar to open the settings popup
2. Enter your API endpoint, API key, and model name
3. Click "Save Settings" to store your configuration
4. Use "Test Connection" to verify your settings are correct
5. Click "Open Sidebar" to open the AI assistant sidebar

## Usage

1. Open the sidebar by clicking the "Open Sidebar" button in the popup or using the browser's sidebar panel
2. Type your message in the input field at the bottom of the sidebar
3. Press Enter or click the send button to submit your message
4. The AI response will appear in the chat area
5. Use the clear button to reset the conversation
6. Use the settings button to adjust your API configuration

## Supported AI Providers

- **OpenAI**: Compatible with OpenAI's API
- **Azure OpenAI**: Works with Azure's OpenAI service
- **Claude**: Anthropic's Claude models
- **Local Models**: Self-hosted models via API endpoints

## Permissions

- `activeTab`: To interact with the currently active tab
- `storage`: To save settings and preferences
- `sidePanel`: To display the sidebar interface
- `windows`: To manage browser windows
- `host_permissions`: To communicate with API endpoints

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.