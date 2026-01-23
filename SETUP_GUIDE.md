# DiagramAI - 配置与使用指南

## 📝 项目简介

**DiagramAI** 是一个强大的 AI 驱动的图表生成工具，通过自然语言对话即可创建、修改和优化各类专业图表。

---

## 🎯 核心特点

### 1. **智能对话式绘图**
- 支持自然语言描述生成图表
- 实时对话修改和优化
- 支持中文、英文、日语多语言交互

### 2. **多模态输入**
- 📝 文本描述
- 🖼️ 图片上传（AI 识别并复制图表）
- 📄 PDF 文档解析
- 🔗 URL 内容提取

### 3. **智能 AI 引擎**
- 🧠 支持多种 AI 模型（OpenAI、Claude、Gemini、DeepSeek 等）
- 🔄 流式输出实时预览
- 💡 智能推理过程可视化（支持 o1/o3 等推理模型）

### 4. **专业图表支持**
- ☁️ 云架构图（AWS、Azure、GCP 图标库）
- 📊 流程图、时序图、组织架构图
- 🔀 UML 类图、用例图
- 🎨 自定义图形和样式

### 5. **版本控制与历史**
- 📂 多会话管理
- ⏮️ 完整的修改历史记录
- 💾 自动保存和恢复
- 🔍 历史版本对比

### 6. **数据安全**
- 🔐 本地存储配置信息
- 🔒 API Key 浏览器端加密存储
- 🚫 服务器不存储任何密钥

---

## 🚀 快速开始

### 方式一：本地运行（推荐开发）

#### 1. 克隆项目
```bash
git clone https://github.com/DayuanJiang/next-ai-draw-io
cd next-ai-draw-io
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
# DeepSeek 配置示例
AI_MODEL=deepseek-chat
DEEPSEEK_API_KEY=sk-28d7d669e40b406a91f76cdba0e7c5c5

# 或者使用其他模型
# AI_MODEL=gpt-4
# OPENAI_API_KEY=sk-xxx

# 可选：自定义 API 端点
# DEEPSEEK_BASE_URL=https://api.deepseek.com
```

**支持的环境变量：**

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `AI_MODEL` | AI 模型名称 | `deepseek-chat`, `gpt-4`, `claude-3-sonnet` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `sk-xxx` |
| `OPENAI_API_KEY` | OpenAI API 密钥 | `sk-xxx` |
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | `sk-ant-xxx` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI 密钥 | `AIzaSy-xxx` |
| `AWS_REGION` | AWS 区域（Bedrock） | `us-east-1` |

#### 4. 启动开发服务器
```bash
npm run dev
```

访问：http://localhost:6002

#### 5. 构建生产版本
```bash
npm run build
npm start
```

---

## 💡 使用方法

### 基础使用流程

1. **启动应用** → 打开浏览器访问 http://localhost:6002

2. **配置 API（可选）**
   - 点击右上角 ⚙️ 设置图标
   - 选择 AI 提供商（DeepSeek、OpenAI 等）
   - 输入 API Key（如果环境变量未配置）
   - 选择模型

3. **开始对话**
   ```
   示例提示词：
   - "画一个用户登录的流程图"
   - "生成一个微服务架构的 AWS 云架构图"
   - "创建一个包含数据库、缓存、负载均衡器的系统架构图"
   ```

4. **交互式修改**
   ```
   - "把登录框改成圆角"
   - "在数据库和应用之间添加一个缓存层"
   - "用不同颜色区分前端和后端服务"
   ```

5. **导出图表**
   - 点击右上角导出按钮
   - 支持 PNG、SVG、XML 格式

---

## 🎨 提升绘图质量的建议

### 1. **使用精确的描述**

❌ 不好的提示：
```
"画一个系统"
```

✅ 好的提示：
```
"创建一个电商系统的微服务架构图，包含：
- 用户服务（蓝色）
- 订单服务（绿色）
- 支付服务（黄色）
- 使用 API Gateway 作为入口
- 服务之间通过消息队列（RabbitMQ）通信
- 使用 Redis 做缓存
- MySQL 作为数据库"
```

