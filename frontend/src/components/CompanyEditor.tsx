import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

interface CompanyEditorProps {
  companyId?: string; // Optional: if provided, edit existing company; otherwise, create new
  onUpdate?: () => void; // Callback after creation / update
}

const API_URL = import.meta.env.VITE_API_URL;

const CompanyEditor: React.FC<CompanyEditorProps> = ({ companyId, onUpdate }) => {
  const isNew = !companyId;

  const [loading, setLoading] = useState(false);
  const [fetchingCompany, setFetchingCompany] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");

  useEffect(() => {
    if (!isNew && companyId) {
      const fetchCompany = async () => {
        setFetchingCompany(true);
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/companies/${companyId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch company details");
          }

          const data = await res.json();
          setCompanyName(data.name || "");
          setCompanyDescription(data.description || "");
        } catch (error: any) {
          toast.error(error.message || "Error fetching company");
        } finally {
          setFetchingCompany(false);
        }
      };
      fetchCompany();
    } else {
      setFetchingCompany(false);
    }
  }, [companyId, isNew]);

  const headers = (isJson = true) => {
    const token = localStorage.getItem("token");
    const baseHeaders: any = {
      Authorization: token ? `Bearer ${token}` : "",
    };
    if (isJson) baseHeaders["Content-Type"] = "application/json";
    return baseHeaders;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? `${API_URL}/companies` : `${API_URL}/companies/${companyId}`;

      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify({
          name: companyName,
          description: companyDescription,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || (isNew ? "Error creating company" : "Error updating company"));
      }

      //const data = await res.json();
      toast.success(isNew ? "Company created!" : "Company updated!");
      onUpdate && onUpdate(); // Notify parent
    } catch (error: any) {
      toast.error(error.message || "Error saving company");
    } finally {
      setLoading(false);
    }
  };



  if (fetchingCompany) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Card className="p-6 shadow-sm border rounded-xl bg-white">
      <CardHeader>
        <CardTitle className="text-2xl">{isNew ? "Create New Company" : "Edit Company"}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {isNew ? "Enter details for your new company" : "Update your company information and logo"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyDescription">Company Description</Label>
            <Textarea
              id="companyDescription"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              rows={4}
              placeholder="Tell us about your company..."
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button type="submit" disabled={loading || fetchingCompany} className="bg-sky-600 text-white hover:bg-sky-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isNew ? "Create Company" : "Save Changes"}
            </Button>
            {!isNew && (
              <Button type="button" variant="outline" onClick={() => onUpdate && onUpdate()}>
                Refresh
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
    </>
  );
};

export default CompanyEditor;
