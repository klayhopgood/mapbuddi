"use client";

import { Store } from "@/db/schema";
import { useState, useEffect } from "react";
import { TextInputWithLabel } from "../text-input-with-label";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { Loader2, Copy, ExternalLink, CheckCircle, Youtube, Instagram, X, Plus } from "lucide-react";
import { type updateStore } from "@/server-actions/store";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { 
  verifySocialAccount, 
  removeSocialVerification,
  getUserSocialConnections 
} from "@/server-actions/clerk-social-verification";
import { useUser } from "@clerk/nextjs";

// List of countries for nationality selection
const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", 
  "Italy", "Spain", "Japan", "South Korea", "China", "India", "Brazil", "Mexico",
  "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Switzerland", "Austria",
  "Belgium", "Portugal", "Greece", "Turkey", "Russia", "Poland", "Czech Republic",
  "Hungary", "Romania", "Bulgaria", "Croatia", "Serbia", "Slovenia", "Slovakia",
  "Estonia", "Latvia", "Lithuania", "Ireland", "Iceland", "New Zealand", "Singapore",
  "Malaysia", "Thailand", "Philippines", "Indonesia", "Vietnam", "South Africa",
  "Egypt", "Morocco", "Nigeria", "Kenya", "Ghana", "Argentina", "Chile", "Peru",
  "Colombia", "Venezuela", "Uruguay", "Paraguay", "Ecuador", "Bolivia", "Costa Rica",
  "Panama", "Guatemala", "Honduras", "El Salvador", "Nicaragua", "Dominican Republic",
  "Cuba", "Jamaica", "Trinidad and Tobago", "Barbados", "Bahamas", "Haiti"
];

