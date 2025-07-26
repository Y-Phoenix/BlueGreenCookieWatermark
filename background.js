// 插件安装时的初始化
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // 设置默认配置（兼容旧版本）
        chrome.storage.sync.set({
            domains: {
                // 默认配置示例
                'example.com': {
                    detectionMode: 'cookie',
                    cookieKey: 'environment',
                    cookieValue: 'blue',
                    requestPath: '',
                    requestValue: '',
                    displayText: '蓝环境',
                    enableDetection: true
                }
            }
        });
    }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get({
            domains: {}
        }, function(items) {
            sendResponse(items);
        });
        return true; // 保持消息通道开放
    }
});