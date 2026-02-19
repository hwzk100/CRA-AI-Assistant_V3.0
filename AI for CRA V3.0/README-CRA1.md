# CRA AI Assistant

临床试验填写tracker表助手 - 一个基于 Electron + React + TypeScript 的桌面应用程序。

## 功能特性

1. **存储区A** - 识别临床试验方案文件及扫描件
   - 支持 PDF、图片（OCR识别）格式
   - PDF、图片（OCR识别）由AI分析

2. **入排标准提取** - 使用 GLM-4 AI 模型
   - 自动从方案文件中提取信息形成监查Tracker表
   - 导出为 Excel 表格，第一工作表为入排标准核对，第二工作表为访视时间安排表，第三个工作表为合并用药和既往用药核对

3. **存储区B** - 识别受试者文件
   - 支持多种文件格式
   - 病历、检查报告等文档管理

4. **入排标准核对** - AI 自动核对
   - 按照入排标准逐一核对受试者条件
   - 生成详细的核对报告
   - 导出 Excel 报告

5. **聊天界面** - 显示核对结论
   - 支持 Markdown 格式
   - 可与 AI 助手对话

## 技术栈

- **框架**: Electron 32
- **前端**: React 18 + TypeScript
- **UI**: Tailwind CSS
- **状态管理**: Zustand
- **AI 模型**: 智谱 GLM-4 (@zhipuai/sdk)
- **PDF**: pdf-parse
- **OCR**: Tesseract.js
- **Excel**: ExcelJS
- **压缩包**: adm-zip

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

这将同时启动主进程和渲染进程的开发服务器。

## 构建

```bash
npm run build
```

## 打包

```bash
npm run package
```

将生成 Windows exe 安装包到 `release` 目录。

## 配置

首次使用需要配置智谱 AI API 密钥：

1. 点击顶部"设置"按钮
2. 输入智谱 AI API 密钥
3. 点击"保存"

获取 API 密钥: https://open.bigmodel.cn/

## 使用说明

### 1. 上传方案文件（存储区A）

点击"添加文件"按钮，选择临床试验方案文件：
- PDF 文件
- 图片文件（支持 OCR）
- ZIP 压缩包

上传后点击"提取文本"处理文件内容。

### 2. 提取入排标准

点击"提取入排标准"按钮，AI 将自动分析并提取：
- 入组标准
- 排除标准

提取完成后可导出为 Excel。

### 3. 上传受试者文件（存储区B）

点击"添加文件"上传受试者相关文档。

### 4. 核对入排标准

点击"核对入排标准"按钮，AI 将：
- 逐一核对入组标准
- 逐一核对排除标准
- 生成核对结论

核对结果将显示在右侧聊天界面，并可导出 Excel 报告。

## 项目结构

```
AI_for_SDR/
├── src/
│   ├── main/              # 主进程
│   │   ├── index.ts       # 主入口
│   │   ├── preload.ts     # 预加载脚本
│   │   ├── ipc/           # IPC 通信层
│   │   └── services/      # 业务服务
│   ├── renderer/          # 渲染进程
│   │   ├── components/    # React 组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   └── styles/        # 样式文件
│   └── shared/            # 共享代码
│       ├── types/         # TypeScript 类型
│       └── constants/     # 常量定义
├── package.json
├── tsconfig.json
├── webpack.main.config.js
├── webpack.renderer.config.js
└── electron-builder.json
```

## 许可证

MIT


OCR语音包