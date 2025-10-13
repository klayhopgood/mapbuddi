import { ContentWrapper } from "@/components/content-wrapper";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function PrivacyPolicyPage() {
  return (
    <ContentWrapper>
      <div className="max-w-4xl mx-auto py-12 space-y-8">
        <div className="text-center mb-12">
          <Heading size="h1">Privacy Policy</Heading>
          <Text className="text-muted-foreground mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <Heading size="h2">Introduction</Heading>
            <Text className="mt-4">
              Welcome to MapBuddi (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </Text>
          </section>

          {/* Information We Collect */}
          <section>
            <Heading size="h2">Information We Collect</Heading>
            <div className="mt-4 space-y-4">
              <div>
                <Heading size="h3">Personal Information</Heading>
                <Text className="mt-2">
                  We collect personal information that you voluntarily provide to us when you:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Create an account</li>
                  <li>Make a purchase</li>
                  <li>Contact us for support</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <Text className="mt-2">
                  This may include your name, email address, phone number, and any other information you choose to provide. We do not store payment information on our servers - all payment processing is handled securely by Stripe and other third-party payment processors.
                </Text>
              </div>

              <div>
                <Heading size="h3">Payment and Compliance Information</Heading>
                <Text className="mt-2">
                  For payment processing and compliance purposes, we collect limited information including:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Transaction details (amount, date, seller information)</li>
                  <li>Payment method information (processed by Stripe, not stored by us)</li>
                  <li>Seller identification for tax compliance purposes</li>
                  <li>Business registration details (ABN, business name) for sellers</li>
                  <li>Contact information for dispute resolution</li>
                </ul>
                <Text className="mt-2">
                  This information is collected to facilitate payments, comply with Australian tax laws, and resolve any disputes that may arise.
                </Text>
              </div>

              <div>
                <Heading size="h3">Location Information</Heading>
                <Text className="mt-2">
                  As a location-based service, we collect and process location data including:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Points of interest (POIs) you create or purchase</li>
                  <li>Location lists and their associated geographic data</li>
                  <li>General location preferences for content personalization</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Social Media Information</Heading>
                <Text className="mt-2">
                  If you choose to verify your social media accounts through our OAuth verification system, we collect:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Basic profile information (username, display name)</li>
                  <li>Public follower/subscriber counts</li>
                  <li>Account verification status</li>
                  <li>Profile URLs and avatars</li>
                </ul>
                <Text className="mt-2">
                  We only collect information necessary for verification purposes and do not access private content.
                </Text>
              </div>

              <div>
                <Heading size="h3">Automatically Collected Information</Heading>
                <Text className="mt-2">
                  We automatically collect certain information when you visit our website, including:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>IP address and general location</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent</li>
                  <li>Referring website</li>
                  <li>Device information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <Heading size="h2">How We Use Your Information</Heading>
            <Text className="mt-4">
              We use the information we collect to:
            </Text>
            <ul className="list-disc list-inside mt-4 space-y-1 text-sm">
              <li>Provide, operate, and maintain our services</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative information and updates</li>
              <li>Respond to comments, questions, and customer service requests</li>
              <li>Improve our website and services</li>
              <li>Personalize your experience</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <Heading size="h2">How We Share Your Information</Heading>
            <Text className="mt-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </Text>
            <ul className="list-disc list-inside mt-4 space-y-1 text-sm">
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our website and services</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale of assets, or acquisition</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Public Information:</strong> Location lists and reviews you publish are publicly visible</li>
              <li><strong>Verified Social Accounts:</strong> Your verified social media links are displayed on your public profile</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <Heading size="h2">Data Security</Heading>
            <Text className="mt-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
            </Text>
          </section>

          {/* Your Rights */}
          <section>
            <Heading size="h2">Your Privacy Rights</Heading>
            <Text className="mt-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </Text>
            <ul className="list-disc list-inside mt-4 space-y-1 text-sm">
              <li>Access and receive a copy of your personal information</li>
              <li>Rectify inaccurate personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <Text className="mt-4">
              To exercise these rights, please contact us using the information provided below.
            </Text>
          </section>

          {/* Cookies */}
          <section>
            <Heading size="h2">Cookies and Tracking</Heading>
            <Text className="mt-4">
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand where our visitors are coming from. You can control cookies through your browser settings.
            </Text>
          </section>

          {/* Google Drive Integration */}
          <section>
            <Heading size="h2">Google Drive Integration</Heading>
            <div className="mt-4 space-y-4">
              <div>
                <Heading size="h3">What Data We Access</Heading>
                <Text className="mt-2">
                  When you connect your Google account to MapBuddi, we request access to the following Google API scopes:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li><strong>drive.file scope</strong> (https://www.googleapis.com/auth/drive.file) - Limited access to only create and manage files that MapBuddi creates in your Google Drive</li>
                  <li><strong>userinfo.email</strong> - Your email address for account association</li>
                  <li><strong>userinfo.profile</strong> - Your basic profile information</li>
                </ul>
                <Text className="mt-2">
                  <strong>Important:</strong> We use the most restrictive &ldquo;drive.file&rdquo; scope, which means we can only access files that our application creates. We cannot see, access, or modify any other files in your Google Drive.
                </Text>
              </div>

              <div>
                <Heading size="h3">Why We Access Your Google Drive</Heading>
                <Text className="mt-2">
                  We access your Google Drive solely to:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Create KML (Keyhole Markup Language) files containing your purchased location lists</li>
                  <li>Organize these files in a &ldquo;MapBuddi&rdquo; folder in your Google Drive</li>
                  <li>Allow you to import these KML files into Google My Maps for navigation</li>
                  <li>Verify that synced files exist and delete them when you request removal</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Data Storage and Retention</Heading>
                <Text className="mt-2">
                  <strong>In Your Google Drive:</strong>
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>KML files remain in your Google Drive indefinitely until you manually delete them</li>
                  <li>Files are stored in a folder called &ldquo;MapBuddi&rdquo; in your Drive</li>
                  <li>You have full control to move, rename, or delete these files at any time</li>
                </ul>
                <Text className="mt-2">
                  <strong>In Our Database:</strong>
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Google access tokens are stored securely and encrypted in our database</li>
                  <li>We store file IDs of created KML files to enable deletion functionality</li>
                  <li>Sync status information (whether a list has been synced, last sync date)</li>
                  <li>Connection metadata (token expiry dates, refresh tokens)</li>
                  <li>This data is retained as long as your account is active or until you disconnect Google integration</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Who Can See Your Files</Heading>
                <Text className="mt-2">
                  <strong>Privacy guarantee:</strong> Only you can see the KML files created in your Google Drive. These files are:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Private to your Google account by default</li>
                  <li>Not shared with MapBuddi staff or other users</li>
                  <li>Not publicly accessible unless you explicitly share them via Google Drive</li>
                  <li>Subject to your Google Drive sharing settings and controls</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Data Sharing and Usage</Heading>
                <Text className="mt-2">
                  We make the following commitments regarding your Google data:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li><strong>We do not sell your Google data</strong> - Your Google Drive data and access tokens will never be sold to third parties</li>
                  <li><strong>We do not share your Google data</strong> - We never share your Google Drive files or access tokens with other users or third-party services</li>
                  <li><strong>We do not use data for advertising</strong> - Your Google Drive data is never used for targeted advertising or marketing purposes</li>
                  <li><strong>We do not aggregate or analyze your Drive content</strong> - We do not read, analyze, or create aggregated datasets from your KML files or Drive content</li>
                  <li><strong>No data transfer to third parties</strong> - Your Google access tokens and Drive data remain within our secure systems and are not transferred to any third parties</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Security Measures</Heading>
                <Text className="mt-2">
                  We implement industry-standard security measures to protect your Google access credentials:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>All Google access tokens are encrypted at rest in our database</li>
                  <li>API communications use HTTPS/TLS encryption</li>
                  <li>Access tokens are stored separately from user-facing data</li>
                  <li>We use OAuth 2.0 refresh tokens to minimize long-term token exposure</li>
                  <li>Tokens expire and are automatically refreshed using secure processes</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Revoking Access and Data Deletion</Heading>
                <Text className="mt-2">
                  You have complete control over your Google Drive integration:
                </Text>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li><strong>Disconnect anytime:</strong> You can disconnect Google Drive integration from your MapBuddi account settings at any time</li>
                  <li><strong>Revoke via Google:</strong> You can revoke MapBuddi&apos;s access to your Google account directly through your <a href="https://myaccount.google.com/permissions" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Account Permissions page</a></li>
                  <li><strong>What happens when you disconnect:</strong>
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>We immediately delete your Google access and refresh tokens from our database</li>
                      <li>We can no longer create new files in your Drive or access existing ones</li>
                      <li>KML files remain in your Google Drive (you can manually delete them)</li>
                      <li>You can re-connect at any time to restore functionality</li>
                    </ul>
                  </li>
                  <li><strong>Account deletion:</strong> If you delete your MapBuddi account, all Google integration data is permanently deleted within 30 days</li>
                  <li><strong>Manual file deletion:</strong> You can delete individual KML files through your MapBuddi interface or directly in Google Drive</li>
                </ul>
              </div>

              <div>
                <Heading size="h3">Google API Services User Data Policy Compliance</Heading>
                <Text className="mt-2">
                  MapBuddi&apos;s use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements. We only use your Google data for the specific purposes outlined above and do not use it for any other purpose.
                </Text>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <Heading size="h2">Third-Party Services</Heading>
            <Text className="mt-4">
              Our website may contain links to third-party services, including:
            </Text>
            <ul className="list-disc list-inside mt-4 space-y-1 text-sm">
              <li>Google Maps for location services and mapping</li>
              <li>Google Drive for file storage and syncing</li>
              <li>Stripe for payment processing</li>
              <li>Social media platforms for account verification</li>
              <li>Analytics services</li>
            </ul>
            <Text className="mt-4">
              These third-party services have their own privacy policies, and we are not responsible for their practices. When you use Google Drive integration, you are also subject to Google&apos;s <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</a>.
            </Text>
          </section>

          {/* Children's Privacy */}
          <section>
            <Heading size="h2">Children&apos;s Privacy</Heading>
            <Text className="mt-4">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </Text>
          </section>

          {/* Changes to Policy */}
          <section>
            <Heading size="h2">Changes to This Privacy Policy</Heading>
            <Text className="mt-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date.
            </Text>
          </section>

          {/* Contact Information */}
          <section>
            <Heading size="h2">Contact Us</Heading>
            <Text className="mt-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
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
