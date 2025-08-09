class AIChatSidebar {
  constructor() {
    this.defaultSettings = {
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: '',
      model: 'gpt-3.5-turbo',
      temperature: 0.7
    };
    
    this.settings = { ...this.defaultSettings };
    this.isTyping = false;
    this.currentLocale = chrome.i18n.getUILanguage();
    
    this.initializeElements();
    this.translateUI();
    this.loadSettings();
    this.bindEvents();
  }
  
  initializeElements() {
    this.chatContainer = document.getElementById('chatContainer');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.settingsPanel = document.getElementById('settingsPanel');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    // 确认对话框元素
    this.confirmDialog = document.getElementById('confirmDialog');
    this.cancelClearBtn = document.getElementById('cancelClearBtn');
    this.confirmClearBtn = document.getElementById('confirmClearBtn');
    
    // 设置面板元素
    this.apiEndpointInput = document.getElementById('apiEndpoint');
    this.apiKeyInput = document.getElementById('apiKey');
    this.modelInput = document.getElementById('model');
    this.temperatureInput = document.getElementById('temperature');
    this.temperatureValue = document.getElementById('temperatureValue');
  }
  
  translateUI() {
    // 头部
    document.getElementById('headerTitle').textContent = chrome.i18n.getMessage('ai_chat');
    this.clearBtn.title = chrome.i18n.getMessage('clear_conversation');
    
    // 聊天区域
    document.getElementById('welcomeMessage').textContent = chrome.i18n.getMessage('welcome_message');
    
    // 输入区域
    this.messageInput.placeholder = chrome.i18n.getMessage('enter_message');
    this.sendBtn.textContent = chrome.i18n.getMessage('send');
    
    // 设置面板
    document.getElementById('settingsTitle').textContent = chrome.i18n.getMessage('settings');
    document.getElementById('apiEndpointLabel').textContent = chrome.i18n.getMessage('api_endpoint');
    document.getElementById('apiKeyLabel').textContent = chrome.i18n.getMessage('api_key');
    document.getElementById('modelLabel').textContent = chrome.i18n.getMessage('model');
    document.getElementById('temperatureLabel').textContent = chrome.i18n.getMessage('temperature');
    this.saveSettingsBtn.textContent = chrome.i18n.getMessage('save_settings');
    
    // 确认对话框
    document.getElementById('confirmTitle').textContent = chrome.i18n.getMessage('clear_conversation');
    document.getElementById('confirmMessage').textContent = chrome.i18n.getMessage('clear_confirm_message');
    document.getElementById('cancelClearBtn').textContent = chrome.i18n.getMessage('cancel');
    document.getElementById('confirmClearBtn').textContent = chrome.i18n.getMessage('clear');
    
    // API端点输入框占位符
    this.apiEndpointInput.placeholder = 'https://api.openai.com/v1/chat/completions';
    this.apiKeyInput.placeholder = chrome.i18n.getMessage('api_key');
    this.modelInput.placeholder = 'gpt-3.5-turbo';
  }
  
  bindEvents() {
    // 发送消息
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // 设置面板
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    
    // 清除对话
    this.clearBtn.addEventListener('click', () => this.showClearConfirm());
    this.cancelClearBtn.addEventListener('click', () => this.hideClearConfirm());
    this.confirmClearBtn.addEventListener('click', () => this.clearConversation());
    
    // 温度滑块
    this.temperatureInput.addEventListener('input', (e) => {
      this.temperatureValue.textContent = e.target.value;
    });
    
    // 自动调整输入框高度（支持多行）
    this.messageInput.addEventListener('input', () => {
      this.adjustInputHeight();
    });
    
    // 点击对话框外部关闭
    this.confirmDialog.addEventListener('click', (e) => {
      if (e.target === this.confirmDialog) {
        this.hideClearConfirm();
      }
    });
  }
  
  adjustInputHeight() {
    const input = this.messageInput;
    input.classList.remove('multiline');
    
    // 检查是否需要多行
    if (input.scrollHeight > input.clientHeight) {
      input.classList.add('multiline');
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    } else {
      // 保持单行高度
      input.style.height = '36px';
    }
  }
  
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get('aiChatSettings');
      if (result.aiChatSettings) {
        this.settings = { ...this.defaultSettings, ...result.aiChatSettings };
      }
      this.populateSettingsForm();
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }
  
  populateSettingsForm() {
    this.apiEndpointInput.value = this.settings.apiEndpoint;
    this.apiKeyInput.value = this.settings.apiKey;
    this.modelInput.value = this.settings.model;
    this.temperatureInput.value = this.settings.temperature;
    this.temperatureValue.textContent = this.settings.temperature;
  }
  
  async saveSettings() {
    this.settings = {
      apiEndpoint: this.apiEndpointInput.value.trim() || this.defaultSettings.apiEndpoint,
      apiKey: this.apiKeyInput.value.trim(),
      model: this.modelInput.value.trim() || this.defaultSettings.model,
      temperature: parseFloat(this.temperatureInput.value)
    };
    
    try {
      await chrome.storage.sync.set({ aiChatSettings: this.settings });
      this.closeSettings();
      this.showNotification(chrome.i18n.getMessage('settings_saved'));
    } catch (error) {
      console.error('保存设置失败:', error);
      this.showNotification(chrome.i18n.getMessage('settings_save_failed'), 'error');
    }
  }
  
  openSettings() {
    this.settingsPanel.classList.remove('hidden');
  }
  
  closeSettings() {
    this.settingsPanel.classList.add('hidden');
  }
  
  showClearConfirm() {
    this.confirmDialog.classList.remove('hidden');
  }
  
  hideClearConfirm() {
    this.confirmDialog.classList.add('hidden');
  }
  
  clearConversation() {
    // 清除其他所有消息
    const messages = this.chatContainer.querySelectorAll('.message:not(.welcome-message)');
    messages.forEach(message => message.remove());
    
    this.hideClearConfirm();
    this.showNotification(chrome.i18n.getMessage('conversation_cleared'));
  }
  
  sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message || this.isTyping) return;
    
    this.addMessage(message, 'user');
    this.messageInput.value = '';
    this.messageInput.style.height = '36px';
    this.messageInput.classList.remove('multiline');
    this.sendBtn.disabled = true;
    
    this.getAIResponse(message);
  }
  
  addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = this.formatMessage(content);
    
    messageDiv.appendChild(contentDiv);
    this.chatContainer.appendChild(messageDiv);
    
    // 滚动到底部
    this.scrollToBottom();
  }
  
  formatMessage(content) {
    // 格式化
    return content.replace(/\n/g, '<br>');
  }
  
  async getAIResponse(userMessage) {
    this.addTypingIndicator();
    
    try {
      const response = await this.callAIAPi(userMessage);
      this.removeTypingIndicator();
      this.addMessage(response, 'ai');
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessage(`${chrome.i18n.getMessage('api_error')}${error.message}`, 'ai');
    }
    
    this.sendBtn.disabled = false;
  }
  
  async callAIAPi(message) {
    if (!this.settings.apiKey) {
      throw new Error(chrome.i18n.getMessage('api_key_required'));
    }
    
    const response = await fetch(this.settings.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`
      },
      body: JSON.stringify({
        model: this.settings.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message }
        ],
        temperature: this.settings.temperature
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
  
  addTypingIndicator() {
    this.isTyping = true;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    
    typingDiv.appendChild(contentDiv);
    this.chatContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }
  
  removeTypingIndicator() {
    this.isTyping = false;
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  scrollToBottom() {
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }
  
  showNotification(message, type = 'success') {
    console.log(`${type}: ${message}`);
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new AIChatSidebar();
});