// 全局变量
let settings = {
    detectionMode: 'cookie',
    cookieKey: '',
    cookieValue: '',
    requestPath: '',
    requestValue: '',
    displayText: '蓝环境',
    enableDetection: true
};

let indicator = null;
let currentDomain = window.location.hostname;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
});

// 页面加载完成后也检查
window.addEventListener('load', function() {
    setTimeout(() => {
        loadSettings();
    }, 500);
});

// 加载设置
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
        
        settings = domainSettings;
        if (settings.enableDetection) {
            checkAndShowIndicator();
        }
    });
}

// 检查并显示指示器
function checkAndShowIndicator() {
    if (!settings.enableDetection) {
        hideIndicator();
        return;
    }

    if (settings.detectionMode === 'cookie') {
        checkCookieAndShowIndicator();
    } else if (settings.detectionMode === 'request') {
        checkRequestAndShowIndicator();
    }
}

// 检查cookie并显示指示器
function checkCookieAndShowIndicator() {
    if (!settings.cookieKey || !settings.cookieValue) {
        hideIndicator();
        return;
    }

    const cookies = document.cookie.split(';');
    let found = false;

    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === settings.cookieKey && value === settings.cookieValue) {
            found = true;
            break;
        }
    }

    if (found) {
        showIndicator();
    } else {
        hideIndicator();
    }
}

// 检查请求并显示指示器
async function checkRequestAndShowIndicator() {
    if (!settings.requestPath || !settings.requestValue) {
        hideIndicator();
        return;
    }

    try {
        let url = settings.requestPath;
        
        // 如果是相对路径，转换为绝对路径
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (!url.startsWith('/')) {
                url = '/' + url;
            }
            url = window.location.origin + url;
        }

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'same-origin', // 包含同源cookie
            headers: {
                'Accept': 'text/plain, application/json, text/html, */*'
            }
        });

        if (response.ok) {
            const text = await response.text();
            if (text.includes(settings.requestValue)) {
                showIndicator();
            } else {
                hideIndicator();
            }
        } else {
            console.warn('蓝绿部署检测器: 请求失败', response.status, response.statusText);
            hideIndicator();
        }
    } catch (error) {
        console.warn('蓝绿部署检测器: 请求错误', error);
        hideIndicator();
    }
}

// 显示水印指示器
function showIndicator() {
    if (indicator) return;
    indicator = document.createElement('div');
    indicator.id = 'blue-deployment-indicator';
    // 多行水印
    let html = '';
    for (let i = 0; i < 6; i++) {
        html += `<div class="watermark-text">${settings.displayText}</div>`;
    }
    indicator.innerHTML = html;
    document.body.appendChild(indicator);
}

// 隐藏指示器
function hideIndicator() {
    if (indicator) {
        indicator.remove();
        indicator = null;
    }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateSettings') {
        settings = request.settings;
        checkAndShowIndicator();
    } else if (request.action === 'testDetection') {
        checkAndShowIndicator();
        sendResponse({success: true});
    }
});

// 监听变化（通过定时器实现）
setInterval(() => {
    if (settings.enableDetection) {
        checkAndShowIndicator();
    }
}, 5000); // 增加到5秒，避免频繁请求

// 监听DOM变化，确保在动态加载的页面中也能工作
const observer = new MutationObserver(function(mutations) {
    if (settings.enableDetection && settings.detectionMode === 'cookie') {
        // 只有cookie模式才需要监听DOM变化
        checkAndShowIndicator();
    }
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});