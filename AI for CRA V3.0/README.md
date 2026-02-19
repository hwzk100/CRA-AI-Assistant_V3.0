# CRA AI Assistant

> 临床试验填写 tracker 表助手 - 一个基于 Electron + React + TypeScript 的桌面应用程序

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/cra-ai/assistant)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-32.0+-9cf.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)

---

## 功能特性

### 1. 存储区A - 临床试验方案文件识别
- 支持 **PDF** 文档解析
- 支持 **图片** OCR 识别（PNG、JPG、JPEG、GIF、BMP、TIFF、WEBP）
- 支持 **ZIP** 压缩包批量处理
- 自动提取文本内容供 AI 分析

### 2. 入排标准提取（工作表1）
使用 GLM-4 AI 模型自动从方案文件中提取：
- 入组标准（Inclusion Criteria）
- 排除标准（Exclusion Criteria）
- 支持标准分类和编号
- 可手动编辑 AI 提取结果

### 3. 访视计划提取（工作表2）
自动提取临床试验访视时间安排：
- 访视编号和名称
- 访视窗口期（开始/结束时间）
- 检查项目（Procedures）
- 评估项目（Assessments）

### 4. 用药信息识别（工作表3）
从受试者病历中识别用药信息：
- 药品名称、剂量、频次
- 给药途径
- 开始/结束日期
- 适应症
- AI 置信度评分

### 5. Excel 导出
一键生成包含三个工作表的 Tracker 表：
- **工作表1**：入排标准核对表
- **工作表2**：访视时间安排表
- **工作表3**：合并用药和既往用药核对表

---

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | [Electron](https://www.electronjs.org/) 32 |
| 前端 | [React](https://reactjs.org/) 18 + [TypeScript](https://www.typescriptlang.org/) 5 |
| UI | [Tailwind CSS](https://tailwindcss.com/) 3 |
| 状态管理 | [Zustand](https://github.com/pmndrs/zustand) 5 |
| AI 模型 | 智谱 [GLM-4](https://open.bigmodel.cn/) |
| PDF | [pdf-parse](https://www.npmjs.com/package/pdf-parse) |
| OCR | [Tesseract.js](https://tesseract.projectnaptha.com/) 5 |
| Excel | [ExcelJS](https://github.com/exceljs/exceljs) 4 |
| 压缩包 | [adm-zip](https://www.npmjs.com/package/adm-zip) |

---

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这将同时启动主进程和渲染进程的开发服务器，支持热重载。

### 构建生产版本

```bash
npm run build
```

### 打包应用

```bash
npm run dist
```

将生成 Windows exe 安装包到 `release` 目录。

---

## 配置

首次使用需要配置智谱 AI API 密钥：

1. 点击顶部 **"设置"** 按钮
2. 输入智谱 AI API 密钥
3. 点击 **"保存"**

> 获取 API 密钥: https://open.bigmodel.cn/

---

## 使用说明

### 工作流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  存储区A    │ ──> │  AI 提取    │ ──> │  Excel 导出 │
│ (方案文件)  │     │  (入排标准) │     │  (Tracker表)│
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐
│  存储区B    │ ──> │  AI 识别    │
│ (受试者文件)│     │  (用药信息) │
└─────────────┘     └─────────────┘
```

### 步骤1：上传方案文件

点击 **"添加文件"** 按钮，选择临床试验方案文件：
- PDF 文件
- 图片文件（支持 OCR）
- ZIP 压缩包

上传后点击 **"提取文本"** 处理文件内容。

### 步骤2：提取入排标准

点击 **"提取入排标准"** 按钮，AI 将自动分析并提取：
- 入组标准列表
- 排除标准列表

提取完成后可编辑并导出为 Excel。

### 步骤3：上传受试者文件

在存储区B点击 **"添加文件"** 上传受试者相关文档。

### 步骤4：识别用药信息

点击 **"识别用药"** 按钮，AI 将：
- 识别药品名称和剂量
- 提取用药频次和途径
- 生成用药记录

### 步骤5：导出 Excel

点击 **"导出 Tracker"** 生成包含所有数据的 Excel 文件。

---

## 项目结构

```
AI for CRA V3.0/
├── src/
│   ├── main/                  # Electron 主进程
│   │   ├── index.ts           # 主入口
│   │   ├── preload.ts         # 预加载脚本（IPC 桥接）
│   │   ├── handlers/          # IPC 处理器
│   │   │   ├── AIHandler.ts
│   │   │   ├── FileHandler.ts
│   │   │   ├── ExcelHandler.ts
│   │   │   └── SettingsHandler.ts
│   │   └── services/          # 业务服务
│   │       ├── AIService/
│   │       │   ├── GLMService.ts
│   │       │   └── prompts.ts
│   │       └── ExcelService/
│   ├── renderer/              # React 渲染进程
│   │   ├── components/        # React 组件
│   │   │   ├── Layout/        # 布局组件
│   │   │   ├── StorageZone/   # 存储区组件
│   │   │   ├── Worksheet1/    # 入排标准
│   │   │   ├── Worksheet2/    # 访视计划
│   │   │   ├── Worksheet3/    # 用药信息
│   │   │   └── common/        # 通用组件
│   │   ├── hooks/             # 自定义 Hooks
│   │   │   └── useStore.ts    # Zustand 状态管理
│   │   ├── App.tsx            # 根组件
│   │   └── index.tsx          # 入口
│   └── shared/                # 共享代码
│       ├── types/             # TypeScript 类型定义
│       │   ├── core.ts        # 核心类型
│       │   └── worksheet.ts   # 工作表类型
│       └── constants/         # 常量定义
│           └── app.ts
├── dist/                      # 编译输出
├── release/                   # 打包输出
├── package.json
├── tsconfig.json
├── webpack.main.config.js
├── webpack.renderer.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## OCR 语言包

应用支持多语言 OCR 识别，默认使用简体中文：

- `chi_sim` - 简体中文（默认）
- `chi_tra` - 繁体中文
- `eng` - 英语
- `jpn` - 日语
- `kor` - 韩语

---

## 许可证

[MIT](LICENSE)

---

## 作者

CRA AI Team

---

## 相关链接

- [智谱 AI 开放平台](https://open.bigmodel.cn/)
- [Electron 文档](https://www.electronjs.org/docs)
- [React 文档](https://react.dev/)
