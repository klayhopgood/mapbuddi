import { generateOnboardingLink } from "@/server-actions/stripe/generate-onboarding-link";

export default async function OnboardingLinkPage() {
  // Generate onboarding link for store ID 2 (kchop1s store)
  const result = await generateOnboardingLink(2);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Stripe Connect Onboarding</h1>
      
      {result.success ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-100 rounded">
            <p className="text-blue-800 mb-4">
              ✅ Onboarding link generated! Click the button below to complete your Stripe Connect setup:
            </p>
            <a 
              href={result.onboardingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Complete Stripe Onboarding →
            </a>
          </div>
          
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600 mb-2">Debug Info:</p>
            <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-100 rounded">
          <p className="text-red-800">❌ Error generating onboarding link:</p>
          <pre className="text-sm mt-2">{result.error}</pre>
        </div>
      )}
    </div>
  );
}
