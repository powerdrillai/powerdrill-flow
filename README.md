This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 项目结构

```
powerdrill-flow/
├── app/                     # Next.js 应用主目录
│   ├── layout.tsx           # 应用布局组件
│   ├── page.tsx             # 主页面组件
│   ├── actions.ts           # 服务器端动作
│   ├── globals.css          # 全局样式
│   └── setup/               # 项目设置相关文件
│
├── components/              # 组件目录
│   ├── ui/                  # UI 基础组件
│   └── custom/              # 自定义业务组件
│
├── lib/                     # 工具库
│   ├── utils.ts             # 通用工具函数
│   ├── api/                 # API 相关工具
│   ├── cookies/             # Cookie 相关工具
│   └── http/                # HTTP 请求相关工具
│
├── providers/               # 应用提供者组件
│   ├── api-guard.tsx        # API 访问控制
│   └── query-client.tsx     # 查询客户端配置
│
├── public/                  # 静态资源目录
│
├── .next/                   # Next.js 构建输出
├── node_modules/            # 依赖包
├── .git/                    # Git 版本控制
├── .vscode/                 # VS Code 配置
│
├── package.json             # 项目依赖与脚本
├── pnpm-lock.yaml           # pnpm 锁定文件
├── tsconfig.json            # TypeScript 配置
├── next.config.ts           # Next.js 配置
├── postcss.config.mjs       # PostCSS 配置
├── eslint.config.mjs        # ESLint 配置
└── README.md                # 项目说明文档
```
