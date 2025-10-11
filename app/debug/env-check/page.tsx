import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

const requiredEnvVars = [
  { key: "DATABASE_URL", required: true, sensitive: true },
  { key: "CLERK_SECRET_KEY", required: true, sensitive: true },
  { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", required: true, sensitive: false },
  { key: "STRIPE_SECRET_KEY", required: true, sensitive: true },
  { key: "STRIPE_WEBHOOK_SECRET", required: true, sensitive: true },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", required: true, sensitive: false },
  { key: "GOOGLE_PLACES_API_KEY", required: true, sensitive: true },
  { key: "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY", required: true, sensitive: false },
  { key: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", required: true, sensitive: false },
  { key: "GOOGLE_CLIENT_ID", required: true, sensitive: true },
  { key: "GOOGLE_CLIENT_SECRET", required: true, sensitive: true },
  { key: "UPLOADTHING_SECRET", required: true, sensitive: true },
  { key: "UPLOADTHING_APP_ID", required: true, sensitive: false },
  { key: "NEXT_PUBLIC_APP_URL", required: true, sensitive: false },
];

function maskSensitiveValue(value: string): string {
  if (value.length <= 8) return "***";
  return value.substring(0, 4) + "***" + value.substring(value.length - 4);
}

export default function EnvCheckPage() {
  const envStatus = requiredEnvVars.map(envVar => {
    const value = process.env[envVar.key];
    const exists = !!value;
    const isCorrectLength = value && value.length > 10;
    
    return {
      ...envVar,
      exists,
      isCorrectLength,
      maskedValue: exists ? maskSensitiveValue(value) : "Not set",
    };
  });

  const allSet = envStatus.every(env => env.exists);
  const allValidLength = envStatus.every(env => !env.exists || env.isCorrectLength);

  return (
    <div className="container mx-auto py-8">
      <HeadingAndSubheading
        heading="Environment Variables Check"
        subheading="Verify all required environment variables are set"
      />
      
      <div className="grid gap-4">
        {envStatus.map((env) => (
          <Card key={env.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{env.key}</CardTitle>
              <div className="flex items-center gap-2">
                {env.exists ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                {env.sensitive && (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={env.exists ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {env.exists ? "Set" : "Missing"}
                  </Badge>
                  {env.exists && (
                    <Badge 
                      variant={env.isCorrectLength ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {env.isCorrectLength ? "Valid Length" : "Too Short"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {env.maskedValue}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allSet && allValidLength ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Environment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className={allSet ? "text-green-600" : "text-red-600"}>
              {allSet ? "✅ All variables set" : "❌ Some variables missing"}
            </p>
            <p className={allValidLength ? "text-green-600" : "text-yellow-600"}>
              {allValidLength ? "✅ All values look valid" : "⚠️ Some values seem too short"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
