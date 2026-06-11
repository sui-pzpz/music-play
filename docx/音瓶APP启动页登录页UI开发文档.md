# 「音瓶」APP启动页与登录页UI开发文档

## 一、项目概述

本项目为「音瓶」音乐APP的启动页（Splash）和登录页（Login）UI实现，采用 React + TypeScript + Tailwind CSS + GSAP 技术栈，仅还原视觉布局和静态交互样式，不实现真实业务逻辑。配色方案与现有音乐播放器主页保持一致。

## 二、全局视觉规范

### 2.1 配色方案（与主页统一）

| 颜色名称 | Tailwind类 | 色值 | 用途 |
| :--- | :--- | :--- | :--- |
| 主色深绿 | `emerald-700` | `#4a6442` | 标题、主文字 |
| 强调绿 | `emerald-500` | `#739968` | 按钮渐变、重点文字 |
| 浅绿 | `emerald-400` | `#8bb07e` | hover状态、次要强调 |
| 辅助浅绿 | `emerald-300` | `#a8c99b` | 蝴蝶装饰 |
| 背景渐变 | - | `#f4f8f2 → #faf6f0 → #f5f1eb → #f0ede6` | 页面背景 |
| 卡片背景 | `glass-card` | `rgba(255,255,255,0.85)` | 毛玻璃卡片 |
| 输入框背景 | `bg-white/80` | `rgba(255,255,255,0.8)` | 输入框底色 |
| 边框 | `green-200` | `#d0e0c8` | 输入框、卡片边框 |
| 占位文字 | `emerald-300` | `#a8c99b` | placeholder文字 |

### 2.2 统一装饰元素

所有装饰元素均使用 `pointer-events: none`，不遮挡交互控件。

| 装饰元素 | 位置 | 配色 | 动效 |
| :--- | :--- | :--- | :--- |
| 蝴蝶 | 左上角2只 | `emerald-300` | 缓慢悬浮动画，翅膀扇动 |
| 落叶粒子 | 页面零星 | `emerald-400` | 飘落动画 |
| 青苹果 | 右下角固定2颗 | `emerald-500` | 静态装饰 + 虚化绿植背景 |
| 星光光点 | 全局 | `white` | 弱闪烁动画 |

### 2.3 圆角规范

- 按钮、输入框、卡片：统一 `16px` 圆角（`rounded-xl`）

### 2.4 交互反馈（仅CSS样式）

| 状态 | 效果 |
| :--- | :--- |
| hover | 按钮上浮、阴影加深、颜色变浅 |
| active | 点击缩小回弹（`active:scale-[0.98]`） |
| focus | 输入框边框 `emerald-400` + 外发光阴影 |

## 三、页面结构

### 3.1 页面目录

```
src/
├── pages/
│   ├── Splash.tsx              # 启动页
│   └── Login.tsx               # 登录页
├── components/
│   └── DecorationElements.tsx  # 装饰元素组件
└── index.css                   # 全局样式
```

### 3.2 路由配置

| 路由路径 | 页面组件 | 说明 |
| :--- | :--- | :--- |
| `/splash` | `Splash.tsx` | 启动页 |
| `/login` | `Login.tsx` | 登录页 |
| `/` | `Layout > Home` | 主页（音乐播放器） |

### 3.3 页面跳转流程

```
启动页 (/splash)
  ├── 3秒倒计时结束 → 登录页 (/login)
  ├── 点击屏幕任意位置 → 登录页 (/login)
  └── 点击右上角「跳过」→ 登录页 (/login)

登录页 (/login)
  ├── 点击右上角「跳过」→ 主页 (/)
  └── 点击「游客登入」→ 主页 (/)
```

## 四、页面详细设计

### 4.1 启动页（Splash）

#### 4.1.1 布局结构

