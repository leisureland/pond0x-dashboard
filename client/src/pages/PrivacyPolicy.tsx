import { Card, CardContent } from "@/components/ui/card";

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100">
          Privacy Policy
        </h1>
        
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Last updated: January 15, 2025
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              This site allows you to enter your Solana wallet address to view your swap data. We value your privacy and keep things simple:
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                1. What We Collect
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li>The only information you provide is your Solana wallet address.</li>
                <li>We do not ask for your name, email, or any other personal details.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                2. How We Use Your Wallet Address
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li>Your wallet address is used only to fetch swap data from third-party APIs.</li>
                <li>We do not store, sell, or share your wallet address ourselves.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                3. Third-Party APIs
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li>We use external APIs to retrieve your swap data. These services may log your request (including your wallet address and IP address) in accordance with their own privacy policies.</li>
                <li>We are not responsible for the data practices of these third parties, and we recommend reviewing their privacy policies if you have concerns.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                4. Cookies & Tracking
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li>We do not use cookies or tracking technologies for advertising or profiling.</li>
                <li>Standard server logs may record basic technical information (such as IP address and browser type) for security and performance purposes.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                5. No Financial Advice
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                The information shown is for informational purposes only and should not be considered financial, investment, or trading advice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                6. Changes to This Policy
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                Contact
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                If you have any questions about this Privacy Policy, you can contact us through the Resources page for community links.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}