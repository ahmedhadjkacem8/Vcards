import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ProfileLocalization {
  id: string;
  profile_id: string;
  address: string;
  latitude: number;
  longitude: number;
  is_primary: boolean;
  maps_link?: string | null;
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
  const [newMapsLink, setNewMapsLink] = useState("");
  const [newIsPrimary, setNewIsPrimary] = useState(false);
  const [method, setMethod] = useState<'link' | 'coords' | null>(null);
  const [adding, setAdding] = useState(false);

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

      // For any localisation that has a maps_link but no coords, resolve on server and update
      data.forEach(async (loc: ProfileLocalization) => {
        if (loc.maps_link && (loc.latitude === null || loc.latitude === undefined)) {
          try {
            const r = await fetch(`${API_URL}/localisations/resolve`, {
              method: 'POST',
              headers: headers(),
              body: JSON.stringify({ url: loc.maps_link }),
            });
            if (!r.ok) return; // skip if cannot resolve
            const json = await r.json();
            if (json.lat && json.lon) {
              // update record in DB
              await fetch(`${API_URL}/localisations/${loc.id}`, {
                method: 'PATCH',
                headers: headers(),
                body: JSON.stringify({ latitude: json.lat, longitude: json.lon }),
              });
              // update local state
              setLocalisations(prev => prev.map(p => p.id === loc.id ? { ...p, latitude: json.lat, longitude: json.lon } : p));
            }
          } catch (e) {
            // ignore resolver failures
          }
        }
      });
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
    setAdding(true);
    try {
      // Build payload based on selected method
      const payload: any = {
        address: newAddress,
        is_primary: newIsPrimary,
      };

      if (method === 'link') {
        if (!newMapsLink || newMapsLink.trim() === '') throw new Error('Veuillez fournir un lien Google Maps.');
        payload.maps_link = newMapsLink.trim();
        // ensure address is set (DB requires it) — use link as address if none provided
        payload.address = payload.address || newMapsLink.trim();
      } else if (method === 'coords') {
        if (!newAddress || newAddress.trim() === '') throw new Error('Veuillez fournir une adresse.');
        const lat = parseFloat(newLatitude);
        const lon = parseFloat(newLongitude);
        if (Number.isNaN(lat) || Number.isNaN(lon)) throw new Error('Veuillez fournir des coordonnées valides.');
        payload.latitude = lat;
        payload.longitude = lon;
      } else {
        throw new Error('Sélectionnez une méthode d\'ajout: Coordonnées ou Lien Google Maps.');
      }

      const res = await fetch(`${API_URL}/localisations/profile/${profileId}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'ajout de la localisation");
      }
      toast.success("Localisation ajoutée !");
      setNewAddress("");
      setNewLatitude("");
      setNewMapsLink("");
      setNewLongitude("");
      setNewIsPrimary(false);
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

  const getMapEmbedUrl = (latitude: number, longitude: number) => {
    const lat = parseFloat(latitude.toString());
    const lon = parseFloat(longitude.toString());
    // OpenStreetMap embed URL. Adjust zoom and other parameters as needed.
    // This is a basic embed, more advanced options might require a dedicated mapping service.
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05}%2C${lat - 0.025}%2C${lon + 0.05}%2C${lat + 0.025}&amp;layer=mapnik&amp;marker=${lat}%2C${lon}`;
  };

  const getEmbedFromLink = (mapsLink: string) => {
    // Return null — this helper kept for backward compatibility; prefer extractCoords()
    return null;
  };

  // Extract coordinates utility (used to render OSM map when possible)
  const extractCoords = (link: string) => {
    try {
      const at = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (at) return { lat: parseFloat(at[1]), lon: parseFloat(at[2]) };

      const q = link.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (q) return { lat: parseFloat(q[1]), lon: parseFloat(q[2]) };

      const ex = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (ex) return { lat: parseFloat(ex[1]), lon: parseFloat(ex[2]) };

      const pair = link.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (pair) return { lat: parseFloat(pair[1]), lon: parseFloat(pair[2]) };
    } catch (e) {
      return null;
    }
    return null;
  };

  const leafletIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const primaryLocalization = localisations.find(loc => loc.is_primary) || localisations[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left side: Map Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu sur la carte</CardTitle>
          <CardDescription>Visualisation des adresses</CardDescription>
        </CardHeader>
        <CardContent>
          {primaryLocalization ? (
            (() => {
              const lat = primaryLocalization.latitude as number | undefined;
              const lon = primaryLocalization.longitude as number | undefined;

              // If coords are available, show interactive Leaflet map (no API key required)
              if (lat !== undefined && lon !== undefined && lat !== null && lon !== null) {
                return (
                  <div className="h-96 rounded-md overflow-hidden" style={{ border: '1px solid black', borderRadius: '0.375rem' }}>
                    <MapContainer center={[lat, lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[lat, lon]} icon={leafletIcon}>
                        <Popup>{primaryLocalization.address}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                );
              }

              // If no coords, but we have a maps_link try extracting coords from the link
              if (primaryLocalization.maps_link) {
                const coords = extractCoords(primaryLocalization.maps_link as string);
                if (coords) {
                  return (
                    <div className="h-96 rounded-md overflow-hidden" style={{ border: '1px solid black', borderRadius: '0.375rem' }}>
                      <MapContainer center={[coords.lat, coords.lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[coords.lat, coords.lon]} icon={leafletIcon}>
                          <Popup>{primaryLocalization.address || primaryLocalization.maps_link}</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  );
                }

                // Fallback: embed not possible, show message and external open button
                return (
                  <div className="h-96 bg-gray-100 rounded-md flex flex-col items-center justify-center p-4 text-center">
                    <p className="mb-3">Impossible d'afficher l'aperçu intégré pour ce lien Google Maps.</p>
                    <a
                      href={primaryLocalization.maps_link as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Ouvrir la carte dans Google Maps
                    </a>
                  </div>
                );
              }

              // No coords and no link
              return (
                <div className="h-96 bg-gray-200 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Ajoutez une localisation pour voir la carte.</p>
                </div>
              );
            })()
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
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    required={method === 'coords'}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={method === 'coords'}
                      onChange={() => {
                        if (method === 'coords') {
                          setMethod(null);
                        } else {
                          setMethod('coords');
                          setNewMapsLink('');
                        }
                      }}
                    />
                    <span>Coordonnées</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={method === 'link'}
                      onChange={() => {
                        if (method === 'link') {
                          setMethod(null);
                        } else {
                          setMethod('link');
                          setNewLatitude('');
                          setNewLongitude('');
                        }
                      }}
                    />
                    <span>Lien Google Maps</span>
                  </label>
                </div>

                {/* show inputs according to selected method */}
                {method === 'link' && (
                  <div className="space-y-2">
                    <Label htmlFor="mapsLink">Lien Google Maps partagé</Label>
                    <Input
                      id="mapsLink"
                      placeholder="https://maps.app.goo.gl/..."
                      value={newMapsLink}
                      onChange={(e) => setNewMapsLink(e.target.value)}
                      required
                    />
                  </div>
                )}

                {method === 'coords' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="0.00000001"
                          value={newLatitude}
                          onChange={(e) => setNewLatitude(e.target.value)}
                          required
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
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                      href={loc.maps_link ? loc.maps_link : `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow hover:underline"
                    >
                      <div>
                        <p className="font-semibold">{loc.address}</p>
                        <p className="text-sm text-muted-foreground">{loc.maps_link ? loc.maps_link : `Lat: ${loc.latitude}, Lng: ${loc.longitude}`}</p>
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
