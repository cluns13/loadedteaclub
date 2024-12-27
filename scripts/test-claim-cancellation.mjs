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
    <p>If you need to cancel this claim, you can do so from your dashboard.</p>
  `;

  return resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: userEmail,
    subject,
    html,
  });
}

async function sendClaimCancelledEmail(claim, businessName, userEmail) {
  const subject = `Business Claim Cancelled - ${businessName}`;
  const html = `
    <h1>Business Claim Cancelled</h1>
    <p>Your claim for "${businessName}" has been cancelled as requested.</p>
    <p>Claim Details:</p>
    <ul>
      <li>Business: ${businessName}</li>
      <li>Claim ID: ${claim._id.toString()}</li>
      <li>Submitted: ${claim.createdAt.toLocaleDateString()}</li>
      <li>Cancelled: ${claim.cancelledAt.toLocaleDateString()}</li>
    </ul>
    <p>If you'd like to submit a new claim in the future, you're welcome to do so.</p>
  `;

  return resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: userEmail,
    subject,
    html,
  });
}

async function testClaimCancellation() {
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

    // Step 1: Create new claim
    console.log('\n--- Step 1: Creating new claim ---');
    const claim = {
      businessId: business._id,
      userId: user._id,
      status: 'pending',
      documents: [
        'https://example.com/updated-license.pdf',
        'https://example.com/updated-ownership.pdf'
      ],
      notes: 'This is a new claim submission for cancellation testing',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('businessClaims').insertOne(claim);
    const insertedClaim = { ...claim, _id: result.insertedId };
    
    console.log('New claim created:', insertedClaim);

    // Send claim submission email
    const submissionEmailResult = await sendClaimSubmittedEmail(
      insertedClaim,
      business.name,
      'cody@weareblnkspce.com'
    );
    console.log('Submission notification email sent:', submissionEmailResult);

    // Step 2: Cancel the claim
    console.log('\n--- Step 2: Cancelling claim ---');
    const now = new Date();
    await db.collection('businessClaims').updateOne(
      { _id: result.insertedId },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: now,
          updatedAt: now,
          cancellationReason: 'User requested cancellation'
        }
      }
    );

    // Send cancellation email
    const cancellationEmailResult = await sendClaimCancelledEmail(
      { ...insertedClaim, cancelledAt: now },
      business.name,
      'cody@weareblnkspce.com'
    );
    console.log('Cancellation notification email sent:', cancellationEmailResult);

    console.log('\nTest claim cancellation completed successfully!');
    console.log('Claim ID:', result.insertedId.toString());
    process.exit(0);
  } catch (error) {
    console.error('Error testing claim cancellation:', error);
    process.exit(1);
  }
}

testClaimCancellation();
