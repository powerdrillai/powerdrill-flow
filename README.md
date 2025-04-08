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

## Project Structure

```
powerdrill-flow/
├── app/                     # Next.js application main directory
│   ├── layout.tsx           # Application layout component
│   ├── page.tsx             # Main page component
│   ├── actions.ts           # Server-side actions
│   ├── globals.css          # Global styles
│   └── setup/               # Project setup related files
│
├── components/              # Components directory
│   ├── ui/                  # UI base components
│   └── custom/              # Custom business components
│
├── lib/                     # Utility library
│   ├── utils.ts             # Common utility functions
│   ├── api/                 # API related tools
│   ├── cookies/             # Cookie related tools
│   └── http/                # HTTP request related tools
│
├── providers/               # Application provider components
│   ├── api-guard.tsx        # API access control
│   └── query-client.tsx     # Query client configuration
│
├── public/                  # Static resources directory
│
├── .next/                   # Next.js build output
├── node_modules/            # Dependencies
├── .git/                    # Git version control
├── .vscode/                 # VS Code configuration
│
├── package.json             # Project dependencies and scripts
├── pnpm-lock.yaml           # pnpm lock file
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS configuration
├── eslint.config.mjs        # ESLint configuration
└── README.md                # Project documentation
```
