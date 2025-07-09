# 🛒 E-Commerce Optimizer (AI-powered)

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-3a3a3a?logo=vercel&logoColor=white)](https://your-vercel-url.vercel.app)
[![MIT License](https://img.shields.io/github/license/YOUR_USERNAME/ecommerce-optimizer)](LICENSE)

A modern, AI-powered dashboard to optimize and analyze product descriptions for e-commerce. Uses the latest Mistral AI models for SEO, conversion, readability, keyword suggestions, sentiment & tone analysis — all in a visually stunning, animated interface.

---

## 🚀 Features

- **AI Description Optimization** (via Mistral API, secure)
- **Automatic Keyword Suggestions**
- **Sentiment & Tone Analysis**
- **Instant Summarization**
- **Beautiful analytics dashboard & charts**
- **Framer-motion animations, tooltips, popups**
- **No API key entry for users — secure via Vercel serverless function**
- **One-click deployment to Vercel**

---

## 🖥️ Demo

> [Live Demo Here](https://ecommerce-optimizer-git-main-pritamdekas-projects.vercel.app/)

---

## 🏗️ Tech Stack

- **React** (Vite or Create React App)
- **Framer Motion** (animations)
- **Recharts** (charts & data viz)
- **Mistral AI** (via Vercel serverless proxy)
- **Vercel** (deployment & API secrets)

---

## 🛡️ Secure AI API Proxy

All AI features are powered via `/api/mistral-proxy` using a serverless function and a secret environment variable.  
**API keys are never exposed to users.**

---

## ✨ Usage

1. **Clone this repo**
2. `cd frontend && npm install`
3. Create a `.env` file in the project root (for local dev) with:
MISTRAL_API_KEY=....

*(Or set in Vercel dashboard for production)*
4. **Start:**  
`npm start`  
or  
**Deploy to Vercel** (recommended)

---

## 📝 Example

- Paste a product description
- Set category/audience/keywords
- Click "Optimize" and "Analyze with AI"
- View instant suggestions, analytics, and visuals

---

## 💡 Why This Project?

This project demonstrates:
- Advanced use of AI APIs in frontend+serverless environments
- Secure handling of secrets (no client-side exposure)
- Animated, modern UX with real business value
- Integration of multiple AI insights into actionable analytics

---

## 📄 License

MIT

---

## 👤 Author

- [Pritam Deka](https://github.com/pritamdeka)

---

## ⭐ If you like it, star the repo!
