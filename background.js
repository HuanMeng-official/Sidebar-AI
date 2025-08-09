chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);

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

            const maxContentLength = 5000;
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

console.log("Background script loaded.");