```
┌─────────────────────────────────────┐
│                              [跳过] │ ← 右上角文字按钮 → 跳转登录页
├─────────────────────────────────────┤
│                                     │
│           ┌─────────────┐           │
│           │   Logo      │           │ ← 音符+玻璃瓶图标
│           │  (呼吸动画)  │           │
│           └─────────────┘           │
│                                     │
│           音瓶                       │ ← emerald-700 粗体标题
│           你的专属音乐能量瓶          │ ← emerald-500 Slogan
│           ──────── 分隔线 ────────   │ ← green-200 渐变线
│           音瓶支持IPv6网络           │ ← emerald-400/70 小字
│                                     │
│           3秒后自动跳转              │ ← 倒计时文字
└─────────────────────────────────────┘
   ↑ 点击屏幕任意位置也可跳转
```

#### 4.1.2 核心功能

| 功能 | 实现说明 |
| :--- | :--- |
| Logo动画 | GSAP呼吸缩放动画（3秒周期，keyframes） |
| 3秒自动跳转 | `setInterval` 倒计时，到0时 `navigate('/login')` |
| 点击屏幕跳转 | 整个页面 `onClick` → `navigate('/login')` |
| 跳过按钮 | `e.stopPropagation()` 防止冒泡，hover `emerald-400 → emerald-600` |
| 防重复跳转 | `useRef(hasNavigated)` 确保只跳转一次 |

#### 4.1.3 关键代码

```tsx
const goToLogin = useCallback(() => {
  if (hasNavigated.current) return
  hasNavigated.current = true
  navigate('/login', { replace: true })
}, [navigate])
```

---

### 4.2 登录页（Login）

#### 4.2.1 布局结构

```
┌─────────────────────────────────────┐
│                              [跳过] │ ← 右上角文字按钮 → 跳转主页
├─────────────────────────────────────┤
│                                     │
│           Logo + 音瓶标题            │ ← 顶部Logo区域
│                                     │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐   │
│  │ ┌─────┐ ┌────────────────┐  │   │
│  │ │ +86 │ │ 手机号输入框    │× │   │ ← 区号+手机号+清空按钮
│  │ └─────┘ └────────────────┘  │   │
│  │                              │   │
│  │ [密码登录]      [遇到问题]   │   │ ← 左右文字链接
│  │                              │   │
│  │ ┌────────────────┐ ┌──────┐ │   │
│  │ │ 验证码输入框   │ │获取  │ │   │ ← 验证码区域
│  │ │   (123456)    │ │验证码│ │   │
│  │ └────────────────┘ └──────┘ │   │
│  │                              │   │
│  │ ○ 我已阅读并同意服务协议和   │   │ ← 协议勾选
│  │   隐私政策                   │   │
│  │                              │   │
│  │      ┌──────────────┐       │   │
│  │      │     登录     │       │   │ ← emerald渐变按钮
│  │      └──────────────┘       │   │
│  └──────────────────────────────┘   │
│                                     │
│         ┌─────────────────┐         │
│         │     游客登入    │         │ ← emerald-100背景 → 跳转主页
│         └─────────────────┘         │
│                                     │
│             向下滑动                 │ ← 滑动指示器
└─────────────────────────────────────┘
```

#### 4.2.2 核心功能

| 功能 | 实现说明 |
| :--- | :--- |
| 右上角跳过 | `navigate('/', { replace: true })` → 进入主页 |
| 手机号输入框 | 聚焦高亮边框 `emerald-400`，清空按钮仅样式 |
| 验证码输入框 | 预置虚拟6位数字 `123456`，仅展示 |
| 获取验证码 | 空心圆角按钮 `border-green-200`，无发码逻辑 |
| 协议勾选 | 圆形单选按钮 `emerald-500`，仅视觉切换 |
| 登录按钮 | `emerald-500 → emerald-400` 渐变，hover/active样式 |
| 游客登入 | `emerald-100/60` 背景，点击跳转主页 |
| 向下滑动 | `animate-bounce` 箭头指示器 |

#### 4.2.3 输入框状态

| 状态 | 样式 |
| :--- | :--- |
| 默认 | `border-green-200/60` + `bg-white/80` |
| focus | `border-emerald-400` + `shadow-[0_0_0_2px_rgba(115,153,104,0.2)]` |
| hover | `border-green-200` |

---

