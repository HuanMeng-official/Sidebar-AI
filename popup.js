document.addEventListener('DOMContentLoaded', function() {
  const apiEndpointInput = document.getElementById('apiEndpoint');
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const temperatureInput = document.getElementById('temperature');
  const maxTokensInput = document.getElementById('maxTokens');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const openSidebarBtn = document.getElementById('openSidebar');
  const openNewTabBtn = document.getElementById('openNewTab');
  const statusDiv = document.getElementById('status');

  // 加载保存的设置
  chrome.storage.sync.get([
    'apiEndpoint', 
    'apiKey', 
    'model', 
    'temperature', 
    'maxTokens'
  ], function(result) {
    if (result.apiEndpoint) {
      apiEndpointInput.value = result.apiEndpoint;
    } else {
      apiEndpointInput.value = 'https://api.openai.com/v1/chat/completions';
    }
    
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    
    if (result.model) {
      modelInput.value = result.model;
    } else {
      modelInput.value = 'gpt-3.5-turbo';
    }
    
    if (result.temperature !== undefined) {
      temperatureInput.value = result.temperature;
    }
    
    if (result.maxTokens !== undefined) {
      maxTokensInput.value = result.maxTokens;
    }
  });

  // 保存设置
  saveBtn.addEventListener('click', function() {
    const apiEndpoint = apiEndpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    const temperature = parseFloat(temperatureInput.value);
    const maxTokens = parseInt(maxTokensInput.value);
    
    if (!apiEndpoint) {
      showStatus('请输入API端点', 'error');
      return;
    }
    
    if (!model) {
      showStatus('请输入模型名称', 'error');
      return;
    }

    chrome.storage.sync.set({
      apiEndpoint: apiEndpoint,
      apiKey: apiKey,
      model: model,
      temperature: temperature,
      maxTokens: maxTokens
    }, function() {
      showStatus('设置已保存！', 'success');
    });
  });

  // 测试连接
  testBtn.addEventListener('click', async function() {
    const apiEndpoint = apiEndpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    
    if (!apiEndpoint || !model) {
      showStatus('请填写API端点和模型名称', 'error');
      return;
    }

    showStatus('测试连接中...', 'success');
    testBtn.disabled = true;

    try {
      // 发送测试请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{role: 'user', content: 'Hello'}],
          max_tokens: 10
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        showStatus('连接成功！', 'success');
      } else {
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
    } catch (error) {
      if (error.name === 'AbortError') {
        showStatus('测试超时，请检查网络连接', 'error');
      } else {
        showStatus(`测试失败: ${error.message}`, 'error');
      }
    } finally {
      testBtn.disabled = false;
    }
  });

  // 打开侧边栏 - 修复窗口ID问题
  openSidebarBtn.addEventListener('click', async function() {
    try {
      // Chrome 114+ 使用 sidePanel API
      if (chrome.sidePanel) {
        // 首先获取当前窗口ID
        const currentWindow = await chrome.windows.getCurrent();
        await chrome.sidePanel.open({windowId: currentWindow.id});
        showStatus('侧边栏已打开', 'success');
      } else {
        // 兼容旧版本 - 提示用户
        showStatus('您的Chrome版本不支持侧边栏功能，请升级到最新版本', 'error');
      }
    } catch (error) {
      console.error('打开侧边栏失败:', error);
      // 提供备选方案
      showStatus('打开侧边栏失败，将在新标签页中打开', 'error');
      // 延迟执行以显示错误信息
      setTimeout(() => {
        chrome.tabs.create({url: chrome.runtime.getURL('sidebar.html')});
      }, 1000);
    }
  });

  // 在新标签页中打开
  openNewTabBtn.addEventListener('click', function() {
    chrome.tabs.create({url: chrome.runtime.getURL('sidebar.html')});
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }
});