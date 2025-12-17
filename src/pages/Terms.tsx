import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export function Terms() {
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
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-slate-400 mb-12">Last updated: {lastUpdated}</p>

        <div className="prose prose-invert prose-slate max-w-none bg-slate-800/50 border border-slate-700 rounded-xl p-8 md:p-10">
          {/* Acceptance of Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-300 mb-4">
              Welcome to QuoteMyAV ("we," "our," or "us"). By accessing or using our website at quotemyav.com and related services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms").
            </p>
            <p className="text-slate-300 mb-4">
              <strong>If you do not agree to these Terms, you may not access or use the Service.</strong>
            </p>
            <p className="text-slate-300">
              These Terms constitute a legally binding agreement between you and QuoteMyAV. By clicking "I Accept," creating an account, or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
            </p>
          </section>

          {/* Description of Service */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-slate-300 mb-4">
              QuoteMyAV provides an AI-powered platform that helps audiovisual professionals create, manage, and deliver professional quotes for AV equipment and services. Our Service includes:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>AI-assisted quote generation based on event requirements</li>
              <li>Equipment catalog and pricing database</li>
              <li>Quote customization and editing tools</li>
              <li>PDF export and client delivery features</li>
              <li>Quote management and tracking</li>
              <li>Subscription-based access to premium features</li>
            </ul>
            <p className="text-slate-300 mt-4">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
            </p>
          </section>

          {/* Account Registration */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration and Security</h2>

            <h3 className="text-lg font-medium text-white mb-3">3.1 Account Creation</h3>
            <p className="text-slate-300 mb-4">
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
              <li>Use the Service for lawful business purposes only</li>
              <li>Not create an account on behalf of another person without authorization</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3">3.2 Account Security</h3>
            <p className="text-slate-300 mb-4">You are responsible for:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Maintaining the confidentiality of your password and account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use or security breach</li>
            </ul>
            <p className="text-slate-300 mt-4">
              <strong>We are not liable for any loss or damage arising from your failure to maintain account security.</strong>
            </p>
          </section>

          {/* Subscription Plans and Billing */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription Plans and Billing</h2>

            <h3 className="text-lg font-medium text-white mb-3">4.1 Subscription Terms</h3>
            <p className="text-slate-300 mb-4">
              QuoteMyAV offers subscription-based access to our Service. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6">
              <li>Pay all fees associated with your selected subscription plan</li>
              <li>Provide accurate and complete payment information</li>
              <li>Monthly recurring charges billed to your payment method on file</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3">4.2 Auto-Renewal</h3>
            <p className="text-slate-300 mb-4">
              <strong>Your subscription will automatically renew at the end of each billing period</strong> unless you cancel before the renewal date. By subscribing, you authorize us to charge your payment method for the renewal fee.
            </p>

            <h3 className="text-lg font-medium text-white mb-3">4.3 Price Changes</h3>
            <p className="text-slate-300 mb-4">
              We reserve the right to modify our subscription prices. We will provide you with at least 30 days' advance notice of any price changes via email. If you do not agree to the price change, you may cancel your subscription before the change takes effect.
            </p>

            <h3 className="text-lg font-medium text-white mb-3">4.4 Cancellation Policy</h3>
            <p className="text-slate-300 mb-4">
              <strong>You may cancel your subscription at any time.</strong> To cancel:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
              <li>Access your account settings and select "Cancel Subscription"</li>
              <li>Your cancellation will take effect at the end of your current billing period</li>
              <li>You will retain access to premium features until the end of your paid period</li>
              <li>No partial refunds are provided for unused time within a billing period</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3">4.5 Refund Policy</h3>
            <p className="text-slate-300 mb-4">
              We offer a <strong>30-day money-back guarantee</strong> for new subscribers:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>If you are not satisfied within 30 days of your initial subscription, contact us for a full refund</li>
              <li>This guarantee applies only to first-time subscribers</li>
              <li>Refund requests must be submitted within 30 days of your first payment</li>
              <li>Renewals and subsequent billing periods are non-refundable</li>
            </ul>
          </section>

          {/* Acceptable Use Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use Policy</h2>
            <p className="text-slate-300 mb-4">You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Transmit malicious code, viruses, or harmful materials</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in fraudulent activities or money laundering</li>
              <li>Share your account credentials with others</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
            <p className="text-slate-300 mt-4">
              <strong>Violation of this policy may result in immediate termination of your account without refund.</strong>
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property Rights</h2>

            <h3 className="text-lg font-medium text-white mb-3">6.1 Our Intellectual Property</h3>
            <p className="text-slate-300 mb-4">
              The Service and its entire contents, features, and functionality (including but not limited to all information, software, code, text, displays, graphics, photographs, video, audio, design, presentation, selection, and arrangement) are owned by QuoteMyAV and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-lg font-medium text-white mb-3">6.2 Your Content</h3>
            <p className="text-slate-300 mb-4">
              You retain ownership of all content you create using the Service, including quotes, client information, and custom pricing. By using the Service, you grant us a limited license to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
              <li>Store and process your content to provide the Service</li>
              <li>Create backups and ensure data redundancy</li>
              <li>Use aggregated, anonymized data for analytics and service improvement</li>
            </ul>
            <p className="text-slate-300">
              <strong>We will not share your quotes, client data, or pricing information with third parties without your consent.</strong>
            </p>

            <h3 className="text-lg font-medium text-white mb-3">6.3 Trademarks</h3>
            <p className="text-slate-300">
              "QuoteMyAV," "QMAV," and our logos are trademarks of QuoteMyAV. You may not use our trademarks without our prior written permission.
            </p>
          </section>

          {/* AI-Generated Content Disclaimer */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">7. AI-Generated Content Disclaimer</h2>
            <p className="text-slate-300 mb-4">
              Our Service uses artificial intelligence to generate quote recommendations and equipment suggestions. You acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li><strong>AI-generated content is for informational purposes only</strong> and should be reviewed and verified by qualified professionals</li>
              <li>You are solely responsible for reviewing, editing, and approving all quotes before sending them to clients</li>
              <li>We do not guarantee the accuracy, completeness, or appropriateness of AI-generated recommendations</li>
              <li>Equipment pricing, availability, and specifications should be verified with suppliers</li>
              <li>AI suggestions may not account for all site-specific requirements, local regulations, or safety considerations</li>
              <li>You must exercise professional judgment and not rely solely on AI-generated content</li>
            </ul>
            <p className="text-slate-300 mt-4">
              <strong>QuoteMyAV is not liable for any errors, omissions, or consequences resulting from AI-generated content.</strong>
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-slate-300 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUOTEMYAV AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6">
              <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>ANY LOSS OF PROFITS, REVENUE, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES</li>
              <li>DAMAGES RESULTING FROM YOUR USE OR INABILITY TO USE THE SERVICE</li>
              <li>DAMAGES RESULTING FROM ERRORS, OMISSIONS, OR INACCURACIES IN AI-GENERATED CONTENT</li>
              <li>DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO YOUR ACCOUNT OR DATA</li>
              <li>DAMAGES RESULTING FROM SERVICE INTERRUPTIONS, DELAYS, OR FAILURES</li>
            </ul>
            <p className="text-slate-300 mb-4">
              <strong>OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE WILL NOT EXCEED THE GREATER OF:</strong>
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR</li>
              <li>$100 USD</li>
            </ul>
            <p className="text-slate-300 mt-4">
              Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Indemnification</h2>
            <p className="text-slate-300">
              You agree to indemnify, defend, and hold harmless QuoteMyAV and its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your content or data uploaded to the Service</li>
              <li>Quotes you create and deliver to clients using our Service</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>

            <h3 className="text-lg font-medium text-white mb-3">10.1 Termination by You</h3>
            <p className="text-slate-300 mb-6">
              You may terminate your account at any time by canceling your subscription through your account settings or by contacting us at support@quotemyav.com.
            </p>

            <h3 className="text-lg font-medium text-white mb-3">10.2 Termination by Us</h3>
            <p className="text-slate-300 mb-4">
              We may suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason, including:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>Extended periods of inactivity</li>
              <li>At our sole discretion</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3">10.3 Effect of Termination</h3>
            <p className="text-slate-300 mb-4">Upon termination:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Your right to use the Service will immediately cease</li>
              <li>We will delete your account and data within 30 days (subject to legal retention requirements)</li>
              <li>You may request a copy of your data before deletion by contacting us</li>
              <li>Provisions of these Terms that by their nature should survive termination will remain in effect</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">11. Dispute Resolution</h2>

            <h3 className="text-lg font-medium text-white mb-3">11.1 Informal Resolution</h3>
            <p className="text-slate-300 mb-6">
              If you have a dispute with us, please contact us first at support@quotemyav.com. We will attempt to resolve the dispute informally within 30 days.
            </p>

            <h3 className="text-lg font-medium text-white mb-3">11.2 Arbitration Agreement</h3>
            <p className="text-slate-300 mb-4">
              If we cannot resolve the dispute informally, you agree that any dispute arising out of or related to these Terms or the Service will be resolved through binding arbitration in accordance with the American Arbitration Association's Commercial Arbitration Rules.
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6">
              <li>Arbitration will take place in Indiana, USA, or remotely via video conference</li>
              <li>The arbitrator's decision will be final and binding</li>
              <li>You waive your right to a jury trial</li>
              <li>You waive your right to participate in a class action lawsuit</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3">11.3 Exceptions</h3>
            <p className="text-slate-300">
              Either party may seek injunctive or other equitable relief in any court of competent jurisdiction to prevent actual or threatened infringement, misappropriation, or violation of intellectual property rights.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
            <p className="text-slate-300 mb-4">
              We reserve the right to modify these Terms at any time. If we make material changes, we will:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Post the updated Terms on this page</li>
              <li>Update the "Last updated" date at the top</li>
              <li>Notify you via email at least 30 days before the changes take effect</li>
            </ul>
            <p className="text-slate-300 mt-4">
              <strong>Your continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.</strong> If you do not agree to the new Terms, you must stop using the Service and cancel your subscription.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">13. Governing Law</h2>
            <p className="text-slate-300">
              These Terms are governed by and construed in accordance with the laws of the State of Indiana, United States, without regard to its conflict of law principles. You agree to submit to the personal and exclusive jurisdiction of the courts located in Indiana for any disputes arising from these Terms or the Service.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
            <p className="text-slate-300 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <p className="text-white font-medium">QuoteMyAV</p>
              <p className="text-slate-300">Email: <a href="mailto:support@quotemyav.com" className="text-teal-400 hover:text-teal-300">support@quotemyav.com</a></p>
              <p className="text-slate-300">Legal: <a href="mailto:legal@quotemyav.com" className="text-teal-400 hover:text-teal-300">legal@quotemyav.com</a></p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="mb-12">
            <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-teal-400 mb-3">Acknowledgment</h3>
              <p className="text-slate-300">
                BY USING QUOTEMYAV, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, YOU ARE NOT AUTHORIZED TO USE THE SERVICE.
              </p>
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
              <Link to="/privacy" className="text-slate-400 hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="text-teal-400 hover:text-teal-300">Terms of Service</Link>
              <a href="mailto:support@quotemyav.com" className="text-slate-400 hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
