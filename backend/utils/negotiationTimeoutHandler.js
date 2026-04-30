const cron = require('node-cron');
const Negotiation = require('../models/Negotiation');

/**
 * Monitors negotiations for emergency buzz timeouts.
 * If a buyer buzzes and the seller doesn't respond (no new message or status change) 
 * within 10 minutes, the deal is automatically declined.
 */
const startNegotiationTimeoutHandler = (io) => {
  console.log('Starting negotiation timeout handler...');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

      // Find negotiations that were buzzed more than 10 mins ago
      // and haven't had a message/update since the buzz
      const stalledNegotiations = await Negotiation.find({
        lastBuzzAt: { $ne: null, $lt: tenMinutesAgo },
        status: { $nin: ['DECLINED', 'AGREED'] }
      });

      if (stalledNegotiations.length > 0) {
        console.log(`Found ${stalledNegotiations.length} stalled negotiations to process`);

        for (const neg of stalledNegotiations) {
          // Double check: if lastMessageAt is AFTER lastBuzzAt, it means someone responded!
          if (neg.lastMessageAt && neg.lastMessageAt > neg.lastBuzzAt) {
            // Someone responded, so clear the buzz flag
            neg.lastBuzzAt = null;
            await neg.save();
            continue;
          }

          // Auto-decline
          console.log(`Auto-declining negotiation ${neg._id} due to buzz timeout`);
          neg.status = 'DECLINED';
          neg.lastMessage = 'System: Deal automatically closed due to no response after emergency buzz.';
          neg.lastBuzzAt = null; // Clear it so we don't process it again
          neg.lastMessageAt = now;
          await neg.save();

          // Inform both parties via Socket
          const payload = {
            productId: neg.productId.toString(),
            buyerId: neg.buyer.toString(),
            status: 'DECLINED',
            sender: 'system',
            message: 'Deal closed automatically due to inactivity after emergency alert.'
          };

          // Emit to both specific and general rooms
          io.to(`${neg.productId}_${neg.buyer}`).emit('deal_update', payload);
          io.to(neg.productId.toString()).emit('deal_update', payload);
        }
      }
    } catch (error) {
      console.error('Error in negotiation timeout handler:', error.message);
    }
  });
};

module.exports = { startNegotiationTimeoutHandler };
