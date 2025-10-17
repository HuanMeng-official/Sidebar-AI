chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Chat Extension installed/updated');
});

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);

  if (request.action === 'toggleChat') {
    // 使用content script在当前页面中切换聊天界面
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleChat' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message to content script:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true;
  }

  // 原有的getPageContent功能保持不变
  if (request.action === "getPageContent") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("Error querying tabs:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      const activeTab = tabs[0];
      if (!activeTab || !activeTab.url || !activeTab.id) {
        console.warn("No active tab found or missing URL/ID");
        sendResponse({ success: false, error: "No active tab found." });
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => {
          try {
            const url = window.location.href;
            const title = document.title || "No Title";

            let description = "";
            const descriptionMeta = document.querySelector('meta[name="description"]');
            if (descriptionMeta) {
                description = descriptionMeta.getAttribute('content') || "";
            }

            let mainContent = "";
            const articleOrMain = document.querySelector('article, main');
            if (articleOrMain) {
                const clonedContent = articleOrMain.cloneNode(true);
                clonedContent.querySelectorAll('script, style, noscript, nav, footer, header, aside, .ad, .advertisement').forEach(el => el.remove());
                mainContent = clonedContent.innerText || clonedContent.textContent || "";
            } else {
                console.log("No <article> or <main> found, falling back to paragraphs and headings.");
                const contentElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
                const contentTexts = [];
                contentElements.forEach(el => {
                    const text = (el.innerText || el.textContent || "").trim();
                    if (text && el.offsetHeight > 0 && el.offsetWidth > 0) {
                         contentTexts.push(text.length > 500 ? text.substring(0, 500) + '...' : text);
                    }
                });
                mainContent = contentTexts.join('\n\n');
            }

            const maxContentLength = 10000;
            if (mainContent.length > maxContentLength) {
                mainContent = mainContent.substring(0, maxContentLength) + `... (Content truncated. Total extracted length was approximately ${mainContent.length} characters.)`;
            }

            let finalContent = `[Page Title]\n${title}\n\n`;
            if (description) {
                finalContent += `[Page Description]\n${description}\n\n`;
            }
            finalContent += `[Main Content]\n${mainContent.trim()}`;

            return {
              success: true,
              data: {
                url: url,
                title: title,
                content: finalContent
              }
            };
          } catch (err) {
            console.error("Error extracting content from page:", err);
            return {
              success: false,
              error: `Failed to extract content: ${err.message}`
            };
          }
        },
      }, (injectionResults) => {

        if (chrome.runtime.lastError) {
          console.error("Error injecting script:", chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }

        if (injectionResults && injectionResults[0]) {
          const result = injectionResults[0].result;
          if (result && result.success) {
            console.log("Successfully retrieved page content:", result.data);
            sendResponse({ success: true, data: result.data });
          } else {
            const errorMsg = result?.error || "Unknown error during content extraction.";
            console.warn("Content script returned error:", errorMsg);
            sendResponse({ success: false, error: errorMsg });
          }
        } else {
          console.warn("No result from content script execution.");
          sendResponse({ success: false, error: "No result from content script." });
        }
      });

      return true;
    });

    return true;
  }
});

// 打开浮动窗口函数
function openFloatingWindow(showSettings = false) {
  // 如果浮动窗口已经存在，则聚焦它
  if (floatingWindowId) {
    chrome.windows.get(floatingWindowId, (window) => {
      if (chrome.runtime.lastError) {
        // 窗口不存在，重新创建
        createFloatingWindow(showSettings);
      } else {
        // 窗口存在，聚焦它
        chrome.windows.update(floatingWindowId, { focused: true });
        // 如果需要显示设置，发送消息给窗口
        if (showSettings) {
          chrome.tabs.query({ windowId: floatingWindowId }, (tabs) => {
            if (tabs && tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: 'showSettings',
                showSettings: true
              });
            }
          });
        }
      }
    });
  } else {
    createFloatingWindow(showSettings);
  }
}

// 创建浮动窗口
function createFloatingWindow(showSettings = false) {
  const width = 400;
  const height = 600;

  // 获取屏幕尺寸来计算居中位置
  chrome.windows.getCurrent((currentWindow) => {
    let left = Math.round((currentWindow.width - width) / 2);
    let top = Math.round((currentWindow.height - height) / 2);

    // 确保窗口在屏幕范围内
    left = Math.max(0, left);
    top = Math.max(0, top);

    chrome.windows.create({
      url: chrome.runtime.getURL('sidebar.html') + (showSettings ? '?showSettings=true' : ''),
      type: 'popup',
      width: width,
      height: height,
      left: left,
      top: top
    }, (window) => {
      if (window) {
        floatingWindowId = window.id;
        console.log('Floating window created with ID:', floatingWindowId);

        // 监听窗口关闭事件
        chrome.windows.onRemoved.addListener((removedWindowId) => {
          if (removedWindowId === floatingWindowId) {
            floatingWindowId = null;
            console.log('Floating window closed');
          }
        });
      }
    });
  });
}

console.log("Background script loaded.");