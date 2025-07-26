document.addEventListener('DOMContentLoaded', function() {
    // Cookie检测相关元素
    const cookieKeyInput = document.getElementById('cookieKey');
    const cookieValueInput = document.getElementById('cookieValue');
    
    // 请求检测相关元素
    const requestPathInput = document.getElementById('requestPath');
    const requestValueInput = document.getElementById('requestValue');
    
    // 通用元素
    const displayTextInput = document.getElementById('displayText');
    const enableDetectionCheckbox = document.getElementById('enableDetection');
    
    // 检测模式相关元素
    const cookieModeRadio = document.getElementById('cookieMode');
    const requestModeRadio = document.getElementById('requestMode');
    const cookieSettings = document.getElementById('cookieSettings');
    const requestSettings = document.getElementById('requestSettings');
    
    // 按钮元素
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

    // 检测模式切换
    cookieModeRadio.addEventListener('change', function() {
        if (this.checked) {
            cookieSettings.style.display = 'block';
            requestSettings.style.display = 'none';
        }
    });

    requestModeRadio.addEventListener('change', function() {
        if (this.checked) {
            cookieSettings.style.display = 'none';
            requestSettings.style.display = 'block';
        }
    });

    // 加载保存的设置
    function loadSettings() {
        chrome.storage.sync.get({
            domains: {}
        }, function(items) {
            const domainSettings = items.domains[currentDomain] || {
                detectionMode: 'cookie',
                cookieKey: '',
                cookieValue: '',
                requestPath: '',
                requestValue: '',
                displayText: '蓝环境',
                enableDetection: true
            };
            
            // 设置检测模式
            if (domainSettings.detectionMode === 'request') {
                requestModeRadio.checked = true;
                cookieSettings.style.display = 'none';
                requestSettings.style.display = 'block';
            } else {
                cookieModeRadio.checked = true;
                cookieSettings.style.display = 'block';
                requestSettings.style.display = 'none';
            }
            
            // 设置表单值
            cookieKeyInput.value = domainSettings.cookieKey;
            cookieValueInput.value = domainSettings.cookieValue;
            requestPathInput.value = domainSettings.requestPath;
            requestValueInput.value = domainSettings.requestValue;
            displayTextInput.value = domainSettings.displayText;
            enableDetectionCheckbox.checked = domainSettings.enableDetection;
        });
    }

    // 保存设置
    saveBtn.addEventListener('click', function() {
        const detectionMode = cookieModeRadio.checked ? 'cookie' : 'request';
        
        const settings = {
            detectionMode: detectionMode,
            cookieKey: cookieKeyInput.value.trim(),
            cookieValue: cookieValueInput.value.trim(),
            requestPath: requestPathInput.value.trim(),
            requestValue: requestValueInput.value.trim(),
            displayText: displayTextInput.value.trim() || '蓝环境',
            enableDetection: enableDetectionCheckbox.checked
        };

        // 验证输入
        if (detectionMode === 'cookie') {
            if (!settings.cookieKey) {
                showStatus('请输入Cookie Key名称', 'error');
                return;
            }
            if (!settings.cookieValue) {
                showStatus('请输入Cookie值', 'error');
                return;
            }
        } else {
            if (!settings.requestPath) {
                showStatus('请输入请求路径', 'error');
                return;
            }
            if (!settings.requestValue) {
                showStatus('请输入检测值', 'error');
                return;
            }
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

    // 一键设置Cookie（仅在Cookie模式下可用）
    setCookieBtn.addEventListener('click', function() {
        if (!cookieModeRadio.checked) {
            showStatus('请切换到Cookie检测模式', 'error');
            return;
        }
        
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

    // 一键清除Cookie（仅在Cookie模式下可用）
    clearCookieBtn.addEventListener('click', function() {
        if (!cookieModeRadio.checked) {
            showStatus('请切换到Cookie检测模式', 'error');
            return;
        }
        
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