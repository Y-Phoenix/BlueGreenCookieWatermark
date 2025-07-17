// 全局变量
let settings = {
    cookieKey: '',
    cookieValue: '',
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
            cookieKey: '',
            cookieValue: '',
            displayText: '蓝环境',
            enableDetection: true
        };
        
        settings = domainSettings;
        if (settings.enableDetection) {
            checkAndShowIndicator();
        }
    });
}

// 检查cookie并显示指示器
function checkAndShowIndicator() {
    if (!settings.enableDetection || !settings.cookieKey || !settings.cookieValue) {
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

// 监听cookie变化（通过定时器实现）
setInterval(() => {
    if (settings.enableDetection) {
        checkAndShowIndicator();
    }
}, 2000);

// 监听DOM变化，确保在动态加载的页面中也能工作
const observer = new MutationObserver(function(mutations) {
    if (settings.enableDetection) {
        checkAndShowIndicator();
    }
});
observer.observe(document.body, {
    childList: true,
    subtree: true
}); 