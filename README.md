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
- **Private One-on-One Chat**: Isolated communication channels between specific buyers and sellers.
- **Offer Management**: Send, accept, or counter offers instantly with automated status tracking.
- **Smart Cart Integration**: Once a deal is agreed upon, the price is automatically updated in the buyer's cart.

### � 2. Integrated Voice Calls (WebRTC)
Experience seamless, secure communication during negotiations.
- **Privacy First Handshake**: Callers must request permission, and recipients must grant it before a connection is established.
- **End-to-End Encrypted**: High-quality peer-to-peer audio sessions powered by WebRTC.
- **Dynamic UI**: Pulsing call overlays and real-time status notifications.

### 🚜 3. Agri-Auction System
A dedicated marketplace for farm-fresh produce and heavy machinery.
- **Live Bidding**: High-performance real-time bidding system.
- **Auction Timers**: Automated auction endings with professional winner selection.
- **Winner Notifications**: Automated HTML emails sent to winners for secure address submission.

### 🤖 4. AI-Powered Seller Insights (Gemini AI)
Empowering sellers with state-of-the-art analytics.
- **Earnings Analytics**: AI-driven breakdown of sales performance and trends.
- **Business Intelligence**: Smart suggestions for product pricing and stock management.

### 💳 5. Secure Payments & Tracking
- **Razorpay Integration**: Seamless and secure payment gateway for the Indian market.
- **Live Order Tracking**: Real-time status updates from "Processing" to "Delivered".

---

## 🛠️ Technical Architecture

### **Frontend**
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **State Management**: Redux Toolkit & React Context API
- **Real-time**: Socket.io-client & WebRTC
- **Internationalization**: i18next (English & हिन्दी support)

### **Backend**
- **Runtime**: Node.js & Express 5.0
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io Signaling
- **Scheduling**: node-cron (Auction automation)
- **Mailing**: Nodemailer (SMTP with diagnostic verification)

---

## 📂 Project Roadmap

- [x] **Phase 1: UI Foundation** — 15+ Premium Responsive Pages.
- [x] **Phase 2: Authentication** — Secure Buyer & Seller Roles.
- [x] **Phase 3: Real-time Core** — Negotiation Chat & Auction Bidding.
- [x] **Phase 4: Commerce Logic** — Cart, Multi-seller Orders, & Razorpay.
- [x] **Phase 5: Voice Communication** — WebRTC Permission-based Audio.
- [x] **Phase 6: Seller Hub** — Advanced Dashboard with Gemini AI Analytics.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Razorpay API Keys
- Google Gemini API Key
- SMTP Server (e.g., Gmail App Password)

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
   # Create a .env file and add MONGO_URI, JWT_SECRET, RAZORPAY keys, EMAIL_USER, etc.
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file and add VITE_BACKEND_URL, VITE_RAZORPAY_KEY_ID
   npm run dev
   ```

---

## � Security & Privacy
- **Strict Data Isolation**: Negotiation chats are filtered by `buyerId` to ensure total privacy.
- **Role-Based Access**: Specialized dashboards for Buyers and Sellers.
- **Consent-Based Calling**: Zero unsolicited calls through the secure WebRTC permission flow.
