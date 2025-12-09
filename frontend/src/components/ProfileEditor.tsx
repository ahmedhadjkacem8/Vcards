import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import GalleryEditor from "./GalleryEditor";
import ContactsEditor from "./ContactsEditor";
import LocalisationEditor from "./LocalisationEditor";

interface ProfileEditorProps {
  profile: any;           // Peut être null pour création
  onUpdate: () => void;   // Callback après création / mise à jour
}

const API_URL = import.meta.env.VITE_API_URL;

const ProfileEditor = ({ profile, onUpdate }: ProfileEditorProps) => {
  const isNew = !profile; // true si création

  // --- State pour création ou édition ---
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [primaryColor, setPrimaryColor] = useState(profile?.primary_color || "#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState(profile?.secondary_color || "#EC4899");
  const [visibility, setVisibility] = useState(profile?.visibility || "private");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Keep local state in sync if `profile` prop changes (e.g. after reload)
  useEffect(() => {
    setDisplayName(profile?.display_name || "");
    setBio(profile?.bio || "");
    setPrimaryColor(profile?.primary_color || "#000000ff");
    setSecondaryColor(profile?.secondary_color || "#ffffffff");
    setVisibility(profile?.visibility || "private");
  }, [profile]);

  const headers = (isJson = true) => {
    const token = localStorage.getItem("token");
    const baseHeaders: any = {
      Authorization: token ? `Bearer ${token}` : "",
    };
    if (isJson) baseHeaders["Content-Type"] = "application/json";
    return baseHeaders;
  };

  // --- Création ou mise à jour ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? `${API_URL}/profiles` : `${API_URL}/profiles/${profile.id}`;

      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify({
          display_name: displayName,
          bio,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          visibility,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || (isNew ? "Erreur lors de la création" : "Erreur lors de la mise à jour"));
      }

      const data = await res.json();

      // Update local form state with returned profile (helps when backend sets defaults)
      setDisplayName(data.display_name || displayName);
      setBio(data.bio || bio);
      setPrimaryColor(data.primary_color || primaryColor);
      setSecondaryColor(data.secondary_color || secondaryColor);
      setVisibility(data.visibility || visibility);

      toast.success(isNew ? "Profil créé !" : "Profil mis à jour !");
      // pass created/updated profile to parent if it accepts it, otherwise keep the old signature
      try {
        // if parent expects profile arg
        (onUpdate as any)(data);
      } catch {
        // fallback: call without args
        onUpdate();
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  // --- Upload d'images (avatar / cover) ---
  const uploadImage = async (file: File, type: "avatar" | "cover") => {
    if (!profile?.id) return; // Pas d'ID tant que le profil n'existe pas

    if (type === "avatar") setAvatarUploading(true);
    if (type === "cover") setCoverUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch(`${API_URL}/profiles/${profile.id}/upload`, {
        method: "POST",
        // don't set Content-Type when sending FormData; include Authorization only
        headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur lors de l'upload");

      await res.json();
      toast.success(`Image ${type === "avatar" ? "de profil" : "de couverture"} mise à jour !`);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      if (type === "avatar") setAvatarUploading(false);
      if (type === "cover") setCoverUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      await uploadImage(file, "avatar");
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      await uploadImage(file, "cover");
    }
  };

  // token not used directly here; authorization header is created by headers()/uploadImage

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1 p-6 shadow-sm border rounded-xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">{isNew ? "Créer mon profil" : "Éditer mon profil"}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {isNew ? "Remplissez les informations principales" : "Mettez à jour vos informations et apparence"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nom d'affichage</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img src={`${API_URL}${profile.avatar_url}`} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-sm text-muted-foreground">Aucun</div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" asChild disabled={avatarUploading}>
                      <span>
                        {avatarUploading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Téléchargement...</>
                        ) : (
                          <><Upload className="mr-2 h-4 w-4" /> Choisir</>
                        )}
                      </span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
                  </label>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Parlez-nous de vous..." />
              </div>

              <div className="space-y-2">
                <Label>Image de couverture</Label>
                <div className="flex items-center gap-3">
                  <div className="w-40 h-20 rounded-lg overflow-hidden bg-gray-100">
                    {profile?.cover_url ? (
                      <img src={`${API_URL}${profile.cover_url}`} alt="cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">Aucune</div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" asChild disabled={coverUploading}>
                      <span>
                        {coverUploading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Téléchargement...</>
                        ) : (
                          <><Upload className="mr-2 h-4 w-4" /> Choisir</>
                        )}
                      </span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Couleur principale</Label>
                <div className="flex items-center gap-2">
                  <Input id="primaryColor" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-16 h-10" />
                  <Input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                <div className="flex items-center gap-2">
                  <Input id="secondaryColor" type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-16 h-10" />
                  <Input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Statut du profil</Label>
                <select
                  id="visibility"
                  value={visibility}
                  onChange={e => setVisibility(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="private">Privé (par défaut)</option>
                  <option value="public">Public</option>
                  {profile?.tier !== "free" && <option value="floux">Flou (Blur)</option>}
                </select>
                <div className="text-xs text-muted-foreground">Un profil privé n’est pas visible publiquement.</div>
              </div>

              <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                <Button type="submit" disabled={loading} className="bg-sky-600 text-white hover:bg-sky-700">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isNew ? "Créer le profil" : "Sauvegarder"}
                </Button>
                {!isNew && (
                  <Button type="button" variant="outline" onClick={() => onUpdate()}>
                    Rafraîchir
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="w-full md:w-80">
          <Card className="p-4 shadow-sm border rounded-xl bg-white sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Aperçu</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Preview rapide du profil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100">
                  {profile?.avatar_url ? (
                    <img src={`${API_URL}${profile.avatar_url}`} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No avatar</div>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-semibold">{displayName || "Nom du profil"}</div>
                  <div className="text-sm text-muted-foreground">{bio ? bio.slice(0, 80) : "Votre bio apparaîtra ici"}</div>
                </div>
                <div className="w-full mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>Couleurs</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ background: primaryColor }} />
                      <div className="w-6 h-6 rounded" style={{ background: secondaryColor }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="p-4 bg-white rounded-xl shadow-sm border">
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="gallery">Galerie</TabsTrigger>
            <TabsTrigger value="localisation">Localisation</TabsTrigger>
          </TabsList>
          <TabsContent value="contacts">
            {profile ? <ContactsEditor profileId={profile.id} /> : <p className="text-muted-foreground">Créez le profil pour gérer les contacts.</p>}
          </TabsContent>
          <TabsContent value="gallery">
            {profile ? <GalleryEditor profileId={profile.id} /> : <p className="text-muted-foreground">Créez le profil pour gérer la galerie.</p>}
          </TabsContent>
          <TabsContent value="localisation">
            {profile ? <LocalisationEditor profileId={profile.id as string} /> : <p className="text-muted-foreground">Créez le profil pour gérer la localisation.</p>}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProfileEditor;
