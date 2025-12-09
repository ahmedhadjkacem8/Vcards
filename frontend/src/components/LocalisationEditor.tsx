import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";


interface ProfileLocalization {
  id: string;
  profile_id: string;
  address: string;
  latitude: number;
  longitude: number;
  is_primary: boolean;
  google_maps_link?: string;
}

interface LocalisationEditorProps {
  profileId: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const LocalisationEditor = ({ profileId }: LocalisationEditorProps) => {
  const [localisations, setLocalisations] = useState<ProfileLocalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState("");
  const [newLatitude, setNewLatitude] = useState("");
  const [newLongitude, setNewLongitude] = useState("");
  const [newIsPrimary, setNewIsPrimary] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addMethod, setAddMethod] = useState("manual");
  const [newGoogleMapsLink, setNewGoogleMapsLink] = useState("");
  const [expanding, setExpanding] = useState(false);

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchLocalisations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/localisations/profile/${profileId}`, { headers: headers() });
      if (!res.ok) throw new Error("Erreur lors du chargement des localisations");
      const data = await res.json();
      setLocalisations(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalisations();
  }, [profileId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasCoords = newLatitude && newLongitude;
    const hasLink = newGoogleMapsLink.trim() !== "";

    if (addMethod === 'link' && !hasLink) {
      toast.error("Veuillez fournir un lien Google Maps.");
      return;
    }
    
    if (!hasCoords) {
        toast.error("Coordonnées invalides. Si vous utilisez un lien, assurez-vous qu'il est correct. Sinon, entrez les coordonnées manuellement.");
        return;
    }
    
    setAdding(true);
    try {
      const body: any = {
        address: newAddress,
        latitude: parseFloat(newLatitude),
        longitude: parseFloat(newLongitude),
        is_primary: newIsPrimary,
      };

      if (addMethod === 'link') {
        body.google_maps_link = newGoogleMapsLink;
      }

      const res = await fetch(`${API_URL}/localisations/profile/${profileId}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'ajout de la localisation");
      }
      toast.success("Localisation ajoutée !");
      setNewAddress("");
      setNewLatitude("");
      setNewLongitude("");
      setNewGoogleMapsLink("");
      setNewIsPrimary(false);
      setAddMethod("manual");
      fetchLocalisations(); // Refresh list
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (localisationId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette localisation ?")) return;

    try {
      const res = await fetch(`${API_URL}/localisations/${localisationId}`, {
        method: "DELETE",
        headers: headers(),
      });
      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }
      toast.success("Localisation supprimée !");
      fetchLocalisations(); // Refresh list
    } catch (err: any) {
      toast.error(err.message);
    }
  };

