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
                  This may include your name, email address, phone number, payment information, and any other information you choose to provide.
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

          {/* Third-Party Services */}
          <section>
            <Heading size="h2">Third-Party Services</Heading>
            <Text className="mt-4">
              Our website may contain links to third-party services, including:
            </Text>
            <ul className="list-disc list-inside mt-4 space-y-1 text-sm">
              <li>Google Maps for location services</li>
              <li>Stripe for payment processing</li>
              <li>Social media platforms for account verification</li>
              <li>Analytics services</li>
            </ul>
            <Text className="mt-4">
              These third-party services have their own privacy policies, and we are not responsible for their practices.
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
