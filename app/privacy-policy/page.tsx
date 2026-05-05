import { PublicNavbar } from "@/components/ui/public-navbar";
import { Footer } from "@/components/landing/footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-balance">Privacy Policy</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Introduction
              </h2>
              <p>
                This Privacy Policy ("Policy") explains how DeepFake Detection
                System ("we," "us," "our," or "Company") collects, uses,
                discloses, and safeguards your information when you use our
                application.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Information We Collect
              </h2>
              <p>
                When you use our service, we may collect the following
                information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Video Content:</strong> Videos you upload are
                  processed for deepfake detection and are not stored after
                  analysis
                </li>
                <li>
                  <strong>Account Information:</strong> Email, username, and
                  password when you create an account
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you
                  interact with our service
                </li>
                <li>
                  <strong>Device Information:</strong> Device type, browser,
                  and IP address
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                How We Use Your Information
              </h2>
              <p>We use the collected information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our service</li>
                <li>Process your video uploads and generate detection reports</li>
                <li>Improve our detection algorithms</li>
                <li>Send you service-related notifications</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures
                to protect your information against unauthorized access,
                alteration, disclosure, or destruction. All data transmission
                is encrypted using industry-standard protocols.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Data Retention
              </h2>
              <p>
                Uploaded videos are processed and automatically deleted after
                analysis. Account information is retained as long as your
                account is active. You may request deletion of your data at any
                time.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy, please contact
                us at: support@deepfake-detection.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