## 五、装饰元素组件

### 5.1 DecorationElements 组件

**文件路径**：`src/components/DecorationElements.tsx`

**包含子组件**：

| 子组件 | 配色 | 功能 |
| :--- | :--- | :--- |
| `Butterfly` | `emerald-300` | 蝴蝶组件，带翅膀扇动和悬浮动画 |
| `FloatingLeaf` | `emerald-400` | 落叶粒子，飘落动画 |
| `AppleDecoration` | `emerald-500` | 青苹果装饰 |
| `StarlightParticles` | `white` | 星光粒子，闪烁动画 |

### 5.2 GSAP动画配置

```typescript
// 蝴蝶悬浮动画
gsap.to(container, {
  x: floatX, y: -floatY,
  duration: 10 + Math.random() * 6,
  repeat: -1, yoyo: true,
  ease: 'sine.inOut'
})

// 落叶飘落动画
gsap.to(leaf, {
  y: '110vh',
  rotation: `+=${Math.random() * 720}`,
  duration: 8 + Math.random() * 10,
  repeat: -1,
  ease: 'linear'
})

// 星光闪烁动画
gsap.to(particle, {
  opacity: [0.2, 0.8, 0.2],
  duration: 3,
  repeat: -1,
  ease: 'sine.inOut'
})
```

---

## 六、样式规范

### 6.1 复用主页样式类

| 样式类 | 来源 | 说明 |
| :--- | :--- | :--- |
| `.glass-card` | `index.css` | 毛玻璃卡片，与主页搜索结果卡片一致 |
| `.scrollbar-thin` | `index.css` | 细滚动条样式 |
| `.animate-bounce` | Tailwind | 弹跳动画 |

### 6.2 页面背景

与主页统一，使用 `index.css` 中 `html, body, #root` 的渐变背景：

```css
background: linear-gradient(180deg, #f4f8f2 0%, #faf6f0 30%, #f5f1eb 70%, #f0ede6 100%);
```

### 6.3 按钮渐变

登录按钮与主页搜索按钮保持一致：

```
bg-gradient-to-r from-emerald-500 to-emerald-400
hover:from-emerald-400 hover:to-emerald-300
```

---

## 七、技术栈

| 技术 | 版本 | 说明 |
| :--- | :--- | :--- |
| React | 18.3.1 | UI框架 |
| TypeScript | 5.8.3 | 类型支持 |
| Tailwind CSS | 3.4.17 | 样式框架 |
| GSAP | 3.15.0 | 动画库 |
| React Router | 7.3.0 | 路由管理（页面跳转） |
| Vite | 6.3.5 | 构建工具 |

---

## 八、项目启动

### 8.1 安装依赖

```bash
npm install
```

### 8.2 开发模式

```bash
npm run dev
```

启动后访问：`http://localhost:5173/music-play/`

### 8.3 构建生产版本

```bash
npm run build:ci
```

### 8.4 预览生产版本

```bash
npm run preview
```

---

## 九、文件清单

| 文件路径 | 说明 |
| :--- | :--- |
| `src/pages/Splash.tsx` | 启动页组件（3秒/点击跳转登录页） |
| `src/pages/Login.tsx` | 登录页组件（右上角跳过→主页） |
| `src/components/DecorationElements.tsx` | 装饰元素组件 |
| `src/index.css` | 全局样式（复用glass-card等） |
| `tailwind.config.js` | Tailwind配置 |
| `src/App.tsx` | 路由配置 |

---

## 十、约束说明

1. **无业务逻辑**：所有按钮、输入框仅做UI展示，登录/发码/校验逻辑不实现
2. **无接口请求**：不调用真实后端接口
3. **配色统一**：与主页音乐播放器使用同一 emerald 色板
4. **样式复用**：复用主页 `glass-card`、`scrollbar-thin` 等样式类
5. **自适应**：适配手机竖屏，不写死固定宽高
6. **跳转逻辑**：启动页3秒/点击→登录页；登录页跳过/游客登入→主页

---

*文档版本：2.1*  
*更新日期：2026-06-10*