export const EditStoreFields = (props: {
  storeDetails: Store;
  updateStore: typeof updateStore;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [socialConnections, setSocialConnections] = useState<any>(null);
  const { user } = useUser();
  
  // Parse existing data
  const existingNationalities = props.storeDetails.nationality 
    ? JSON.parse(props.storeDetails.nationality) 
    : [];
  const existingSocialLinks = props.storeDetails.socialLinks 
    ? JSON.parse(props.storeDetails.socialLinks) 
    : {};
  const existingVerifiedSocials = props.storeDetails.verifiedSocials 
    ? JSON.parse(props.storeDetails.verifiedSocials) 
    : [];

  const [formValues, setFormValues] = useState<Record<string, string | null>>({
    name: props.storeDetails.name,
    description: props.storeDetails.description,
    firstName: props.storeDetails.firstName,
    lastName: props.storeDetails.lastName,
    age: props.storeDetails.age?.toString() || "",
  });

  const [selectedNationalities, setSelectedNationalities] = useState<string[]>(existingNationalities);

  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/profile/${props.storeDetails.slug}` 
    : '';

  // Load user's social connections
  useEffect(() => {
    const loadSocialConnections = async () => {
      const connections = await getUserSocialConnections();
      setSocialConnections(connections);
    };
    loadSocialConnections();
  }, []);

  const handleUpdateDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    props
      .updateStore({
        name: formValues.name,
        description: formValues.description,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        age: formValues.age ? parseInt(formValues.age) : null,
        nationality: JSON.stringify(selectedNationalities),
      })
      .then((res) => {
        setIsLoading(false);
        toast({
          title: res.message,
          description: res.action,
        });
      });
  };

  const copyProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Profile URL copied!",
        description: "The link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const openProfile = () => {
    window.open(profileUrl, '_blank');
  };

  const handleNationalityChange = (country: string, checked: boolean) => {
    if (checked) {
      setSelectedNationalities([...selectedNationalities, country]);
    } else {
      setSelectedNationalities(selectedNationalities.filter(c => c !== country));
    }
  };

  const handleVerifyPlatform = async (provider: 'google' | 'facebook' | 'tiktok') => {
    setIsVerifying(provider);
    try {
      const result = await verifySocialAccount(provider);
      if (result.success) {
        toast({
          title: "Verification Successful",
          description: result.message,
        });
        // Refresh the page to show updated verification status
        window.location.reload();
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Failed to verify account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(null);
    }
  };

  const handleRemoveVerification = async (platform: 'youtube' | 'instagram' | 'tiktok') => {
    try {
      const result = await removeSocialVerification(platform);
      if (result.success) {
        toast({
          title: "Verification Removed",
          description: result.message,
        });
        // Refresh to show updated state
        window.location.reload();
      } else {
        toast({
          title: "Failed to Remove",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Remove",
        description: "Failed to remove verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConnectSocialAccount = (provider: 'google' | 'facebook' | 'tiktok') => {
    // Redirect to Clerk's social connection flow
    const baseUrl = window.location.origin;
    const returnUrl = `${baseUrl}/account/selling/profile`;
    
    // Use Clerk's user profile URL to add social connections
    if (user) {
      window.location.href = `/user-profile#/security`;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube size={16} className="text-red-600" />;
      case 'instagram': return <Instagram size={16} className="text-pink-600" />;
      case 'tiktok': return (
        <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">T</span>
        </div>
      );
      default: return null;
    }
  };

  const getPlatformDisplayName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const getPlatformFromProvider = (provider: string) => {
    const map: Record<string, string> = {
      'google': 'youtube',
      'facebook': 'instagram',
      'tiktok': 'tiktok'
    };
    return map[provider] || provider;
  };

  return (
    <div className="space-y-8">
      {/* Profile URL Section */}
      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
              {profileUrl}
            </code>
            <Button variant="outline" size="sm" onClick={copyProfileUrl}>
              <Copy size={16} className="mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={openProfile}>
              <ExternalLink size={16} className="mr-2" />
              View Profile
            </Button>
          </div>
          
          {existingVerifiedSocials.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                <CheckCircle size={14} className="text-green-600" />
                Verified Socials
              </Badge>
              <div className="flex gap-1">
                {existingVerifiedSocials.map((platform: string) => (
                  <span key={platform} className="flex items-center gap-1">
                    {getSocialIcon(platform)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Form */}
      <form className="flex flex-col gap-6" onSubmit={handleUpdateDetails}>
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInputWithLabel
                required
                type="text"
                label="Store Name"
                id="name"
                state={formValues}
                setState={setFormValues}
              />
              <div className="md:col-span-2">
                <TextInputWithLabel
                  type="text"
                  inputType="textarea"
                  label="Store Description"
                  id="description"
                  state={formValues}
                  setState={setFormValues}
                  rows="4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TextInputWithLabel
                type="text"
                label="First Name"
                id="firstName"
                state={formValues}
                setState={setFormValues}
              />
              <TextInputWithLabel
                type="text"
                label="Last Name"
                id="lastName"
                state={formValues}
                setState={setFormValues}
              />
              <TextInputWithLabel
                type="number"
                label="Age"
                id="age"
                state={formValues}
                setState={setFormValues}
              />
            </div>
          </CardContent>
        </Card>

        {/* Nationality */}
        <Card>
          <CardHeader>
            <CardTitle>Nationality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select all countries that represent your nationality or cultural background.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                {COUNTRIES.map((country) => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      id={country}
                      checked={selectedNationalities.includes(country)}
                      onCheckedChange={(checked) => 
                        handleNationalityChange(country, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={country}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {country}
                    </label>
                  </div>
                ))}
              </div>
              {selectedNationalities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedNationalities.map((country) => (
                    <Badge key={country} variant="secondary">
                      {country}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end">
          <Button className="flex gap-2" disabled={isLoading}>
            {!!isLoading && <Loader2 size={18} className="animate-spin" />}
            Save Profile
          </Button>
        </div>
      </form>

      {/* Social Verification Section - Using Clerk's OAuth */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Connect and verify your social media accounts to build trust with customers. Only verified social accounts will be displayed on your profile.
            </p>

            {/* Verified Accounts */}
            {existingVerifiedSocials.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Verified Accounts</h4>
                <div className="space-y-3">
                  {existingVerifiedSocials.map((platform: string) => {
                    const socialLink = existingSocialLinks[platform];
                    
                    return (
                      <div key={platform} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getSocialIcon(platform)}
                          <div>
                            <div className="font-medium">{getPlatformDisplayName(platform)}</div>
                            {socialLink && (
                              <a href={socialLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                {socialLink}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle size={12} className="mr-1" />
                            Verified
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveVerification(platform as 'youtube' | 'instagram' | 'tiktok')}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Verifications */}
            <div>
              <h4 className="font-medium mb-3">Available Verifications</h4>
              <div className="space-y-3">
                {[
                  { provider: 'google', platform: 'youtube', name: 'YouTube' },
                  { provider: 'facebook', platform: 'instagram', name: 'Instagram' },
                  { provider: 'tiktok', platform: 'tiktok', name: 'TikTok' }
                ].map(({ provider, platform, name }) => {
                  const isVerified = existingVerifiedSocials.includes(platform);
                  const isConnected = socialConnections?.[`has${provider.charAt(0).toUpperCase() + provider.slice(1)}`];
                  
                  if (isVerified) return null;

                  return (
                    <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSocialIcon(platform)}
                        <div>
                          <div className="font-medium">{name}</div>
                          <div className="text-sm text-gray-600">
                            {isConnected 
                              ? `Connected - Click verify to confirm ownership of your ${name} account`
                              : `Connect your ${name} account first`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isConnected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectSocialAccount(provider as 'google' | 'facebook' | 'tiktok')}
                          >
                            <Plus size={14} className="mr-2" />
                            Connect
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyPlatform(provider as 'google' | 'facebook' | 'tiktok')}
                            disabled={isVerifying === provider}
                          >
                            {isVerifying === provider ? (
                              <>
                                <Loader2 size={14} className="mr-2 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} className="mr-2" />
                                Verify
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">How Verification Works</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Connect your social accounts through your profile settings</li>
                <li>• Click &ldquo;Verify&rdquo; to confirm ownership of each account</li>
                <li>• Your verified accounts will show on your public profile</li>
                <li>• This builds trust with potential customers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
