import { Card, CardContent } from "@/components/ui/card";

export function TermsOfService() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100">
          Terms of Use
        </h1>
        
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Last updated: January 15, 2025
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Please read these Terms of Use ("Terms") carefully before using this website. By accessing or using this site, you agree to be bound by these Terms. If you do not agree, please do not use the site.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                1. Purpose of This Site
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                This site allows you to enter your Solana wallet address and view related swap data. It is provided for informational purposes only.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                2. No Financial Advice
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                The information provided by this site is not financial, investment, or trading advice. You are solely responsible for any actions you take based on the data shown. Always do your own research or consult a qualified professional before making financial decisions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                3. Use at Your Own Risk
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li>You use this site entirely at your own risk.</li>
                <li>We do not guarantee the accuracy, completeness, or timeliness of any information.</li>
                <li>We are not responsible for any losses or damages, including financial losses, that result from your use of this site.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                4. Third-Party Services
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li>The site uses third-party APIs to retrieve swap data. We do not control or guarantee the operation or output of these services.</li>
                <li>You acknowledge that your wallet address and IP address may be shared with these third parties to retrieve the requested data, and their own terms and privacy policies will apply.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                5. No Warranty
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                This site is provided "as is" and "as available," without warranties of any kind, whether express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                6. Limitation of Liability
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                To the fullest extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the site.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                7. Changes to These Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                We may update or change these Terms at any time without prior notice. Changes will be effective once posted on this page.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                8. Contact
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                If you have any questions about these Terms, contact us through the Resources page for community contact information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}