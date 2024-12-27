import { Resend } from 'resend';
import type { BusinessClaim, VerificationStep } from '@/types/claims';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@loadedteafinder.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@loadedteafinder.com';
const APP_NAME = 'Loaded Tea Finder';
const APP_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://loadedteafinder.com';

type EmailData = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailData) {
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

export async function sendClaimSubmittedEmail(claim: BusinessClaim, businessName: string, userEmail: string) {
  const subject = `Business Claim Submitted - ${businessName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50;">Business Claim Submitted</h1>
      <p>Your claim for <strong>"${businessName}"</strong> has been submitted successfully.</p>
      
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
        <li><strong>Business:</strong> ${businessName}</li>
        <li><strong>Claim ID:</strong> ${claim._id.toString()}</li>
        <li><strong>Submitted On:</strong> ${new Date(claim.createdAt).toLocaleDateString()}</li>
      </ul>

      <p style="margin-top: 20px;">
        <a 
          href="${APP_DOMAIN}/claim/${claim._id.toString()}" 
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

  return sendEmail({
    to: userEmail,
    subject,
    html
  });
}

export async function sendVerificationStepEmail(
  claim: BusinessClaim, 
  businessName: string, 
  userEmail: string, 
  step: VerificationStep
) {
  const subject = `Verification Step Update - ${businessName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50;">Verification Step Update</h1>
      <p>We've updated the verification status for your claim of <strong>"${businessName}"</strong>.</p>
      
      <div style="background-color: #f4f6f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Verification Details</h3>
        <ul>
          <li><strong>Method:</strong> ${step.method.replace('_', ' ')}</li>
          <li><strong>Status:</strong> ${step.status}</li>
          <li><strong>Details:</strong> ${step.details || 'No additional details'}</li>
        </ul>
      </div>

      ${step.status === 'needs_more_info' ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Action Required</h3>
          <p>We need some additional information to complete your verification. Please log in to your account to provide the requested details.</p>
        </div>
      ` : ''}

      <p style="margin-top: 20px;">
        <a 
          href="${APP_DOMAIN}/claim/${claim._id.toString()}" 
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

  return sendEmail({
    to: userEmail,
    subject,
    html
  });
}

export async function sendClaimStatusEmail(
  claim: BusinessClaim, 
  businessName: string, 
  userEmail: string, 
  status: 'approved' | 'rejected', 
  notes?: string
) {
  const subject = `Claim ${status.charAt(0).toUpperCase() + status.slice(1)} - ${businessName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: ${status === 'approved' ? '#2ecc71' : '#e74c3c'};">
        Claim ${status.charAt(0).toUpperCase() + status.slice(1)}
      </h1>
      
      <p>
        Your claim for <strong>"${businessName}"</strong> has been 
        ${status === 'approved' ? 'approved' : 'rejected'}.
      </p>

      ${notes ? `
        <div style="background-color: #f4f6f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Additional Notes</h3>
          <p>${notes}</p>
        </div>
      ` : ''}

      ${status === 'approved' ? `
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Next Steps</h3>
          <p>Congratulations! You can now:</p>
          <ul>
            <li>Complete your business profile</li>
            <li>Add menu items</li>
            <li>Upload business photos</li>
          </ul>
        </div>
      ` : `
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>What Can You Do?</h3>
          <p>You can:</p>
          <ul>
            <li>Review the rejection reasons</li>
            <li>Update your documentation</li>
            <li>Submit a new claim</li>
          </ul>
        </div>
      `}

      <p style="margin-top: 20px;">
        <a 
          href="${APP_DOMAIN}/claim/${claim._id.toString()}" 
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

  return sendEmail({
    to: userEmail,
    subject,
    html
  });
}

export async function sendAdminNotificationEmail(
  claim: BusinessClaim, 
  businessName: string, 
  userName: string
) {
  const subject = `New Business Claim - ${businessName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>New Business Claim Submitted</h1>
      <p>A new business claim has been submitted:</p>
      
      <div style="background-color: #f4f6f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Claim Details</h3>
        <ul>
          <li><strong>Business:</strong> ${businessName}</li>
          <li><strong>Claimed By:</strong> ${userName}</li>
          <li><strong>Submitted On:</strong> ${new Date(claim.createdAt).toLocaleDateString()}</li>
          <li><strong>Claim ID:</strong> ${claim._id.toString()}</li>
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

  return sendEmail({
    to: ADMIN_EMAIL,
    subject,
    html
  });
}
