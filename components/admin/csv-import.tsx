"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Users, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Store {
  id: number;
  name: string | null;
  slug: string | null;
  userId: string | null;
}

interface CSVImportProps {
  stores: Store[];
}

export function CSVImport({ stores }: CSVImportProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [listName, setListName] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [categoryName, setCategoryName] = useState("General");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error("Please select a CSV file");
        return;
      }
      setSelectedFile(file);
      
      // Auto-suggest list name from filename
      if (!listName) {
        const suggestedName = file.name
          .replace('.csv', '')
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .trim();
        setListName(suggestedName);
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      toast.error("Please select a CSV file");
      return;
    }

    if (!listName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    if (!selectedStoreId) {
      toast.error("Please select a store");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('csvFile', selectedFile);
        formData.append('listName', listName.trim());
        formData.append('storeId', selectedStoreId);
        formData.append('categoryName', categoryName);

        const response = await fetch('/api/admin/import-csv', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error || "Failed to import CSV");
          return;
        }

        toast.success(result.message);
        
        // Reset form
        setSelectedFile(null);
        setListName("");
        setSelectedStoreId("");
        setCategoryName("General");
        
        // Reset file input
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

      } catch (error) {
        toast.error("Failed to import CSV");
        console.error("Import error:", error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import CSV to Draft List
        </CardTitle>
        <CardDescription>
          Upload a CSV file to create a new draft location list for a user
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV File</Label>
          <div className="flex items-center gap-4">
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex-1"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {selectedFile.name}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Expected headers: name, address, latitude, longitude, notes
          </p>
        </div>

        {/* List Name */}
        <div className="space-y-2">
          <Label htmlFor="list-name">List Name</Label>
          <Input
            id="list-name"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Enter a name for the location list"
          />
        </div>

        {/* Store Selection */}
        <div className="space-y-2">
          <Label htmlFor="store-select">Assign to Store</Label>
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {store.name || `Store ${store.id}`}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Name */}
        <div className="space-y-2">
          <Label htmlFor="category-name">Category Name</Label>
          <Input
            id="category-name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category name for all imported locations"
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={isPending || !selectedFile || !listName || !selectedStoreId}
          className="w-full"
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Importing...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Import CSV to Draft
            </>
          )}
        </Button>

        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Import Information:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• The list will be created as a draft (not published)</li>
            <li>• All locations will be added to a single category</li>
            <li>• The list will be assigned to the selected store</li>
            <li>• CSV must have headers: name, address, latitude, longitude, notes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
