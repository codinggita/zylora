const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const Product = require('./models/Product');
const Negotiation = require('./models/Negotiation');
const { startAuctionCompletionHandler } = require('./utils/auctionCompletionHandler');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://zylora-3.onrender.com", "*"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  const findLatestNegotiation = async (productId, sellerId) => {
    return Negotiation.findOne({ productId, seller: sellerId }).sort('-lastMessageAt');
  };

  socket.on('join_negotiation', (data) => {
    // If data is a string, it's just productId (legacy), if object it has productId and buyerId
    const productId = typeof data === 'string' ? data : data.productId;
    const buyerId = typeof data === 'object' ? data.buyerId : null;

    if (productId) {
      const room = buyerId ? `${productId}_${buyerId}` : productId;
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      if (!data || !data.productId || !data.senderId) {
        console.log('Invalid message data received:', data);
        return;
      }

      const newMessage = await Message.create({
        productId: data.productId,
        sender: data.senderId,
        text: data.text,
        type: data.type || 'text',
        offerPrice: data.offerPrice
      });

      const product = await Product.findById(data.productId).select('seller');

      if (product) {
        const targetBuyerId = data.senderRole === 'buyer' ? data.senderId : data.buyerId;

        if (targetBuyerId) {
          const existingNegotiation = await Negotiation.findOne({
            productId: data.productId,
            buyer: targetBuyerId,
            seller: product.seller
          });

          let newStatus = existingNegotiation ? existingNegotiation.status : 'PENDING';
          if (data.type === 'offer') {
            newStatus = 'COUNTERED';
          }

          const update = {
            status: newStatus,
            lastMessage: data.text,
            lastMessageAt: newMessage.createdAt
          };

          if (typeof data.offerPrice === 'number') {
            update.lastOfferPrice = data.offerPrice;
          }

          await Negotiation.findOneAndUpdate(
            {
              productId: data.productId,
              buyer: targetBuyerId,
              seller: product.seller
            },
            { $set: update },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true
            }
          );
        }
      }

      console.log('Message saved and emitting:', data);
      
      const targetBuyerId = data.senderRole === 'buyer' ? data.senderId : data.buyerId;
      const room = targetBuyerId ? `${data.productId}_${targetBuyerId}` : data.productId;

      socket.to(room).emit('receive_message', {
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
      const room = data.buyerId ? `${data.productId}_${data.buyerId}` : data.productId;
      socket.to(room).emit('price_update', {
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

       const product = await Product.findById(data.productId).select('seller');
       if (product) {
         const targetBuyerId = data.senderRole === 'buyer' ? data.senderId : data.buyerId;

         if (targetBuyerId) {
           await Negotiation.findOneAndUpdate(
             {
               productId: data.productId,
               buyer: targetBuyerId,
               seller: product.seller
             },
             {
               $set: {
                 status: data.status,
                 agreedPrice: data.price || 0,
                 lastMessage: `Deal status updated to ${data.status}`,
                 lastMessageAt: new Date()
               }
             },
             {
               upsert: true,
               new: true,
               setDefaultsOnInsert: true
             }
           );
         }
       }

       socket.to(`${data.productId}_${targetBuyerId}`).emit('deal_update', {
         status: data.status,
         price: data.price,
         sender: data.sender
       });
     } catch (err) {
       console.error('Socket deal_update error:', err);
     }
   });

  socket.on('join_auction', (auctionId) => {
    if (auctionId) {
      socket.join(`auction_${auctionId}`);
      console.log(`User ${socket.id} joined auction room: auction_${auctionId}`);
    }
  });

  socket.on('leave_auction', (auctionId) => {
    if (auctionId) {
      socket.leave(`auction_${auctionId}`);
      console.log(`User ${socket.id} left auction room: auction_${auctionId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

// Start auction completion handler
startAuctionCompletionHandler(io);

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
const auctions = require('./routes/auctionRoutes');
const payments = require('./routes/paymentRoutes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/orders', orders);
app.use('/api/products', products);
app.use('/api/wishlist', wishlist);
app.use('/api/cart', cart);
app.use('/api/negotiation', negotiation);
app.use('/api/auctions', auctions);
app.use('/api/payments', payments);

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
