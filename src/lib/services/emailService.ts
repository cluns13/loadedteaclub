import nodemailer from 'nodemailer';
import { formatDistanceToNow } from 'date-fns';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface ReviewNotificationData {
  businessName: string;
  reviewerName: string;
  rating: number;
  content: string;
  createdAt: string;
  businessUrl: string;
  reviewId: string;
}

export async function sendReviewNotification(
  ownerEmail: string,
  data: ReviewNotificationData
) {
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
  const timeAgo = formatDistanceToNow(new Date(data.createdAt), { addSuffix: true });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
          }
          .rating {
            color: #FFD700;
            font-size: 24px;
            margin: 10px 0;
          }
          .review {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Review for ${data.businessName}</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have received a new review for ${data.businessName}.</p>
            
            <div class="review">
              <div class="rating">${stars}</div>
              <p><strong>${data.reviewerName}</strong> • ${timeAgo}</p>
              <p>${data.content}</p>
            </div>

            <p>You can respond to this review to show your customers you value their feedback.</p>
            
            <a href="${data.businessUrl}?review=${data.reviewId}" class="button">
              Respond to Review
            </a>

            <div class="footer">
              <p>This email was sent from Loaded Tea Finder. 
              To manage your notification preferences, visit your dashboard settings.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: '"Loaded Tea Finder" <' + process.env.SMTP_FROM + '>',
    to: ownerEmail,
    subject: 'New Review for ' + data.businessName + ' (' + data.rating + ' stars)',
    html,
  });
}
