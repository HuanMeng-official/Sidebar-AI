// Content script to inject AI chat interface into current page
class AIChatInjector {
  constructor() {
    this.chatContainer = null;
    this.isVisible = false;
    this.init();
  }

  init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleChat') {
        this.toggleChat();
        sendResponse({ success: true });
        return true;
      }
    });

    // Listen for messages from injected sidebar
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      if (event.data.type === 'AIChat_Close') {
        this.hideChat();
      }
    });
  }

  toggleChat() {
    if (this.isVisible) {
      this.hideChat();
    } else {
      this.showChat();
    }
  }

  showChat() {
    if (this.chatContainer) {
      this.chatContainer.style.display = 'block';
      this.isVisible = true;
      return;
    }

    // Create chat container
    this.chatContainer = document.createElement('div');
    this.chatContainer.id = 'ai-chat-container';
    this.chatContainer.innerHTML = `
      <div class="ai-chat-overlay"></div>
      <div class="ai-chat-sidebar">
        <div class="ai-chat-header">
          <span class="ai-chat-title">AI Chat</span>
          <button class="ai-chat-close">×</button>
        </div>
        <div class="ai-chat-content">
          <iframe
            src="${chrome.runtime.getURL('sidebar.html')}"
            class="ai-chat-iframe"
            frameborder="0"
            allowtransparency="true"
          ></iframe>
        </div>
      </div>
    `;

    document.body.appendChild(this.chatContainer);
    this.isVisible = true;

    // Add event listeners
    this.chatContainer.querySelector('.ai-chat-overlay').addEventListener('click', () => {
      this.hideChat();
    });

    this.chatContainer.querySelector('.ai-chat-close').addEventListener('click', () => {
      this.hideChat();
    });

    // Prevent body scroll when chat is open
    document.body.style.overflow = 'hidden';
  }

  hideChat() {
    if (this.chatContainer) {
      this.chatContainer.style.display = 'none';
      this.isVisible = false;
      document.body.style.overflow = '';
    }
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AIChatInjector();
  });
} else {
  new AIChatInjector();
}