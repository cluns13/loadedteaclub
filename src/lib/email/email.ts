import { Resend } from 'resend';
import type { BusinessClaim, VerificationStep } from '@/types/claims';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@loadedteafinder.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@loadedteafinder.com';
const APP_NAME = 'Loaded Tea Finder';
const APP_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://loadedteafinder.com';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

type EmailData = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(options: EmailOptions): Promise<void> {
  // Mock email sending functionality
  console.log('Sending email:', options);
}

export async function sendEmailData({ to, subject, html }: EmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendClaimStatusEmail({
  to,
  businessName,
  status,
  notes
}: {
  to: string;
  businessName: string;
  status: 'approved' | 'rejected';
  notes?: string;
}): Promise<void> {
  const subject = `Business Claim Status Update - ${businessName}`;
  const text = `
    Your business claim for ${businessName} has been ${status}.
    
    ${notes ? `Additional Notes: ${notes}` : ''}
  `;
  
  await sendEmail({
    to,
    subject,
    text
  });
}

export async function sendVerificationStepEmail(
  to: string,
  businessName: string,
  step: string,
  details: string
): Promise<void> {
  const subject = `Verification Step Required - ${businessName}`;
  const text = `
    A new verification step is required for your business claim of ${businessName}.
    
    Step: ${step}
    Details: ${details}
    
    Please log in to your account to complete this step.
  `;
  
  await sendEmail({
    to,
    subject,
    text
  });
}

export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<void> {
  const subject = 'Welcome to Loaded Tea Club!';
  const text = `
    Hi ${name},
    
    Welcome to Loaded Tea Club! We're excited to have you join our community.
    
    Get started by:
    1. Completing your profile
    2. Exploring nearby clubs
    3. Earning rewards
    
    If you have any questions, please don't hesitate to reach out.
    
    Best regards,
    The Loaded Tea Club Team
  `;
  
  await sendEmail({
    to,
    subject,
    text
  });
}

export async function sendClaimSubmittedEmail(claimDetails: any) {
  const subject = `Business Claim Submitted - ${claimDetails.businessName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50;">Business Claim Submitted</h1>
      <p>Your claim for <strong>"${claimDetails.businessName}"</strong> has been submitted successfully.</p>
      
      <div style="background-color: #f4f6f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>What Happens Next?</h3>
        <ol>
          <li>Our team will review your claim within 2-3 business days</li>
          <li>We'll verify the documents you've submitted</li>
          <li>You'll receive an email with the final decision</li>
        </ol>
      </div>

      <p>Claim Details:</p>
      <ul>
        <li><strong>Business:</strong> ${claimDetails.businessName}</li>
        <li><strong>Claim ID:</strong> ${claimDetails.claimId}</li>
        <li><strong>Submitted On:</strong> ${new Date(claimDetails.createdAt).toLocaleDateString()}</li>
      </ul>

      <p style="margin-top: 20px;">
        <a 
          href="${APP_DOMAIN}/claim/${claimDetails.claimId}" 
          style="background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;"
        >
          Track Your Claim
        </a>
      </p>

      <footer style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
        ${APP_NAME} ${new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  `;

  return sendEmailData({
    to: claimDetails.userEmail,
    subject,
    html
  });
}

export async function sendAdminNotificationEmail(claimDetails: any) {
  const subject = `New Business Claim - ${claimDetails.businessName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>New Business Claim Submitted</h1>
      <p>A new business claim has been submitted:</p>
      
      <div style="background-color: #f4f6f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Claim Details</h3>
        <ul>
          <li><strong>Business:</strong> ${claimDetails.businessName}</li>
          <li><strong>Claimed By:</strong> ${claimDetails.userName}</li>
          <li><strong>Submitted On:</strong> ${new Date(claimDetails.createdAt).toLocaleDateString()}</li>
          <li><strong>Claim ID:</strong> ${claimDetails.claimId}</li>
        </ul>
      </div>

      <p style="margin-top: 20px;">
        <a 
          href="${APP_DOMAIN}/admin/claims" 
          style="background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;"
        >
          Review Claim
        </a>
      </p>

      <footer style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
        ${APP_NAME} ${new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  `;

  return sendEmailData({
    to: ADMIN_EMAIL,
    subject,
    html
  });
}

export async function sendClaimCancelledEmail(claimDetails: any) {
  const subject = `Claim Cancelled - ${claimDetails.businessName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>Claim Cancelled</h1>
      <p>Your claim for <strong>"${claimDetails.businessName}"</strong> has been cancelled.</p>
      
      <p>Claim Details:</p>
      <ul>
        <li><strong>Business:</strong> ${claimDetails.businessName}</li>
        <li><strong>Claim ID:</strong> ${claimDetails.claimId}</li>
        <li><strong>Cancelled On:</strong> ${new Date(claimDetails.cancelledAt).toLocaleDateString()}</li>
      </ul>

      <p style="margin-top: 20px;">
        <a 
          href="${APP_DOMAIN}/claim/${claimDetails.claimId}" 
          style="background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;"
        >
          View Claim Details
        </a>
      </p>

      <footer style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
        ${APP_NAME} ${new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  `;

  return sendEmailData({
    to: claimDetails.userEmail,
    subject,
    html
  });
}

export async function sendClaimRejectedEmail(claimDetails: any) {
  const subject = `Claim Rejected - ${claimDetails.businessName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>Claim Rejected</h1>
      <p>Your claim for <strong>"${claimDetails.businessName}"</strong> has been rejected.</p>
      
      <p>Claim Details:</p>
      <ul>
        <li><strong>Business:</strong> ${claimDetails.businessName}</li>
        <li><strong>Claim ID:</strong> ${claimDetails.claimId}</li>
        <li><strong>Rejected On:</strong> ${new Date(claimDetails.rejectedAt).toLocaleDateString()}</li>
      </ul>

      <p style="margin-top: 20px;">
        <a 
          href="${APP_DOMAIN}/claim/${claimDetails.claimId}" 
          style="background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;"
        >
          View Claim Details
        </a>
      </p>

      <footer style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
        ${APP_NAME} ${new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  `;

  return sendEmailData({
    to: claimDetails.userEmail,
    subject,
    html
  });
}

export default {
  sendEmail,
  sendClaimStatusEmail,
  sendVerificationStepEmail,
  sendWelcomeEmail,
  sendClaimSubmittedEmail,
  sendAdminNotificationEmail,
  sendClaimCancelledEmail,
  sendClaimRejectedEmail
};
