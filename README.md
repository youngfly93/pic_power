# PicPower AI - AI 图片生成工具

一个基于即梦API的现代化AI图片生成工具，让创意无限可能。

## ✨ 特性

- 🎨 **智能图片生成** - 基于文本描述生成高质量图片
- 🎯 **多种尺寸选择** - 支持1K、2K、4K多种分辨率
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🌙 **深色模式** - 支持明暗主题切换
- 📚 **生成历史** - 自动保存生成历史，方便回顾
- ⚡ **实时反馈** - 优雅的加载动画和状态提示
- 🔄 **一键重试** - 快速重新生成或复用提示词

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: Shadcn/ui
- **状态管理**: Zustand
- **主题**: next-themes
- **通知**: Sonner
- **图标**: Lucide React

## 🔧 配置说明

### 图片域名配置
应用已配置支持即梦API的图片域名：
- `ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com`
- `ark-doc.tos-ap-southeast-1.bytepluses.com`

如需添加其他图片域名，请在 `next.config.ts` 中的 `images.remotePatterns` 数组中添加相应配置。

### 环境变量
确保在 `api.txt` 文件中配置了正确的即梦API密钥和基础URL。

## 📁 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API路由
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 主页面
├── components/         # React组件
│   ├── ui/            # UI基础组件
│   ├── image-generation-form.tsx
│   ├── image-gallery.tsx
│   ├── generation-history.tsx
│   └── ...
├── lib/               # 工具函数
│   ├── api.ts         # API集成
│   └── utils.ts       # 通用工具
├── store/             # 状态管理
│   └── app-store.ts   # 全局状态
└── types/             # TypeScript类型定义
    └── api.ts
```

## ✨ 主要功能

### 🎨 图片生成模式
- **文生图 (Text-to-Image)**: 基于文本描述生成全新图片
- **图片编辑 (Image-to-Image)**: 基于现有图片进行编辑和风格转换

### 🛠️ 核心功能
- **智能图片生成**: 使用即梦4.0模型生成高质量图片
- **多种尺寸支持**: 支持1K、2K、4K及多种比例（竖屏、横屏、宽屏等）
- **图片上传**: 支持多张参考图片上传（最多4张）
- **高级参数调节**: 种子值等专业参数
- **实时预览**: 即时查看生成结果
- **历史记录**: 自动保存生成历史，支持重新生成
- **响应式设计**: 完美适配桌面和移动设备
- **深色模式**: 支持明暗主题切换
- **下载功能**: 一键下载生成的图片
- **无水印**: 生成的图片默认无水印

## 🎯 使用指南

### 文生图模式
1. **选择模式**: 在顶部选择"文生图"标签
2. **输入描述**: 在文本框中输入您想要生成的图片描述
3. **选择参数**: 选择图片尺寸、生成数量等参数
4. **调节高级设置**: 可选择种子值控制随机性
5. **生成图片**: 点击"生成图片"按钮开始创作

### 图片编辑模式
1. **选择模式**: 在顶部选择"图片编辑"标签
2. **上传图片**: 点击上传区域选择参考图片（支持多张）
3. **描述修改**: 在文本框中描述您希望的修改效果
4. **调节参数**: 选择输出尺寸和其他参数
5. **编辑图片**: 点击"编辑图片"按钮开始处理

### 通用操作
1. **查看结果**: 在画廊中查看生成的图片
2. **下载保存**: 点击下载按钮保存喜欢的图片
3. **查看历史**: 在历史记录中查看之前的生成结果
4. **重新生成**: 点击历史记录中的项目可重新使用相同参数

## 🔧 配置

API配置位于 `src/app/api/generate/route.ts` 文件中。如需修改API密钥或其他配置，请编辑该文件。

## 📝 开发说明

### 添加新功能

1. 在 `src/components/` 中创建新组件
2. 在 `src/types/` 中定义相关类型
3. 在 `src/store/` 中添加状态管理逻辑
4. 更新相关页面和路由

### 样式定制

- 全局样式: `src/app/globals.css`
- 组件样式: 使用 Tailwind CSS 类名
- 主题配置: `tailwind.config.js`

## 🚀 部署

### Vercel (推荐)

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量
4. 部署完成

### 其他平台

```bash
npm run build
npm start
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**让AI为您的创意插上翅膀！** ✨
