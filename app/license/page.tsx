import { PublicNavbar } from "@/components/ui/public-navbar";
import { Footer } from "@/components/landing/footer";

export default function License() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-balance">License</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                MIT License
              </h2>
              <p>
                Copyright (c) 2025 DeepFake Detection System
              </p>
              <p>
                Permission is hereby granted, free of charge, to any person
                obtaining a copy of this software and associated documentation
                files (the "Software"), to deal in the Software without
                restriction, including without limitation the rights to use,
                copy, modify, merge, publish, distribute, sublicense, and/or
                sell copies of the Software, and to permit persons to whom the
                Software is furnished to do so, subject to the following
                conditions:
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Conditions
              </h2>
              <p>
                The above copyright notice and this permission notice shall be
                included in all copies or substantial portions of the Software.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Disclaimer
              </h2>
              <p>
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
                OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
                NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
                HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
                WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
                FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
                OTHER DEALINGS IN THE SOFTWARE.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Third-Party Licenses
              </h2>
              <p>This project uses the following open-source libraries:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Next.js - MIT License</li>
                <li>React - MIT License</li>
                <li>TailwindCSS - MIT License</li>
                <li>Shadcn UI - MIT License</li>
                <li>PyTorch - BSD License</li>
              </ul>
              <p className="mt-4">
                For detailed information about each library's license, please
                visit their respective repositories.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Attribution
              </h2>
              <p>
                If you use this software, we would appreciate attribution to the
                original project. However, this is not a requirement of the
                license.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Questions?
              </h2>
              <p>
                For questions about licensing, please contact us at:
                support@deepfake-detection.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
