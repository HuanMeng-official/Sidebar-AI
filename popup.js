document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('settingsTitle').textContent = chrome.i18n.getMessage('settingsTitle');
  document.getElementById('apiEndpointLabel').textContent = chrome.i18n.getMessage('apiEndpoint');
  document.getElementById('apiKeyLabel').textContent = chrome.i18n.getMessage('apiKey');
  document.getElementById('modelLabel').textContent = chrome.i18n.getMessage('model');
  document.getElementById('saveSettingsText').textContent = chrome.i18n.getMessage('saveSettings');
  document.getElementById('testConnectionText').textContent = chrome.i18n.getMessage('testConnection');
  document.getElementById('openSidebarText').textContent = chrome.i18n.getMessage('openSidebar');
  document.getElementById('openNewTabText').textContent = chrome.i18n.getMessage('openNewTab');
  
  document.getElementById('apiEndpoint').placeholder = chrome.i18n.getMessage('enterApiEndpoint');
  document.getElementById('apiKey').placeholder = chrome.i18n.getMessage('enterApiKey');
  document.getElementById('model').placeholder = chrome.i18n.getMessage('enterModel');

  const apiEndpointInput = document.getElementById('apiEndpoint');
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const openSidebarBtn = document.getElementById('openSidebar');
  const openNewTabBtn = document.getElementById('openNewTab');
  const statusDiv = document.getElementById('status');

  chrome.storage.sync.get([
    'apiEndpoint', 
    'apiKey', 
    'model'
  ], function(result) {
    apiEndpointInput.value = result.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
    apiKeyInput.value = result.apiKey || '';
    modelInput.value = result.model || 'gpt-3.5-turbo';
  });

  saveBtn.addEventListener('click', function() {
    const apiEndpoint = apiEndpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    
    if (!apiEndpoint || !model) {
      showStatus(chrome.i18n.getMessage('fillRequiredFields'), 'error');
      return;
    }

    chrome.storage.sync.set({
      apiEndpoint: apiEndpoint,
      apiKey: apiKey,
      model: model
    }, function() {
      showStatus(chrome.i18n.getMessage('settingsSaved'), 'success');
    });
  });

  testBtn.addEventListener('click', async function() {
    const apiEndpoint = apiEndpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    
    if (!apiEndpoint || !model) {
      showStatus(chrome.i18n.getMessage('fillRequiredFields'), 'error');
      return;
    }

    showStatus(chrome.i18n.getMessage('testingConnection'), 'success');
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
        showStatus(chrome.i18n.getMessage('connectionSuccessful'), 'success');
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
        showStatus(chrome.i18n.getMessage('testTimeout'), 'error');
      } else {
        showStatus(chrome.i18n.getMessage('testFailed', [error.message]), 'error');
      }
    } finally {
      testBtn.disabled = false;
    }
  });

  openSidebarBtn.addEventListener('click', async function() {
    try {
      if (chrome.sidePanel) {
        const currentWindow = await chrome.windows.getCurrent();
        await chrome.sidePanel.open({windowId: currentWindow.id});
        showStatus(chrome.i18n.getMessage('sidebarOpened'), 'success');
      } else {
        showStatus(chrome.i18n.getMessage('sidebarNotSupported'), 'error');
      }
    } catch (error) {
      console.error('Open sidebar failed:', error);
      showStatus(chrome.i18n.getMessage('openingInNewTab'), 'error');
      setTimeout(() => {
        chrome.tabs.create({url: chrome.runtime.getURL('sidebar.html')});
      }, 1000);
    }
  });

  openNewTabBtn.addEventListener('click', function() {
    chrome.tabs.create({url: chrome.runtime.getURL('sidebar.html')});
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }
});