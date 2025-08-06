document.addEventListener('DOMContentLoaded', function() {
  const chatContainer = document.getElementById('chatContainer');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const loading = document.getElementById('loading');

  let conversationHistory = [];

  // 自动调整文本框高度
  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.scrollHeight > 120) {
      this.style.overflowY = 'scroll';
    } else {
      this.style.overflowY = 'hidden';
    }
  });

  // 启用/禁用发送按钮
  messageInput.addEventListener('input', function() {
    sendBtn.disabled = !this.value.trim();
  });

  // 发送消息（回车键）
  messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        sendMessage();
      }
    }
  });

  // 发送按钮点击
  sendBtn.addEventListener('click', sendMessage);

  // 清空对话
  clearBtn.addEventListener('click', function() {
    showWelcomeMessage();
    conversationHistory = [];
  });

  // 设置按钮点击 - 打开popup页面
  settingsBtn.addEventListener('click', function() {
    // 尝试打开popup，如果失败则在新标签页中打开
    try {
      chrome.runtime.openOptionsPage();
    } catch (error) {
      // 如果在sidebar中无法打开popup，则在新标签页中打开设置
      chrome.tabs.create({url: chrome.runtime.getURL('popup.html')});
    }
  });

  // 显示欢迎消息
  function showWelcomeMessage() {
    chatContainer.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM8 17.5C7.17 17.5 6.5 16.83 6.5 16C6.5 15.17 7.17 14.5 8 14.5C8.83 14.5 9.5 15.17 9.5 16C9.5 16.83 8.83 17.5 8 17.5ZM9.5 12C9.5 12.83 8.83 13.5 8 13.5C7.17 13.5 6.5 12.83 6.5 12C6.5 11.17 7.17 10.5 8 10.5C8.83 10.5 9.5 11.17 9.5 12ZM12 18C10.9 18 10 17.1 10 16H14C14 17.1 13.1 18 12 18ZM15.5 13.5C14.67 13.5 14 12.83 14 12C14 11.17 14.67 10.5 15.5 10.5C16.33 10.5 17 11.17 17 12C17 12.83 16.33 13.5 15.5 13.5ZM16 16C16 16.83 15.33 17.5 14.5 17.5C13.67 17.5 13 16.83 13 16H16Z" fill="currentColor"/>
          </svg>
        </div>
        <h2>您好！我是您的通用AI助手</h2>
        <p>支持任何兼容OpenAI API的服务</p>
        <div class="supported-providers">
          <span class="provider-tag">OpenAI</span>
          <span class="provider-tag">Azure OpenAI</span>
          <span class="provider-tag">Claude</span>
          <span class="provider-tag">本地模型</span>
        </div>
      </div>
    `;
  }

  async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // 添加用户消息到聊天界面
    addMessageToChat(message, 'user');
    
    // 清空输入框
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendBtn.disabled = true;

    // 显示加载状态
    loading.style.display = 'flex';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
      // 获取API配置
      const config = await new Promise((resolve) => {
        chrome.storage.sync.get([
          'apiEndpoint', 
          'apiKey', 
          'model', 
          'temperature', 
          'maxTokens'
        ], resolve);
      });

      if (!config.apiEndpoint) {
        throw new Error('请先在设置中配置API端点');
      }

      if (!config.model) {
        throw new Error('请先在设置中配置模型名称');
      }

      // 添加到对话历史
      conversationHistory.push({
        role: 'user',
        content: message
      });

      // 调用通用AI API
      const response = await callGenericAI(
        config.apiEndpoint,
        config.apiKey,
        config.model,
        conversationHistory,
        config.temperature || 0.7,
        config.maxTokens || 1000
      );
      
      // 添加AI回复到聊天界面
      addMessageToChat(response, 'ai');
      
      // 添加到对话历史
      conversationHistory.push({
        role: 'assistant',
        content: response
      });

    } catch (error) {
      addMessageToChat(`错误: ${error.message}`, 'ai');
    } finally {
      // 隐藏加载状态
      loading.style.display = 'none';
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function addMessageToChat(message, sender) {
    // 移除欢迎消息（如果是第一条消息）
    const welcomeMessage = chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    
    // 滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function callGenericAI(apiEndpoint, apiKey, model, messages, temperature, maxTokens) {
    // 处理不同的API端点格式
    let endpoint = apiEndpoint;
    let requestBody = {
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens
    };

    // 处理Azure OpenAI的特殊情况
    if (endpoint.includes('azure.com') && !endpoint.includes('chat/completions')) {
      // Azure通常在URL中包含部署名称
      if (!endpoint.endsWith('/chat/completions')) {
        endpoint = endpoint + (endpoint.endsWith('/') ? '' : '/') + 'chat/completions';
      }
      // Azure可能需要api-version参数
      if (!endpoint.includes('api-version=')) {
        endpoint += (endpoint.includes('?') ? '&' : '?') + 'api-version=2023-05-15';
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          // 为Azure添加额外的头部
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
      
      // 处理不同API的响应格式
      if (data.choices && data.choices.length > 0) {
        // 标准OpenAI格式
        return data.choices[0].message?.content?.trim() || data.choices[0].text?.trim() || '';
      } else if (data.content) {
        // Claude或其他格式
        return data.content.trim();
      } else {
        // 尝试其他可能的响应格式
        const content = data.text || data.response || data.result || JSON.stringify(data);
        return content.trim();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接或API服务状态');
      }
      throw error;
    }
  }

  // 初始化显示欢迎消息
  showWelcomeMessage();
});