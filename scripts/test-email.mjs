import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: 'cody@weareblnkspce.com',
      subject: 'Test Email from Loaded Tea Finder',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from the Loaded Tea Finder application.</p>
        <p>If you're receiving this, the email functionality is working correctly!</p>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      process.exit(1);
    }

    console.log('Test email sent successfully!', data);
    process.exit(0);
  } catch (error) {
    console.error('Error sending email:', error);
    process.exit(1);
  }
}

sendTestEmail();
