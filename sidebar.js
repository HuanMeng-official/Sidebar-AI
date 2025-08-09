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
    this.currentConversation = [];
    this.conversationHistory = [];
    this.maxHistoryLength = 50;
    
    this.initializeElements();
    this.translateUI();
    this.loadSettings();
    this.loadConversationHistory();
    this.bindEvents();
  }
  
  initializeElements() {
    this.chatContainer = document.getElementById('chatContainer');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.newChatBtn = document.getElementById('newChatBtn');
    this.historyBtn = document.getElementById('historyBtn');
    
    this.settingsPanel = document.getElementById('settingsPanel');
    this.historyPanel = document.getElementById('historyPanel');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
    this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    this.newChatDialog = document.getElementById('newChatDialog');
    this.clearDialog = document.getElementById('clearDialog');
    this.cancelNewChatBtn = document.getElementById('cancelNewChatBtn');
    this.confirmNewChatBtn = document.getElementById('confirmNewChatBtn');
    this.cancelClearBtn = document.getElementById('cancelClearBtn');
    this.confirmClearBtn = document.getElementById('confirmClearBtn');
    
    this.apiEndpointInput = document.getElementById('apiEndpoint');
    this.apiKeyInput = document.getElementById('apiKey');
    this.modelInput = document.getElementById('model');
    this.temperatureInput = document.getElementById('temperature');
    this.temperatureValue = document.getElementById('temperatureValue');
    
    this.historyList = document.getElementById('historyList');
  }
  
  translateUI() {
    document.getElementById('headerTitle').textContent = chrome.i18n.getMessage('ai_chat');
    this.historyBtn.title = chrome.i18n.getMessage('chat_history');
    this.newChatBtn.title = chrome.i18n.getMessage('new_chat');
    this.clearBtn.title = chrome.i18n.getMessage('clear_conversation');
    
    this.messageInput.placeholder = chrome.i18n.getMessage('enter_message');
    this.sendBtn.textContent = chrome.i18n.getMessage('send');
    
    document.getElementById('settingsTitle').textContent = chrome.i18n.getMessage('settings');
    document.getElementById('apiEndpointLabel').textContent = chrome.i18n.getMessage('api_endpoint');
    document.getElementById('apiKeyLabel').textContent = chrome.i18n.getMessage('api_key');
    document.getElementById('modelLabel').textContent = chrome.i18n.getMessage('model');
    document.getElementById('temperatureLabel').textContent = chrome.i18n.getMessage('temperature');
    this.saveSettingsBtn.textContent = chrome.i18n.getMessage('save_settings');
    
    document.getElementById('historyTitle').textContent = chrome.i18n.getMessage('chat_history');
    
    document.getElementById('newChatTitle').textContent = chrome.i18n.getMessage('new_chat');
    document.getElementById('newChatMessage').textContent = chrome.i18n.getMessage('new_chat_confirm_message');
    document.getElementById('cancelNewChatBtn').textContent = chrome.i18n.getMessage('cancel');
    document.getElementById('confirmNewChatBtn').textContent = chrome.i18n.getMessage('new_chat');
    
    document.getElementById('clearTitle').textContent = chrome.i18n.getMessage('clear_conversation');
    document.getElementById('clearMessage').textContent = chrome.i18n.getMessage('clear_confirm_message');
    document.getElementById('cancelClearBtn').textContent = chrome.i18n.getMessage('cancel');
    document.getElementById('confirmClearBtn').textContent = chrome.i18n.getMessage('clear');
  }
  
  bindEvents() {
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.historyBtn.addEventListener('click', () => this.openHistory());
    this.newChatBtn.addEventListener('click', () => this.showNewChatConfirm());
    this.clearBtn.addEventListener('click', () => this.showClearConfirm());
    
    this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    this.closeHistoryBtn.addEventListener('click', () => this.closeHistory());
    
    this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    
    this.cancelNewChatBtn.addEventListener('click', () => this.hideNewChatConfirm());
    this.confirmNewChatBtn.addEventListener('click', () => this.newChat());
    
    this.cancelClearBtn.addEventListener('click', () => this.hideClearConfirm());
    this.confirmClearBtn.addEventListener('click', () => this.clearCurrentConversation());
    
    this.temperatureInput.addEventListener('input', (e) => {
      this.temperatureValue.textContent = e.target.value;
    });
    
    this.messageInput.addEventListener('input', () => {
      this.adjustInputHeight();
    });
    
    this.newChatDialog.addEventListener('click', (e) => {
      if (e.target === this.newChatDialog) {
        this.hideNewChatConfirm();
      }
    });
    
    this.clearDialog.addEventListener('click', (e) => {
      if (e.target === this.clearDialog) {
        this.hideClearConfirm();
      }
    });
  }
  
  adjustInputHeight() {
    const input = this.messageInput;
    input.classList.remove('multiline');
    
    if (input.scrollHeight > input.clientHeight) {
      input.classList.add('multiline');
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    } else {
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
  
  async loadConversationHistory() {
    try {
      const result = await chrome.storage.local.get('conversationHistory');
      if (result.conversationHistory) {
        this.conversationHistory = result.conversationHistory;
      }
    } catch (error) {
      console.error('加载对话历史失败:', error);
    }
  }
  
  async saveConversationHistory() {
    try {
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
      }
      
      await chrome.storage.local.set({ conversationHistory: this.conversationHistory });
    } catch (error) {
      console.error('保存对话历史失败:', error);
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
  
  openHistory() {
    this.renderHistoryList();
    this.historyPanel.classList.remove('hidden');
  }
  
  closeHistory() {
    this.historyPanel.classList.add('hidden');
  }
  
  renderHistoryList() {
    this.historyList.innerHTML = '';
    
    if (this.conversationHistory.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'history-item-empty';
      emptyDiv.textContent = chrome.i18n.getMessage('no_history');
      this.historyList.appendChild(emptyDiv);
      return;
    }
    
    const sortedHistory = [...this.conversationHistory].reverse();
    
    sortedHistory.forEach((conversation, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.dataset.conversationId = conversation.id || conversation.timestamp;
      
      const firstMessage = conversation.messages[0];
      const title = firstMessage ? firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '') : 'Empty conversation';
      const preview = conversation.messages.length > 1 ? 
        conversation.messages[1].content.substring(0, 80) + (conversation.messages[1].content.length > 80 ? '...' : '') : 'No response';
      
      const date = new Date(conversation.timestamp);
      const dateString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      historyItem.innerHTML = `
        <div class="history-item-header">
          <div class="history-item-title">${this.escapeHtml(title)}</div>
          <div class="history-item-date">${dateString}</div>
        </div>
        <div class="history-item-preview">${this.escapeHtml(preview)}</div>
        <div class="history-item-actions">
          <button class="delete-history-btn">${chrome.i18n.getMessage('delete')}</button>
        </div>
      `;
      
      historyItem.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-history-btn')) {
          return;
        }
        this.loadConversation(conversation);
        this.closeHistory();
      });
      
      const deleteBtn = historyItem.querySelector('.delete-history-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteConversation(conversation.id || conversation.timestamp);
      });
      
      this.historyList.appendChild(historyItem);
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  showNewChatConfirm() {
    this.newChatDialog.classList.remove('hidden');
  }
  
  hideNewChatConfirm() {
    this.newChatDialog.classList.add('hidden');
  }
  
  showClearConfirm() {
    this.clearDialog.classList.remove('hidden');
  }
  
  hideClearConfirm() {
    this.clearDialog.classList.add('hidden');
  }
  
  async newChat() {
    if (this.currentConversation.length > 0) {
      const conversation = {
        messages: [...this.currentConversation],
        timestamp: Date.now(),
        id: Date.now().toString()
      };
      this.conversationHistory.push(conversation);
      await this.saveConversationHistory();
    }
    
    this.clearCurrentConversation();
    this.hideNewChatConfirm();
    
    this.showNotification(chrome.i18n.getMessage('new_chat_created'));
  }
  
  async deleteConversation(conversationId) {
    this.conversationHistory = this.conversationHistory.filter(conversation => 
      (conversation.id || conversation.timestamp) !== conversationId
    );
    
    await this.saveConversationHistory();
    this.renderHistoryList();
    this.showNotification(chrome.i18n.getMessage('conversation_deleted'));
  }
  
  loadConversation(conversation) {
    this.clearCurrentConversation();
    this.currentConversation = [...conversation.messages];
    
    this.currentConversation.forEach(message => {
      this.addMessageToUI(message.content, message.sender, false);
    });
  }
  
  clearCurrentConversation() {
    const messages = this.chatContainer.querySelectorAll('.message');
    messages.forEach(message => message.remove());
    
    this.currentConversation = [];
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
    const messageItem = {
      content: content,
      sender: sender,
      timestamp: Date.now()
    };
    
    this.currentConversation.push(messageItem);
    
    this.addMessageToUI(content, sender);
  }
  
  addMessageToUI(content, sender, saveToHistory = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = this.renderMarkdown(content);
    
    messageDiv.appendChild(contentDiv);
    this.chatContainer.appendChild(messageDiv);
    
    this.scrollToBottom();
  }
  
  renderMarkdown(text) {
    let html = this.escapeHtml(text);
    html = this.renderTables(html);
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/^(\s*)-\s+(.*)$/gm, '$1<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>)+/gs, '<ul>$&</ul>');
    html = html.replace(/^(\s*)\d+\.\s+(.*)$/gm, '$1<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>)+/gs, '<ol>$&</ol>');
    html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }
  
  renderTables(html) {
    const tableRegex = /(\|(?:[^\n]*\|)+\n\|(?:\s*[-:]+\s*\|)+\n(?:\|(?:[^\n]*\|)+\n?)*)/g;
    
    return html.replace(tableRegex, (match) => {
      const lines = match.trim().split('\n');
      if (lines.length < 2) return match;
      
      const headerLine = lines[0];
      const separatorLine = lines[1];
      const headers = headerLine.split('|').filter(cell => cell.trim() !== '');
      const separators = separatorLine.split('|').filter(cell => cell.trim() !== '');
      
      if (headers.length !== separators.length) return match;
      
      let tableHtml = '<table class="markdown-table">';
      
      tableHtml += '<thead><tr>';
      headers.forEach(header => {
        tableHtml += `<th>${this.escapeHtml(header.trim())}</th>`;
      });
      tableHtml += '</tr></thead>';
      
      tableHtml += '<tbody>';
      for (let i = 2; i < lines.length; i++) {
        const rowLine = lines[i];
        const cells = rowLine.split('|').filter(cell => cell.trim() !== '');
        if (cells.length === headers.length) {
          tableHtml += '<tr>';
          cells.forEach(cell => {
            tableHtml += `<td>${this.escapeHtml(cell.trim())}</td>`;
          });
          tableHtml += '</tr>';
        }
      }
      tableHtml += '</tbody></table>';
      
      return tableHtml;
    });
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
    
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' }
    ];
    
    this.currentConversation.forEach(item => {
      messages.push({
        role: item.sender === 'user' ? 'user' : 'assistant',
        content: item.content
      });
    });
    
    const response = await fetch(this.settings.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`
      },
      body: JSON.stringify({
        model: this.settings.model,
        messages: messages,
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

document.addEventListener('DOMContentLoaded', () => {
  new AIChatSidebar();
});