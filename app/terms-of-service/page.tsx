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

          {/* Purchases and Payments */}
          <section>
            <Heading size="h2">Purchases and Payments</Heading>
            <div className="mt-4 space-y-4">
              <div>
                <Heading size="h3">Purchasing Location Lists</Heading>
                <Text className="mt-2">
                  When you purchase a location list, you receive a personal, non-transferable license to access and use that content for your personal use. You do not acquire ownership of the content itself.
                </Text>
              </div>

              <div>
                <Heading size="h3">Payment Processing</Heading>
                <Text className="mt-2">
                  All payments are processed through Stripe. By making a purchase, you agree to Stripe&apos;s terms of service. We do not store your payment information on our servers.
                </Text>
              </div>

              <div>
                <Heading size="h3">Refunds</Heading>
                <Text className="mt-2">
                  Due to the digital nature of our products, all sales are final. We do not offer refunds except as required by law or in cases of technical issues that prevent access to purchased content.
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
                  <li>Comply with applicable tax obligations</li>
                  <li>Respond to customer inquiries in a timely manner</li>
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
                  Our service integrates with third-party services including Google Maps, Stripe, and social media platforms. We are not responsible for the availability or functionality of these third-party services.
                </Text>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <Heading size="h2">Limitation of Liability</Heading>
            <Text className="mt-4">
              To the fullest extent permitted by applicable law, MapBuddi shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </Text>
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
              These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms will be resolved in the courts of [Your Jurisdiction].
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
