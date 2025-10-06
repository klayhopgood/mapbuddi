import { checkAndFixStripeCapabilities } from "@/server-actions/stripe/fix-capabilities";

export default async function FixCapabilitiesPage() {
  // Fix capabilities for store ID 2 (kchop1s store)
  const result = await checkAndFixStripeCapabilities(2);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Stripe Capabilities Fix</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
}
