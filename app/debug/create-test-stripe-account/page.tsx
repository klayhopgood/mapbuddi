import { createTestStripeAccount } from "@/server-actions/stripe/create-test-account";

export default async function CreateTestAccountPage() {
  // Create test account for store ID 2 (kchop1s store)
  const result = await createTestStripeAccount(2);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create Test Stripe Account</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
      {result.success && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800">
            ✅ New test account created! Try the payment again.
          </p>
        </div>
      )}
    </div>
  );
}
