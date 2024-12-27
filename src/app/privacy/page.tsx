import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Loaded Tea Finder',
  description: 'Learn about how we collect, use, and protect your personal information at Loaded Tea Finder.',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="lead">
          At Loaded Tea Finder, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our website.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We collect information that you provide directly to us, including:
        </p>
        <ul>
          <li>Name and contact information when you create an account</li>
          <li>Location data when you search for tea clubs</li>
          <li>Business information if you claim or list a business</li>
          <li>Communications you send to us</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Provide and maintain our services</li>
          <li>Improve and personalize your experience</li>
          <li>Communicate with you about our services</li>
          <li>Protect against unauthorized access and abuse</li>
        </ul>

        <h2>Information Sharing</h2>
        <p>
          We do not sell your personal information. We may share your information with:
        </p>
        <ul>
          <li>Service providers who assist in our operations</li>
          <li>Law enforcement when required by law</li>
          <li>Other users when you choose to make information public</li>
        </ul>

        <h2>Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt out of marketing communications</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <p>
          Email: privacy@loadedteafinder.com<br />
          Phone: 1-800-TEA-FIND
        </p>

        <p className="text-sm text-gray-500 mt-8">
          Last updated: December 26, 2024
        </p>
      </div>
    </main>
  );
}