const handleExpandLink = async () => {
  if (!newGoogleMapsLink.trim()) {
    toast.error("Veuillez coller un lien Google Maps.");
    return;
  }

  setExpanding(true);

  try {
    let urlToProcess = newGoogleMapsLink;
    let latitude = "";
    let longitude = "";

    // Si c'est un lien raccourci goo.gl, on l'expanse via le backend
    if (urlToProcess.includes("goo.gl")) {
      toast.info("Développement du lien raccourci...");

      const res = await fetch(`${API_URL}/localisations/expand-url`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ url: urlToProcess }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Impossible d'étendre le lien.");
      }

      const data = await res.json();
      urlToProcess = data.finalUrl;
    }

    // Extraction des coordonnées
    // Compatible @lat,lon ou ?q=lat,lon
    const latLonMatch =
      urlToProcess.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      urlToProcess.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (latLonMatch && latLonMatch.length >= 3) {
      latitude = latLonMatch[1];
      longitude = latLonMatch[2];
      setNewLatitude(latitude);
      setNewLongitude(longitude);
      toast.success("Coordonnées extraites !");
    } else {
      setNewLatitude("");
      setNewLongitude("");
      toast.error("Impossible d'extraire les coordonnées du lien fourni.");
    }
  } catch (error: any) {
    toast.error(error.message || "Une erreur est survenue.");
    setNewLatitude("");
    setNewLongitude("");
  } finally {
    setExpanding(false);
  }
};

  const getMapEmbedUrl = (latitude: number, longitude: number) => {
    const lat = parseFloat(latitude.toString());
    const lon = parseFloat(longitude.toString());
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05}%2C${lat - 0.025}%2C${lon + 0.05}%2C${lat + 0.025}&amp;layer=mapnik&amp;marker=${lat}%2C${lon}`;
  };

  const primaryLocalization = localisations.find(loc => loc.is_primary) || localisations[0];
  const hasNewCoords = newLatitude && newLongitude;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left side: Map Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu sur la carte</CardTitle>
          <CardDescription>Visualisation de la nouvelle adresse ou des adresses existantes</CardDescription>
        </CardHeader>
        <CardContent>
          {hasNewCoords ? (
            <iframe
              key={`${newLatitude}-${newLongitude}`}
              width="100%"
              height="384px" // h-96 approx
              src={getMapEmbedUrl(parseFloat(newLatitude), parseFloat(newLongitude))}
              style={{ border: "1px solid black", borderRadius: "0.375rem" }}
              title="Map Preview"
            ></iframe>
          ) : primaryLocalization ? (
            <iframe
              width="100%"
              height="384px" // h-96 approx
              src={getMapEmbedUrl(primaryLocalization.latitude, primaryLocalization.longitude)}
              style={{ border: "1px solid black", borderRadius: "0.375rem" }}
              title="Map Preview"
            ></iframe>
          ) : (
            <div className="h-96 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Ajoutez une localisation pour voir la carte.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right side: Editor */}
      <div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ajouter une localisation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} required />
              </div>

              
              <div className="flex items-center space-x-2">
                <Input
                  id="addMethodCheckbox"
                  type="checkbox"
                  checked={addMethod === 'link'}
                  onChange={(e) => setAddMethod(e.target.checked ? "link" : "manual")}
                  className="w-4 h-4"
                />
                <Label htmlFor="addMethodCheckbox">Utiliser un lien Google Maps</Label>
              </div>

              {addMethod === 'link' ? (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="gmaps-link">Lien de partage Google Maps</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="gmaps-link"
                      placeholder="Collez le lien ici"
                      value={newGoogleMapsLink}
                      onChange={(e) => setNewGoogleMapsLink(e.target.value)}
                    />
                    <Button type="button" onClick={handleExpandLink} disabled={expanding}>
                      {expanding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Extraire"}
                    </Button>
                  </div>
                   <p className="text-sm text-muted-foreground">
                      Collez un lien (court ou long) et cliquez sur "Extraire".
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground pt-2">
                    Entrez les coordonnées manuellement ci-dessous.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.00000001"
                    value={newLatitude}
                    onChange={(e) => setNewLatitude(e.target.value)}
                    readOnly={addMethod === 'link'}
                    placeholder={addMethod === 'link' ? "Extraite du lien" : "Ex: 48.8583701"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.00000001"
                    value={newLongitude}
                    onChange={(e) => setNewLongitude(e.target.value)}
                    readOnly={addMethod === 'link'}
                    placeholder={addMethod === 'link' ? "Extraite du lien" : "Ex: 2.2944813"}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  id="isPrimary"
                  type="checkbox"
                  checked={newIsPrimary}
                  onChange={(e) => setNewIsPrimary(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="isPrimary">Définir comme localisation principale</Label>
              </div>

              <Button type="submit" disabled={adding}>
                {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localisations enregistrées</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : localisations.length > 0 ? (
              <ul className="space-y-3">
                {localisations.map((loc) => (
                  <li key={loc.id} className="flex justify-between items-center p-2 border rounded-md">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow hover:underline"
                    >
                      <div>
                        <p className="font-semibold">{loc.address}</p>
                        <p className="text-sm text-muted-foreground">{`Lat: ${loc.latitude}, Lng: ${loc.longitude}`}</p>
                        {loc.is_primary && <span className="text-xs text-blue-500"> (Principale)</span>}
                      </div>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune localisation pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocalisationEditor;
