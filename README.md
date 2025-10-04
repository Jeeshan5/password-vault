# 🔐 SecureVault - Password Generator + Secure Vault

A modern, secure password management application built with Next.js 15, TypeScript, and Tailwind CSS. Features client-side encryption, beautiful 3D UI, and comprehensive password management.

## 🌟 Features

- **🔑 Strong Password Generation** - Cryptographically secure passwords with customizable options
- **🔒 Client-Side Encryption** - Your passwords are encrypted in your browser before storage  
- **💎 Modern 3D UI** - Beautiful glassmorphism design with smooth animations
- **📱 Responsive Design** - Works perfectly on all devices
- **🔍 Smart Search** - Quickly find passwords with real-time filtering
- **📋 Smart Clipboard** - Copy passwords with 15-second auto-clear for security
- **👁️ Password Visibility** - Toggle password visibility with eye icons
- **🌙 Dark Mode** - Automatic dark/light mode support

## 🚀 Demo Credentials

For testing the application:
- **Email:** `demo@example.com`  
- **Password:** `demo123`

## ⚠️ Important Security Notice

This is a **demonstration application** with simplified security for development purposes. Current implementation uses:
- Mock in-memory data storage (not persistent)
- Simplified encryption (Base64 for demo)
- No real database connection

**For production use:** Implement proper database security, real encryption, HTTPS, and follow security best practices.

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
