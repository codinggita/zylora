const nodemailer = require('nodemailer');

// Create a transporter using Gmail (you can use any email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true, // Use connection pool for efficiency
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Function to send winner notification email
const sendWinnerNotificationEmail = async (winnerEmail, winnerName, auctionId, productName, bidAmount) => {
  try {
    const addressSubmissionLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auction/${auctionId}/submit-address`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@zylora.com',
      to: winnerEmail,
      subject: `🎉 Congratulations! You Won the Auction for ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎉 Auction Won!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Hi ${winnerName},</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Congratulations! You have won the auction for <strong>${productName}</strong>!
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">Winning Bid Amount</p>
              <p style="margin: 10px 0 0 0; font-size: 28px; color: #667eea; font-weight: bold;">₹${bidAmount}</p>
            </div>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              To complete your purchase, please submit your delivery address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${addressSubmissionLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                📍 Submit Your Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #888; line-height: 1.6;">
              <strong>Next Steps:</strong>
              <br>1. Click the button above to submit your delivery address
              <br>2. Your order will be created automatically
              <br>3. The seller will process your shipment
              <br>4. You'll receive tracking information via email
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              If you did not win this auction or have any issues, please contact our support team.
              <br><strong>ZyLora Agricultural E-Commerce Platform</strong>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Winner notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending winner notification email:', error);
    return { success: false, error: error.message };
  }
};

// Function to send address reminder email
const sendAddressReminderEmail = async (winnerEmail, winnerName, auctionId, productName) => {
  try {
    const addressSubmissionLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auction/${auctionId}/submit-address`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@zylora.com',
      to: winnerEmail,
      subject: `⏰ Reminder: Complete Your Auction Purchase for ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #fff3cd; color: #856404; padding: 20px; border-radius: 8px;">
            <h3 style="margin: 0;">⏰ Action Required: Submit Your Address</h3>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 8px;">
            <p style="font-size: 16px; color: #333;">Hi ${winnerName},</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              We're waiting for your delivery address to complete your auction purchase for <strong>${productName}</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${addressSubmissionLink}" style="background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Complete Purchase Now
              </a>
            </div>
            
            <p style="font-size: 14px; color: #888;">
              Please submit your address within 48 hours to avoid order cancellation.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Address reminder email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return { success: false, error: error.message };
  }
};

// Function to send order confirmation email
const sendOrderConfirmationEmail = async (winnerEmail, winnerName, auction, address) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@zylora.com',
      to: winnerEmail,
      subject: `✅ Order Confirmed - Auction Purchase`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">✅ Order Confirmed!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Hi ${winnerName},</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Your order has been successfully created! The seller will process your shipment shortly.
            </p>
            
            <div style="background: white; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 12px;">DELIVERY ADDRESS</p>
              <p style="margin: 10px 0; color: #333; font-size: 14px;">
                <strong>${address.name}</strong><br>
                ${address.address}<br>
                ${address.city}, ${address.state} ${address.postalCode}<br>
                📱 ${address.mobile}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #888; line-height: 1.6;">
              You will receive tracking information as soon as the seller ships your order.
              <br><br>
              <strong>Order Details:</strong>
              <br>Winning Bid: ₹${auction.currentBid}
              <br>Status: Processing
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              Thank you for shopping at ZyLora!
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWinnerNotificationEmail,
  sendAddressReminderEmail,
  sendOrderConfirmationEmail
};
