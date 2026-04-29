# Zylora — Shop Everything. Negotiate Anything.

> ⚛️ React + 🎨 Tailwind CSS · Full-Stack E-commerce Platform

---

## 🔗 Live Deployment & Resources

| Resource | Link |
|---|---|
| � Frontend Live | [zylora-tau.vercel.app](https://zylora-tau.vercel.app/) |
| ⚙️ Backend API | [zylora-e-commerce.onrender.com](https://zylora-e-commerce.onrender.com/) |
| �🎨 Figma Design File | [View on Figma](https://www.figma.com/design/vt3eDlpqhdudT35CdsZjPg/Portfolio?node-id=0-1&t=DzB5ULzEV5Gu0Iph-1) |
| 🖼️ Figma Prototype | [Open Prototype](https://www.figma.com/design/vt3eDlpqhdudT35CdsZjPg/Portfolio?node-id=0-1&t=DzB5ULzEV5Gu0Iph-1) |



---

## 📌 About

**Zylora** is a full-stack e-commerce platform — inspired by Flipkart and Myntra in polish and trust. This repository contains the complete implementation with a React frontend and an Express/Node.js backend.

Three features make Zylora unique beyond standard shopping:

- **💬 Price Negotiation** — Buyers chat directly with sellers to agree on a custom price
- **📦 Bulk Discounts** — More units = lower price per unit, shown in a tiered pricing table
- **🌿 Live Agri Auctions** — A dedicated green-themed section for farm-fresh produce with live countdown bidding

> The project is now fully integrated with a backend API for authentication and data management.

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 18.x | UI framework |
| [Tailwind CSS](https://tailwindcss.com) | 3.x | Styling |
| [Vite](https://vitejs.dev) | 5.x | Build tool & dev server |
| [React Router](https://reactrouter.com) | 6.x | Client-side routing |

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-username/zylora.git

# 2. Move into the project
cd zylora

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```
zylora/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── AuctionCard.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── ProductListing.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── NegotiationChat.jsx
│   │   ├── AgriAuction.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderConfirmation.jsx
│   │   ├── OrderTracking.jsx
│   │   ├── dashboard/
│   │   │   ├── MyOrders.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   └── MyNegotiations.jsx
│   │   ├── SellerDashboard.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🖥️ Pages (15 Total)

| # | Page | Route |
|---|---|---|
| 1 | Homepage | `/` |
| 2 | Product Listing | `/products` |
| 3 | Product Detail | `/products/:id` |
| 4 | Negotiation Chat | `/negotiate/:id` |
| 5 | Agri Auction | `/agri-auctions` |
| 6 | Cart | `/cart` |
| 7 | Checkout | `/checkout` |
| 8 | Order Confirmation | `/order-confirmed` |
| 9 | Order Tracking | `/track/:orderId` |
| 10 | My Orders | `/account/orders` |
| 11 | Wishlist | `/account/wishlist` |
| 12 | My Negotiations | `/account/negotiations` |
| 13 | Seller Dashboard | `/seller/dashboard` |
| 14 | Login | `/login` |
| 15 | Signup | `/signup` |

---

## 🧭 Navigation Flows

```
Flow 1 — Shopping
Homepage → Product Detail → Add to Cart → Cart → Checkout → Order Confirmed → Track Order

Flow 2 — Negotiation
Product Detail → Make an Offer → Negotiation Chat → Accept Deal → Cart (negotiated price applied)

Flow 3 — Agri Auction
Homepage Agri Strip / Navbar → Agri Auction Page → Bid Now

Flow 4 — Auth
Login → Create Account → Signup (User / Seller role) → OTP Verify → Dashboard

Flow 5 — Buyer Account
My Account → My Orders / Wishlist / My Negotiations

Flow 6 — Seller
Become a Seller → Seller Dashboard
```

---

## 🎨 Design System

### Fonts
| Role | Font |
|---|---|
| Headings | DM Serif Display |
| Body & UI | DM Sans |
| Prices & Timers | JetBrains Mono |

### Colors
| Token | Hex | Used For |
|---|---|---|
| Navy | `#0A1628` | Navbar, footer, primary buttons |
| Amber | `#D97706` | Buy Now, pay, seller accent |
| Rich Blue | `#1D4ED8` | Links, highlights |
| Teal | `#0D9488` | Negotiate feature |
| Forest Green | `#15803D` | Agri Auction feature |
| Success | `#16A34A` | Delivered, in stock, deal agreed |
| Error | `#DC2626` | Urgent timers, errors, declined |
| Background | `#F8F9FB` | Page background |
| Card | `#FFFFFF` | Card surface |
| Border | `#E5E7EB` | All borders |

### `tailwind.config.js` Custom Tokens
```js
theme: {
  extend: {
    colors: {
      navy:   '#0A1628',
      amber:  '#D97706',
      teal:   '#0D9488',
      forest: '#15803D',
    },
    fontFamily: {
      serif: ['DM Serif Display', 'serif'],
      sans:  ['DM Sans', 'sans-serif'],
      mono:  ['JetBrains Mono', 'monospace'],
    },
  },
},
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Width |
|---|---|
| Mobile | `375px` |
| Tablet | `768px` |
| Desktop | `1280px+` |

---

## 🌐 Localisation

- All prices in **₹ Indian Rupees** — no `$` or `€` anywhere
- Indian product catalogue — Samsung, Apple, boAt, Nike, Realme, OnePlus
- Indian seller names — TechZone Official Store, MobileHub, DigiWorld, KitchenKing
- Indian cities — Mumbai, Delhi, Bangalore, Chennai, Pune, Jaipur, Kolkata
- Phone numbers in `+91 98xxxxxxxx` format

---

## ✅ Current Progress

- [ ] Navbar & Footer
- [ ] Homepage
- [ ] Product Listing Page
- [ ] Product Detail Page
- [ ] Negotiation Chat Page
- [ ] Agri Auction Page
- [ ] Cart Page
- [ ] Checkout Page
- [ ] Order Confirmation Page
- [ ] Order Tracking Page
- [ ] Buyer Dashboard (Orders / Wishlist / Negotiations)
- [ ] Seller Dashboard
- [ ] Login Page
- [ ] Signup Page (User + Seller role toggle)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <strong>Zy</strong>lora &nbsp;·&nbsp; Shop Everything. Negotiate Anything. &nbsp;·&nbsp; Built with ⚛️ React & 🎨 Tailwind
</div>
