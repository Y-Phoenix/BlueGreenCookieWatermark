document.addEventListener('DOMContentLoaded', function() {
    const cookieKeyInput = document.getElementById('cookieKey');
    const cookieValueInput = document.getElementById('cookieValue');
    const displayTextInput = document.getElementById('displayText');
    const enableDetectionCheckbox = document.getElementById('enableDetection');
    const saveBtn = document.getElementById('saveBtn');
    const testBtn = document.getElementById('testBtn');
    const statusDiv = document.getElementById('status');
    const setCookieBtn = document.getElementById('setCookieBtn');
    const clearCookieBtn = document.getElementById('clearCookieBtn');

    let currentDomain = '';
    // 获取当前域名
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            currentDomain = new URL(tabs[0].url).hostname;
            loadSettings();
        }
    });

    // 加载保存的设置
    function loadSettings() {
        chrome.storage.sync.get({
            domains: {}
        }, function(items) {
            const domainSettings = items.domains[currentDomain] || {
                cookieKey: '',
                cookieValue: '',
                displayText: '蓝环境',
                enableDetection: true
            };
            
            cookieKeyInput.value = domainSettings.cookieKey;
            cookieValueInput.value = domainSettings.cookieValue;
            displayTextInput.value = domainSettings.displayText;
            enableDetectionCheckbox.checked = domainSettings.enableDetection;
        });
    }

    // 保存设置
    saveBtn.addEventListener('click', function() {
        const settings = {
            cookieKey: cookieKeyInput.value.trim(),
            cookieValue: cookieValueInput.value.trim(),
            displayText: displayTextInput.value.trim() || '蓝环境',
            enableDetection: enableDetectionCheckbox.checked
        };

        if (!settings.cookieKey) {
            showStatus('请输入Cookie Key名称', 'error');
            return;
        }

        if (!settings.cookieValue) {
            showStatus('请输入Cookie值', 'error');
            return;
        }

        // 按域名保存设置
        chrome.storage.sync.get({
            domains: {}
        }, function(items) {
            items.domains[currentDomain] = settings;
            chrome.storage.sync.set(items, function() {
                showStatus(`设置已保存到 ${currentDomain}！`, 'success');
                
                // 通知content script重新检测
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'updateSettings',
                            settings: settings
                        });
                    }
                });
            });
        });
    });

    // 测试检测
    testBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'testDetection'
                });
                showStatus('正在测试检测...', 'success');
            }
        });
    });

    // 一键设置Cookie
    setCookieBtn.addEventListener('click', function() {
        const key = cookieKeyInput.value.trim();
        const value = cookieValueInput.value.trim();
        if (!key || !value) {
            showStatus('请先填写Cookie Key和Value', 'error');
            return;
        }
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    func: (k, v) => { document.cookie = `${k}=${v}; path=/`; },
                    args: [key, value]
                }, () => {
                    showStatus('已设置Cookie', 'success');
                });
            }
        });
    });

    // 一键清除Cookie
    clearCookieBtn.addEventListener('click', function() {
        const key = cookieKeyInput.value.trim();
        if (!key) {
            showStatus('请先填写Cookie Key', 'error');
            return;
        }
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    func: (k) => { document.cookie = `${k}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`; },
                    args: [key]
                }, () => {
                    showStatus('已清除Cookie', 'success');
                });
            }
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'status';
        }, 3000);
    }
}); 