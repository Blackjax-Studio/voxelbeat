"use client";

import { useEffect } from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || "Blackjax, LLC";
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "VoxelBeat";
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@blackjaxstudio.com";

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
          <h1 className="text-3xl font-['Anton'] text-white mb-6">Terms of Service</h1>

          <div className="space-y-6 text-white/80 text-sm leading-relaxed">
            <section>
              <p className="text-white/60 mb-4">
                <strong>Effective Date:</strong> March 21, 2026
              </p>
              <p className="mb-4">
                Welcome to {appName}, a music discovery platform operated by <strong>{companyName}</strong>.
                These Terms of Service ("Terms") govern your access to and use of the {appName} website, services, and platform
                (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="mb-4">
                If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Definitions</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>"Service"</strong> means the {appName} platform, website, and all related services provided by {companyName}.</li>
                <li><strong>"User," "you,"</strong> and <strong>"your"</strong> refer to any individual or entity accessing or using the Service.</li>
                <li><strong>"Artist"</strong> refers to Users who upload music content to the platform.</li>
                <li><strong>"Content"</strong> includes all text, audio files, images, metadata, profiles, and other materials uploaded or shared through the Service.</li>
                <li><strong>"We," "us,"</strong> and <strong>"our"</strong> refer to {companyName}.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Eligibility</h2>
              <p className="mb-2">To use the Service, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be at least 13 years of age (or the age of digital consent in your jurisdiction);</li>
                <li>If you are under 18, you must have parental or guardian consent to use the Service;</li>
                <li>Provide accurate, current, and complete information during registration;</li>
                <li>Not be prohibited from using the Service under applicable laws or previous Terms violations.</li>
              </ul>
              <p className="mt-3">
                By creating an account, you represent and warrant that you meet these eligibility requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Account Registration and Security</h2>
              <p className="mb-2"><strong>3.1 Account Creation:</strong> To upload Content or access certain features, you must create an account by providing a valid email address and password. You are responsible for maintaining the confidentiality of your login credentials.</p>
              <p className="mb-2"><strong>3.2 Account Responsibility:</strong> You are solely responsible for all activities that occur under your account. You must immediately notify us at <a href={`mailto:${contactEmail}`} className="underline hover:text-white">{contactEmail}</a> if you suspect unauthorized access to your account.</p>
              <p className="mb-2"><strong>3.3 One Account Per User:</strong> You may not create multiple accounts to circumvent platform restrictions or manipulate search rankings.</p>
              <p className="mb-2"><strong>3.4 Account Termination by You:</strong> You may delete your account at any time through your account settings. Upon deletion, your profile and uploaded tracks will be permanently removed from the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. User Content and Intellectual Property Rights</h2>
              <p className="mb-2"><strong>4.1 Ownership:</strong> You retain all ownership rights to the Content you upload to the Service. We do not claim ownership of your music, artwork, or other creative materials.</p>
              <p className="mb-2"><strong>4.2 License Grant to Us:</strong> By uploading Content, you grant {companyName} and {appName} a non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                <li>Host, store, reproduce, and display your Content on the Service;</li>
                <li>Stream and distribute your Content to users of the Service;</li>
                <li>Generate vector embeddings and metadata from your Content to enable semantic search functionality;</li>
                <li>Promote the Service using your Content (e.g., in marketing materials, social media);</li>
                <li>Post, share, and distribute your Content on third-party platforms (including but not limited to YouTube, SoundCloud, Spotify, Instagram, TikTok, X/Twitter, and other social media or music platforms) for the purpose of promoting the Service and driving traffic to {appName};</li>
                <li>Create excerpts, clips, previews, or derivative promotional materials from your Content for marketing and promotional purposes;</li>
                <li>Make your publicly shared profile information and contact details visible to other users;</li>
                <li>Include attribution and links back to your {appName} profile when sharing your Content on external platforms.</li>
              </ul>
              <p className="mb-2">This license exists only for the purpose of operating, improving, and promoting the Service and terminates when you delete your Content or account, except for Content that has been shared or cached by third parties or posted to external platforms prior to deletion.</p>
              <p className="mb-2"><strong>4.3 Representations and Warranties:</strong> By uploading Content, you represent and warrant that:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                <li>You own all rights to the Content or have obtained all necessary licenses, permissions, and consents;</li>
                <li>Your Content does not infringe, misappropriate, or violate any third-party intellectual property rights, privacy rights, or other rights;</li>
                <li>Your Content complies with all applicable laws and regulations;</li>
                <li>Your Content does not contain malware, viruses, or other harmful code.</li>
              </ul>
              <p className="mb-2"><strong>4.4 Content Removal:</strong> We reserve the right to remove any Content that violates these Terms, infringes third-party rights, or is otherwise objectionable, without prior notice.</p>
              <p className="mb-2"><strong>4.5 DMCA and Copyright Infringement:</strong> We respect intellectual property rights. If you believe Content on the Service infringes your copyright, please submit a DMCA takedown notice to <a href={`mailto:${contactEmail}`} className="underline hover:text-white">{contactEmail}</a> with the following information:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Identification of the copyrighted work claimed to be infringed;</li>
                <li>Identification of the infringing material and its location on the Service;</li>
                <li>Your contact information (name, address, email, phone number);</li>
                <li>A statement that you have a good faith belief that use of the material is not authorized;</li>
                <li>A statement that the information in the notice is accurate and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner;</li>
                <li>Your physical or electronic signature.</li>
              </ul>
              <p className="mt-2">Repeat infringers will have their accounts terminated.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Prohibited Conduct</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upload Content that you do not have the right to share, including copyrighted music, samples, or recordings without proper authorization;</li>
                <li>Upload Content that is illegal, obscene, defamatory, harassing, threatening, hateful, or discriminatory;</li>
                <li>Impersonate any person or entity, or falsely represent your affiliation with any person or entity;</li>
                <li>Use the Service to spam, phish, or distribute malware;</li>
                <li>Scrape, harvest, or collect data from the Service using automated means (bots, crawlers, scripts) without our express written permission;</li>
                <li>Reverse-engineer, decompile, or attempt to extract source code from the Service;</li>
                <li>Interfere with or disrupt the integrity or performance of the Service or its underlying infrastructure;</li>
                <li>Circumvent any security features or access controls of the Service;</li>
                <li>Use the Service for any unlawful purpose or in violation of any applicable laws;</li>
                <li>Harass, abuse, threaten, or intimidate other users;</li>
                <li>Upload Content containing personal information of others without their consent;</li>
                <li>Manipulate play counts, search rankings, or other platform metrics through artificial means.</li>
              </ul>
              <p className="mt-3">
                Violation of these prohibitions may result in immediate account suspension or termination, and we may report illegal activity to law enforcement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Public Profiles and Contact Information</h2>
              <p className="mb-2">
                {appName} is designed to connect artists with game developers. By completing your profile with contact information (email, phone number, Discord username),
                you acknowledge and agree that this information will be <strong>publicly visible</strong> to all users of the Service.
              </p>
              <p className="mb-2">
                <strong>You are solely responsible</strong> for deciding what contact information to share. We recommend:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Using a dedicated business email or contact form rather than personal email;</li>
                <li>Not sharing sensitive personal information (home address, personal phone numbers) unless necessary;</li>
                <li>Being aware that publicly shared contact details may be used by third parties outside our control.</li>
              </ul>
              <p className="mt-2">
                We are not responsible for how third parties use your publicly shared contact information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Third-Party Services and Links</h2>
              <p className="mb-2">
                The Service integrates with third-party services, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                <li>Supabase (authentication and database)</li>
                <li>Amazon Web Services (AWS S3 for file storage)</li>
                <li>OpenAI (for generating semantic embeddings)</li>
              </ul>
              <p className="mb-2">
                We may also display links to external websites (Spotify, SoundCloud, Instagram, itch.io, personal websites).
                We are not responsible for the content, privacy practices, or terms of service of these third-party services.
                Your use of third-party services is governed by their respective terms and policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Disclaimers and Limitation of Liability</h2>
              <p className="mb-2"><strong>8.1 "AS IS" Disclaimer:</strong> THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</p>
              <p className="mb-2"><strong>8.2 No Guarantee of Availability:</strong> We do not guarantee that the Service will be uninterrupted, secure, or error-free. We may suspend or discontinue the Service at any time without notice.</p>
              <p className="mb-2"><strong>8.3 No Guarantee of Results:</strong> We do not guarantee that uploading music will result in licensing opportunities, income, or any specific outcome. The Service is a discovery platform, not a licensing or distribution service.</p>
              <p className="mb-2"><strong>8.4 User Content Disclaimer:</strong> We do not endorse, verify, or guarantee the accuracy, legality, or quality of user-uploaded Content. Users interact with Content and other users at their own risk.</p>
              <p className="mb-2"><strong>8.5 Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, {companyName.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
              <p className="mb-2"><strong>8.6 Cap on Liability:</strong> OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $100 USD, WHICHEVER IS GREATER.</p>
              <p className="mt-2">
                Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so the above limitations may not apply to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless {companyName}, its officers, directors, employees, agents, and affiliates
                from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or related to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Your use of the Service;</li>
                <li>Your Content;</li>
                <li>Your violation of these Terms;</li>
                <li>Your infringement of any third-party rights, including intellectual property or privacy rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">10. Termination and Suspension</h2>
              <p className="mb-2"><strong>10.1 Termination by Us:</strong> We reserve the right to suspend or terminate your account and access to the Service at any time, with or without cause, with or without notice, including if:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                <li>You violate these Terms;</li>
                <li>You engage in fraudulent, abusive, or illegal activity;</li>
                <li>We are required to do so by law;</li>
                <li>We discontinue the Service.</li>
              </ul>
              <p className="mb-2"><strong>10.2 Effect of Termination:</strong> Upon termination, your right to use the Service will immediately cease. We may delete your account and Content, though cached or shared Content may persist.</p>
              <p className="mb-2"><strong>10.3 Survival:</strong> Sections 4 (Intellectual Property), 8 (Disclaimers), 9 (Indemnification), 11 (Dispute Resolution), and 12 (General Provisions) will survive termination.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">11. Dispute Resolution and Governing Law</h2>
              <p className="mb-2"><strong>11.1 Governing Law:</strong> These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles.</p>
              <p className="mb-2"><strong>11.2 Informal Resolution:</strong> Before filing a claim, you agree to contact us at <a href={`mailto:${contactEmail}`} className="underline hover:text-white">{contactEmail}</a> to attempt to resolve the dispute informally.</p>
              <p className="mb-2"><strong>11.3 Binding Arbitration:</strong> If we cannot resolve the dispute informally, you agree that any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules. The arbitration will be conducted in Delaware or remotely via video conference. Judgment on the arbitration award may be entered in any court having jurisdiction.</p>
              <p className="mb-2"><strong>11.4 Class Action Waiver:</strong> YOU AGREE THAT DISPUTES WILL BE RESOLVED ON AN INDIVIDUAL BASIS ONLY, AND NOT AS PART OF A CLASS ACTION, CONSOLIDATED ACTION, OR REPRESENTATIVE ACTION.</p>
              <p className="mb-2"><strong>11.5 Exceptions:</strong> Either party may bring a claim in small claims court if it qualifies, or seek injunctive relief in court to protect intellectual property rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">12. General Provisions</h2>
              <p className="mb-2"><strong>12.1 Changes to Terms:</strong> We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or through a prominent notice on the Service at least 30 days before the changes take effect. Your continued use of the Service after the effective date constitutes acceptance of the updated Terms.</p>
              <p className="mb-2"><strong>12.2 Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and {companyName} regarding the Service and supersede any prior agreements.</p>
              <p className="mb-2"><strong>12.3 Severability:</strong> If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.</p>
              <p className="mb-2"><strong>12.4 Waiver:</strong> Our failure to enforce any provision of these Terms does not constitute a waiver of that provision.</p>
              <p className="mb-2"><strong>12.5 Assignment:</strong> You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms without restriction.</p>
              <p className="mb-2"><strong>12.6 No Agency:</strong> Nothing in these Terms creates a partnership, joint venture, or agency relationship between you and {companyName}.</p>
              <p className="mb-2"><strong>12.7 Force Majeure:</strong> We are not liable for any failure or delay in performance due to circumstances beyond our reasonable control.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">13. Contact Information</h2>
              <p>
                If you have questions or concerns about these Terms, please contact us:
              </p>
              <p className="mt-2">
                <strong>{companyName}</strong><br />
                Email: <a href={`mailto:${contactEmail}`} className="underline hover:text-white">{contactEmail}</a>
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
