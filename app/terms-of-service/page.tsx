import { PublicNavbar } from "@/components/ui/public-navbar";
import { Footer } from "@/components/landing/footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-balance">
            Terms of Service
          </h1>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Agreement to Terms
              </h2>
              <p>
                By accessing and using this DeepFake Detection System, you
                accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Use License
              </h2>
              <p>
                Permission is granted to temporarily download one copy of the
                materials (information or software) on our service for personal,
                non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title, and under this license you
                may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>
                  Attempt to decompile or reverse engineer any software
                  contained on the service
                </li>
                <li>
                  Remove any copyright or other proprietary notations from the
                  materials
                </li>
                <li>
                  Transferring the materials to another person or "mirroring"
                  the materials on any other server
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Disclaimer
              </h2>
              <p>
                The materials on our service are provided on an 'as is' basis.
                We make no warranties, expressed or implied, and hereby disclaim
                and negate all other warranties including, without limitation,
                implied warranties or conditions of merchantability, fitness for
                a particular purpose, or non-infringement of intellectual
                property or other violation of rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Limitations
              </h2>
              <p>
                In no event shall our company or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on our service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Accuracy of Materials
              </h2>
              <p>
                The materials appearing on our service could include technical,
                typographical, or photographic errors. Our company does not
                warrant that any of the materials on our service are accurate,
                complete, or current.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Modifications
              </h2>
              <p>
                Our company may revise these terms of service for our service at
                any time without notice. By using this service, you are agreeing
                to be bound by the then current version of these terms of
                service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at: support@deepfake-detection.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
