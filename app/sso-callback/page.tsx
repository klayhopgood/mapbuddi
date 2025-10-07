import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Completing connection...</h2>
        <p className="text-gray-600">
          Please wait while we finish connecting your social account.
        </p>
      </div>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/account/selling/profile"
        signUpForceRedirectUrl="/account/selling/profile"
      />
    </div>
  );
}
