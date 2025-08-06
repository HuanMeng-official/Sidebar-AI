document.addEventListener('DOMContentLoaded', function() {
  const apiEndpointInput = document.getElementById('apiEndpoint');
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const openSidebarBtn = document.getElementById('openSidebar');
  const openNewTabBtn = document.getElementById('openNewTab');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get([
    'apiEndpoint', 
    'apiKey', 
    'model'
  ], function(result) {
    apiEndpointInput.value = result.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
    apiKeyInput.value = result.apiKey || '';
    modelInput.value = result.model || 'gpt-3.5-turbo';
  });

  // Save settings
  saveBtn.addEventListener('click', function() {
    const apiEndpoint = apiEndpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    
    if (!apiEndpoint || !model) {
      showStatus('Please fill in required fields', 'error');
      return;
    }

    chrome.storage.sync.set({
      apiEndpoint: apiEndpoint,
      apiKey: apiKey,
      model: model
    }, function() {
      showStatus('Settings saved successfully!', 'success');
    });
  });

  // Test connection
  testBtn.addEventListener('click', async function() {
    const apiEndpoint = apiEndpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    
    if (!apiEndpoint || !model) {
      showStatus('Please fill in API endpoint and model', 'error');
      return;
    }

    showStatus('Testing connection...', 'success');
    testBtn.disabled = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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
        showStatus('Connection successful!', 'success');
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
        showStatus('Test timeout, check network connection', 'error');
      } else {
        showStatus(`Test failed: ${error.message}`, 'error');
      }
    } finally {
      testBtn.disabled = false;
    }
  });

  // Open sidebar
  openSidebarBtn.addEventListener('click', async function() {
    try {
      if (chrome.sidePanel) {
        const currentWindow = await chrome.windows.getCurrent();
        await chrome.sidePanel.open({windowId: currentWindow.id});
        showStatus('Sidebar opened', 'success');
      } else {
        showStatus('Your Chrome version does not support sidebar', 'error');
      }
    } catch (error) {
      console.error('Open sidebar failed:', error);
      showStatus('Opening in new tab instead', 'error');
      setTimeout(() => {
        chrome.tabs.create({url: chrome.runtime.getURL('sidebar.html')});
      }, 1000);
    }
  });

  // Open in new tab
  openNewTabBtn.addEventListener('click', function() {
    chrome.tabs.create({url: chrome.runtime.getURL('sidebar.html')});
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }
});