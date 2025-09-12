# Sidebar AI

> A Chrome Manifest V3 extension that provides an AI chat interface in the browser sidebar with customizable API endpoints, models, and APPLE UI design.

[English Version](README.md) | [中文版本](README.zh-CN.md) | [Versión en Español](README.es.md) | [Version Française](README.fr.md) | [日本語版](README.ja.md) | [русский язык](README.ru.md)

## Features

```
project/
├── manifest.json
├── background.js
├── sidebar.html
├── sidebar.css
├── sidebar.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── _locales/
│   ├── en/
│   │   └── messages.json
│   └── zh_CN/
│       └── messages.json
```

### Core Functionality
- **Sidebar Integration**: Native Chrome sidebar implementation using Manifest V3 Side Panel API
- **AI Chat Interface**: Real-time conversational AI interactions with streaming responses
- **Multi-language Support**: Full internationalization (i18n) with English, Chinese, Spanish, French, Japanese locales
- **Persistent Storage**: Conversation history management with local storage persistence

### API Configuration
- **Custom API Endpoints**: Configurable REST API endpoints for OpenAI-compatible services
- **Model Selection**: Flexible model specification with support for various LLM architectures
- **Authentication Management**: Secure API key storage and management
- **Temperature Control**: Adjustable response creativity parameters (0.0-1.0 range)

### Conversation Management
- **Session History**: Persistent conversation context within active sessions
- **Chat History**: Comprehensive historical conversation archive with timestamp metadata
- **Conversation Switching**: Seamless transition between multiple chat contexts
- **Selective Deletion**: Granular conversation history management with individual record removal

### UI/UX Design
- **Responsive Layout**: Adaptive design optimized for various viewport dimensions
- **Dark Mode Support**: Automatic system preference detection with dynamic theme switching
- **Micro-interactions**: Subtle animations and transitions using cubic-bezier timing functions
- **Accessibility Compliance**: WCAG-compliant contrast ratios and semantic HTML structure

## Technical Architecture

### Manifest V3 Implementation
- **Service Worker**: Background script for extension lifecycle management
- **Side Panel API**: Dedicated sidebar interface with isolated execution context
- **Storage API**: Synchronized settings and asynchronous conversation data persistence
- **Host Permissions**: Secure cross-origin resource access with explicit domain declarations

### Security Considerations
- **Credential Isolation**: API keys stored in encrypted Chrome storage mechanisms
- **Content Security Policy**: Strict CSP implementation preventing XSS vulnerabilities
- **Input Sanitization**: HTML entity encoding for user-generated content rendering
- **Rate Limiting**: Client-side request throttling to prevent API abuse

### Performance Optimization
- **Lazy Loading**: Conditional resource loading based on user interaction patterns
- **Memory Management**: Efficient garbage collection with conversation data pruning
- **Event Delegation**: Optimized event handling with bubbling prevention techniques
- **Virtual Scrolling**: Efficient DOM rendering for extensive conversation histories

## Installation

### Development Setup
1. Clone the repository to local development environment
2. Navigate to `chrome://extensions/` in Chromium-based browser
3. Enable "Developer mode" toggle
4. Select "Load unpacked" and choose extension directory
5. Pin extension to toolbar for convenient access

### Configuration Requirements
- **API Endpoint**: Valid REST endpoint URL for chat completion services
- **Authentication Token**: Bearer token for API service authentication
- **Model Identifier**: Valid model name compatible with configured endpoint

## Usage Guide

### Basic Operations
1. **Initiate Chat**: Click extension icon to open sidebar interface
2. **Configure Settings**: Access settings panel via gear icon for API configuration
3. **Start Conversation**: Enter message in input field and press send or Enter key
4. **Manage Sessions**: Use new chat button to create fresh conversation contexts

### Advanced Features
- **History Navigation**: Access previous conversations through history panel
- **Context Switching**: Load historical conversations for continued interaction
- **Selective Cleanup**: Remove individual conversations from history archive
- **Theme Adaptation**: Automatic dark/light mode switching based on system preferences

## Localization Support

### Supported Languages
- English
- Chinese
- Spanish
- French
- Japanese
- Russian

### Translation Framework
- **Message Bundles**: JSON-based i18n message catalogs
- **Dynamic Localization**: Runtime language detection and switching
- **Fallback Mechanism**: Graceful degradation to default language

## Browser Compatibility

### Supported Platforms
- **Google Chrome**: Version 114+ with Manifest V3 support
- **Microsoft Edge**: Chromium-based versions with side panel capability
- **Brave Browser**: Manifest V3 compliant implementations
- **Opera**: Chromium engine versions with extension support

### System Requirements
- **Operating Systems**: Windows 10+, macOS 10.15+, Linux distributions with GTK
- **Memory**: Minimum 4GB RAM recommended for optimal performance
- **Storage**: 50MB available disk space for extension and cached data

## Privacy & Data Handling

### Data Collection Policy
- **Zero Tracking**: No user behavior monitoring or analytics collection
- **Local Processing**: All conversation data processed within browser context
- **No External Dependencies**: Self-contained functionality without third-party services
- **Transparent Operations**: Clear data flow with explicit user consent mechanisms

### Storage Management
- **Settings Persistence**: Chrome Sync storage for cross-device configuration
- **Conversation Archiving**: Local storage with automatic data retention policies
- **Cache Optimization**: Efficient memory utilization with automatic cleanup routines

## Development Roadmap

### Planned Enhancements
- **Multi-model Support**: Simultaneous interaction with multiple AI services
- **Export Functionality**: Conversation data serialization in standard formats
- **Advanced Prompting**: Template-based prompt engineering capabilities
- **Voice Integration**: Speech-to-text and text-to-speech functionality

### Technical Improvements
- **WebAssembly Integration**: Performance optimization for client-side processing
- **Progressive Enhancement**: Offline functionality with service worker caching
- **Accessibility Audit**: WCAG 2.1 AA compliance verification
- **Performance Monitoring**: Real-time metrics collection and optimization

## Contributing

### Development Workflow
1. Fork repository and create feature branch
2. Implement changes following established coding standards
3. Execute comprehensive testing across supported platforms
4. Submit pull request with detailed change documentation

### Code Standards
- **ES6+ Syntax**: Modern JavaScript with async/await patterns
- **CSS Architecture**: BEM methodology with custom property theming
- **Security Practices**: Input validation and output encoding protocols
- **Performance Metrics**: Lighthouse scores and Core Web Vitals compliance

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For technical assistance and feature requests, please submit issues through the GitHub repository issue tracker. Community contributions and feedback are welcome through pull requests and discussions.