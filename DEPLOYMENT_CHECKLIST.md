# 📦 DiagramAI 部署文件清单

本文档说明了将 DiagramAI 部署给他人时，哪些文件是必需的，哪些可以排除。

---

## ✅ 必需文件（必须提供）

### 核心代码文件
```
app/                    # Next.js 应用路由和 API
├── api/               # API 端点
│   ├── chat/         # 主要聊天 API（route.ts）
│   ├── config/       # 配置接口
│   ├── parse-url/    # URL 解析
│   ├── validate-diagram/  # 图表验证
│   └── ...
├── [lang]/           # 多语言页面
│   ├── layout.tsx   # 根布局
│   ├── page.tsx     # 首页
│   └── about/       # 关于页面
├── globals.css      # 全局样式
├── manifest.ts      # PWA 配置
└── ...

components/            # React 组件
├── ui/               # Shadcn UI 基础组件
├── chat/             # 聊天相关组件
│   ├── ChatLobby.tsx
│   ├── ToolCallCard.tsx
│   └── ValidationCard.tsx
├── chat-input.tsx    # 输入框
├── chat-panel.tsx    # 主面板
├── chat-message-display.tsx
├── model-selector.tsx
├── settings-dialog.tsx
└── ...

contexts/              # React Context
└── diagram-context.tsx  # 图表状态管理

hooks/                 # 自定义 Hooks
├── use-diagram-tool-handlers.ts
├── use-dictionary.ts
├── use-model-config.ts
└── ...

lib/                   # 工具函数和配置
├── ai-providers.ts   # AI 提供商配置
├── system-prompts.ts # 系统提示词
├── diagram-validator.ts  # XML 验证
├── pdf-utils.ts      # PDF 处理
├── url-utils.ts      # URL 工具
├── ssrf-protection.ts  # 安全防护
├── storage.ts        # 存储键定义
├── session-storage.ts  # IndexedDB 管理
├── i18n/             # 国际化
│   ├── dictionaries/ # 语言包
│   └── utils.ts
└── types/            # TypeScript 类型定义

public/                # 静态资源
├── favicon.ico       # 网站图标
├── favicon-white.svg
├── og.webp          # 社交媒体预览图
├── drawio/          # Draw.io 集成文件
└── ...
```

### 配置文件
```
package.json           # 依赖和脚本（必需）
package-lock.json      # 锁定依赖版本（推荐）
next.config.ts         # Next.js 配置
tsconfig.json          # TypeScript 配置
postcss.config.mjs     # PostCSS 配置
components.json        # Shadcn UI 配置
biome.json            # 代码格式化/lint 配置
.gitignore            # Git 忽略规则
env.example           # 环境变量模板（重要！）
```

### 文档文件（推荐提供）
```
README.md             # 项目说明
SETUP_GUIDE.md        # 详细配置指南
QUICKSTART.md         # 快速开始
ARCHITECTURE.md       # 架构文档
DRAWING_METHODS.md    # 绘图方式说明（新增）
```

---

## ❌ 可以排除的文件（不需要提供）

### 开发和构建产物
```
node_modules/         # 依赖包（通过 npm install 安装）
.next/               # Next.js 构建输出
.wrangler/           # Cloudflare 临时文件
```

### Git 和版本控制
```
.git/                # Git 仓库历史
```

### 环境配置（敏感信息）
```
.env.local           # 本地环境变量（包含 API 密钥）
                     # ⚠️ 绝对不要提供，会泄露密钥
```

### 其他可选文档
```
README_SIMPLE.md     # 可选，如果已有 README.md
SETUP_COMPLETE.md    # 可选，部署时会重新配置
```

---

## 📋 推荐的发布方式

### 方式 1：GitHub 发布（推荐）
```bash
# 1. 确保 .gitignore 正确配置
cat .gitignore
# 应包含：
# node_modules/
# .next/
# .env.local
# .wrangler/

# 2. 提交代码
git add .
git commit -m "准备发布"
git push

# 3. 创建 Release
# 在 GitHub 上创建 Release，自动打包源代码
```

**用户获取**：
```bash
git clone https://github.com/DayuanJiang/next-ai-draw-io.git
cd next-ai-draw-io
npm install
cp env.example .env.local
# 编辑 .env.local 配置 API 密钥
npm run dev
```

