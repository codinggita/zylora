const cron = require('node-cron');
const Auction = require('../models/Auction');
const { sendWinnerNotificationEmail } = require('./emailService');

// Check for completed auctions and send winner notifications
// Runs every minute
const startAuctionCompletionHandler = (io) => {
  console.log('Starting auction completion handler...');

  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find auctions that have ended but winner notification not sent
      const completedAuctions = await Auction.find({
        status: 'ACTIVE',
        endTime: { $lt: now },
        winnerNotificationSent: false,
        highestBidder: { $ne: null }
      })
        .populate('highestBidder', 'name email')
        .populate('product', 'name');

      if (completedAuctions.length > 0) {
        console.log(`Found ${completedAuctions.length} completed auctions to process`);

        for (const auction of completedAuctions) {
          try {
            // Send email to winner
            const emailResult = await sendWinnerNotificationEmail(
              auction.highestBidder.email,
              auction.highestBidder.name,
              auction._id,
              auction.product.name,
              auction.currentBid
            );

            if (emailResult.success) {
              // Update auction to mark notification sent
              auction.status = 'COMPLETED';
              auction.winnerNotificationSent = true;

              // Mark loser payments as ready for refund
              let refundCount = 0;
              auction.userPayments.forEach(payment => {
                if (payment.user.toString() !== auction.highestBidder._id.toString() && !payment.isRefunded && payment.totalPaid > 0) {
                  payment.refundAmount = payment.totalPaid;
                  payment.isRefunded = false; // Mark as pending
                  refundCount++;
                }
              });

              // Simulation: Automatically "process" refunds immediately for now
              auction.userPayments.forEach(payment => {
                if (payment.refundAmount > 0 && !payment.isRefunded) {
                  payment.isRefunded = true;
                  payment.refundedAt = new Date();
                }
              });

              await auction.save();

              // Emit real-time event for winner
              io.to(`auction_${auction._id}`).emit('auction_completed', {
                auctionId: auction._id,
                winner: auction.highestBidder,
                winningBid: auction.currentBid,
                message: 'Auction has ended! Check your email for winner instructions.',
                addressRequired: true
              });

              console.log(`- Auction ${auction._id} processed: Email sent and ${refundCount} refunds handled.`);
            }
          } catch (error) {
            console.error(`Error processing auction ${auction._id}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error in auction completion handler:', error.message);
    }
  });
};

module.exports = { startAuctionCompletionHandler };
