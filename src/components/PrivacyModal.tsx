"use client";

import { useEffect } from "react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fadeIn"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-slideUp isolation-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset',
          transform: 'translateZ(0)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110"
        >
          <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 py-8">
          <h1 className="text-3xl font-['Anton'] text-white mb-6">Privacy Policy</h1>

          <div className="space-y-6 text-white/80 text-sm leading-relaxed">
            <section>
              <p className="text-white/60 mb-4">
                <strong>Effective Date:</strong> March 21, 2026
              </p>
              <p className="mb-4">
                This Privacy Policy describes how <strong>Blackjax, LLC</strong> ("we," "us," or "our") collects, uses, shares, and protects
                your personal information when you use the VoxelBeat platform and services (the "Service"). By using the Service, you agree to the practices
                described in this Privacy Policy.
              </p>
              <p className="mb-4">
                If you do not agree with this Privacy Policy, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
              <p className="mb-3">We collect several types of information from and about users of the Service:</p>

              <p className="mb-2"><strong>1.1 Information You Provide Directly</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li><strong>Account Information:</strong> When you create an account, we collect your email address and password (encrypted and managed by Supabase).</li>
                <li><strong>Profile Information:</strong> You may optionally provide studio name, bio, avatar image, and social media links (Spotify, SoundCloud, Instagram, itch.io, personal website).</li>
                <li><strong>Contact Information:</strong> You may choose to share contact details such as business email address, phone number, and Discord username. <strong>These details will be publicly visible</strong> to all users of the Service if you complete your profile.</li>
                <li><strong>Content:</strong> Audio files you upload, track titles, descriptions, and tags.</li>
                <li><strong>Communications:</strong> Messages you send to us via email or contact forms.</li>
              </ul>

              <p className="mb-2"><strong>1.2 Automatically Collected Information</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li><strong>Usage Data:</strong> Information about how you interact with the Service, including tracks played, search queries, features accessed, and time spent on the platform.</li>
                <li><strong>Device and Browser Information:</strong> IP address, browser type and version, operating system, device type, screen resolution, and language preferences.</li>
                <li><strong>Cookies and Similar Technologies:</strong> We use cookies, local storage, and session storage to remember your preferences, maintain your session, and analyze usage patterns. See Section 8 for more details.</li>
                <li><strong>Log Data:</strong> Server logs that include IP address, request timestamps, pages visited, and error reports.</li>
              </ul>

              <p className="mb-2"><strong>1.3 Information from Third Parties</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Authentication Providers:</strong> We use Supabase for authentication, which may collect and share authentication-related data.</li>
                <li><strong>Public Profile Links:</strong> If you provide links to your Spotify, SoundCloud, Instagram, or other public profiles, we display these links but do not collect data from those platforms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p className="mb-2">We use the information we collect for the following purposes:</p>

              <p className="mb-2"><strong>2.1 To Provide and Operate the Service</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Create and manage your account;</li>
                <li>Store and stream your uploaded audio files;</li>
                <li>Display your public profile and contact information to other users;</li>
                <li>Enable semantic search by generating vector embeddings from your track metadata using OpenAI's API;</li>
                <li>Post and share your Content on third-party platforms (YouTube, SoundCloud, social media, etc.) to promote the Service and drive traffic to your VoxelBeat profile;</li>
                <li>Process and respond to your inquiries and support requests.</li>
              </ul>

              <p className="mb-2"><strong>2.2 To Improve and Personalize the Service</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Analyze usage patterns to understand how users interact with the Service;</li>
                <li>Optimize search algorithms and recommendation features;</li>
                <li>Test new features and improvements;</li>
                <li>Diagnose and fix technical issues.</li>
              </ul>

              <p className="mb-2"><strong>2.3 For Security and Compliance</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Detect, prevent, and respond to fraud, abuse, security incidents, and other harmful activities;</li>
                <li>Enforce our Terms of Service;</li>
                <li>Comply with legal obligations, court orders, and law enforcement requests;</li>
                <li>Protect the rights, property, and safety of Blackjax, LLC, our users, and the public.</li>
              </ul>

              <p className="mb-2"><strong>2.4 For Communication</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Send you important account-related notifications (e.g., password resets, Terms updates);</li>
                <li>Respond to your questions and support requests;</li>
                <li>Send occasional updates about new features or platform announcements (you may opt out of non-essential communications).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. How We Share Your Information</h2>
              <p className="mb-3"><strong>We do not sell your personal information to third parties.</strong> We may share your information in the following circumstances:</p>

              <p className="mb-2"><strong>3.1 Public Information</strong></p>
              <p className="mb-3">
                Certain information is <strong>publicly visible</strong> to all users and visitors of the Service, including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Studio name, bio, and avatar;</li>
                <li>Track titles, descriptions, tags, and audio files;</li>
                <li>Social media links (Spotify, SoundCloud, Instagram, itch.io, website);</li>
                <li>Contact information (email, phone number, Discord username) <strong>if you choose to provide it</strong>.</li>
              </ul>
              <p className="mb-3 italic text-white/60">
                You control what contact information you share. Only provide contact details you are comfortable making public. By uploading Content to VoxelBeat, you consent to VoxelBeat and Blackjax, LLC sharing your Content on external platforms (YouTube, social media, etc.) with attribution linking back to your profile, for the purpose of promoting the Service and driving traffic to your VoxelBeat profile.
              </p>

              <p className="mb-2"><strong>3.2 Service Providers</strong></p>
              <p className="mb-2">We share information with third-party service providers who help us operate the Service, including:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li><strong>Supabase:</strong> Authentication and database hosting (see <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Supabase Privacy Policy</a>);</li>
                <li><strong>Amazon Web Services (AWS):</strong> Cloud storage for audio files via S3 (see <a href="https://aws.amazon.com/privacy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">AWS Privacy Notice</a>);</li>
                <li><strong>OpenAI:</strong> Generating semantic embeddings from track and profile metadata (see <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">OpenAI Privacy Policy</a>);</li>
                <li><strong>Hosting and Infrastructure Providers:</strong> Services that host our website and backend infrastructure.</li>
              </ul>
              <p className="mb-3">
                These providers are contractually required to protect your data and use it only for the purposes we specify.
              </p>

              <p className="mb-2"><strong>3.3 Legal Requirements and Protection of Rights</strong></p>
              <p className="mb-3">We may disclose your information if required to do so by law or in response to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Legal process (subpoenas, court orders, government requests);</li>
                <li>Requests from law enforcement or regulatory authorities;</li>
                <li>Investigations of potential violations of our Terms of Service;</li>
                <li>Efforts to protect the safety, rights, or property of Blackjax, LLC, our users, or the public.</li>
              </ul>

              <p className="mb-2"><strong>3.4 Business Transfers</strong></p>
              <p className="mb-3">
                If <strong>Blackjax, LLC</strong> is involved in a merger, acquisition, sale of assets, or bankruptcy, your information may be transferred as part of that transaction.
                We will notify you via email or a prominent notice on the Service before your information is transferred and becomes subject to a different privacy policy.
              </p>

              <p className="mb-2"><strong>3.5 With Your Consent</strong></p>
              <p className="mb-3">
                We may share your information for other purposes with your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Data Retention</h2>
              <p className="mb-2">We retain your information for as long as necessary to provide the Service and fulfill the purposes described in this Privacy Policy:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li><strong>Account Data:</strong> We retain your account information until you delete your account.</li>
                <li><strong>Uploaded Content:</strong> Audio files and metadata are retained until you delete them or delete your account.</li>
                <li><strong>Usage Data and Logs:</strong> We retain logs and analytics data for up to 90 days for security and performance monitoring.</li>
                <li><strong>Legal Obligations:</strong> We may retain certain data longer if required by law or to resolve disputes.</li>
              </ul>
              <p>
                When you delete your account, we permanently delete your profile, tracks, and associated data from our active systems within 30 days.
                Cached or archived copies may persist in backups for up to 90 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Data Security</h2>
              <p className="mb-2">
                We take data security seriously and implement industry-standard technical and organizational measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Encryption in transit (HTTPS/TLS) and at rest (encrypted database and file storage);</li>
                <li>Secure authentication via Supabase with hashed and salted passwords;</li>
                <li>Access controls and role-based permissions to limit who can access your data;</li>
                <li>Regular security assessments and monitoring for vulnerabilities;</li>
                <li>Secure presigned URLs for time-limited access to audio files.</li>
              </ul>
              <p className="mb-2">
                However, <strong>no method of transmission or storage is 100% secure</strong>. While we strive to protect your information, we cannot guarantee absolute security.
                You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Your Privacy Rights</h2>
              <p className="mb-3">Depending on your location, you may have the following rights regarding your personal information:</p>

              <p className="mb-2"><strong>6.1 Access and Portability</strong></p>
              <p className="mb-3">
                You have the right to access and download a copy of your personal information. You can view and manage your profile and tracks through your account settings.
                To request a complete data export, contact us at <a href="mailto:contact@blackjaxstudio.com" className="underline hover:text-white">contact@blackjaxstudio.com</a>.
              </p>

              <p className="mb-2"><strong>6.2 Correction</strong></p>
              <p className="mb-3">
                You can update your profile information, track metadata, and contact details at any time through your account settings.
              </p>

              <p className="mb-2"><strong>6.3 Deletion</strong></p>
              <p className="mb-3">
                You can delete individual tracks or your entire account through your account settings. Upon deletion, your data will be permanently removed within 30 days.
                Note that publicly shared information may have been cached or copied by other users or search engines before deletion.
              </p>

              <p className="mb-2"><strong>6.4 Opt-Out of Marketing Communications</strong></p>
              <p className="mb-3">
                You can opt out of non-essential marketing emails by clicking the "unsubscribe" link in any marketing email or by contacting us.
                You cannot opt out of essential account-related notifications (e.g., security alerts, Terms updates).
              </p>

              <p className="mb-2"><strong>6.5 Rights Under GDPR (European Users)</strong></p>
              <p className="mb-2">If you are located in the European Economic Area (EEA), UK, or Switzerland, you have additional rights under the General Data Protection Regulation (GDPR):</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Right to object to processing of your data;</li>
                <li>Right to restrict processing;</li>
                <li>Right to withdraw consent (where processing is based on consent);</li>
                <li>Right to lodge a complaint with your local data protection authority.</li>
              </ul>

              <p className="mb-2"><strong>6.6 Rights Under CCPA (California Users)</strong></p>
              <p className="mb-2">If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA), including:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Right to know what personal information we collect, use, and share;</li>
                <li>Right to request deletion of your personal information;</li>
                <li>Right to opt out of the "sale" of your personal information (note: we do not sell personal information);</li>
                <li>Right to non-discrimination for exercising your privacy rights.</li>
              </ul>

              <p className="mb-2"><strong>To exercise your rights, contact us at <a href="mailto:contact@blackjaxstudio.com" className="underline hover:text-white">contact@blackjaxstudio.com</a>.</strong></p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. International Data Transfers</h2>
              <p className="mb-2">
                The Service is operated in the United States. If you are located outside the United States, your information will be transferred to, stored, and processed in the United States,
                where data protection laws may differ from those in your jurisdiction.
              </p>
              <p className="mb-2">
                By using the Service, you consent to the transfer of your information to the United States and other countries where our service providers operate.
                We take steps to ensure that your data is protected in accordance with this Privacy Policy, regardless of where it is processed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Cookies and Tracking Technologies</h2>
              <p className="mb-2">We use cookies and similar technologies to enhance your experience and collect usage data:</p>

              <p className="mb-2"><strong>8.1 Types of Cookies We Use</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li><strong>Essential Cookies:</strong> Required for authentication, session management, and core functionality.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service (e.g., page views, clicks, search queries).</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., visualizer style, volume level).</li>
              </ul>

              <p className="mb-2"><strong>8.2 Managing Cookies</strong></p>
              <p className="mb-3">
                You can control cookies through your browser settings. Note that disabling essential cookies may affect the functionality of the Service.
                Most browsers allow you to block third-party cookies while still accepting first-party cookies.
              </p>

              <p className="mb-2"><strong>8.3 Do Not Track</strong></p>
              <p className="mb-3">
                We do not currently respond to "Do Not Track" (DNT) signals, as there is no industry-standard definition of how to interpret them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. Children's Privacy</h2>
              <p className="mb-2">
                The Service is not intended for children under the age of 13 (or the applicable age of digital consent in your jurisdiction).
                We do not knowingly collect personal information from children under 13.
              </p>
              <p className="mb-2">
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:contact@blackjaxstudio.com" className="underline hover:text-white">contact@blackjaxstudio.com</a>.
                We will promptly delete such information from our systems.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">10. Third-Party Links and Services</h2>
              <p className="mb-2">
                The Service may contain links to third-party websites and services (e.g., Spotify, SoundCloud, Instagram, itch.io, personal websites).
                We are not responsible for the privacy practices or content of these third-party sites.
              </p>
              <p className="mb-2">
                We encourage you to review the privacy policies of any third-party services you interact with.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">11. Changes to This Privacy Policy</h2>
              <p className="mb-2">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
                When we make material changes, we will notify you by:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Sending an email to the address associated with your account;</li>
                <li>Posting a prominent notice on the Service;</li>
                <li>Updating the "Effective Date" at the top of this Privacy Policy.</li>
              </ul>
              <p className="mb-2">
                We encourage you to review this Privacy Policy periodically. Your continued use of the Service after changes take effect constitutes your acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">12. Contact Us</h2>
              <p className="mb-2">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <p className="mt-2">
                <strong>Blackjax, LLC</strong><br />
                Email: <a href="mailto:contact@blackjaxstudio.com" className="underline hover:text-white">contact@blackjaxstudio.com</a>
              </p>
              <p className="mt-3">
                We will respond to privacy inquiries within 30 days.
              </p>
            </section>

            <p className="text-white/50 text-xs pt-6 border-t border-white/10">
              Last updated: March 21, 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
