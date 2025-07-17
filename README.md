# 蓝绿部署检测器 Chrome 插件

一个用于检测网页蓝绿部署环境的Chrome浏览器插件，当检测到指定的cookie时，会在页面右上角显示美观的蓝环境提示。

## 功能特性

- 🔵 **智能检测**: 自动检测页面中的指定cookie
- 🎨 **美观提示**: 右上角显示渐变色的蓝环境提示
- ⚙️ **灵活配置**: 可自定义cookie key、值和显示文本
- 🔄 **实时更新**: 支持实时检测cookie变化
- 📱 **响应式设计**: 支持移动端和桌面端
- 🌙 **深色模式**: 自动适配系统深色模式

## 安装方法

1. 下载或克隆此项目到本地
2. 打开Chrome浏览器，进入 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹
6. 插件安装完成！

## 使用方法

1. **配置设置**:
   - 点击浏览器工具栏中的插件图标
   - 在弹出窗口中设置：
     - Cookie Key 名称（如：`environment`, `env`, `deployment`）
     - 蓝环境 Cookie 值（如：`blue`, `staging`, `test`）
     - 显示文本（如：`蓝环境`, `测试环境`）
   - 点击"保存设置"

2. **检测效果**:
   - 访问任何网站
   - 如果该网站的cookie匹配设置的条件
   - 页面右上角会显示蓝色的环境提示

## 配置示例

### 示例1：检测环境变量
- Cookie Key: `environment`
- Cookie Value: `blue`
- 显示文本: `蓝环境`

### 示例2：检测部署类型
- Cookie Key: `deployment`
- Cookie Value: `staging`
- 显示文本: `测试环境`

### 示例3：检测服务版本
- Cookie Key: `service_version`
- Cookie Value: `v2`
- 显示文本: `V2版本`

## 技术特性

- **Manifest V3**: 使用最新的Chrome扩展API
- **Content Script**: 注入到页面中检测cookie
- **Storage API**: 同步设置到云端
- **响应式CSS**: 适配不同屏幕尺寸
- **动画效果**: 平滑的显示/隐藏动画

## 文件结构

```
blue-extension/
├── manifest.json          # 插件配置文件
├── popup.html            # 弹出窗口HTML
├── popup.css             # 弹出窗口样式
├── popup.js              # 弹出窗口逻辑
├── content.js            # 内容脚本
├── content.css           # 内容脚本样式
├── background.js         # 后台脚本
├── icons/                # 图标文件夹
└── README.md             # 说明文档
```

## 注意事项

- 插件需要访问所有网站的权限来检测cookie
- 设置会同步到Chrome账户，在其他设备上也能使用
- 检测间隔为2秒，确保及时响应cookie变化
- 支持所有现代浏览器（基于Chromium内核）

## 开发说明

如需修改或扩展功能：

1. 修改相应的JS文件
2. 在Chrome扩展管理页面点击"重新加载"
3. 刷新测试页面查看效果

## 许可证

MIT License 