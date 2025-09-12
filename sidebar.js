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
      console.error('Failed to load settings:', error);
    }
  }

  async loadConversationHistory() {
    try {
      const result = await chrome.storage.local.get('conversationHistory');
      if (result.conversationHistory) {
        this.conversationHistory = result.conversationHistory;
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }

  async saveConversationHistory() {
    try {
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
      }
      await chrome.storage.local.set({ conversationHistory: this.conversationHistory });
    } catch (error) {
      console.error('Failed to save conversation history:', error);
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
      console.error('Failed to save settings:', error);
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

  processWebReferences(message) {
    const webRefs = [];

    // 检查消息中是否包含 @标题 引用
    const webRefRegex = /@([^\s@]+)/g;
    let match;

    while ((match = webRefRegex.exec(message)) !== null) {
      const refTitle = match[1];

      // 在存储的网页引用中查找匹配的标题
      if (this.webReferences) {
        const matchedRef = this.webReferences.find(ref =>
          ref.title.includes(refTitle) || refTitle.includes(ref.title)
        );

        if (matchedRef) {
          webRefs.push(matchedRef);
        }
      }
    }

    return webRefs;
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
    let message = this.messageInput.value.trim();

    if ((!message && this.attachedFiles.length === 0) || this.isTyping) return;

    // 处理 @网页 引用
    const webReferences = this.processWebReferences(message);

    this.addMessage(message, 'user', this.attachedFiles, webReferences);

    this.messageInput.value = '';
    this.messageInput.style.height = '36px';
    this.messageInput.classList.remove('multiline');
    this.sendBtn.disabled = true;

    this.getAIResponse(message, webReferences);
  }

  addMessage(content, sender, files = [], webReferences = []) {
    const messageItem = {
      content: content,
      sender: sender,
      timestamp: Date.now(),
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })),
      webReferences: webReferences
    };

    this.currentConversation.push(messageItem);
    this.addMessageToUI(content, sender, files, true, null, webReferences);
  }

  addMessageToUI(content, sender, files = [], isNewMessage = true, tokens = null, webReferences = []) {
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

    // 显示网页引用
    if (webReferences && webReferences.length > 0) {
      const webRefsDiv = document.createElement('div');
      webRefsDiv.className = 'web-references';

      webReferences.forEach(ref => {
        const refDiv = document.createElement('div');
        refDiv.className = 'web-reference';
        refDiv.innerHTML = `
          <div class="web-ref-header">
            <span class="web-ref-icon">🌐</span>
            <span class="web-ref-title" title="${this.escapeHtml(ref.url)}">${this.escapeHtml(ref.title)}</span>
          </div>
          <div class="web-ref-preview">${this.escapeHtml(ref.content.substring(0, 150))}...</div>
        `;
        webRefsDiv.appendChild(refDiv);
      });

      contentDiv.appendChild(webRefsDiv);
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
    try {
      // 检查 marked 是否已加载
      if (typeof marked === 'undefined') {
        console.warn('Marked library not available, using fallback rendering');
        return this.escapeHtml(text);
      }
      
      return marked.parse(text, {
        breaks: true,
        gfm: true,
        headerIds: false
      });
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return this.escapeHtml(text);
    }
  }

  async getAIResponse(userMessage, webReferences = []) {
    this.addTypingIndicator();

    const startTime = performance.now();

    try {
      if (this.settings.apiType === 'gemini') {
        // 流式响应（Gemini）
        await this.callGeminiAPIStreaming(userMessage, startTime, webReferences);
      } else {
        // OpenAI 同上
        await this.callOpenAIAPIStreaming(userMessage, startTime, webReferences);
      }
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessageToUI(`${chrome.i18n.getMessage('api_error')}${error.message}`, 'ai', [], true, null);
      this.clearAttachedFiles();
    }

    this.sendBtn.disabled = false;
  }

  async callGeminiAPI(message, webReferences = []) {
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

      // 添加网页引用内容
      if (webReferences.length > 0) {
        const webRefParts = [];
        webReferences.forEach(ref => {
          webRefParts.push({
            text: `[${chrome.i18n.getMessage('web_ref_label')}: ${ref.title}]\n${chrome.i18n.getMessage('web_ref_url')}: ${ref.url}\n${chrome.i18n.getMessage('web_ref_summary')}: ${ref.content.substring(0, 500)}...`
          });
        });

        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts.push(...webRefParts);
        } else {
          contents.push({
            role: 'user',
            parts: webRefParts
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

  async callGeminiAPIStreaming(userMessage, startTime, webReferences = []) {
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

      // 添加网页引用内容
      if (webReferences.length > 0) {
        const webRefParts = [];
        webReferences.forEach(ref => {
          webRefParts.push({
            text: `[${chrome.i18n.getMessage('web_ref_label')}: ${ref.title}]\n${chrome.i18n.getMessage('web_ref_url')}: ${ref.url}\n${chrome.i18n.getMessage('web_ref_summary')}: ${ref.content.substring(0, 500)}...`
          });
        });

        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts.push(...webRefParts);
        } else {
          contents.push({
            role: 'user',
            parts: webRefParts
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

      // 为 Gemini 使用 streamGenerateContent 方法
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

        // 退回非流式传输
        const modelSupportsStreaming = this.settings.model &&
          (this.settings.model.includes('gemini') || this.settings.model.includes('1.5') || this.settings.model.includes('2.0') || this.settings.model.includes('2.5'));

        if (response.status === 404 || response.status === 400 || response.status === 403 || !modelSupportsStreaming) {
          console.log('Streaming not supported for this model, falling back to non-streaming Gemini API');
          try {
            const result = await this.callGeminiAPI(userMessage, webReferences);
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

      // 为流式传输创建 AI 消息容器
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

          // 在接收到数据时重置超时
          clearTimeout(streamTimeout);
          streamTimeout = setTimeout(() => {
            console.warn('Stream timeout - no data received for 30 seconds');
            reader.cancel();
          }, 30000);

          // 处理空数据块
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

                // 处理 Gemini 流式响应格式，检查多种可能的结构
                let textChunk = '';

                // 标准候选格式
                if (parsed.candidates && parsed.candidates[0]) {
                  const candidate = parsed.candidates[0];

                  if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
                    const part = candidate.content.parts[0];
                    if (part.text) {
                      textChunk = part.text;
                    }
                  }

                  // 处理结束原因
                  if (candidate.finishReason && candidate.finishReason !== 'FINISH_REASON_UNSPECIFIED') {
                    console.log('Stream finished with reason:', candidate.finishReason);
                    break;
                  }
                }

                // 响应中直接包含文本
                if (!textChunk && parsed.text) {
                  textChunk = parsed.text;
                }

                // 错误响应
                if (parsed.error) {
                  console.error('Gemini API error:', parsed.error);
                  break;
                }

                // 元数据使用量
                if (parsed.usageMetadata) {
                  console.log('Usage metadata:', parsed.usageMetadata);
                  // TODO: 令牌计数
                }

                if (textChunk) {
                  hasContent = true;
                  fullResponse += textChunk;
                  textDiv.innerHTML = this.renderMarkdown(fullResponse);
                  this.scrollToBottom();

                  // 估算令牌数（4个字符为1个 Token）
                  outputTokens += Math.ceil(textChunk.length / 4);

                  console.log('Received text chunk:', textChunk);
                } else if (Object.keys(parsed).length > 0) {
                  console.log('Received non-text chunk:', parsed);
                }
              } catch (e) {
                console.log('Error parsing Gemini streaming chunk:', e, data);
                // 尝试处理格式错误的 JSON
                if (data.includes('text') || data.includes('content')) {
                  console.log('Attempting to extract text from malformed JSON:', data);
                  // 从格式错误的 JSON 中提取简单文本
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
        inputTokens: 0, // Gemini 流式传输不提供输入令牌计数
        outputTokens: outputTokens,
        timeTakenMs: endTime - startTime
      };

      // 使用最终内容和令牌数更新消息
      aiMessageDiv.classList.remove('streaming-message');

      // 如果在流式传输过程中未接收到任何内容，则回退到非流式传输
      if (!hasContent || fullResponse.trim() === '') {
        console.log('No content received from streaming, falling back to non-streaming API');
        aiMessageDiv.remove();
        const result = await this.callGeminiAPI(userMessage, webReferences);
        tokens.inputTokens = result.tokens.inputTokens;
        tokens.outputTokens = result.tokens.outputTokens;

        this.addMessageToUI(result.text, 'ai', [], true, tokens);
        this.clearAttachedFiles();
        return;
      }

      // 添加到对话历史
      const messageItem = {
        content: fullResponse.trim(),
        sender: 'ai',
        timestamp: Date.now(),
        files: [],
        tokens: tokens
      };
      this.currentConversation.push(messageItem);

      // 添加到 Tokens 统计
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

  async callOpenAIAPIStreaming(userMessage, startTime, webReferences = []) {
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

    // 添加网页引用内容
    if (webReferences.length > 0) {
      let webRefContent = `\n\n[${chrome.i18n.getMessage('web_ref_label')}]\n`;
      webReferences.forEach(ref => {
        webRefContent += `\n---\n${chrome.i18n.getMessage('web_ref_label')}: ${ref.title}\n${chrome.i18n.getMessage('web_ref_url')}: ${ref.url}\n${chrome.i18n.getMessage('web_ref_summary')}: ${ref.content.substring(0, 300)}...\n---\n`;
      });

      if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
        messages[messages.length - 1].content += webRefContent;
      } else {
        messages.push({
          role: 'user',
          content: webRefContent
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

      // 为流式传输创建 AI 消息容器
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
        inputTokens: 0, // 如有可用的使用量数据，将据此更新
        outputTokens: outputTokens,
        timeTakenMs: endTime - startTime
      };

      // 使用最终内容和令牌数更新消息
      aiMessageDiv.classList.remove('streaming-message');

      // 添加到对话历史
      const messageItem = {
        content: fullResponse,
        sender: 'ai',
        timestamp: Date.now(),
        files: [],
        tokens: tokens
      };
      this.currentConversation.push(messageItem);

      // 添加到 Tokens 统计
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

        // 创建网页引用对象
        const webReference = {
          type: 'web_page',
          url: pageData.url,
          title: pageData.title,
          content: pageData.content,
          timestamp: Date.now(),
          id: 'web_' + Date.now()
        };

        // 存储网页引用
        if (!this.webReferences) {
          this.webReferences = [];
        }
        this.webReferences.push(webReference);

        // 在消息输入框中添加 @网页标题 引用
        const currentInput = this.messageInput.value;
        const separator = currentInput ? " " : "";
        this.messageInput.value = currentInput + separator + `@${pageData.title}`;
        this.adjustInputHeight();

        this.showNotification(chrome.i18n.getMessage('web_ref_notification'));
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

async function loadMarked() {
  return new Promise((resolve) => {
    const markedUrl = chrome.runtime.getURL('lib/marked.min.js');
    console.log('Attempting to load marked from:', markedUrl);
    
    // 使用标准的 script 标签加载方式
    const script = document.createElement('script');
    script.src = markedUrl;
    script.onload = () => {
      console.log('Marked library loaded successfully');
      console.log('Marked available:', typeof marked !== 'undefined');
      resolve(true);
    };
    script.onerror = (error) => {
      console.error('Failed to load marked library:', error);
      console.log('Error details:', error);
      resolve(false);
    };
    
    document.head.appendChild(script);
    
    // 添加超时检查
    setTimeout(() => {
      if (typeof marked === 'undefined') {
        console.warn('Marked library loading timeout');
        resolve(false);
      }
    }, 3000);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const markedLoaded = await loadMarked();
  if (markedLoaded) {
    new AIChatSidebar();
  } else {
    console.error('Marked library failed to load, sidebar functionality may be limited');
    // 即使 marked 加载失败，也创建侧边栏实例
    new AIChatSidebar();
  }
});