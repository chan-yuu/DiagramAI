# DiagramAI - AI 智能图表生成器

<div align="center">

**通过 AI 对话创建专业图表**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

</div>

一个基于 Next.js 的 AI 驱动图表生成工具，通过自然语言对话即可创建、修改和优化各类专业图表。

---

## ✨ 核心功能

- 🤖 **AI 对话式绘图** - 自然语言描述即可生成图表
- 🎨 **多种图表类型** - 流程图、架构图、UML、思维导图等
- ☁️ **云架构支持** - AWS、Azure、GCP 图标库
- 📸 **多模态输入** - 支持图片、PDF、URL 内容提取
- 💾 **版本控制** - 完整的历史记录和会话管理
- 🔐 **隐私保护** - API Key 仅存储在浏览器本地

---

## 🚀 快速开始

### 1. 安装

```bash
git clone https://github.com/DayuanJiang/next-ai-draw-io
cd next-ai-draw-io
npm install
```

### 2. 配置

创建 `.env.local` 文件：

```bash
# 必需配置
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
DEEPSEEK_API_KEY=your-api-key-here
```

**支持的 AI 提供商**：
- DeepSeek（推荐，性价比高）
- OpenAI (GPT-4)
- Anthropic (Claude)
- Google (Gemini)
- AWS Bedrock
- Ollama（本地部署）

### 3. 运行

```bash
npm run dev
```

访问 http://localhost:6002

---

## 💡 使用示例

### 简单流程图
```
画一个用户登录流程图，包含登录、验证、成功/失败分支
```

### 微服务架构
```
创建一个电商系统架构图，包含：
- API Gateway（橙色）
- 用户服务（蓝色）
- 订单服务（绿色）
- 使用 Redis 缓存
- MySQL 数据库
```

### AWS 云架构
```
使用 AWS 图标创建一个架构图：
- EC2 实例
- RDS 数据库
- S3 存储
- CloudFront CDN
```

---

## 🎨 提升质量技巧

1. **使用精确描述** - 包含具体组件名称、颜色、连接关系
2. **分步构建** - 先建立基础结构，再逐步添加细节
3. **指定风格** - "使用圆角矩形"、"用虚线表示异步调用"
4. **利用图标库** - 指定使用 AWS/Azure/GCP 图标
5. **迭代优化** - 通过多轮对话不断完善图表

---

## 📚 文档

- [完整配置指南](./SETUP_GUIDE.md) - 详细的环境配置和使用说明
- [技术架构](./ARCHITECTURE.md) - 系统设计和核心模块详解
- [快速示例](./QUICKSTART.md) - 实战案例和最佳实践

---

## 🔧 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `AI_PROVIDER` | AI 提供商 | `deepseek`, `openai`, `anthropic` |
| `AI_MODEL` | 模型名称 | `deepseek-chat`, `gpt-4`, `claude-3.5-sonnet` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `sk-xxx` |
| `OPENAI_API_KEY` | OpenAI API 密钥 | `sk-xxx` |
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | `sk-ant-xxx` |

更多配置选项请查看 [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 🛠️ 技术栈

- **前端**: Next.js 16, React 19, TypeScript
- **AI**: Vercel AI SDK (支持多种 AI 提供商)
- **图表**: react-drawio, draw.io
- **样式**: Tailwind CSS, Radix UI
- **存储**: IndexedDB (本地会话管理)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

Apache 2.0 License

---

## 💬 支持

- [GitHub Issues](https://github.com/DayuanJiang/next-ai-draw-io/issues)
- Email: me[at]jiang.jp

---

**开始创建你的第一个 AI 图表吧！** 🎉