### 方式 2：压缩包发布
如果不使用 Git，可以手动创建压缩包：

```bash
# PowerShell 命令
# 创建发布文件夹
$releaseDir = "DiagramAI-Release"
New-Item -ItemType Directory -Path $releaseDir -Force

# 复制必需文件
$filesToCopy = @(
    "app",
    "components", 
    "contexts",
    "hooks",
    "lib",
    "public",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "postcss.config.mjs",
    "components.json",
    "biome.json",
    ".gitignore",
    "env.example",
    "README.md",
    "SETUP_GUIDE.md",
    "QUICKSTART.md",
    "ARCHITECTURE.md",
    "DRAWING_METHODS.md"
)

foreach ($file in $filesToCopy) {
    Copy-Item -Path $file -Destination "$releaseDir\$file" -Recurse -Force
}

# 创建压缩包
Compress-Archive -Path "$releaseDir\*" -DestinationPath "DiagramAI-v1.0.zip" -Force

Write-Host "✅ 发布包已创建: DiagramAI-v1.0.zip"
```

**用户使用**：
```bash
# 解压
unzip DiagramAI-v1.0.zip
cd DiagramAI-Release

# 安装依赖
npm install

# 配置环境变量
copy env.example .env.local
# 编辑 .env.local

# 启动
npm run dev
```

### 方式 3：Docker 镜像（最便捷）
创建 `Dockerfile`（项目中已有）：

```dockerfile
FROM node:22-alpine AS base

# 依赖安装
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**发布 Docker 镜像**：
```bash
# 构建镜像
docker build -t diagram-ai:latest .

# 导出镜像
docker save diagram-ai:latest -o diagram-ai-docker.tar

# 或推送到 Docker Hub
docker tag diagram-ai:latest yourusername/diagram-ai:latest
docker push yourusername/diagram-ai:latest
```

**用户使用**：
```bash
# 方式 A：从文件加载
docker load -i diagram-ai-docker.tar

# 方式 B：从 Docker Hub 拉取
docker pull yourusername/diagram-ai:latest

# 运行
docker run -d \
  -p 3000:3000 \
  -e AI_PROVIDER=deepseek \
  -e AI_MODEL=deepseek-chat \
  -e DEEPSEEK_API_KEY=your-key-here \
  --name diagram-ai \
  diagram-ai:latest
```

---

## 📝 部署清单检查表

### 准备阶段
- [ ] 确保所有代码已提交到 Git
- [ ] 检查 `.gitignore` 配置正确
- [ ] 确认 `env.example` 包含所有必要配置项
- [ ] 运行 `npm run build` 确保可以成功构建
- [ ] 运行 `npm run check` 确保没有 lint 错误

### 文档准备
- [ ] README.md 更新到最新
- [ ] SETUP_GUIDE.md 包含完整配置说明
- [ ] QUICKSTART.md 提供快速示例
- [ ] DRAWING_METHODS.md 说明绘图方式（新增）
- [ ] 删除或更新 .env.local 中的敏感信息引用

### 发布检查
- [ ] 确认 package.json 版本号
- [ ] 创建 CHANGELOG.md 说明版本变更（可选）
- [ ] 在 GitHub 创建 Release Tag
- [ ] 在 Release 说明中提供配置指南链接

### 用户支持文档
创建一个 `DEPLOYMENT_GUIDE.md`：
```markdown
# 部署指南

## 快速开始
1. 下载源代码
2. 安装依赖：`npm install`
3. 配置环境变量：`cp env.example .env.local`
4. 编辑 `.env.local`，填入您的 API 密钥
5. 启动开发服务器：`npm run dev`
6. 访问 http://localhost:6002

## 生产部署
见 SETUP_GUIDE.md 中的"生产部署"章节

