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

---

## ✨ Core Pillars of ZyLora

### 💬 1. Real-Time Price Negotiation (Socket.io)
Unlike traditional "static price" platforms, ZyLora allows buyers to initiate live negotiations with sellers. 
- **Live Chat Interface**: Negotiate prices in real-time.
- **Offer Management**: Send, accept, or counter offers instantly.
- **Smart Cart Integration**: Once a deal is agreed upon, the price is automatically updated in the buyer's cart.

### 🚜 2. Agri-Auction System
A dedicated green-themed marketplace for farm-fresh produce and heavy machinery.
- **Live Bidding**: High-performance real-time bidding system.
- **Auction Timers**: Staggered auction endings with automated winner selection.
- **Email Notifications**: Winners are notified via professional HTML emails to submit delivery details.

### 🤖 3. AI-Powered Seller Insights (Gemini AI)
Empowering sellers with state-of-the-art analytics.
- **Earnings Analytics**: AI-driven breakdown of sales performance.
- **Market Trends**: Smart suggestions for product pricing and stock management.

### 💳 4. Secure Payments & Tracking
- **Razorpay Integration**: Seamless and secure payment gateway for the Indian market.
- **Live Order Tracking**: Real-time status updates from "Processing" to "Delivered".

---

## 🛠️ Technical Architecture

### **Frontend**
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion (for premium micro-interactions)
- **State Management**: React Context API
- **Icons**: Lucide React

### **Backend**
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens) with Secure Cookie/Session Storage
- **Mailing**: Nodemailer (Professional Transactional Emails)

---

## 📂 Project Roadmap

- [x] **Phase 1: UI Foundation** — 15+ Premium Responsive Pages.
- [x] **Phase 2: Authentication** — Secure Buyer & Seller Roles.
- [x] **Phase 3: Real-time Core** — Negotiation Chat & Auction Bidding.
- [x] **Phase 4: Commerce Logic** — Cart, Multi-seller Orders, & Razorpay.
- [x] **Phase 5: Seller Hub** — Advanced Dashboard with Earnings Analytics.
- [x] **Phase 6: Deployment** — Vercel & Render Integration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Razorpay API Keys
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/zylora.git
   cd zylora
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file based on the provided template
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file with VITE_API_URL
   npm run dev
   ```

---

## 📱 Responsive Experience
ZyLora is engineered for a "Mobile-First" experience, ensuring the premium glassmorphism aesthetic remains stunning across:
- **Mobile (375px)**
- **Tablet (768px)**
- **Desktop (1440px+)**

---

<div align="center">
  <img src="https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Powered%20by-Node.js-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
</div>

<div align="center">
  <strong>ZyLora Ecosystem</strong> &nbsp;·&nbsp; Build for the modern Indian Marketplace &nbsp;·&nbsp; 2024
</div>
