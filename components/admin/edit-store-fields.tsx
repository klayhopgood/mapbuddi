"use client";

import { Store } from "@/db/schema";
import { useState } from "react";
import { TextInputWithLabel } from "../text-input-with-label";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { Loader2, Copy, ExternalLink, CheckCircle, Youtube, Instagram } from "lucide-react";
import { type updateStore } from "@/server-actions/store";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

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

interface SocialLinks {
  youtube?: string;
  tiktok?: string;
  instagram?: string;
}

export const EditStoreFields = (props: {
  storeDetails: Store;
  updateStore: typeof updateStore;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse existing data
  const existingNationalities = props.storeDetails.nationality 
    ? JSON.parse(props.storeDetails.nationality) 
    : [];
  const existingSocialLinks: SocialLinks = props.storeDetails.socialLinks 
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
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(existingSocialLinks);
  const [verifiedSocials] = useState<string[]>(existingVerifiedSocials);

  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/profile/${props.storeDetails.slug}` 
    : '';

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
        socialLinks: JSON.stringify(socialLinks),
        // Keep existing verified socials - they can only be changed through verification process
        verifiedSocials: JSON.stringify(verifiedSocials),
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

  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks({
      ...socialLinks,
      [platform]: value.trim() || undefined,
    });
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube size={16} className="text-red-600" />;
      case 'instagram': return <Instagram size={16} className="text-pink-600" />;
      default: return null;
    }
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
          
          {verifiedSocials.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle size={14} className="text-green-600" />
                Verified Socials
              </Badge>
              <div className="flex gap-1">
                {verifiedSocials.map(platform => (
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

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">YouTube Channel</label>
                <div className="flex items-center gap-2 mt-1">
                  <Youtube size={20} className="text-red-600" />
                  <input
                    type="url"
                    placeholder="https://youtube.com/@yourchannel"
                    value={socialLinks.youtube || ''}
                    onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {verifiedSocials.includes('youtube') && (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">TikTok Profile</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@yourusername"
                    value={socialLinks.tiktok || ''}
                    onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {verifiedSocials.includes('tiktok') && (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Instagram Profile</label>
                <div className="flex items-center gap-2 mt-1">
                  <Instagram size={20} className="text-pink-600" />
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourusername"
                    value={socialLinks.instagram || ''}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {verifiedSocials.includes('instagram') && (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Social Verification</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Verify your social media accounts to get a "Verified Socials" badge on your profile and location lists. 
                  This builds trust with potential customers.
                </p>
                <Button variant="outline" size="sm" disabled>
                  <CheckCircle size={16} className="mr-2" />
                  Verify Social Accounts (Coming Soon)
                </Button>
              </div>
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
    </div>
  );
};