# Free AugmentCode VSCode Extension - Complete Guide

## 🎯 项目概述

Free AugmentCode VSCode Extension 是将原有的Python命令行工具成功转换为功能完整的VSCode插件。该插件提供了用户友好的界面来清理AugmentCode相关数据，允许在同一台电脑上使用不同账号登录。

## 🏗️ 项目架构

### 前端 (TypeScript)
- **主扩展文件** (`src/extension.ts`) - 插件入口点和命令注册
- **Python服务** (`src/pythonService.ts`) - 与Python后端通信
- **状态管理** (`src/statusManager.ts`) - 状态栏和操作状态管理
- **错误处理** (`src/errorHandler.ts`) - 统一错误处理和用户友好提示
- **进度管理** (`src/progressManager.ts`) - 多步骤进度显示
- **环境验证** (`src/environmentValidator.ts`) - 系统环境检查
- **平台工具** (`src/platformUtils.ts`) - 跨平台兼容性处理
- **配置管理** (`src/configManager.ts`) - 插件配置管理
- **工具函数** (`src/utils.ts`) - 通用工具函数

### 后端 (Python)
- **服务脚本** (`python/`) - 独立的Python服务脚本
  - `telemetry_service.py` - Telemetry ID修改服务
  - `database_service.py` - 数据库清理服务
  - `workspace_service.py` - 工作区清理服务
- **原有模块** (`augutils/`, `utils/`) - 保持原有Python功能

## 🚀 主要功能

### 1. 完整清理操作
- 一键执行所有清理步骤
- 自动环境验证
- 详细进度显示
- 自动备份创建

### 2. 单独操作
- **修改Telemetry ID**: 重置设备和机器标识
- **清理数据库**: 删除AugmentCode相关记录
- **清理工作区**: 清理VSCode工作区存储

### 3. 用户体验优化
- **进度指示**: 实时显示操作进度
- **错误处理**: 友好的错误消息和解决建议
- **确认对话框**: 操作前的安全确认
- **状态栏集成**: 显示插件状态
- **日志系统**: 详细的操作日志

### 4. 配置选项
- 自动备份开关
- 确认对话框控制
- 详细进度显示
- 自定义Python路径
- 备份保留天数
- 日志级别设置

## 🔧 技术特性

### 跨平台支持
- **Windows**: 完整支持，包括权限处理
- **macOS**: 原生支持，路径自动适配
- **Linux**: 完整兼容，权限自动检查

### 环境检测
- 自动检测Python环境
- VSCode安装验证
- 文件权限检查
- 依赖关系验证

### 安全特性
- 操作前自动备份
- 权限验证
- 错误恢复机制
- 数据完整性检查

## 📦 安装和使用

### 开发环境设置
```bash
# 1. 克隆项目
git clone <repository-url>
cd free-augmentcode

# 2. 安装依赖
npm install

# 3. 编译项目
npm run compile

# 4. 在VSCode中按F5启动调试
```

### 构建和打包
```bash
# 完整构建
npm run build

# 清理构建
npm run clean

# 重新构建
npm run rebuild

# 手动打包
npm run package
```

### 用户安装
1. 从VSCode扩展市场安装
2. 或下载.vsix文件手动安装
3. 确保Python 3.10+已安装

## 🎮 使用方法

### 基本使用流程
1. **退出AugmentCode插件**
2. **完全关闭VSCode**
3. **重新打开VSCode**
4. **打开命令面板** (`Ctrl+Shift+P`)
5. **执行清理命令**:
   - `Free AugmentCode: Clean AugmentCode Data` (推荐)
   - 或选择单独的清理操作
6. **按照提示完成操作**
7. **重启VSCode**
8. **使用新邮箱登录AugmentCode**

### 可用命令
- `Free AugmentCode: Clean AugmentCode Data` - 完整清理
- `Free AugmentCode: Modify Telemetry IDs` - 仅修改ID
- `Free AugmentCode: Clean Database` - 仅清理数据库
- `Free AugmentCode: Clean Workspace Storage` - 仅清理工作区
- `Free AugmentCode: Show Logs` - 显示日志
- `Free AugmentCode: Open Settings` - 打开设置

## ⚙️ 配置选项

### 通过VSCode设置
```json
{
  "free-augmentcode.autoBackup": true,
  "free-augmentcode.confirmBeforeCleanup": true,
  "free-augmentcode.showDetailedProgress": true,
  "free-augmentcode.pythonPath": "",
  "free-augmentcode.backupRetentionDays": 30,
  "free-augmentcode.enableLogging": true,
  "free-augmentcode.logLevel": "info"
}
```

### 通过插件设置界面
使用命令 `Free AugmentCode: Open Settings` 打开图形化设置界面。

## 🐛 故障排除

### 常见问题

#### Python未找到
- 安装Python 3.10或更高版本
- 确保Python在系统PATH中
- 或在设置中指定Python路径

#### 权限错误
- 完全关闭VSCode
- 以管理员身份运行VSCode (Windows)
- 检查文件权限 (Linux/macOS)

#### 操作失败
- 查看日志了解详细错误信息
- 检查备份文件是否创建
- 验证VSCode安装完整性

### 获取帮助
1. 使用 `Free AugmentCode: Show Logs` 查看详细日志
2. 检查VSCode开发者控制台
3. 查看GitHub Issues
4. 提交新的Issue报告

## 🔄 从命令行版本迁移

如果您之前使用的是命令行版本的Free AugmentCode：

1. **保留原有文件**: 插件版本与命令行版本可以共存
2. **相同功能**: 所有原有功能都已集成到插件中
3. **更好体验**: 插件版本提供更好的用户界面和错误处理
4. **推荐使用**: 建议使用插件版本以获得最佳体验

## 📈 未来计划

### 即将推出的功能
- 自动备份清理
- 定时清理任务
- 配置导入/导出
- 多语言支持
- 性能优化

### 贡献指南
欢迎提交Issue和Pull Request来帮助改进这个项目。

## 📄 许可证

此项目采用MIT许可证。详见LICENSE文件。

---

**注意**: 使用此插件前请确保已完全退出VSCode和AugmentCode插件，以避免文件锁定问题。
