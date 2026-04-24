const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this for production
    methods: ["GET", "POST"]
  }
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_negotiation', (productId) => {
    if (productId) {
      socket.join(productId);
      console.log(`User ${socket.id} joined room: ${productId}`);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      if (!data || !data.productId) {
        console.log('Invalid message data received:', data);
        return;
      }

      console.log('Message received:', data);
      socket.to(data.productId).emit('receive_message', {
        text: data.text,
        sender: data.sender,
        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      console.error('Socket send_message error:', err);
    }
  });

  socket.on('price_update', async (data) => {
    try {
      if (!data || !data.productId) {
        console.log('Invalid price update data:', data);
        return;
      }

      console.log('Price update received:', data);
      socket.to(data.productId).emit('price_update', {
         agreedPrice: data.agreedPrice
       });
     } catch (err) {
       console.error('Socket price_update error:', err);
     }
   });

   socket.on('deal_update', async (data) => {
     try {
       if (!data || !data.productId) {
         console.log('Invalid deal update data:', data);
         return;
       }

       console.log('Deal update received:', data);
       socket.to(data.productId).emit('deal_update', {
         status: data.status,
         price: data.price,
         sender: data.sender
       });
     } catch (err) {
       console.error('Socket deal_update error:', err);
     }
   });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const auth = require('./routes/authRoutes');
const orders = require('./routes/orderRoutes');
const products = require('./routes/productRoutes');
const wishlist = require('./routes/wishlistRoutes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/orders', orders);
app.use('/api/products', products);
app.use('/api/wishlist', wishlist);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