### 2. **分步骤构建复杂图表**

```bash
# 第1步：建立基础架构
"创建一个包含客户端、服务器、数据库的三层架构"

# 第2步：添加细节
"在服务器层添加负载均衡器和应用服务器集群"

# 第3步：优化样式
"使用不同颜色区分不同层次，添加图标"
```

### 3. **利用云服务商图标库**

```bash
# AWS 风格
"使用 AWS 图标创建一个架构图，包含 EC2、RDS、S3、CloudFront"

# Azure 风格
"用 Azure 风格画一个包含 App Service、SQL Database、Storage 的架构"

# GCP 风格
"用 GCP 图标展示 Compute Engine、Cloud SQL、Cloud Storage 的连接"
```

### 4. **指定图表类型和风格**

```bash
- "画一个 UML 类图，展示订单管理系统的核心类"
- "创建一个时序图，展示用户注册流程"
- "用泳道图展示跨部门的审批流程"
- "画一个思维导图，整理项目需求"
```

### 5. **使用视觉提示词**

```bash
- "使用圆角矩形"
- "用虚线表示可选流程"
- "用粗箭头表示主要数据流"
- "添加阴影效果"
- "使用渐变色"
```

### 6. **参考上传图片**

- 上传现有图表截图
- AI 会分析并复制类似风格
- 适合需要统一设计风格的场景

### 7. **迭代优化**

```bash
# 初始版本
"创建一个登录流程图"

# 第一次优化
"添加错误处理分支"

# 第二次优化
"添加验证码验证步骤"

# 第三次优化
"美化样式，使用品牌色"
```

### 8. **推荐模型选择**

| 任务类型 | 推荐模型 | 原因 |
|---------|---------|------|
| 简单流程图 | `deepseek-chat` | 快速、经济 |
| 复杂架构图 | `claude-3.5-sonnet` | 理解力强、训练过 draw.io |
| 云架构图 | `claude-3.5-sonnet` | 熟悉 AWS/Azure/GCP 图标 |
| 需要推理 | `deepseek-reasoner` | 推理能力强 |
| 创意图表 | `gpt-4` | 创造力强 |

---

## 🔧 高级配置

### 多模型配置

可以配置多个 AI 模型供用户切换：

创建 `ai-models.json` 或设置环境变量 `AI_MODELS_CONFIG`：

```json
[
  {
    "id": "deepseek",
    "name": "DeepSeek Chat",
    "provider": "deepseek",
    "model": "deepseek-chat",
    "apiKeyEnv": "DEEPSEEK_API_KEY"
  },
  {
    "id": "gpt4",
    "name": "GPT-4",
    "provider": "openai",
    "model": "gpt-4",
    "apiKeyEnv": "OPENAI_API_KEY"
  }
]
```

### 代理配置

如果需要通过代理访问 API：

```bash
# .env.local
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080
```

### 访问控制

设置访问密码保护：

```bash
# .env.local
ACCESS_CODE_LIST=password1,password2,password3
```

---

## 🐛 常见问题

### Q: API Key 配置后不生效？
**A:** 重启开发服务器，环境变量需要重新加载。

### Q: 生成的图表不够精确？
**A:** 
1. 使用更强大的模型（如 Claude 3.5 Sonnet）
2. 提供更详细的描述
3. 分步骤构建复杂图表

### Q: 如何导出高清图片？
**A:** 使用 SVG 格式导出，矢量图可无损缩放。

### Q: 能否离线使用？
**A:** 需要连接 AI API，但可以使用本地部署的 Ollama 模型。

### Q: 支持哪些图表格式？
**A:** 所有 draw.io 支持的格式，包括流程图、UML、架构图等。

---

## 📚 更多资源

- [GitHub 仓库](https://github.com/DayuanJiang/next-ai-draw-io)
- [问题反馈](https://github.com/DayuanJiang/next-ai-draw-io/issues)
- [在线演示](https://next-ai-drawio.jiang.jp/)

---

## 📄 许可证

Apache 2.0 License

---

**祝你使用愉快！如有问题欢迎提 Issue。** 🎉
