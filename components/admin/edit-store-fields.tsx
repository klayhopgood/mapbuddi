"use client";

import { Store } from "@/db/schema";
import { useState, useEffect } from "react";
import { TextInputWithLabel } from "../text-input-with-label";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { Loader2, Copy, ExternalLink, CheckCircle, Youtube, Instagram, X } from "lucide-react";
import { type updateStore } from "@/server-actions/store";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { 
  initiateYouTubeVerification, 
  initiateInstagramVerification, 
  initiateTikTokVerification,
  removeVerification 
} from "@/server-actions/social-verification";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  
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
  const existingSocialData = props.storeDetails.socialData 
    ? JSON.parse(props.storeDetails.socialData) 
    : {};

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

  // Handle OAuth callback results
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success) {
      let message = '';
      switch (success) {
        case 'youtube_verified':
          message = 'YouTube channel verified successfully!';
          break;
        case 'instagram_verified':
          message = 'Instagram account verified successfully!';
          break;
        case 'tiktok_verified':
          message = 'TikTok account verified successfully!';
          break;
      }
      
      if (message) {
        toast({
          title: "Verification Successful",
          description: message,
        });
        // Refresh the page to show updated verification status
        window.location.replace('/account/selling/profile');
      }
    }
    
    if (error) {
      let message = '';
      switch (error) {
        case 'oauth_cancelled':
          message = 'Verification was cancelled.';
          break;
        case 'oauth_failed':
          message = 'OAuth authorization failed.';
          break;
        case 'token_failed':
          message = 'Failed to exchange authorization code.';
          break;
        case 'no_youtube_channel':
          message = 'No YouTube channel found for this Google account.';
          break;
        case 'no_instagram_business':
          message = 'No Instagram business account found. Please convert to a business account first.';
          break;
        case 'verification_failed':
          message = 'Verification process failed. Please try again.';
          break;
        default:
          message = 'Verification failed. Please try again.';
      }
      
      toast({
        title: "Verification Failed",
        description: message,
        variant: "destructive",
      });
      
      // Clean up URL
      window.history.replaceState({}, '', '/account/selling/profile');
    }
  }, [searchParams]);

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

  const handleVerifyPlatform = async (platform: 'youtube' | 'instagram' | 'tiktok') => {
    setIsVerifying(platform);
    try {
      switch (platform) {
        case 'youtube':
          await initiateYouTubeVerification();
          break;
        case 'instagram':
          await initiateInstagramVerification();
          break;
        case 'tiktok':
          await initiateTikTokVerification();
          break;
      }
    } catch (error) {
      setIsVerifying(null);
      toast({
        title: "Verification Failed",
        description: "Failed to start verification process. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveVerification = async (platform: 'youtube' | 'instagram' | 'tiktok') => {
    try {
      await removeVerification(platform);
      toast({
        title: "Verification Removed",
        description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} verification has been removed.`,
      });
      // Refresh to show updated state
      window.location.reload();
    } catch (error) {
      toast({
        title: "Failed to Remove",
        description: "Failed to remove verification. Please try again.",
        variant: "destructive",
      });
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

      {/* Social Verification Section - Separate from main form */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Verify your social media accounts to build trust with customers. Only verified social accounts will be displayed on your profile.
            </p>

            {/* Verified Accounts */}
            {existingVerifiedSocials.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Verified Accounts</h4>
                <div className="space-y-3">
                  {existingVerifiedSocials.map((platform: string) => {
                    const socialData = existingSocialData[platform];
                    const socialLink = existingSocialLinks[platform];
                    
                    return (
                      <div key={platform} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getSocialIcon(platform)}
                          <div>
                            <div className="font-medium">{getPlatformDisplayName(platform)}</div>
                            {socialData && (
                              <div className="text-sm text-gray-600">
                                {platform === 'youtube' && socialData.channelName && (
                                  <span>{socialData.channelName} • {socialData.subscriberCount?.toLocaleString()} subscribers</span>
                                )}
                                {platform === 'instagram' && socialData.username && (
                                  <span>@{socialData.username} • {socialData.followersCount?.toLocaleString()} followers</span>
                                )}
                                {platform === 'tiktok' && socialData.username && (
                                  <span>@{socialData.username} • {socialData.followerCount?.toLocaleString()} followers</span>
                                )}
                              </div>
                            )}
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
                {['youtube', 'instagram', 'tiktok'].map((platform) => {
                  const isVerified = existingVerifiedSocials.includes(platform);
                  if (isVerified) return null;

                  return (
                    <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSocialIcon(platform)}
                        <div>
                          <div className="font-medium">{getPlatformDisplayName(platform)}</div>
                          <div className="text-sm text-gray-600">
                            {platform === 'youtube' && 'Verify your YouTube channel'}
                            {platform === 'instagram' && 'Verify your Instagram business account'}
                            {platform === 'tiktok' && 'Verify your TikTok creator account'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyPlatform(platform as 'youtube' | 'instagram' | 'tiktok')}
                        disabled={isVerifying === platform}
                      >
                        {isVerifying === platform ? (
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
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">How Verification Works</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Click &ldquo;Verify&rdquo; to connect your social account</li>
                <li>• You&apos;ll be redirected to login with the platform</li>
                <li>• We&apos;ll automatically verify account ownership</li>
                <li>• Your verified accounts will show on your public profile</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};