# 📊 DiagramAI 绘图方式详解

DiagramAI 支持三种输入方式来生成图表，每种方式都经过精心设计的处理流程，确保高质量的图表输出。

---

## 🎯 方式一：文字描述（最常用）

### 使用场景
直接用自然语言描述想要的图表，适合快速创建各类图表。

### 完整工作流程

```
用户输入 → API 路由 → 系统提示词增强 → AI 模型推理 → 工具调用 → 验证 → 渲染
```

#### 1️⃣ 用户输入阶段
- **位置**：`components/chat-input.tsx`
- **功能**：
  - 支持多行文本输入
  - Enter 发送，Shift+Enter 换行
  - 实时调整输入框高度

**示例输入**：
```
创建一个AWS三层架构图，包含：
1. ALB（应用负载均衡器）
2. Auto Scaling Group 中的 EC2 实例
3. RDS 数据库
请使用泳道图布局，从左到右排列
```

#### 2️⃣ 消息发送到后端
- **位置**：`app/api/chat/route.ts`
- **处理**：
  ```typescript
  // 1. 访问控制检查
  if (accessCodes.length > 0) {
    验证 x-access-code header
  }
  
  // 2. 配额检查（如果启用）
  if (isQuotaEnabled()) {
    checkAndIncrementRequest(userId, limits)
  }
  
  // 3. 文件验证
  validateFileParts(messages)
  
  // 4. 读取 AI 配置
  - 从 headers 读取客户端覆盖配置
  - 支持多种 AI 提供商（DeepSeek/OpenAI/Claude/Gemini等）
  ```

#### 3️⃣ 系统提示词构建
- **位置**：`lib/system-prompts.ts`
- **多层次提示词架构**：

**层次 1：基础指令**
```typescript
const systemMessage = getSystemPrompt(modelId, minimalStyle)
```
核心规则：
- ✅ 只生成 mxCell 元素
- ✅ 不包含 `<mxfile>`、`<mxGraphModel>`、`<root>` 等包装标签
- ✅ 不包含根节点（id="0" 或 id="1"）
- ✅ 使用 AWS 2025 图标库
- ✅ 所有 mxCell 必须是兄弟节点，不能嵌套
- ✅ 每个元素必须有唯一 id（从 "2" 开始）
- ✅ 每个元素必须有有效的 parent 属性