## 常见问题
见 QUICKSTART.md 中的 FAQ 部分
```

---

## 🎯 最小可运行文件集

如果只想给出最精简的可运行版本：

### 必需文件（约 50+ 文件）
```
DiagramAI/
├── app/                  # 完整目录
├── components/           # 完整目录
├── contexts/            # 完整目录
├── hooks/               # 完整目录
├── lib/                 # 完整目录
├── public/              # 完整目录
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json
├── biome.json
├── .gitignore
├── env.example
└── README.md
```

### 安装命令
```bash
npm install
cp env.example .env.local
# 编辑 .env.local 配置 API 密钥
npm run dev
```

---

## 📊 文件大小参考

```
完整源代码（不含 node_modules）：~5-10 MB
node_modules：~500-800 MB
构建产物（.next）：~50-100 MB
压缩包（zip）：~2-3 MB
Docker 镜像：~150-200 MB
```

---

## ⚠️ 重要提醒

### 绝对不要提供
❌ `.env.local` - 包含您的 API 密钥
❌ `node_modules/` - 体积大且可重新安装
❌ `.next/` - 构建产物，可重新生成
❌ `.git/` - 历史记录，可能包含敏感信息

### 必须提供
✅ `env.example` - 环境变量模板
✅ `package.json` - 依赖列表
✅ 所有源代码目录（app, components, lib 等）
✅ 配置文件（next.config.ts, tsconfig.json 等）
✅ 文档文件（README, SETUP_GUIDE 等）

### 推荐提供
🔵 `package-lock.json` - 锁定依赖版本，确保一致性
🔵 `.gitignore` - 帮助用户正确配置 Git
🔵 完整文档（ARCHITECTURE.md, DRAWING_METHODS.md）

---

## 🚀 推荐发布工作流

### 步骤 1：准备发布
```bash
# 1. 清理临时文件
rm -rf node_modules .next .wrangler

# 2. 确保 .gitignore 正确
cat .gitignore

# 3. 测试构建
npm install
npm run build
npm run check

# 4. 提交代码
git add .
git commit -m "Release v1.0.0"
git push
```

### 步骤 2：创建 GitHub Release
1. 访问 GitHub 仓库
2. 点击 "Releases" → "Create a new release"
3. 填写：
   - **Tag**: v1.0.0
   - **Title**: DiagramAI v1.0.0
   - **Description**: 复制以下内容

```markdown
## 🎉 DiagramAI v1.0.0

AI 驱动的图表生成工具，支持文字、文件、URL 三种输入方式。

### ✨ 主要特性
- 🤖 多 AI 提供商支持（DeepSeek/OpenAI/Claude/Gemini）
- 📝 文字描述生成图表
- 📎 图片/PDF/文本文件上传
- 🔗 URL 内容提取
- 🎨 Draw.io 集成
- 💾 自动历史记录

### 📦 快速开始
1. 下载源代码（Source code.zip）
2. 解压并安装依赖：
   ```bash
   unzip next-ai-draw-io-1.0.0.zip
   cd next-ai-draw-io-1.0.0
   npm install
   ```
3. 配置环境变量：
   ```bash
   cp env.example .env.local
   # 编辑 .env.local，填入您的 API 密钥
   ```
4. 启动应用：
   ```bash
   npm run dev
   ```
5. 访问 http://localhost:6002

### 📚 完整文档
- [配置指南](SETUP_GUIDE.md)
- [快速开始](QUICKSTART.md)
- [绘图方式](DRAWING_METHODS.md)
- [架构文档](ARCHITECTURE.md)

### 🐛 问题反馈
https://github.com/DayuanJiang/next-ai-draw-io/issues
```

4. 点击 "Publish release"

### 步骤 3：通知用户
将 GitHub Release 链接发送给用户：
```
https://github.com/DayuanJiang/next-ai-draw-io/releases/tag/v1.0.0
```

---

## 📧 给用户的说明模板

```markdown
# DiagramAI 部署说明

感谢使用 DiagramAI！

## 获取代码
从 GitHub 下载：https://github.com/DayuanJiang/next-ai-draw-io/releases/latest

## 部署步骤
1. 解压下载的文件
2. 安装 Node.js 18+ (https://nodejs.org)
3. 打开终端，进入项目目录
4. 运行命令：
   ```bash
   npm install
   cp env.example .env.local
   ```
5. 编辑 `.env.local` 文件，配置您的 AI API 密钥
6. 运行 `npm run dev` 启动应用
7. 在浏览器访问 http://localhost:6002

## 详细文档
- 配置指南：见 `SETUP_GUIDE.md`
- 使用说明：见 `QUICKSTART.md`
- 绘图方式：见 `DRAWING_METHODS.md`

## 需要帮助？
查看文档或提交 Issue：https://github.com/DayuanJiang/next-ai-draw-io/issues
```

---

希望这个清单对您有帮助！🎉
