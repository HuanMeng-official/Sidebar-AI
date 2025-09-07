class AIChatSidebar {
  constructor() {
    this.defaultSettings = {
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      apiKey: '',
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      apiType: 'gemini',
      systemPrompt: 'You are a helpful assistant.',
      showTokenInfo: false
    };
    this.settings = { ...this.defaultSettings };
    this.isTyping = false;
    this.currentLocale = chrome.i18n.getUILanguage();
    this.currentConversation = [];
    this.conversationHistory = [];
    this.maxHistoryLength = 50;
    this.attachedFiles = [];
    this.maxFileSize = 10 * 1024 * 1024;
    this.allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    this.allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'];
    this.isFetchingPageContent = false;

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
    this.apiTypeSelect = document.getElementById('apiType');
    this.historyList = document.getElementById('historyList');
    this.attachBtn = document.getElementById('attachBtn');
    this.fileInput = document.getElementById('fileInput');
    this.fileUploadArea = document.getElementById('fileUploadArea');
    this.fileUploadText = document.getElementById('fileUploadText');
    this.filePreviewContainer = document.getElementById('filePreviewContainer');
    this.filePreviewList = document.getElementById('filePreviewList');
    this.clearFilesBtn = document.getElementById('clearFilesBtn');
    this.getPageContentBtn = document.getElementById('getPageContentBtn');
    this.systemPromptInput = document.getElementById('systemPrompt');
    this.showTokenInfoInput = document.getElementById('showTokenInfo');
  }

  translateUI() {
    document.getElementById('headerTitle').textContent = chrome.i18n.getMessage('ai_chat');
    this.historyBtn.title = chrome.i18n.getMessage('chat_history');
    this.newChatBtn.title = chrome.i18n.getMessage('new_chat');
    this.clearBtn.title = chrome.i18n.getMessage('clear_conversation');
    if (this.attachBtn) {
      this.attachBtn.title = chrome.i18n.getMessage('attach_file');
    }
    if (this.getPageContentBtn) {
      this.getPageContentBtn.title = chrome.i18n.getMessage('get_page_content');
    }
    this.messageInput.placeholder = chrome.i18n.getMessage('enter_message');
    this.sendBtn.textContent = chrome.i18n.getMessage('send');

    document.getElementById('settingsTitle').textContent = chrome.i18n.getMessage('settings');
    document.getElementById('apiEndpointLabel').textContent = chrome.i18n.getMessage('api_endpoint');
    document.getElementById('apiKeyLabel').textContent = chrome.i18n.getMessage('api_key');
    document.getElementById('modelLabel').textContent = chrome.i18n.getMessage('model');
    document.getElementById('temperatureLabel').textContent = chrome.i18n.getMessage('temperature');
    if (document.getElementById('apiTypeLabel')) {
      document.getElementById('apiTypeLabel').textContent = chrome.i18n.getMessage('api_type');
    }
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

    if (document.getElementById('filePreviewTitle')) {
      document.getElementById('filePreviewTitle').textContent = chrome.i18n.getMessage('attached_files');
    }
    if (this.fileUploadText) {
      this.fileUploadText.textContent = chrome.i18n.getMessage('drop_files_here') || 'Drop files here or click to upload';
    }
    if (document.getElementById('systemPromptLabel')) {
      document.getElementById('systemPromptLabel').textContent = chrome.i18n.getMessage('system_prompt') || 'System Prompt';
    }
    if (this.systemPromptInput) {
      this.systemPromptInput.placeholder = chrome.i18n.getMessage('system_prompt_placeholder') || 'Enter system prompt for the AI...';
    }
    if (document.getElementById('showTokenInfoLabel')) {
      document.getElementById('showTokenInfoLabel').textContent = chrome.i18n.getMessage('show_token_info') || 'Show Token Info';
    }
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

    if (this.apiTypeSelect) {
      this.apiTypeSelect.addEventListener('change', () => this.updateApiDefaults());
    }

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

    if (this.attachBtn) {
      this.attachBtn.addEventListener('click', () => this.openFileSelector());
    }
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }
    if (this.clearFilesBtn) {
      this.clearFilesBtn.addEventListener('click', () => this.clearAttachedFiles());
    }

    if (this.fileUploadArea) {
      this.fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.fileUploadArea.classList.add('drag-over');
      });

      this.fileUploadArea.addEventListener('dragleave', () => {
        this.fileUploadArea.classList.remove('drag-over');
      });

      this.fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        this.fileUploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
          this.handleFiles(Array.from(e.dataTransfer.files));
        }
      });

      this.fileUploadArea.addEventListener('click', (e) => {
        if (e.target === this.fileUploadArea) {
          this.hideFileUploadArea();
        }
      });
    }

    if (this.getPageContentBtn) {
      this.getPageContentBtn.addEventListener('click', () => this.fetchAndSendMessage());
    }
  }

  updateApiDefaults() {
    const apiType = this.apiTypeSelect.value;
    if (apiType === 'gemini') {
      this.apiEndpointInput.value = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
      this.modelInput.value = 'gemini-2.5-flash';
    } else {
      this.apiEndpointInput.value = 'https://api.openai.com/v1/chat/completions';
      this.modelInput.value = 'gpt-4o';
    }
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
    if (this.apiTypeSelect) {
      this.apiTypeSelect.value = this.settings.apiType || 'gemini';
    }
    if (this.systemPromptInput) {
      this.systemPromptInput.value = this.settings.systemPrompt || this.defaultSettings.systemPrompt;
    }
    if (this.showTokenInfoInput) {
      this.showTokenInfoInput.checked = this.settings.showTokenInfo || false;
    }
  }

  async saveSettings() {
    this.settings = {
      apiEndpoint: this.apiEndpointInput.value.trim() || this.defaultSettings.apiEndpoint,
      apiKey: this.apiKeyInput.value.trim(),
      model: this.modelInput.value.trim() || this.defaultSettings.model,
      temperature: parseFloat(this.temperatureInput.value),
      apiType: this.apiTypeSelect ? this.apiTypeSelect.value : 'gemini',
      systemPrompt: this.systemPromptInput ? (this.systemPromptInput.value.trim() || this.defaultSettings.systemPrompt) : this.defaultSettings.systemPrompt,
      showTokenInfo: this.showTokenInfoInput ? this.showTokenInfoInput.checked : false
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
      const dateString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
      this.addMessageToUI(message.content, message.sender, message.files || [], false);
    });
  }

  clearCurrentConversation() {
    const messages = this.chatContainer.querySelectorAll('.message');
    messages.forEach(message => message.remove());
    this.currentConversation = [];
    this.clearAttachedFiles();
    this.hideClearConfirm();
    this.showNotification(chrome.i18n.getMessage('conversation_cleared'));
  }

  sendMessage() {
    const message = this.messageInput.value.trim();

    if ((!message && this.attachedFiles.length === 0) || this.isTyping) return;

    this.addMessage(message, 'user', this.attachedFiles);

    this.messageInput.value = '';
    this.messageInput.style.height = '36px';
    this.messageInput.classList.remove('multiline');
    this.sendBtn.disabled = true;

    this.getAIResponse(message);
  }

  addMessage(content, sender, files = []) {
    const messageItem = {
      content: content,
      sender: sender,
      timestamp: Date.now(),
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    this.currentConversation.push(messageItem);
    this.addMessageToUI(content, sender, files, true);
  }

  addMessageToUI(content, sender, files = [], isNewMessage = true, tokens = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.dataset.sender = sender;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (sender === 'user' && files.length > 0) {
      const filesDiv = document.createElement('div');
      filesDiv.className = 'message-files';

      files.forEach(file => {
        const filePreview = document.createElement('div');
        filePreview.className = 'message-file-preview';

        let icon = '📄';
        if (file.type.startsWith('image/')) {
          icon = '🖼️';
        }

        const fileSize = this.formatFileSize(file.size);

        filePreview.innerHTML = `
          <span class="file-icon">${icon}</span>
          <div class="file-info">
            <div class="file-name">${this.escapeHtml(file.name)}</div>
            <div class="file-size">${fileSize}</div>
          </div>
        `;

        filesDiv.appendChild(filePreview);
      });

      contentDiv.appendChild(filesDiv);
    }

    if (content) {
      const textDiv = document.createElement('div');
      textDiv.className = 'message-text';
      textDiv.innerHTML = this.renderMarkdown(content);
      contentDiv.appendChild(textDiv);
    }

    messageDiv.appendChild(contentDiv);

    if (this.settings.showTokenInfo && tokens) {
      const tokenInfoDiv = document.createElement('div');
      tokenInfoDiv.className = 'token-info';

      let tokenText = '';
      if (tokens.inputTokens !== undefined) {
        tokenText += `In: ${tokens.inputTokens} tokens`;
      }
      if (tokens.outputTokens !== undefined) {
        tokenText += tokenText ? ', ' : '';
        tokenText += `Out: ${tokens.outputTokens} tokens`;
      }
      if (tokens.timeTakenMs !== undefined && tokens.outputTokens !== undefined && tokens.outputTokens > 0) {
        const timeInSeconds = tokens.timeTakenMs / 1000;
        if (timeInSeconds > 0) {
          const tokensPerSecond = (tokens.outputTokens / timeInSeconds).toFixed(2);
          tokenText += tokenText ? `, ` : '';
          tokenText += `Sed: ${tokensPerSecond} T/s`;
        }
      }

      if (tokenText) {
        tokenInfoDiv.textContent = tokenText;
        contentDiv.appendChild(tokenInfoDiv);
      }
    }

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

    const startTime = performance.now();

    try {
      if (this.settings.apiType === 'gemini') {
        // For Gemini, use streaming response
        await this.callGeminiAPIStreaming(userMessage, startTime);
      } else {
        // For OpenAI, use streaming response
        await this.callOpenAIAPIStreaming(userMessage, startTime);
      }
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessageToUI(`${chrome.i18n.getMessage('api_error')}${error.message}`, 'ai', [], true, null);
      this.clearAttachedFiles();
    }

    this.sendBtn.disabled = false;
  }

  async callGeminiAPI(message) {
    if (!this.settings.apiKey) {
      throw new Error(chrome.i18n.getMessage('api_key_required'));
    }

    try {
      const contents = [];

      const systemMessageContent = this.settings.systemPrompt || this.defaultSettings.systemPrompt;
      if (systemMessageContent) {
        contents.push({
          role: 'user',
          parts: [{ text: systemMessageContent }]
        });
        contents.push({
          role: 'model',
          parts: [{ text: "Understood. I will follow these instructions." }]
        });
      }

      for (const item of this.currentConversation) {
        const contentParts = [];
        if (item.content) {
          contentParts.push({ text: item.content });
        }

        if (contentParts.length > 0) {
          contents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: contentParts
          });
        }
      }

      if (this.attachedFiles.length > 0) {
        const fileParts = await this.prepareFilesForGemini(this.attachedFiles);
        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts.push(...fileParts);
        } else {
          contents.push({
            role: 'user',
            parts: fileParts
          });
        }
      }

      const requestBody = {
        contents: contents,
        generationConfig: {
          temperature: this.settings.temperature,
          maxOutputTokens: 8192
        }
      };

      const model = this.settings.model || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.settings.apiKey}`;

      console.log('Gemini API Request:', url, requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Response:', errorText);
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Gemini API Response:', data);

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response candidates received from Gemini API');
      }

      const candidate = data.candidates[0];
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Response blocked by safety filters');
      }

      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response format from Gemini API');
      }

      let inputTokens = 0;
      let outputTokens = 0;
      if (data.usageMetadata) {
        inputTokens = data.usageMetadata.promptTokenCount || 0;
        outputTokens = data.usageMetadata.candidatesTokenCount || 0;
      }

      return {
        text: candidate.content.parts[0].text.trim(),
        tokens: { inputTokens, outputTokens }
      };
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  async callGeminiAPIStreaming(userMessage, startTime) {
    if (!this.settings.apiKey) {
      throw new Error(chrome.i18n.getMessage('api_key_required'));
    }

    try {
      const contents = [];

      const systemMessageContent = this.settings.systemPrompt || this.defaultSettings.systemPrompt;
      if (systemMessageContent) {
        contents.push({
          role: 'user',
          parts: [{ text: systemMessageContent }]
        });
        contents.push({
          role: 'model',
          parts: [{ text: "Understood. I will follow these instructions." }]
        });
      }

      for (const item of this.currentConversation) {
        const contentParts = [];
        if (item.content) {
          contentParts.push({ text: item.content });
        }

        if (contentParts.length > 0) {
          contents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: contentParts
          });
        }
      }

      if (this.attachedFiles.length > 0) {
        const fileParts = await this.prepareFilesForGemini(this.attachedFiles);
        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts.push(...fileParts);
        } else {
          contents.push({
            role: 'user',
            parts: fileParts
          });
        }
      }

      const requestBody = {
        contents: contents,
        generationConfig: {
          temperature: this.settings.temperature,
          maxOutputTokens: 8192
        }
      };

      const model = this.settings.model || 'gemini-2.5-flash';
      
      // Use the correct streaming endpoint for Gemini
      // For streaming, we use streamGenerateContent method with the correct model format
      const modelName = model.includes('/') ? model : `models/${model}`;
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:streamGenerateContent?key=${this.settings.apiKey}&alt=sse`;

      console.log('Gemini Streaming API Request:', url, requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Gemini API Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Response:', response.status, response.statusText, errorText);
        
        // Try fallback to non-streaming API if streaming fails
        // Check if this might be a model that doesn't support streaming
        const modelSupportsStreaming = this.settings.model && 
          (this.settings.model.includes('gemini') || this.settings.model.includes('1.5') || this.settings.model.includes('2.0') || this.settings.model.includes('2.5'));
        
        if (response.status === 404 || response.status === 400 || response.status === 403 || !modelSupportsStreaming) {
          console.log('Streaming not supported for this model, falling back to non-streaming Gemini API');
          try {
            const result = await this.callGeminiAPI(userMessage);
            const endTime = performance.now();
            const tokens = { 
              ...result.tokens, 
              timeTakenMs: endTime - startTime 
            };
            
            this.removeTypingIndicator();
            this.addMessageToUI(result.text, 'ai', [], true, tokens);
            this.clearAttachedFiles();
            return;
          } catch (fallbackError) {
            console.error('Fallback to non-streaming also failed:', fallbackError);
            throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - Fallback also failed`);
          }
        }
        
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let aiMessageDiv = null;
      let aiMessageContentDiv = null;
      let outputTokens = 0;

      // Create AI message container for streaming
      this.removeTypingIndicator();
      aiMessageDiv = document.createElement('div');
      aiMessageDiv.className = 'message ai-message streaming-message';
      aiMessageDiv.dataset.sender = 'ai';
      
      aiMessageContentDiv = document.createElement('div');
      aiMessageContentDiv.className = 'message-content';
      
      const textDiv = document.createElement('div');
      textDiv.className = 'message-text';
      aiMessageContentDiv.appendChild(textDiv);
      
      aiMessageDiv.appendChild(aiMessageContentDiv);
      this.chatContainer.appendChild(aiMessageDiv);
      this.scrollToBottom();

      let hasContent = false;
      let streamTimeout = setTimeout(() => {
        console.warn('Stream timeout - no data received for 30 seconds');
        reader.cancel();
      }, 30000);
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Reset timeout on data reception
          clearTimeout(streamTimeout);
          streamTimeout = setTimeout(() => {
            console.warn('Stream timeout - no data received for 30 seconds');
            reader.cancel();
          }, 30000);

          // Handle empty chunks
          if (!value) {
            console.log('Received empty chunk, continuing...');
            continue;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log('Raw chunk received:', chunk);
          
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            console.log('Processing line:', line);
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                console.log('Stream completed with [DONE]');
                break;
              }

            try {
              const parsed = JSON.parse(data);
              console.log('Gemini streaming chunk raw:', data);
              console.log('Gemini streaming chunk parsed:', parsed);
              
              // Handle Gemini streaming response format - check multiple possible structures
              let textChunk = '';
              
              // Structure 1: Standard candidate format (most common)
              if (parsed.candidates && parsed.candidates[0]) {
                const candidate = parsed.candidates[0];
                
                if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
                  const part = candidate.content.parts[0];
                  if (part.text) {
                    textChunk = part.text;
                  }
                }
                
                // Handle finish reason
                if (candidate.finishReason && candidate.finishReason !== 'FINISH_REASON_UNSPECIFIED') {
                  console.log('Stream finished with reason:', candidate.finishReason);
                  break;
                }
              }
              
              // Structure 2: Direct text in response (some Gemini versions)
              if (!textChunk && parsed.text) {
                textChunk = parsed.text;
              }
              
              // Structure 3: Error response
              if (parsed.error) {
                console.error('Gemini API error:', parsed.error);
                break;
              }
              
              // Structure 4: Usage metadata (contains token counts)
              if (parsed.usageMetadata) {
                console.log('Usage metadata:', parsed.usageMetadata);
                // Can use this for token counting if needed
              }
              
              if (textChunk) {
                hasContent = true;
                fullResponse += textChunk;
                textDiv.innerHTML = this.renderMarkdown(fullResponse);
                this.scrollToBottom();
                
                // Estimate tokens (roughly 4 characters per token)
                outputTokens += Math.ceil(textChunk.length / 4);
                
                console.log('Received text chunk:', textChunk);
              } else if (Object.keys(parsed).length > 0) {
                console.log('Received non-text chunk:', parsed);
              }
            } catch (e) {
              console.log('Error parsing Gemini streaming chunk:', e, data);
              // Try to handle malformed JSON - sometimes Gemini sends incomplete chunks
              if (data.includes('text') || data.includes('content')) {
                console.log('Attempting to extract text from malformed JSON:', data);
                // Simple text extraction from malformed JSON
                const textMatch = data.match(/"text"\s*:\s*"([^"]*)"/);
                if (textMatch && textMatch[1]) {
                  const extractedText = textMatch[1];
                  hasContent = true;
                  fullResponse += extractedText;
                  textDiv.innerHTML = this.renderMarkdown(fullResponse);
                  this.scrollToBottom();
                  outputTokens += Math.ceil(extractedText.length / 4);
                  console.log('Extracted text from malformed JSON:', extractedText);
                }
              }
            }
          }
        }
      }
      } catch (streamError) {
        console.error('Stream reading error:', streamError);
        if (streamError.name === 'AbortError') {
          console.log('Stream was aborted due to timeout');
        }
      } finally {
        clearTimeout(streamTimeout);
      }

      const endTime = performance.now();
      const tokens = {
        inputTokens: 0, // Gemini streaming doesn't provide input token count
        outputTokens: outputTokens,
        timeTakenMs: endTime - startTime
      };

      // Update the message with final content and tokens
      aiMessageDiv.classList.remove('streaming-message');
      
      // If no content was received during streaming, fall back to non-streaming
      if (!hasContent || fullResponse.trim() === '') {
        console.log('No content received from streaming, falling back to non-streaming API');
        aiMessageDiv.remove();
        const result = await this.callGeminiAPI(userMessage);
        tokens.inputTokens = result.tokens.inputTokens;
        tokens.outputTokens = result.tokens.outputTokens;
        
        this.addMessageToUI(result.text, 'ai', [], true, tokens);
        this.clearAttachedFiles();
        return;
      }
      
      // Add to conversation history
      const messageItem = {
        content: fullResponse.trim(),
        sender: 'ai',
        timestamp: Date.now(),
        files: [],
        tokens: tokens
      };
      this.currentConversation.push(messageItem);

      // Add token info if enabled
      if (this.settings.showTokenInfo) {
        const tokenInfoDiv = document.createElement('div');
        tokenInfoDiv.className = 'token-info';
        
        let tokenText = '';
        if (tokens.outputTokens !== undefined) {
          tokenText += `Out: ${tokens.outputTokens} tokens`;
        }
        if (tokens.timeTakenMs !== undefined && tokens.outputTokens !== undefined && tokens.outputTokens > 0) {
          const timeInSeconds = tokens.timeTakenMs / 1000;
          if (timeInSeconds > 0) {
            const tokensPerSecond = (tokens.outputTokens / timeInSeconds).toFixed(2);
            tokenText += tokenText ? ', ' : '';
            tokenText += `Sed: ${tokensPerSecond} T/s`;
          }
        }

        if (tokenText) {
          tokenInfoDiv.textContent = tokenText;
          aiMessageContentDiv.appendChild(tokenInfoDiv);
        }
      }

      this.clearAttachedFiles();

    } catch (error) {
      this.removeTypingIndicator();
      throw error;
    }
  }

  async callOpenAIAPI(message) {
    if (!this.settings.apiKey) {
      throw new Error(chrome.i18n.getMessage('api_key_required'));
    }

    const systemMessageContent = this.settings.systemPrompt || this.defaultSettings.systemPrompt;
    const messages = [
      { role: 'system', content: systemMessageContent }
    ];

    for (const item of this.currentConversation) {
      let content = item.content || '';

      if (item.files && item.files.length > 0) {
        const fileInfos = item.files.map(file =>
          `Attached file: ${file.name} (${this.formatFileSize(file.size)})`
        ).join('\n');
        if (fileInfos) {
          content += (content ? '\n\n' : '') + fileInfos;
        }
      }

      if (content) {
        messages.push({
          role: item.sender === 'user' ? 'user' : 'assistant',
          content: content
        });
      }
    }

    let currentUserMessageContent = message || '';

    if (this.attachedFiles.length > 0) {
      const contentParts = [];

      if (currentUserMessageContent.trim()) {
        contentParts.push({ type: 'text', text: currentUserMessageContent });
      }

      for (const file of this.attachedFiles) {
        if (file.type.startsWith('image/')) {
          try {
            const base64DataUrl = await this.fileToBase64(file);
            contentParts.push({
              type: 'image_url',
              image_url: {
                url: base64DataUrl
              }
            });
          } catch (error) {
            console.error('Error processing image file for OpenAI:', file.name, error);
            contentParts.push({ type: 'text', text: `[Error reading image: ${file.name}]` });
          }
        } else {
          contentParts.push({
            type: 'text',
            text: `Attached file (not an image): ${file.name} (${this.formatFileSize(file.size)})`
          });
        }
      }

      messages.push({
        role: 'user',
        content: contentParts
      });

    } else {
      if (currentUserMessageContent.trim()) {
        messages.push({
          role: 'user',
          content: currentUserMessageContent
        });
      }
    }

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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `OpenAI API request failed: ${response.status} ${response.statusText}`;
      console.error('OpenAI API Error Response:', errorData);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    let inputTokens = 0;
    let outputTokens = 0;
    if (data.usage) {
      inputTokens = data.usage.prompt_tokens || 0;
      outputTokens = data.usage.completion_tokens || 0;
    }

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return {
      text: data.choices[0].message.content.trim(),
      tokens: { inputTokens, outputTokens }
    };
  }

  async callOpenAIAPIStreaming(userMessage, startTime) {
    if (!this.settings.apiKey) {
      throw new Error(chrome.i18n.getMessage('api_key_required'));
    }

    const systemMessageContent = this.settings.systemPrompt || this.defaultSettings.systemPrompt;
    const messages = [
      { role: 'system', content: systemMessageContent }
    ];

    for (const item of this.currentConversation) {
      let content = item.content || '';

      if (item.files && item.files.length > 0) {
        const fileInfos = item.files.map(file =>
          `Attached file: ${file.name} (${this.formatFileSize(file.size)})`
        ).join('\n');
        if (fileInfos) {
          content += (content ? '\n\n' : '') + fileInfos;
        }
      }

      if (content) {
        messages.push({
          role: item.sender === 'user' ? 'user' : 'assistant',
          content: content
        });
      }
    }

    let currentUserMessageContent = userMessage || '';

    if (this.attachedFiles.length > 0) {
      const contentParts = [];

      if (currentUserMessageContent.trim()) {
        contentParts.push({ type: 'text', text: currentUserMessageContent });
      }

      for (const file of this.attachedFiles) {
        if (file.type.startsWith('image/')) {
          try {
            const base64DataUrl = await this.fileToBase64(file);
            contentParts.push({
              type: 'image_url',
              image_url: {
                url: base64DataUrl
              }
            });
          } catch (error) {
            console.error('Error processing image file for OpenAI:', file.name, error);
            contentParts.push({ type: 'text', text: `[Error reading image: ${file.name}]` });
          }
        } else {
          contentParts.push({
            type: 'text',
            text: `Attached file (not an image): ${file.name} (${this.formatFileSize(file.size)})`
          });
        }
      }

      messages.push({
        role: 'user',
        content: contentParts
      });

    } else {
      if (currentUserMessageContent.trim()) {
        messages.push({
          role: 'user',
          content: currentUserMessageContent
        });
      }
    }

    try {
      const response = await fetch(this.settings.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: messages,
          temperature: this.settings.temperature,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `OpenAI API request failed: ${response.status} ${response.statusText}`;
        console.error('OpenAI API Error Response:', errorData);
        throw new Error(errorMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let aiMessageDiv = null;
      let aiMessageContentDiv = null;
      let outputTokens = 0;

      // Create AI message container for streaming
      this.removeTypingIndicator();
      aiMessageDiv = document.createElement('div');
      aiMessageDiv.className = 'message ai-message streaming-message';
      aiMessageDiv.dataset.sender = 'ai';
      
      aiMessageContentDiv = document.createElement('div');
      aiMessageContentDiv.className = 'message-content';
      
      const textDiv = document.createElement('div');
      textDiv.className = 'message-text';
      aiMessageContentDiv.appendChild(textDiv);
      
      aiMessageDiv.appendChild(aiMessageContentDiv);
      this.chatContainer.appendChild(aiMessageDiv);
      this.scrollToBottom();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                const delta = parsed.choices[0].delta;
                if (delta.content) {
                  fullResponse += delta.content;
                  textDiv.innerHTML = this.renderMarkdown(fullResponse);
                  this.scrollToBottom();
                  outputTokens++;
                }
              }
            } catch (e) {
              console.log('Error parsing streaming chunk:', e, data);
            }
          }
        }
      }

      const endTime = performance.now();
      const tokens = {
        inputTokens: 0, // Will be updated from usage data if available
        outputTokens: outputTokens,
        timeTakenMs: endTime - startTime
      };

      // Update the message with final content and tokens
      aiMessageDiv.classList.remove('streaming-message');
      
      // Add to conversation history
      const messageItem = {
        content: fullResponse,
        sender: 'ai',
        timestamp: Date.now(),
        files: [],
        tokens: tokens
      };
      this.currentConversation.push(messageItem);

      // Add token info if enabled
      if (this.settings.showTokenInfo) {
        const tokenInfoDiv = document.createElement('div');
        tokenInfoDiv.className = 'token-info';
        
        let tokenText = '';
        if (tokens.outputTokens !== undefined) {
          tokenText += `Out: ${tokens.outputTokens} tokens`;
        }
        if (tokens.timeTakenMs !== undefined && tokens.outputTokens !== undefined && tokens.outputTokens > 0) {
          const timeInSeconds = tokens.timeTakenMs / 1000;
          if (timeInSeconds > 0) {
            const tokensPerSecond = (tokens.outputTokens / timeInSeconds).toFixed(2);
            tokenText += tokenText ? ', ' : '';
            tokenText += `Sed: ${tokensPerSecond} T/s`;
          }
        }

        if (tokenText) {
          tokenInfoDiv.textContent = tokenText;
          aiMessageContentDiv.appendChild(tokenInfoDiv);
        }
      }

      this.clearAttachedFiles();

    } catch (error) {
      this.removeTypingIndicator();
      throw error;
    }
  }


  async prepareFilesForGemini(files) {
    const fileParts = [];

    for (const file of files) {
      try {
        if (file.type.startsWith('image/')) {
          const base64DataUrl = await this.fileToBase64(file);
          fileParts.push({
            inlineData: {
              mimeType: file.type,
              data: base64DataUrl.split(',')[1]
            }
          });
        } else {
          fileParts.push({
            text: `File: ${file.name}\nSize: ${this.formatFileSize(file.size)}\nType: ${file.type}`
          });
        }
      } catch (error) {
        console.error('Error processing file for Gemini:', file.name, error);
        fileParts.push({
          text: `Error processing file: ${file.name}`
        });
      }
    }

    return fileParts;
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

  openFileSelector() {
    if (this.fileInput) {
      this.fileInput.click();
    }
  }

  handleFileSelect(event) {
    const files = Array.from(event.target.files);
    this.handleFiles(files);
    this.fileInput.value = '';
  }

  handleFiles(files) {
    files.forEach(file => {
      const isAllowedType = this.allowedMimeTypes.includes(file.type);
      const isAllowedExtension = this.allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

      if (!isAllowedType && !isAllowedExtension) {
        this.showNotification(`File ${file.name} is not an allowed image type.`, 'error');
        return;
      }

      if (file.size > this.maxFileSize) {
        this.showNotification(`File ${file.name} is too large (max 10MB)`, 'error');
        return;
      }

      const existingFile = this.attachedFiles.find(f =>
        f.name === file.name && f.size === file.size
      );

      if (!existingFile) {
        this.attachedFiles.push(file);
      }
    });

    this.updateFilePreview();
    this.hideFileUploadArea();
  }

  updateFilePreview() {
    if (this.attachedFiles.length === 0) {
      if (this.filePreviewContainer) {
        this.filePreviewContainer.classList.add('hidden');
      }
      return;
    }

    if (this.filePreviewContainer) {
      this.filePreviewContainer.classList.remove('hidden');
    }
    if (this.filePreviewList) {
      this.filePreviewList.innerHTML = '';
    }

    this.attachedFiles.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-preview-item';

      let icon = '📄';
      if (file.type.startsWith('image/')) {
        icon = '🖼️';
      }

      const fileSize = this.formatFileSize(file.size);

      fileItem.innerHTML = `
        <span class="file-preview-icon">${icon}</span>
        <div class="file-preview-info">
          <div class="file-preview-name" title="${file.name}">${file.name}</div>
          <div class="file-preview-size">${fileSize}</div>
        </div>
        <button class="file-preview-remove" data-index="${index}">×</button>
      `;

      const removeBtn = fileItem.querySelector('.file-preview-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeAttachedFile(index);
        });
      }

      if (this.filePreviewList) {
        this.filePreviewList.appendChild(fileItem);
      }
    });
  }

  removeAttachedFile(index) {
    this.attachedFiles.splice(index, 1);
    this.updateFilePreview();
  }

  clearAttachedFiles() {
    this.attachedFiles = [];
    this.updateFilePreview();
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showFileUploadArea() {
    if (this.fileUploadArea) {
      this.fileUploadArea.classList.remove('hidden');
    }
    if (this.fileUploadText) {
      this.fileUploadText.textContent = chrome.i18n.getMessage('drop_files_here') || 'Drop files here or click to upload';
    }
    this.hideFileUploadProgress();
  }

  hideFileUploadArea() {
    if (this.fileUploadArea) {
      this.fileUploadArea.classList.add('hidden');
    }
  }

  showFileUploadProgress() {
    const progressContainer = document.querySelector('.file-upload-progress');
    if (progressContainer) {
      progressContainer.classList.remove('hidden');
    }
  }

  hideFileUploadProgress() {
    const progressContainer = document.querySelector('.file-upload-progress');
    if (progressContainer) {
      progressContainer.classList.add('hidden');
    }
  }

  updateUploadProgress(percent) {
    if (this.progressFill) {
      this.progressFill.style.width = percent + '%';
    }
    if (this.progressText) {
      this.progressText.textContent = percent + '%';
    }
  }

  async fetchAndSendMessage() {
    if (this.isFetchingPageContent || this.isTyping) {
      console.log("Fetch already in progress or AI is typing.");
      return;
    }

    this.isFetchingPageContent = true;
    let originalBtnText = "";
    if (this.getPageContentBtn) {
      originalBtnText = this.getPageContentBtn.textContent;
      this.getPageContentBtn.textContent = "🔄";
      this.getPageContentBtn.classList.add('loading');
      this.getPageContentBtn.disabled = true;
    }

    try {
      console.log("Requesting page content from background...");
      const response = await chrome.runtime.sendMessage({ action: "getPageContent" });

      if (response.success) {
        const pageData = response.data;
        console.log("Received page content:", pageData);

        const pageSummaryMessage = `[Current Web Page - Key Information]\nTitle: ${pageData.title}\nURL: ${pageData.url}\nContent:\n${pageData.content}`;

        const currentInput = this.messageInput.value;
        const separator = currentInput ? "\n\n" : "";
        this.messageInput.value = currentInput + separator + pageSummaryMessage;
        this.adjustInputHeight();

        this.showNotification("Key page content added to message input.");
      } else {
        const errorMsg = response.error || "Unknown error occurred.";
        console.error("Failed to get page content:", errorMsg);
        this.showNotification(`Failed to get page content: ${errorMsg}`, 'error');
      }
    } catch (error) {
      console.error("Error during fetchAndSendMessage:", error);
      this.showNotification(`Error: ${error.message}`, 'error');
    } finally {
      this.isFetchingPageContent = false;
      if (this.getPageContentBtn) {
        this.getPageContentBtn.textContent = originalBtnText;
        this.getPageContentBtn.classList.remove('loading');
        this.getPageContentBtn.disabled = false;
      }
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AIChatSidebar();
});