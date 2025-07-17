# 安装说明

## 快速安装

1. **下载项目**
   ```bash
   git clone <repository-url>
   cd blue-extension
   ```

2. **转换图标**（可选）
   - 将 `icons/icon.svg` 转换为PNG格式
   - 需要生成 16x16, 48x48, 128x128 三种尺寸
   - 可以使用在线工具如 https://convertio.co/svg-png/

3. **安装插件**
   - 打开Chrome浏览器
   - 访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目文件夹

## 图标转换方法

### 方法1：在线转换
1. 访问 https://convertio.co/svg-png/
2. 上传 `icons/icon.svg` 文件
3. 设置输出尺寸为 128x128
4. 下载PNG文件并重命名为 `icon128.png`
5. 重复步骤生成 48x48 和 16x16 版本

### 方法2：使用命令行工具
```bash
# 安装 ImageMagick
brew install imagemagick  # macOS
# 或
sudo apt-get install imagemagick  # Ubuntu

# 转换图标
convert icons/icon.svg -resize 128x128 icons/icon128.png
convert icons/icon.svg -resize 48x48 icons/icon48.png
convert icons/icon.svg -resize 16x16 icons/icon16.png
```

### 方法3：使用Node.js
```bash
# 安装 sharp
npm install -g sharp-cli

# 转换图标
sharp -i icons/icon.svg -o icons/icon128.png resize 128 128
sharp -i icons/icon.svg -o icons/icon48.png resize 48 48
sharp -i icons/icon.svg -o icons/icon16.png resize 16 16
```

## 测试插件

1. **设置配置**
   - 点击插件图标打开设置面板
   - 设置Cookie Key（如：`environment`）
   - 设置Cookie Value（如：`blue`）
   - 点击"保存设置"

2. **测试检测**
   - 打开浏览器开发者工具
   - 在Console中设置测试cookie：
   ```javascript
   document.cookie = "environment=blue; path=/";
   ```
   - 页面右上角应该显示蓝环境提示

3. **清除测试**
   ```javascript
   document.cookie = "environment=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
   ```

## 故障排除

### 插件不显示
- 检查manifest.json语法是否正确
- 确认所有必需文件都存在
- 重新加载插件

### 检测不工作
- 检查Cookie设置是否正确
- 确认插件权限已授予
- 查看浏览器控制台是否有错误

### 图标不显示
- 确认PNG图标文件存在
- 检查图标文件路径是否正确
- 重新加载插件

## 开发模式

在开发过程中，可以：
1. 修改代码后点击"重新加载"
2. 使用Chrome DevTools调试content script
3. 查看background script日志

## 发布到Chrome Web Store

1. 打包插件：`zip -r blue-extension.zip .`
2. 访问 https://chrome.google.com/webstore/devconsole
3. 上传插件包
4. 填写描述和截图
5. 提交审核 