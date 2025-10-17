document.addEventListener('DOMContentLoaded', function() {
    const openChatButton = document.getElementById('openChat');
    const openSettingsButton = document.getElementById('openSettings');

    openChatButton.addEventListener('click', function() {
        // 发送消息给background script打开浮动窗口
        chrome.runtime.sendMessage({
            action: 'openFloatingWindow'
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error opening floating window:', chrome.runtime.lastError);
            } else {
                console.log('Floating window opened successfully');
                // 关闭popup
                window.close();
            }
        });
    });

    openSettingsButton.addEventListener('click', function() {
        // 在浮动窗口中打开设置
        chrome.runtime.sendMessage({
            action: 'openFloatingWindow',
            showSettings: true
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error opening settings:', chrome.runtime.lastError);
            } else {
                console.log('Settings opened successfully');
                window.close();
            }
        });
    });
});