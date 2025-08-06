document.addEventListener('DOMContentLoaded', function() {
  const chatContainer = document.getElementById('chatContainer');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const loading = document.getElementById('loading');

  let conversationHistory = [];

  // Auto-resize textarea
  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.scrollHeight > 120) {
      this.style.overflowY = 'scroll';
    } else {
      this.style.overflowY = 'hidden';
    }
  });

  // Enable/disable send button
  messageInput.addEventListener('input', function() {
    sendBtn.disabled = !this.value.trim();
  });

  // Send message (Enter key)
  messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        sendMessage();
      }
    }
  });

  // Send button click
  sendBtn.addEventListener('click', sendMessage);

  // Clear chat
  clearBtn.addEventListener('click', function() {
    showWelcomeMessage();
    conversationHistory = [];
  });

  // Open settings - 弹出设置窗口
  settingsBtn.addEventListener('click', function() {
    // 创建弹出窗口显示设置页面
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 400,
      height: 600,
      focused: true
    });
  });

  // Show welcome message
  function showWelcomeMessage() {
    chatContainer.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="icon-robot">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5L3 3V5H5V7H3V9H5V11H3V15H5V17H3V19H5V21H9V19H15V21H19V19H21V15H19V11H21V9H19V7H21V9ZM17 17H7V15H17V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="currentColor"/>
          </svg>
        </div>
        <h2>Welcome to AI Assistant</h2>
        <p>Ask me anything and I'll help you</p>
        <div class="supported-providers">
          <span class="provider-tag">OpenAI</span>
          <span class="provider-tag">Azure</span>
          <span class="provider-tag">Claude</span>
          <span class="provider-tag">Local</span>
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
        throw new Error('Please configure API endpoint in settings');
      }

      if (!config.model) {
        throw new Error('Please configure model in settings');
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
      addMessageToChat(`Error: ${error.message}`, 'ai');
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
        throw new Error('Request timeout, check network or API service');
      }
      throw error;
    }
  }

  showWelcomeMessage();
});