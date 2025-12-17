import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export function Privacy() {
  const lastUpdated = 'December 17, 2025';

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <nav className="border-b border-slate-800/50 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/icons/logo/logo-icon-only.png"
                alt="QMAV"
                className="w-10 h-10 rounded-xl shadow-lg group-hover:shadow-teal-500/30 transition-shadow"
              />
              <span className="text-xl font-bold text-white">QMAV</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-400 mb-12">Last updated: {lastUpdated}</p>

        <div className="prose prose-invert prose-slate max-w-none bg-slate-800/50 border border-slate-700 rounded-xl p-8 md:p-10">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300 mb-4">
              QuoteMyAV ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services at quotemyav.com (the "Service").
            </p>
            <p className="text-slate-300">
              By using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-white mb-3">2.1 Information You Provide</h3>
            <p className="text-slate-300 mb-4">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6">
              <li><strong>Account Information:</strong> Name, email address, company name, and password when you create an account</li>
              <li><strong>Quote Data:</strong> Event details, equipment specifications, and pricing information you enter when creating quotes</li>
              <li><strong>Payment Information:</strong> Credit card details and billing address (processed securely by Stripe; we do not store your full credit card number)</li>
              <li><strong>Communications:</strong> Information you provide when contacting us for support</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3">2.2 Information Collected Automatically</h3>
            <p className="text-slate-300 mb-4">When you access our Service, we automatically collect:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
              <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
              <li><strong>Cookies:</strong> See our Cookie Policy section below</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-300 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process transactions and send related information (receipts, invoices)</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Generate AI-powered quote recommendations based on your event requirements</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
              <li>Personalize and improve your experience</li>
            </ul>
          </section>

          {/* Legal Basis (GDPR) */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-slate-300 mb-4">If you are in the European Economic Area (EEA), our legal basis for processing your personal data includes:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li><strong>Contract Performance:</strong> Processing necessary to provide our Service to you</li>
              <li><strong>Legitimate Interests:</strong> Processing for our legitimate business interests (improving our Service, preventing fraud)</li>
              <li><strong>Consent:</strong> Where you have given us explicit consent for specific processing</li>
              <li><strong>Legal Obligation:</strong> Processing necessary to comply with legal requirements</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Information Sharing and Disclosure</h2>
            <p className="text-slate-300 mb-4">We may share your information with:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6">
              <li><strong>Service Providers:</strong> Third parties that perform services on our behalf:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Stripe (payment processing)</li>
                  <li>Amazon Web Services (cloud hosting)</li>
                  <li>Anthropic (AI quote generation)</li>
                </ul>
              </li>
              <li><strong>Legal Requirements:</strong> When required by law or to respond to legal process</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you have given us permission to share</li>
            </ul>
            <p className="text-slate-300">
              <strong>We do not sell your personal information to third parties.</strong>
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
            <p className="text-slate-300 mb-4">We retain your information for as long as:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Your account is active</li>
              <li>Needed to provide you with our Service</li>
              <li>Required by law or for legitimate business purposes</li>
            </ul>
            <p className="text-slate-300 mt-4">
              When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal, tax, or accounting purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
            <p className="text-slate-300 mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request a machine-readable copy of your data</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="text-slate-300 mt-4">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:privacy@quotemyav.com" className="text-teal-400 hover:text-teal-300">
                privacy@quotemyav.com
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-slate-300 mb-4">We use cookies and similar tracking technologies to:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6">
              <li><strong>Essential Cookies:</strong> Required for the Service to function (authentication, security)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our Service</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="text-slate-300">
              You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of our Service.
            </p>
          </section>

          {/* Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Security</h2>
            <p className="text-slate-300">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit (TLS/SSL), secure password hashing, and regular security assessments. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* International Transfers */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">10. International Data Transfers</h2>
            <p className="text-slate-300">
              Your information may be transferred to and processed in countries other than your own (including the United States). These countries may have different data protection laws. We ensure appropriate safeguards are in place for such transfers, including standard contractual clauses approved by relevant authorities.
            </p>
          </section>

          {/* Children */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">11. Children's Privacy</h2>
            <p className="text-slate-300">
              Our Service is not intended for children under 16. We do not knowingly collect personal data from children under 16. If you are a parent or guardian and believe your child has provided us with personal data, please contact us immediately.
            </p>
          </section>

          {/* Changes */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to This Policy</h2>
            <p className="text-slate-300">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
            <p className="text-slate-300 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <p className="text-white font-medium">QuoteMyAV</p>
              <p className="text-slate-300">Email: <a href="mailto:privacy@quotemyav.com" className="text-teal-400 hover:text-teal-300">privacy@quotemyav.com</a></p>
              <p className="text-slate-300">Support: <a href="mailto:support@quotemyav.com" className="text-teal-400 hover:text-teal-300">support@quotemyav.com</a></p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} QuoteMyAV. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-teal-400 hover:text-teal-300">Privacy Policy</Link>
              <Link to="/terms" className="text-slate-400 hover:text-white">Terms of Service</Link>
              <a href="mailto:support@quotemyav.com" className="text-slate-400 hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
