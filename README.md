# Free AugmentCode VSCode Extension

[English](#english) | [中文](#chinese)

# <a name="chinese"></a>中文版

Free AugmentCode 是一个VSCode插件，用于清理AugmentCode相关数据，可以在同一台电脑上无限次登录不同的账号，避免账号被锁定。

## 🚀 快速开始

1. 在VSCode扩展市场搜索并安装 "Free AugmentCode"
2. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS) 打开命令面板
3. 输入 "Free AugmentCode" 查看可用命令
4. 选择 "Clean AugmentCode Data" 执行完整清理

## ✨ 功能特性

- 🎯 **一键清理** - 通过VSCode命令面板快速执行清理操作
- 📝 **修改Telemetry ID** - 重置设备ID和机器ID，生成新的随机标识
- 🗃️ **数据库清理** - 清理SQLite数据库中的AugmentCode相关记录
- 💾 **工作区存储管理** - 清理VSCode工作区存储文件
- 🔒 **自动备份** - 操作前自动创建备份，确保数据安全
- 🌍 **跨平台支持** - 支持Windows、macOS、Linux三大平台
- ⚙️ **可配置选项** - 丰富的配置选项，满足不同需求
- 📊 **详细进度** - 实时显示操作进度和状态
- 🛡️ **错误处理** - 完善的错误处理和用户友好的提示信息

## 📦 安装方法

### 方法一：从VSCode扩展市场安装（推荐）
1. 打开VSCode
2. 点击左侧活动栏的扩展图标（或按 `Ctrl+Shift+X`）
3. 搜索 "Free AugmentCode"
4. 点击安装

### 方法二：手动安装
1. 从[Releases页面](https://github.com/yourusername/free-augmentcode/releases)下载最新的`.vsix`文件
2. 在VSCode中按 `Ctrl+Shift+P` 打开命令面板
3. 输入 "Extensions: Install from VSIX..."
4. 选择下载的`.vsix`文件

## 🔧 系统要求

- **VSCode**: 1.74.0 或更高版本
- **Python**: 3.10 或更高版本（自动检测，也可手动配置）
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

## 📖 使用方法

### 完整清理（推荐）
1. **退出AugmentCode插件**
2. **完全关闭VSCode**
3. 重新打开VSCode
4. 按 `Ctrl+Shift+P` 打开命令面板
5. 输入 "Free AugmentCode: Clean AugmentCode Data"
6. 按照提示完成操作
7. 重启VSCode
8. 使用新邮箱登录AugmentCode插件

### 单独操作
- **修改Telemetry ID**: `Free AugmentCode: Modify Telemetry IDs`
- **清理数据库**: `Free AugmentCode: Clean Database`
- **清理工作区**: `Free AugmentCode: Clean Workspace Storage`
- **查看日志**: `Free AugmentCode: Show Logs`
- **打开设置**: `Free AugmentCode: Open Settings`

## 项目结构

```
free-augmentcode/
├── index.py              # 主程序入口
├── augutils/             # 工具类目录
│   ├── json_modifier.py      # JSON 文件修改工具
│   ├── sqlite_modifier.py    # SQLite 数据库修改工具
│   └── workspace_cleaner.py  # 工作区清理工具
└── utils/                # 通用工具目录
    └── paths.py             # 路径管理工具
```

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

此项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

# <a name="english"></a>English Version

Free AugmentCode is a tool for cleaning AugmentCode-related data, allowing unlimited logins with different accounts on the same computer while avoiding account lockouts.

## Features

- 📝 Telemetry ID Modification
  - Reset device ID and machine ID
  - Automatic backup of original data
  - Generate new random IDs

- 🗃️ Database Cleanup
  - Clean specific records in SQLite database
  - Automatic database file backup
  - Remove records containing 'augment' keyword

- 💾 Workspace Storage Management
  - Clean workspace storage files
  - Automatic workspace data backup

## Installation

1. Ensure Python 3.10 or above is installed on your system
2. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/free-augmentcode.git
   cd free-augmentcode
   ```

## Usage

1. Exit the AugmentCode plugin
2. Completely close VS Code
3. Run the script:

```bash
python index.py
```

4. Restart VS Code
5. Log in to the AugmentCode plugin with a new email

## Project Structure

```
free-augmentcode/
├── index.py              # Main program entry
├── augutils/             # Utility classes directory
│   ├── json_modifier.py      # JSON file modification tool
│   ├── sqlite_modifier.py    # SQLite database modification tool
│   └── workspace_cleaner.py  # Workspace cleanup tool
└── utils/                # Common utilities directory
    └── paths.py             # Path management tool
```

## Contributing

Issues and Pull Requests are welcome to help improve this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. 