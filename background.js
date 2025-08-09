chrome.runtime.onInstalled.addListener(() => {
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
  });

  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });