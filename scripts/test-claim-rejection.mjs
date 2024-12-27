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

async function sendClaimRejectedEmail(claim, businessName, userEmail, reason) {
  const subject = `Business Claim Rejected - ${businessName}`;
  const html = `
    <h1>Business Claim Rejected</h1>
    <p>Unfortunately, your claim for "${businessName}" has been rejected.</p>
    <p>Reason for rejection: ${reason}</p>
    <p>Claim Details:</p>
    <ul>
      <li>Business: ${businessName}</li>
      <li>Claim ID: ${claim._id.toString()}</li>
      <li>Submitted: ${claim.createdAt.toLocaleDateString()}</li>
      <li>Rejected: ${claim.rejectedAt.toLocaleDateString()}</li>
    </ul>
    <p>If you believe this was a mistake or would like to submit a new claim with updated documentation, 
    please feel free to do so.</p>
  `;

  return resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: userEmail,
    subject,
    html,
  });
}

async function testClaimRejection() {
  try {
    const db = await getDb();
    const claimId = '6769b7acefcab46a32140e7a'; // The claim ID from our previous test
    
    // Find the claim
    const claim = await db.collection('businessClaims').findOne({
      _id: new ObjectId(claimId)
    });

    if (!claim) {
      console.error('Claim not found');
      process.exit(1);
    }

    if (claim.status !== 'pending') {
      console.error('Claim is not in pending status');
      process.exit(1);
    }

    // Get business and user details
    const [business, user] = await Promise.all([
      db.collection('businesses').findOne({ _id: claim.businessId }),
      db.collection('users').findOne({ _id: claim.userId })
    ]);

    if (!business || !user) {
      console.error('Business or user not found');
      process.exit(1);
    }

    // Update claim status
    const now = new Date();
    const rejectionReason = 'Documentation provided is insufficient. Please provide a clearer copy of your business license.';
    
    await db.collection('businessClaims').updateOne(
      { _id: new ObjectId(claimId) },
      { 
        $set: { 
          status: 'rejected',
          rejectionReason,
          rejectedBy: new ObjectId(user._id), // Using test user as admin for this test
          rejectedAt: now,
          updatedAt: now
        }
      }
    );

    console.log('Claim status updated to rejected');

    // Send rejection email
    const emailResult = await sendClaimRejectedEmail(
      { ...claim, rejectedAt: now },
      business.name,
      'cody@weareblnkspce.com', // Using your email for testing
      rejectionReason
    );

    console.log('Rejection email sent:', emailResult);

    console.log('\nTest claim rejection completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error testing claim rejection:', error);
    process.exit(1);
  }
}

testClaimRejection();