**层次 2：当前上下文（带 Prompt Caching）**
```typescript
const systemMessages = [
  {
    role: "system",
    content: systemMessage,
    providerOptions: { bedrock: { cachePoint: { type: "default" } } }
  },
  {
    role: "system",
    content: `
      Previous diagram XML (before user's last message):
      """xml
      ${previousXml}
      """
      
      Current diagram XML (AUTHORITATIVE - the source of truth):
      """xml
      ${xml}
      """
      
      IMPORTANT: Current diagram XML is the SINGLE SOURCE OF TRUTH.
      User can manually modify shapes in draw.io.
      Always count and describe based on CURRENT XML.
    `,
    providerOptions: { bedrock: { cachePoint: { type: "default" } } }
  }
]
```

**关键优化**：
- 🚀 **Prompt Caching**：系统提示词和 XML 上下文被缓存，减少 90% token 消耗
- 🎯 **增量感知**：通过对比 previousXml 和当前 xml，AI 能感知用户手动修改
- 📍 **精确引用**：编辑时要求 AI 从 CURRENT XML 精确复制属性顺序

**层次 3：工具描述**
三个核心工具：

1. **display_diagram**：生成全新图表
   ```typescript
   inputSchema: z.object({
     xml: z.string().describe("XML string to be displayed on draw.io")
   })
   ```
   
2. **edit_diagram**：编辑现有图表（增/删/改）
   ```typescript
   inputSchema: z.object({
     operations: z.array(z.object({
       operation: z.enum(["update", "add", "delete"]),
       cell_id: z.string(),
       new_xml: z.string().optional()
     }))
   })
   ```
   - 删除容器会自动级联删除子节点和连接线
   - JSON 中所有双引号必须转义为 `\"`

3. **get_shape_library**：查询图标库文档
   ```typescript
   execute: async ({ library }) => {
     // 从 docs/shape-libraries/*.md 读取
     return fs.readFile(`${library}.md`)
   }
   ```

**层次 4：用户输入**
```typescript
const formattedUserInput = `User input:
"""md
${userInputText}
"""`
```

#### 4️⃣ AI 模型推理
- **引擎**：Vercel AI SDK `streamText`
- **配置**：
  ```typescript
  streamText({
    model: getAIModel(clientOverrides),
    maxOutputTokens: parseInt(process.env.MAX_OUTPUT_TOKENS),
    stopWhen: stepCountIs(5),  // 最多 5 步工具调用
    experimental_repairToolCall: repairFunction,
    messages: allMessages,
    tools: { display_diagram, edit_diagram, get_shape_library }
  })
  ```

**智能修复机制**：
```typescript
experimental_repairToolCall: async ({ toolCall, error }) => {
  if (error instanceof InvalidToolInputError) {
    // 修复截断的 JSON
    let repaired = jsonrepair(toolCall.input)
    // 修复常见语法错误
    repaired = repaired.replace(/:=/g, ': ')  // := → :
    repaired = repaired.replace(/=\s*"/g, ': "')  // = " → : "
    // 修复 XML 属性中的引号转义
    repaired = repaired.replace(/(\w+)="([^"]*?)\\"/g, '$1=\\"$2\\"')
    return { ...toolCall, input: repairedInput }
  }
}
```

#### 5️⃣ 客户端工具执行
- **位置**：`components/chat/ToolCallCard.tsx`
- **验证流程**：

```typescript
// 1. XML 验证
const validationResult = validateDiagramXml(toolCall.input.xml)
if (!validationResult.isValid) {
  显示错误：validationResult.error
  return
}

// 2. 自动包装
const wrappedXml = `
<mxfile>
  <diagram>
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${toolCall.input.xml}  <!-- AI 生成的内容 -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`

// 3. 注入到 Draw.io
iframe.contentWindow.postMessage({
  action: 'load',
  xml: wrappedXml
}, '*')
```

**验证规则**（`lib/diagram-validator.ts`）：
- ❌ 拒绝嵌套的 mxCell
- ❌ 拒绝包含根节点（id="0"/"1"）
- ❌ 拒绝包含包装标签
- ✅ 允许纯 mxCell 兄弟节点

#### 6️⃣ Draw.io 渲染
- **位置**：`contexts/diagram-context.tsx`
- **通信**：iframe postMessage API
- **功能**：
  - 实时预览
  - 支持用户手动编辑
  - 自动保存历史记录到 IndexedDB

---

## 📎 方式二：文件上传

### 支持格式
- **图片**：PNG, JPG, GIF, WebP, SVG（限制 2MB）
- **PDF**：自动提取文本内容
- **文本**：TXT, MD, JSON, CSV 等

### 完整工作流程

```
文件选择 → 类型验证 → 预处理 → Base64/文本提取 → 发送给AI → 视觉/文本理解 → 生成图表
```

#### 1️⃣ 文件选择
- **位置**：`components/chat-input.tsx`
- **方式**：
  - 点击 📎 图标
  - 拖拽到输入区域
  - 粘贴（Ctrl+V）

**验证逻辑**：
```typescript
function validateFiles(newFiles: File[], existingCount: number) {
  const errors = []
  const validFiles = []
  const availableSlots = MAX_FILES - existingCount  // 最多 5 个
  
  for (const file of newFiles) {
    // 1. 检查数量限制
    if (validFiles.length >= availableSlots) {
      errors.push(`只能再添加 ${availableSlots} 个文件`)
      break
    }
    
    // 2. 检查文件类型
    if (!isValidFileType(file)) {
      errors.push(`不支持的文件类型: ${file.name}`)
      continue
    }
    
    // 3. 检查图片大小（PDF/文本不限）
    if (file.type.startsWith('image/') && file.size > 2MB) {
      errors.push(`图片 ${file.name} 超过 2MB`)
      continue
    }
    
    validFiles.push(file)
  }
  
  return { validFiles, errors }
}
```

#### 2️⃣ 预处理阶段

**图片处理**：
```typescript
// 直接转换为 Base64 URL
const reader = new FileReader()
reader.readAsDataURL(imageFile)
// 结果：data:image/png;base64,iVBORw0KG...
```

**PDF 处理**（`lib/pdf-utils.ts`）：
```typescript
import * as pdfjsLib from 'pdfjs-dist'

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
  
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map(item => item.str)
      .join(' ')
    fullText += `\n--- Page ${i} ---\n${pageText}`
  }
  
  return fullText
}
```

**文本文件处理**：
```typescript
async function readTextFile(file: File): Promise<string> {
  return await file.text()
}
```

#### 3️⃣ 消息构建

**带图片的消息**（`app/api/chat/route.ts`）：
```typescript
const fileParts = lastUserMessage?.parts?.filter(p => p.type === "file") || []

// 检查模型是否支持视觉
if (fileParts.length > 0 && !supportsImageInput(modelId)) {
  return Response.json({
    error: `模型 "${modelId}" 不支持图片输入。请使用支持视觉的模型（如 GPT-4o、Claude、Gemini）`
  }, { status: 400 })
}

// 构建内容数组
const contentParts = [
  { type: "text", text: userInputText },
  ...fileParts.map(file => ({
    type: "image",
    image: file.url,  // data:image/png;base64,...
    mimeType: file.mediaType
  }))
]
```

**带 PDF/文本的消息**：
```typescript
// PDF 和文本作为普通文本附加
const contentParts = [
  { 
    type: "text", 
    text: `${userInputText}\n\n[来自文件 ${file.name}]\n${extractedText}` 
  }
]
```

#### 4️⃣ AI 处理

**图片理解**（需要 Vision 模型）：
- GPT-4o / GPT-4 Turbo
- Claude 3.5 Sonnet / Opus
- Gemini 1.5 Pro / Flash
- 识别图中的架构、流程、布局
- 理解手绘草图的意图

**文本理解**：
- 提取关键信息
- 识别实体和关系
- 生成对应的图表结构

#### 5️⃣ 生成图表
调用 `display_diagram` 工具，后续流程同"方式一"。

### 典型应用场景

**场景 1：重绘架构图**
```
1. 上传手绘或截图的架构图
2. 输入："将这个架构图重新绘制成标准的 AWS 图"
3. AI 识别组件 → 生成标准图标 + 布局
```

**场景 2：文档转流程图**
```
1. 上传需求文档 PDF
2. 输入："根据第 3 章的流程描述生成流程图"
3. AI 提取流程步骤 → 生成流程图
```

**场景 3：代码转类图**
```
1. 上传 Python/Java 代码文件
2. 输入："生成这个代码的 UML 类图"
3. AI 分析类结构 → 生成类图
```

---

## 🔗 方式三：URL 链接

### 使用场景
从网页内容生成图表，适合参考在线文档、博客文章、技术规范等。

### 完整工作流程

```
URL输入 → SSRF防护 → 服务端抓取 → 内容提取 → 发送给AI → 理解生成 → 渲染图表
```

#### 1️⃣ URL 输入
- **位置**：`components/url-input-dialog.tsx`
- **触发**：点击 🔗 链接图标
- **支持**：一次输入多个 URL（换行分隔）

#### 2️⃣ SSRF 安全防护
- **位置**：`lib/ssrf-protection.ts`

```typescript
function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url)
    
    // 1. 只允许 HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: '仅支持 HTTP/HTTPS 协议' }
    }
    
    // 2. 阻止内网 IP
    const blockedIPs = [
      '127.0.0.1', 'localhost',
      /^192\.168\./,  // 192.168.x.x
      /^10\./,        // 10.x.x.x
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16-31.x.x
      '::1', 'fd00::'
    ]
    
    for (const pattern of blockedIPs) {
      if (pattern instanceof RegExp) {
        if (pattern.test(parsed.hostname)) {
          return { valid: false, error: '禁止访问内网地址' }
        }
      } else if (parsed.hostname === pattern) {
        return { valid: false, error: '禁止访问内网地址' }
      }
    }
    
    // 3. 阻止危险端口
    const dangerousPorts = [22, 23, 25, 3306, 5432, 6379, 27017]
    const port = parseInt(parsed.port) || (parsed.protocol === 'https:' ? 443 : 80)
    if (dangerousPorts.includes(port)) {
      return { valid: false, error: '禁止访问危险端口' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: '无效的 URL 格式' }
  }
}
```

#### 3️⃣ 服务端抓取
- **位置**：`app/api/parse-url/route.ts`

```typescript
export async function POST(req: Request) {
  const { url } = await req.json()
  
  // 1. SSRF 验证
  const validation = validateUrl(url)
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 })
  }
  
  // 2. 发送请求（带超时和重定向限制）
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 DiagramAI Bot',
      'Accept': 'text/html,application/xhtml+xml'
    },
    redirect: 'follow',  // 最多 20 次重定向（浏览器默认）
    signal: AbortSignal.timeout(10000)  // 10 秒超时
  })
  
  // 3. 读取内容
  const html = await response.text()
  
  // 4. 提取信息
  const extracted = extractUrlContent(html, url)
  
  return Response.json(extracted)
}
```

#### 4️⃣ 内容提取
- **位置**：`lib/url-utils.ts`

```typescript
interface UrlData {
  url: string
  title?: string
  text: string        // 提取的纯文本
  charCount: number
  favicon?: string
}

function extractUrlContent(html: string, url: string): UrlData {
  // 使用简单的正则提取（生产环境建议用 cheerio 或 jsdom）
  
  // 1. 提取标题
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : undefined
  
  // 2. 移除脚本和样式
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  
  // 3. 移除 HTML 标签
  text = text.replace(/<[^>]+>/g, ' ')
  
  // 4. 清理空白
  text = text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000)  // 限制长度
  
  // 5. 提取 favicon
  const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i)
  const favicon = faviconMatch ? new URL(faviconMatch[1], url).href : undefined
  
  return {
    url,
    title,
    text,
    charCount: text.length,
    favicon
  }
}
```

#### 5️⃣ 消息构建
- **位置**：`components/chat-input.tsx`

```typescript
// URL 数据作为文本附加到用户输入
const urlContext = Array.from(urlData.values())
  .map(data => `
[来自 ${data.url}]
标题：${data.title || '无'}
内容：${data.text}
  `)
  .join('\n\n')

const fullInput = `${userInput}\n\n${urlContext}`
```

#### 6️⃣ AI 理解与生成
- AI 理解网页内容的语义
- 识别架构、流程、概念等
- 调用 `display_diagram` 生成图表

### 典型应用场景

**场景 1：文档架构图**
```
URL: https://docs.aws.amazon.com/wellarchitected/latest/framework/
输入："根据这个 AWS Well-Architected Framework 文档生成五大支柱的架构图"
```

**场景 2：博客流程图**
```
URL: https://example.com/blog/deployment-process
输入："把这篇博客中的部署流程画成流程图"
```

**场景 3：API 文档**
```
URL: https://api.example.com/docs
输入："生成这个 API 的请求响应流程的时序图"
```

---

## 🔄 三种方式的组合使用

### 组合策略 1：文字 + 图片
```
上传：旧系统架构图截图
输入："在这个架构基础上添加 Redis 缓存层和 CDN"
```

### 组合策略 2：URL + 文字
```
URL：AWS 官方三层架构参考
输入："参考这个架构，但替换为 Azure 服务，并添加监控组件"
```

### 组合策略 3：文件 + 文字编辑
```
上传：客户提供的需求文档 PDF
输入："生成初始流程图"
→ 查看结果
输入："把审批节点改为并行，添加超时处理分支"
```

---

## 🎯 关键技术点总结

### 1. 提示词工程
- **分层设计**：基础规则 + 上下文 + 工具 + 用户输入
- **Prompt Caching**：缓存系统提示和 XML 上下文，节省 90% token
- **增量感知**：通过 previousXml 和 currentXml 对比理解变化

### 2. XML 验证
- **客户端预验证**：`diagram-validator.ts` 在发送前检查
- **自动修复**：`experimental_repairToolCall` 修复截断 JSON
- **自动包装**：客户端自动添加根节点和包装标签

### 3. 安全机制
- **SSRF 防护**：阻止内网访问和危险端口
- **文件验证**：类型、大小、数量限制
- **配额管理**：请求频率和 token 使用量限制

### 4. 性能优化
- **流式输出**：AI 生成过程实时显示
- **缓存策略**：系统提示词和上下文缓存
- **批量操作**：`edit_diagram` 支持一次多个操作

### 5. 用户体验
- **实时预览**：修改立即在 Draw.io 中显示
- **历史管理**：IndexedDB 存储会话和快照
- **错误提示**：清晰的验证错误和修复建议

---

## 📝 最佳实践建议

### 文字描述方式
✅ **推荐**：
- 提供清晰的结构描述
- 指定布局方向（左到右/上到下）
- 使用专业术语（泳道图、UML、AWS 架构）
- 分步描述复杂图表

❌ **避免**：
- 模糊的描述（"画一个系统"）
- 过于复杂的一次性请求
- 不指定图表类型

### 文件上传方式
✅ **推荐**：
- 使用清晰的参考图片
- PDF 确保文本可提取
- 配合文字说明需求

❌ **避免**：
- 模糊不清的图片
- 扫描质量差的 PDF
- 超大文件（>2MB 图片）

### URL 方式
✅ **推荐**：
- 使用权威技术文档
- 提供具体的章节或部分
- 说明要提取的内容类型

❌ **避免**：
- 需要登录的页面
- JavaScript 动态渲染的内容
- 过于冗长的页面

---

## 🛠️ 故障排查

### 问题 1：AI 生成的 XML 无效
**原因**：包含包装标签或嵌套结构  
**解决**：
1. 检查 `diagram-validator.ts` 的错误信息
2. 查看 `lib/system-prompts.ts` 确保规则清晰
3. 尝试重新生成或手动编辑

### 问题 2：图片无法识别
**原因**：模型不支持 vision 或图片过大  
**解决**：
1. 切换到支持 vision 的模型（GPT-4o/Claude/Gemini）
2. 压缩图片到 2MB 以下
3. 提高图片清晰度

### 问题 3：URL 抓取失败
**原因**：SSRF 拦截或网页需要 JS 渲染  
**解决**：
1. 确保 URL 不是内网地址
2. 尝试使用静态 HTML 页面
3. 手动复制网页内容作为文本输入

### 问题 4：编辑操作不生效
**原因**：cell_id 不匹配或 XML 格式错误  
**解决**：
1. 检查当前图表的 XML（在 diagram-context 中查看）
2. 确保 cell_id 存在且唯一
3. 验证 new_xml 的转义正确（\" 而不是 "）

---

## 📚 相关文件索引

- **系统提示词**：`lib/system-prompts.ts`
- **API 路由**：`app/api/chat/route.ts`
- **XML 验证**：`lib/diagram-validator.ts`
- **文件处理**：`lib/pdf-utils.ts`
- **URL 工具**：`lib/url-utils.ts`
- **SSRF 防护**：`lib/ssrf-protection.ts`
- **输入组件**：`components/chat-input.tsx`
- **工具调用**：`components/chat/ToolCallCard.tsx`
- **图表上下文**：`contexts/diagram-context.tsx`
