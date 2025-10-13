import { ContentWrapper } from "@/components/content-wrapper";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function TermsOfServicePage() {
  return (
    <ContentWrapper>
      <div className="max-w-4xl mx-auto py-12 space-y-8">
        <div className="text-center mb-12">
          <Heading size="h1">Terms of Service</Heading>
          <Text className="text-muted-foreground mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <Heading size="h2">Agreement to Terms</Heading>
            <Text className="mt-4">
              Welcome to MapBuddi. These Terms of Service (&ldquo;Terms&rdquo;) govern your use of our website and services. By accessing or using MapBuddi, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
            </Text>
          </section>

          {/* Description of Service */}
          <section>
            <Heading size="h2">Description of Service</Heading>
            <Text className="mt-4">
              MapBuddi is a platform that allows users to create, share, and purchase curated location lists and points of interest (POIs). Our services include:
            </Text>
            <ul className="list-disc list-inside mt-4 space-y-1 text-sm">
              <li>Creating and managing location lists</li>
              <li>Purchasing location lists from other users</li>
              <li>Integrating with Google Maps for navigation</li>
              <li>Social media verification for sellers</li>
              <li>Review and rating system</li>
              <li>Payment processing for transactions</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <Heading size="h2">User Accounts</Heading>
            <div className="mt-4 space-y-4">
              <div>
                <Heading size="h3">Account Creation</Heading>
                <Text className="mt-2">
                  To use certain features of our service, you must create an account. You agree to:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Account Termination</Heading>
                <Text className="mt-2">
                  We may terminate or suspend your account at any time for violations of these Terms or for any other reason at our sole discretion.
                </Text>
              </div>
            </div>
          </section>

          {/* User Content */}
          <section>
            <Heading size="h2">User Content</Heading>
            <div className="mt-4 space-y-4">
              <div>
                <Heading size="h3">Content You Create</Heading>
                <Text className="mt-2">
                  You retain ownership of the content you create on MapBuddi, including location lists, POIs, reviews, and descriptions. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with our services.
                </Text>
              </div>

              <div>
                <Heading size="h3">Content Standards</Heading>
                <Text className="mt-2">
                  All content must comply with our standards. You agree not to post content that:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Is illegal, harmful, or violates any laws</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains false or misleading information</li>
                  <li>Is spam, harassment, or abusive</li>
                  <li>Contains personal information of others without consent</li>
                  <li>Promotes illegal activities or violence</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Content Moderation</Heading>
                <Text className="mt-2">
                  We reserve the right to review, modify, or remove any content at our discretion. We may also suspend or terminate accounts that repeatedly violate our content standards.
                </Text>
              </div>
            </div>
          </section>

          {/* Google Drive Integration */}
          <section>
            <Heading size="h2">Google Drive Integration</Heading>
            <div className="mt-4 space-y-4">
              <div>
                <Heading size="h3">Service Description</Heading>
                <Text className="mt-2">
                  MapBuddi offers optional integration with Google Drive to create KML files of your purchased location lists. This feature requires you to authorize MapBuddi to access your Google Drive using OAuth 2.0 authentication.
                </Text>
              </div>

              <div>
                <Heading size="h3">Your Rights and Our Rights</Heading>
                <Text className="mt-2">
                  <strong>Your Rights:</strong>
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>You retain full ownership of all files created in your Google Drive</li>
                  <li>You can revoke MapBuddi&apos;s access to your Google Drive at any time</li>
                  <li>You can delete, move, or modify any KML files we create</li>
                  <li>You can disconnect the integration from your MapBuddi account settings</li>
                </ul>
                <Text className="mt-2">
                  <strong>Our Rights:</strong>
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>We may suspend or terminate Google Drive integration features for violations of these Terms</li>
                  <li>We may discontinue Google Drive integration with reasonable notice</li>
                  <li>We may impose reasonable limits on file creation to prevent abuse</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">User Responsibilities</Heading>
                <Text className="mt-2">
                  When using Google Drive integration, you agree to:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li><strong>Maintain adequate Google Drive storage:</strong> Ensure you have sufficient Google Drive storage space for KML files</li>
                  <li><strong>Comply with Google&apos;s Terms:</strong> Abide by Google&apos;s Terms of Service and Acceptable Use Policy</li>
                  <li><strong>No malicious files:</strong> Do not attempt to use our service to create or upload malicious files, viruses, or harmful code</li>
                  <li><strong>No copyright infringement:</strong> Ensure you have the right to sync and store location data you purchase</li>
                  <li><strong>Respect file limits:</strong> Do not abuse the sync feature by creating excessive files or attempting to circumvent rate limits</li>
                  <li><strong>Maintain Google account access:</strong> You are responsible for maintaining access to your Google account and Google Drive</li>
                  <li><strong>Backup important data:</strong> While we make reasonable efforts to create files correctly, you should maintain backups of any critical data</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Data Ownership and License</Heading>
                <Text className="mt-2">
                  <strong>Ownership:</strong>
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>You own all KML files created in your Google Drive</li>
                  <li>The underlying location data is owned by the original content creator (seller)</li>
                  <li>Your purchase grants you a personal, non-transferable license to use the location data</li>
                  <li>You may not redistribute or resell the KML files or location data</li>
                </ul>
                <Text className="mt-2">
                  <strong>License to MapBuddi:</strong>
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>By using Google Drive integration, you grant us permission to create files in your Drive</li>
                  <li>We only access files that we create; we cannot access your other Google Drive files</li>
                  <li>This license terminates when you disconnect Google Drive integration or delete your account</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Service Availability</Heading>
                <Text className="mt-2">
                  Google Drive integration is provided &ldquo;as is&rdquo; and depends on:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Google Drive API availability and functionality</li>
                  <li>Your Google account remaining in good standing</li>
                  <li>Sufficient storage space in your Google Drive</li>
                  <li>Valid OAuth tokens and authentication</li>
                </ul>
                <Text className="mt-2">
                  We do not guarantee uninterrupted access to Google Drive integration and may experience downtime due to factors beyond our control, including Google API changes or outages.
                </Text>
              </div>

              <div>
                <Heading size="h3">Limitations and Restrictions</Heading>
                <Text className="mt-2">
                  The following limitations apply to Google Drive integration:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>File sync may be delayed or queued during high traffic periods</li>
                  <li>Very large location lists may be subject to file size limitations</li>
                  <li>Sync attempts may fail if your Google Drive is full or if Google APIs are unavailable</li>
                  <li>We reserve the right to impose rate limits to prevent abuse</li>
                  <li>Synced files remain in your Drive even after disconnecting (you must manually delete them)</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Troubleshooting and Support</Heading>
                <Text className="mt-2">
                  If you experience issues with Google Drive integration:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Check that your Google account is connected and authorized</li>
                  <li>Verify you have sufficient Google Drive storage space</li>
                  <li>Try disconnecting and reconnecting your Google account</li>
                  <li>Contact our support team at contact@mapbuddi.com if issues persist</li>
                </ul>
                <Text className="mt-2">
                  While we provide reasonable support, we cannot guarantee resolution of issues caused by Google API changes, Google account problems, or third-party factors beyond our control.
                </Text>
              </div>
            </div>
          </section>

          {/* Purchases and Payments */}
          <section>
            <Heading size="h2">Purchases and Payments</Heading>
            <div className="mt-4 space-y-4">
              <div>
                <Heading size="h3">Platform as Payment Facilitator</Heading>
                <Text className="mt-2">
                  MapBuddi operates as a payment facilitator and agent on behalf of sellers. When you purchase a location list, the full payment is collected by MapBuddi, which then:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Retains a 10% platform commission as our service fee</li>
                  <li>Remits the remaining 90% to the seller</li>
                  <li>Acts as an intermediary in the transaction</li>
                </ul>
                <Text className="mt-2">
                  You receive a personal, non-transferable license to access and use the purchased content for your personal use. You do not acquire ownership of the content itself.
                </Text>
              </div>

              <div>
                <Heading size="h3">Payment Processing</Heading>
                <Text className="mt-2">
                  All payments are processed through Stripe. By making a purchase, you agree to Stripe&apos;s terms of service. We do not store your payment information on our servers.
                </Text>
              </div>

              <div>
                <Heading size="h3">Refunds and Australian Consumer Law</Heading>
                <Text className="mt-2">
                  Under Australian Consumer Law, you have certain rights regarding refunds and guarantees. We will provide refunds in the following circumstances:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>If the product is not as described or has a major fault</li>
                  <li>If the product is not fit for its intended purpose</li>
                  <li>If technical issues prevent access to purchased content</li>
                  <li>As otherwise required by Australian Consumer Law</li>
                </ul>
                <Text className="mt-2">
                  To request a refund, please contact us at contact@mapbuddi.com with your order details and reason for the refund request.
                </Text>
              </div>

              <div>
                <Heading size="h3">Seller Tax Obligations</Heading>
                <Text className="mt-2">
                  <strong>Important:</strong> Sellers are responsible for their own tax obligations, including:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Declaring and paying income tax on their earnings (90% of sale price)</li>
                  <li>Registering for and paying Goods and Services Tax (GST) if applicable</li>
                  <li>Obtaining an Australian Business Number (ABN) if required</li>
                  <li>Maintaining proper business records for tax purposes</li>
                  <li>Complying with all applicable Australian tax laws</li>
                </ul>
                <Text className="mt-2">
                  MapBuddi&apos;s taxable income is limited to our 10% platform commission. We do not provide tax advice, and sellers should consult with a qualified tax professional regarding their specific obligations.
                </Text>
              </div>

              <div>
                <Heading size="h3">Seller Responsibilities</Heading>
                <Text className="mt-2">
                  If you sell location lists on our platform, you agree to:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Provide accurate and high-quality content</li>
                  <li>Ensure you have the right to sell the content</li>
                  <li>Comply with all applicable tax obligations as outlined above</li>
                  <li>Respond to customer inquiries in a timely manner</li>
                  <li>Maintain accurate business records</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Social Media Verification */}
          <section>
            <Heading size="h2">Social Media Verification</Heading>
            <Text className="mt-4">
              Our social media verification system allows sellers to verify their social media accounts through OAuth. By using this feature, you agree that:
            </Text>
            <ul className="list-disc list-inside mt-4 space-y-1 text-sm">
              <li>You own and control the social media accounts you verify</li>
              <li>We may display your verified social media links on your public profile</li>
              <li>You can remove verification at any time</li>
              <li>False verification attempts may result in account suspension</li>
            </ul>
          </section>

          {/* Prohibited Uses */}
          <section>
            <Heading size="h2">Prohibited Uses</Heading>
            <Text className="mt-4">
              You agree not to use MapBuddi for any of the following purposes:
            </Text>
            <ul className="list-disc list-inside mt-4 space-y-1 text-sm">
              <li>Any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>Violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>Infringing upon or violating our intellectual property rights or the intellectual property rights of others</li>
              <li>Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating</li>
              <li>Submitting false or misleading information</li>
              <li>Uploading or transmitting viruses or any other type of malicious code</li>
              <li>Collecting or tracking the personal information of others</li>
              <li>Spamming, phishing, pharming, pretext, spider, crawl, or scrape</li>
              <li>Any obscene or immoral purpose</li>
              <li>Interfering with or circumventing the security features of our service</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <Heading size="h2">Intellectual Property Rights</Heading>
            <Text className="mt-4">
              MapBuddi and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </Text>
            <Text className="mt-4">
              Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </Text>
          </section>

          {/* Privacy */}
          <section>
            <Heading size="h2">Privacy Policy</Heading>
            <Text className="mt-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices.
            </Text>
          </section>

          {/* Disclaimers */}
          <section>
            <Heading size="h2">Disclaimers</Heading>
            <div className="mt-4 space-y-4">
              <div>
                <Heading size="h3">Service Availability</Heading>
                <Text className="mt-2">
                  We do not guarantee that our service will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the service.
                </Text>
              </div>

              <div>
                <Heading size="h3">Location Accuracy</Heading>
                <Text className="mt-2">
                  While we strive for accuracy, we cannot guarantee that all location information is current, complete, or accurate. Users should verify location information independently.
                </Text>
              </div>

              <div>
                <Heading size="h3">Third-Party Services</Heading>
                <Text className="mt-2">
                  Our service integrates with third-party services including Google Maps, Google Drive, Stripe, and social media platforms. We are not responsible for the availability or functionality of these third-party services.
                </Text>
              </div>

              <div>
                <Heading size="h3">Google Drive Integration Disclaimers</Heading>
                <Text className="mt-2">
                  With respect to Google Drive integration, we specifically disclaim:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li><strong>No guarantee of file integrity:</strong> While we make reasonable efforts, we cannot guarantee that KML files will be created perfectly or without errors</li>
                  <li><strong>No guarantee of sync success:</strong> File synchronization may fail due to network issues, API limitations, Google account problems, or other factors</li>
                  <li><strong>No responsibility for Google actions:</strong> We are not responsible if Google suspends your account, changes APIs, or modifies Drive functionality</li>
                  <li><strong>No guarantee of data preservation:</strong> You are responsible for backing up any critical data; we do not guarantee permanent retention of files in your Drive</li>
                  <li><strong>No guarantee of compatibility:</strong> KML files are created in good faith but may not be compatible with all mapping applications or future Google My Maps versions</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">No Warranty</Heading>
                <Text className="mt-2">
                  OUR SERVICES, INCLUDING GOOGLE DRIVE INTEGRATION, ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </Text>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <Heading size="h2">Limitation of Liability</Heading>
            <div className="mt-4 space-y-4">
              <Text>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, INCLUDING AUSTRALIAN CONSUMER LAW WHERE APPLICABLE, MAPBUDDI SHALL NOT BE LIABLE FOR:
              </Text>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Any loss of profits or revenues, whether incurred directly or indirectly</li>
                <li>Any loss of data, use, goodwill, or other intangible losses</li>
                <li>Any damages resulting from your use of or inability to use our services</li>
                <li>Any damages resulting from unauthorized access to or alteration of your transmissions or data</li>
              </ul>

              <div>
                <Heading size="h3">Data Loss and Google Drive Integration</Heading>
                <Text className="mt-2">
                  Without limiting the generality of the above, we specifically disclaim liability for:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li><strong>Data loss:</strong> Loss or corruption of data stored in your Google Drive, including KML files we create</li>
                  <li><strong>Sync failures:</strong> Failed synchronizations, incomplete file transfers, or partial data uploads</li>
                  <li><strong>File deletion:</strong> Accidental or unintended deletion of files from your Google Drive</li>
                  <li><strong>Access loss:</strong> Loss of access to your Google account or Drive files for any reason</li>
                  <li><strong>Google API changes:</strong> Changes to Google APIs that affect functionality or data access</li>
                  <li><strong>Third-party actions:</strong> Actions taken by Google, including account suspension, API rate limiting, or service termination</li>
                  <li><strong>File format issues:</strong> Incompatibility of KML files with Google My Maps or other applications</li>
                  <li><strong>Storage limitations:</strong> Issues arising from insufficient Google Drive storage space</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Australian Consumer Law</Heading>
                <Text className="mt-2">
                  Nothing in these Terms excludes, restricts, or modifies any consumer guarantee, right, or remedy conferred by the Australian Consumer Law or any other applicable law that cannot be excluded, restricted, or modified by agreement. Subject to the foregoing, our liability for breach of any consumer guarantee that cannot be excluded is limited, at our option, to:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>In the case of goods: replacement or repair of the goods, or payment of the cost of replacement or repair</li>
                  <li>In the case of services: supply of the services again, or payment of the cost of having the services supplied again</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Maximum Liability</Heading>
                <Text className="mt-2">
                  To the extent permitted by law, our total liability to you for all claims arising out of or related to your use of our services, including Google Drive integration, shall not exceed the greater of:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>The amount you paid to MapBuddi in the 12 months prior to the event giving rise to liability; or</li>
                  <li>One hundred Australian dollars (AUD $100)</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Your Responsibility</Heading>
                <Text className="mt-2">
                  You acknowledge and agree that:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>You are solely responsible for maintaining backups of any important data</li>
                  <li>You assume all risk associated with using Google Drive integration</li>
                  <li>You should verify the integrity and accuracy of synced files</li>
                  <li>You are responsible for monitoring your Google Drive storage and account status</li>
                  <li>We strongly recommend backing up any critical location data independently</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <Heading size="h2">Indemnification</Heading>
            <Text className="mt-4">
              You agree to defend, indemnify, and hold us harmless from and against any loss, damage, liability, claim, or demand, including reasonable attorneys&apos; fees and expenses, made by any third party due to or arising out of your use of our service, violation of these Terms, or infringement of any intellectual property or other right of any person or entity.
            </Text>
          </section>

          {/* Governing Law */}
          <section>
            <Heading size="h2">Governing Law</Heading>
            <Text className="mt-4">
              These Terms shall be interpreted and governed by the laws of Australia, without regard to its conflict of law provisions. Any disputes arising from these Terms will be resolved in the courts of Australia. These Terms are subject to Australian Consumer Law and other applicable Australian legislation.
            </Text>
          </section>

          {/* Changes to Terms */}
          <section>
            <Heading size="h2">Changes to Terms</Heading>
            <Text className="mt-4">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on our website and updating the &ldquo;Last updated&rdquo; date. Your continued use of our service after changes become effective constitutes acceptance of the new Terms.
            </Text>
          </section>

          {/* Contact Information */}
          <section>
            <Heading size="h2">Contact Us</Heading>
            <Text className="mt-4">
              If you have any questions about these Terms of Service, please contact us at:
            </Text>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Text><strong>Email:</strong> <a href="mailto:contact@mapbuddi.com" className="text-blue-600 hover:underline">contact@mapbuddi.com</a></Text>
              <Text><strong>Company:</strong> Khop Media Pty Ltd</Text>
              <Text><strong>ABN:</strong> 77 673 029 117</Text>
            </div>
          </section>
        </div>
      </div>
    </ContentWrapper>
  );
}
