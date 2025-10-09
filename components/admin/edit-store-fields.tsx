"use client";

import { Store } from "@/db/schema";
import { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { Loader2, Copy, ExternalLink, Youtube, Instagram } from "lucide-react";
import { type updateStore } from "@/server-actions/store";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { ProfileImageUploader } from "./profile-image-uploader";

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
  
  // Parse existing data
  const existingNationalities = props.storeDetails.nationality 
    ? JSON.parse(props.storeDetails.nationality) 
    : [];
  const existingSocialLinks = props.storeDetails.socialLinks 
    ? JSON.parse(props.storeDetails.socialLinks) 
    : {};
  
  // Form state
  const [name, setName] = useState(props.storeDetails.name || "");
  const [description, setDescription] = useState(props.storeDetails.description || "");
  const [firstName, setFirstName] = useState(props.storeDetails.firstName || "");
  const [lastName, setLastName] = useState(props.storeDetails.lastName || "");
  const [age, setAge] = useState(props.storeDetails.age?.toString() || "");
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>(existingNationalities);
  const [website, setWebsite] = useState(props.storeDetails.website || "");
  const [profileImage, setProfileImage] = useState(props.storeDetails.profileImage || "");
  
  // Individual social link states
  const [youtubeHandle, setYoutubeHandle] = useState(existingSocialLinks.youtube || "");
  const [instagramHandle, setInstagramHandle] = useState(existingSocialLinks.instagram || "");
  const [tiktokHandle, setTiktokHandle] = useState(existingSocialLinks.tiktok || "");

  const handleNationalityChange = (country: string, checked: boolean) => {
    if (checked) {
      setSelectedNationalities([...selectedNationalities, country]);
    } else {
      setSelectedNationalities(selectedNationalities.filter(c => c !== country));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!profileImage) {
        toast({
          title: "Profile image required",
          description: "You must upload a profile image to sell on MapBuddi.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if at least one social link or website is provided
      const hasWebsite = website && website.trim().length > 0;
      const hasYoutube = youtubeHandle && youtubeHandle.trim().length > 0;
      const hasInstagram = instagramHandle && instagramHandle.trim().length > 0;
      const hasTiktok = tiktokHandle && tiktokHandle.trim().length > 0;
      
      if (!hasWebsite && !hasYoutube && !hasInstagram && !hasTiktok) {
        toast({
          title: "Verified channel required",
          description: "You must provide at least one website or social media link to sell on MapBuddi.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Build social links object from individual states
      const socialLinksObject = {
        youtube: youtubeHandle,
        instagram: instagramHandle,
        tiktok: tiktokHandle,
      };

      await props.updateStore({
        storeId: props.storeDetails.id,
        name,
        description,
        firstName,
        lastName,
        age: age ? parseInt(age) : null,
        nationality: JSON.stringify(selectedNationalities),
        socialLinks: JSON.stringify(socialLinksObject),
        website,
        profileImage,
      });

      toast({
        title: "Profile updated",
        description: "Your store profile has been successfully updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating store:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyProfileUrl = () => {
    const profileUrl = `${window.location.origin}/profile/${props.storeDetails.slug}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Profile URL copied",
      description: "Your profile URL has been copied to clipboard.",
      variant: "default",
    });
  };

  const viewProfile = () => {
    const profileUrl = `/profile/${props.storeDetails.slug}`;
    window.open(profileUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Store Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">Description</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your store and what makes your location lists special..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Image */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileImageUploader
              currentImage={profileImage}
              onImageUpdate={setProfileImage}
            />
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">Age</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="13"
                max="120"
              />
            </div>
          </CardContent>
        </Card>

        {/* Nationality Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Nationality</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Select all countries that represent your nationality (optional)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {COUNTRIES.map((country) => (
                <div key={country} className="flex items-center space-x-2">
                  <Checkbox
                    id={country}
                    checked={selectedNationalities.includes(country)}
                    onCheckedChange={(checked) => handleNationalityChange(country, checked as boolean)}
                  />
                  <label htmlFor={country} className="text-sm cursor-pointer">
                    {country}
                  </label>
                </div>
              ))}
            </div>
            {selectedNationalities.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedNationalities.map((country) => (
                    <span key={country} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Links Section - Now inside the form */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links & Website</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Add your social media handles and website. These will be displayed on your public profile.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    <Youtube size={16} className="inline mr-2 text-red-600" />
                    YouTube Handle
                  </label>
                  <Input
                    placeholder="@yourusername"
                    value={youtubeHandle}
                    onChange={(e) => setYoutubeHandle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2">
                    <Instagram size={16} className="inline mr-2 text-pink-600" />
                    Instagram Handle
                  </label>
                  <Input
                    placeholder="@yourusername"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2">
                    <div className="inline-block w-4 h-4 mr-2 bg-black text-white text-xs font-bold text-center leading-4 rounded">T</div>
                    TikTok Handle
                  </label>
                  <Input
                    placeholder="@yourusername"
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2">
                    <ExternalLink size={16} className="inline mr-2 text-blue-600" />
                    Website
                  </label>
                  <Input
                    placeholder="https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-red-800 mb-2">Required Fields</h4>
                <p className="text-sm text-red-700">
                  You must have at least 1 Verified Channel (website or social link) and a profile image to sell on MapBuddi.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Social Links Display</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your social handles will appear on your public profile</li>
                  <li>• Use the format @username for social platforms</li>
                  <li>• Include https:// for website URLs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save button moved to the bottom */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </div>
      </form>

      {/* Profile actions outside the form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={copyProfileUrl}>
              <Copy size={16} className="mr-2" />
              Copy Profile URL
            </Button>
            
            <Button type="button" variant="outline" onClick={viewProfile}>
              <ExternalLink size={16} className="mr-2" />
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};