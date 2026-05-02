# 💎 ZyLora — The Future of Negotiable E-Commerce

> **Shop Everything. Negotiate Anything.**  
> A premium, full-stack agricultural and general e-commerce ecosystem built for trust, transparency, and real-time interaction.

---

## 🔗 Live Deployment & Resources

| Resource | Status | Link |
|---|---|---|
| 🌐 **Frontend Live** | Deployed (Vercel) | [zylora-ecommerce.vercel.app](https://zylora-ecommerce.vercel.app/) |
| ⚙️ **Backend API** | Deployed (Render) | [zylora-e-commerce.onrender.com](https://zylora-e-commerce.onrender.com/) |
| 🎨 **Figma Design** | Original Assets | [View on Figma](https://www.figma.com/design/vt3eDlpqhdudT35CdsZjPg/Portfolio?node-id=0-1&t=DzB5ULzEV5Gu0Iph-1) |
| 🖼️ **Figma Prototype** | Interaction Map | [Open Prototype](https://www.figma.com/design/vt3eDlpqhdudT35CdsZjPg/Portfolio?node-id=0-1&t=DzB5ULzEV5Gu0Iph-1) |
| 📮 **Postman Docs** | API Reference | [View Documentation](https://documenter.getpostman.com/view/your-link-here) |
| 🎥 **YouTube Demo** | Video Walkthrough | [Watch Presentation](https://youtube.com/your-link-here) |

---

## 📖 Project Overview

### **Problem Statement**
Traditional e-commerce platforms often feel impersonal and rigid. Prices are static, leaving no room for the natural bargaining process that is central to many cultures, especially in agricultural and high-value trade. Furthermore, farmers and small-scale sellers often lack real-time tools to reach the right buyers at the right price.

### **Solution**
ZyLora bridges the gap between digital convenience and human interaction. By integrating **Real-Time Negotiations** and **Live Auctions**, we provide a dynamic marketplace where value is determined through interaction. Combined with **AI-driven insights** and **Secure Voice Calling**, ZyLora empowers both buyers and sellers to trade with absolute confidence and transparency.

---

## ✨ Core Features

### 💬 1. Real-Time Price Negotiation (Socket.io)
- **Private One-on-One Chat**: Isolated communication channels between specific buyers and sellers.
- **Offer Management**: Send, accept, or counter offers instantly with automated status tracking.
- **Smart Cart Integration**: Once a deal is agreed upon, the price is automatically updated in the buyer's cart.

### 📞 2. Integrated Voice Calls (WebRTC)
- **Privacy First Handshake**: Consent-based calling ensures zero unsolicited calls.
- **Crystal Clear Audio**: Optimized Opus codec for high-fidelity communication across mobile and desktop.
- **Real-Time Signaling**: Custom signaling server built on Socket.io for instant connection.

### 🚜 3. Agri-Auction System
- **Live Bidding**: High-performance real-time bidding system for fresh produce and machinery.
- **Automated Management**: node-cron powered handlers for auction completions and winner selections.
- **Notifications**: Automated HTML emails for winners with secure address submission links.

### 🤖 4. AI-Powered Seller Hub (Gemini AI)
- **Earnings Analytics**: Advanced data visualization and AI-driven performance trends.
- **Business Intelligence**: Smart inventory suggestions based on historical negotiation data.

### 💳 5. Secure Commerce
- **Razorpay Integration**: Seamless payment processing for the Indian market.
- **SEO Optimized**: Fully implemented Meta tags, Open Graph, and JSON-LD for maximum visibility.

---

## 🛠️ Tech Stack

### **Frontend**
- **Core**: React 19 (Vite), Redux Toolkit, React Context API.
- **UI/UX**: Tailwind CSS 4.0, Framer Motion, Lucide React.
- **Comm**: Socket.io-client, WebRTC (Peer-to-Peer).
- **I18n**: i18next (English & हिन्दी support).

### **Backend**
- **Runtime**: Node.js & Express 5.0.
- **Database**: MongoDB (Mongoose ODM).
- **Automation**: Node-cron, Nodemailer (SMTP).
- **Security**: JWT Authentication, Bcryptjs.

---

## 📂 Project Structure

```bash
zylora/
├── frontend/                # Vite + React Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── store/           # Redux Toolkit slices
│   │   ├── context/         # Context API (Cart/Wishlist)
│   │   └── services/        # API and Socket configurations
│   └── public/              # Static assets and SEO images
└── backend/                 # Node.js + Express API
    ├── models/              # Mongoose Schemas (User, Product, etc.)
    ├── controllers/         # Business Logic
    ├── routes/              # API Endpoints
    ├── middleware/          # Auth and Validation
    └── utils/               # Email, Cron, and Helper functions
```

---

## 📸 Project Screenshots

*(Add your high-quality project images here)*

---

## 🚀 Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/your-username/zylora.git
   npm install
   ```

2. **Configure Environment**
   - Setup `.env` files in both `frontend` and `backend` directories as per the provided templates.

3. **Run Locally**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```
