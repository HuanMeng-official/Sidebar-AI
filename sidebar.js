document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('settingsBtn').title = chrome.i18n.getMessage('settings');
  document.getElementById('clearBtn').title = chrome.i18n.getMessage('clearChat');
  document.getElementById('welcomeTitle').textContent = chrome.i18n.getMessage('welcomeTitle');
  document.getElementById('welcomeMessage').textContent = chrome.i18n.getMessage('welcomeMessage');
  document.getElementById('messageInput').placeholder = chrome.i18n.getMessage('typeMessage');
  
  document.getElementById('openaiTag').textContent = chrome.i18n.getMessage('openai');
  document.getElementById('azureTag').textContent = chrome.i18n.getMessage('azure');
  document.getElementById('claudeTag').textContent = chrome.i18n.getMessage('claude');
  document.getElementById('localTag').textContent = chrome.i18n.getMessage('local');

  const chatContainer = document.getElementById('chatContainer');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const loading = document.getElementById('loading');

  let conversationHistory = [];

  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.scrollHeight > 120) {
      this.style.overflowY = 'scroll';
    } else {
      this.style.overflowY = 'hidden';
    }
  });

  messageInput.addEventListener('input', function() {
    sendBtn.disabled = !this.value.trim();
  });

  messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        sendMessage();
      }
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  clearBtn.addEventListener('click', function() {
    showWelcomeMessage();
    conversationHistory = [];
  });

  settingsBtn.addEventListener('click', function() {
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 400,
      height: 600,
      focused: true
    });
  });

  function showWelcomeMessage() {
    chatContainer.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="icon-robot">
            <path d="M9 11H15V13H9V11ZM12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9H5V21H19V9H21ZM7 20V9H9V20H7ZM17 20V9H15V20H17Z" fill="currentColor"/>
          </svg>
        </div>
        <h2>${chrome.i18n.getMessage('welcomeTitle')}</h2>
        <p>${chrome.i18n.getMessage('welcomeMessage')}</p>
        <div class="supported-providers">
          <span class="provider-tag">${chrome.i18n.getMessage('openai')}</span>
          <span class="provider-tag">${chrome.i18n.getMessage('azure')}</span>
          <span class="provider-tag">${chrome.i18n.getMessage('claude')}</span>
          <span class="provider-tag">${chrome.i18n.getMessage('local')}</span>
        </div>
      </div>
    `;
  }

  async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessageToChat(message, 'user');
    
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendBtn.disabled = true;

    loading.style.display = 'flex';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
      const config = await new Promise((resolve) => {
        chrome.storage.sync.get([
          'apiEndpoint', 
          'apiKey', 
          'model'
        ], resolve);
      });

      if (!config.apiEndpoint) {
        throw new Error(chrome.i18n.getMessage('pleaseConfigureApi'));
      }

      if (!config.model) {
        throw new Error(chrome.i18n.getMessage('pleaseConfigureModel'));
      }

      conversationHistory.push({
        role: 'user',
        content: message
      });

      const response = await callGenericAI(
        config.apiEndpoint,
        config.apiKey,
        config.model,
        conversationHistory
      );
      
      addMessageToChat(response, 'ai');
      
      conversationHistory.push({
        role: 'assistant',
        content: response
      });

    } catch (error) {
      addMessageToChat(chrome.i18n.getMessage('errorMessage', [error.message]), 'ai');
    } finally {
      loading.style.display = 'none';
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function addMessageToChat(message, sender) {
    const welcomeMessage = chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function callGenericAI(apiEndpoint, apiKey, model, messages) {
    let endpoint = apiEndpoint;
    let requestBody = {
      model: model,
      messages: messages
    };

    if (endpoint.includes('azure.com') && !endpoint.includes('chat/completions')) {
      if (!endpoint.endsWith('/chat/completions')) {
        endpoint = endpoint + (endpoint.endsWith('/') ? '' : '/') + 'chat/completions';
      }
      if (!endpoint.includes('api-version=')) {
        endpoint += (endpoint.includes('?') ? '&' : '?') + 'api-version=2023-05-15';
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(endpoint.includes('azure.com') && {
            'api-key': apiKey
          })
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message?.content?.trim() || data.choices[0].text?.trim() || '';
      } else if (data.content) {
        return data.content.trim();
      } else {
        const content = data.text || data.response || data.result || JSON.stringify(data);
        return content.trim();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(chrome.i18n.getMessage('requestTimeout'));
      }
      throw error;
    }
  }

  showWelcomeMessage();
});