const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');

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
      if (!data || !data.productId || !data.senderId) {
        console.log('Invalid message data received:', data);
        return;
      }

      // Save message to database
      const newMessage = await Message.create({
        productId: data.productId,
        sender: data.senderId,
        text: data.text,
        type: data.type || 'text',
        offerPrice: data.offerPrice
      });

      console.log('Message saved and emitting:', data);
      socket.to(data.productId).emit('receive_message', {
        id: newMessage._id,
        text: data.text,
        sender: data.senderId,
        type: data.type || 'text',
        offerPrice: data.offerPrice,
        time: newMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
const cart = require('./routes/cartRoutes');
const negotiation = require('./routes/negotiationRoutes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/orders', orders);
app.use('/api/products', products);
app.use('/api/wishlist', wishlist);
app.use('/api/cart', cart);
app.use('/api/negotiation', negotiation);

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
