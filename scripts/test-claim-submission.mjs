import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function getDb() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  return client.db(process.env.MONGODB_DB || 'loaded-tea-finder');
}

async function sendClaimSubmittedEmail(claim, businessName, userEmail) {
  const subject = `Business Claim Submitted - ${businessName}`;
  const html = `
    <h1>Business Claim Submitted</h1>
    <p>Your claim for "${businessName}" has been submitted successfully.</p>
    <p>Our team will review your claim and get back to you within 2-3 business days.</p>
    <p>Claim Details:</p>
    <ul>
      <li>Business: ${businessName}</li>
      <li>Claim ID: ${claim._id.toString()}</li>
      <li>Submitted: ${claim.createdAt.toLocaleDateString()}</li>
    </ul>
    <p>If you have any questions, please don't hesitate to contact us.</p>
  `;

  return resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: userEmail,
    subject,
    html,
  });
}

async function sendAdminNotificationEmail(claim, businessName, userName) {
  const subject = `New Business Claim - ${businessName}`;
  const html = `
    <h1>New Business Claim Submitted</h1>
    <p>A new business claim requires your review.</p>
    <p>Claim Details:</p>
    <ul>
      <li>Business: ${businessName}</li>
      <li>Claimed By: ${userName}</li>
      <li>Claim ID: ${claim._id.toString()}</li>
      <li>Submitted: ${claim.createdAt.toLocaleDateString()}</li>
    </ul>
    <p>Please review the claim in the admin dashboard.</p>
  `;

  return resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject,
    html,
  });
}

async function testClaimSubmission() {
  try {
    const db = await getDb();
    
    // Get test business and user
    const [business, user] = await Promise.all([
      db.collection('businesses').findOne({ name: 'Test Nutrition Club' }),
      db.collection('users').findOne({ email: 'test@loadedteafinder.com' })
    ]);

    if (!business || !user) {
      console.error('Test business or user not found');
      process.exit(1);
    }

    // Create claim request
    const claim = {
      businessId: business._id,
      userId: user._id,
      status: 'pending',
      documents: [
        'https://example.com/test-license.pdf',
        'https://example.com/test-ownership.pdf',
        'https://example.com/test-id.pdf'
      ],
      notes: 'This is a test claim submission',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert claim
    const result = await db.collection('businessClaims').insertOne(claim);
    const insertedClaim = { ...claim, _id: result.insertedId };
    
    console.log('Test claim created:', insertedClaim);

    // Send notification emails
    const [userEmailResult, adminEmailResult] = await Promise.all([
      sendClaimSubmittedEmail(insertedClaim, business.name, 'cody@weareblnkspce.com'),
      sendAdminNotificationEmail(insertedClaim, business.name, user.name)
    ]);

    console.log('User notification email sent:', userEmailResult);
    console.log('Admin notification email sent:', adminEmailResult);

    console.log('\nTest claim submission completed successfully!');
    console.log('Claim ID:', result.insertedId.toString());
    process.exit(0);
  } catch (error) {
    console.error('Error testing claim submission:', error);
    process.exit(1);
  }
}

testClaimSubmission();
