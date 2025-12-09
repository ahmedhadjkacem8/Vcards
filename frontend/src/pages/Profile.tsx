import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

// (legacy helper removed — using LucideIcons or react-icons directly)

const Profile = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isQrAccess = queryParams.get("source") === "qr";
  const [profile, setProfile] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [phones, setPhones] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [localizations, setLocalizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null); // To store user session
  const [sessionReady, setSessionReady] = useState(false);

  // Helper to get token
  const getToken = () => localStorage.getItem("token");

  // Fetch user session
  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setSessionReady(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/session`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        console.warn("[fetchUser] Token invalide ou expiré");
        localStorage.removeItem("token");
        setUser(null);
        setSessionReady(true);
        return;
      }

      const data = await res.json();
      setUser(data.user || null);
    } catch (err) {
      console.error("[fetchUser] Erreur:", err);
      setUser(null);
    } finally {
      setSessionReady(true);
    }
  }, []); // Empty dependency array as API_URL is constant

  useEffect(() => {
    fetch(`${API_URL}/social_platforms`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setPlatforms(data))
      .catch(() => setPlatforms([]));
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const loadProfile = useCallback(async () => {
    try {
      const resProfile = await fetch(`${API_URL}/profiles/${id}`);
      if (!resProfile.ok) throw new Error("Profil introuvable");
      const profileData = await resProfile.json();

      const isUserPremium = user?.profile?.tier === "premium";

      // Allow access if banned OR (not public AND not premium AND not QR access)
      if (profileData.is_banned || (profileData.visibility !== "public" && !isUserPremium && !isQrAccess)) {
        toast.error("Ce profil n'est pas accessible");
        setLoading(false);
        return;
      }
      setProfile(profileData);

      const [emailsRes, phonesRes, addressesRes, socialRes, galleryRes, localizationsRes] = await Promise.all([
        fetch(`${API_URL}/profiles/${id}/emails`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/profiles/${id}/phones`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/profiles/${id}/addresses`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/profiles/${id}/social-links`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/gallery/${id}`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/localisations/profile/${id}`).then(r => r.ok ? r.json() : []),
      ]);

      setEmails(emailsRes || []);
      setPhones(phonesRes || []);
      setAddresses(addressesRes || []);
      setSocialLinks(socialRes || []);
      setGallery(galleryRes || []);
      setLocalizations(localizationsRes || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  }, [id, user, isQrAccess]);

  useEffect(() => {
    if (id && sessionReady) loadProfile();
  }, [id, loadProfile, sessionReady]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Profil introuvable</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative text-foreground"
      style={{ backgroundColor: profile.secondary_color || "#f7fafc" }}
    >
      <header className="border-b bg-white/6 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
      </header>

      <main
        className="container mx-auto px-4 py-12 max-w-5xl relative z-10 space-y-8"
        style={{
          background: profile.secondary_color ? profile.secondary_color + "20" : "rgba(255,255,255,0.04)",
          borderRadius: "1rem",
        }}
      >
        {/* Hero Card */}
        <Card
          className="overflow-hidden rounded-2xl"
          style={{
            background: profile.secondary_color ? profile.secondary_color + "0f" : "rgba(255,255,255,0.06)",
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          {profile.cover_url && (
            <div className="h-56 overflow-visible relative flex justify-center items-center">
              <img
                src={`${API_URL}${profile.cover_url}`}
                alt="Cover"
                className="w-full h-56 object-cover rounded-2xl shadow-xl border-4 border-white"
                style={{ maxWidth: '100%', maxHeight: '14rem', objectFit: 'cover', boxShadow: `0 8px 32px ${profile.primary_color || '#6366f1'}40` }}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent via-transparent to-card/80 pointer-events-none" />
            </div>
          )}

          <CardHeader className="text-center relative pb-8 pt-20">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2">
              {profile.avatar_url ? (
                <img
                  src={`${API_URL}${profile.avatar_url}`}
                  alt={profile.display_name}
                  className="w-40 h-40 rounded-full object-cover ring-4 ring-background shadow-elegant"
                />
              ) : (
                <div className="w-40 h-40 rounded-full flex items-center justify-center text-white text-5xl font-bold ring-4 ring-background">
                  {profile.display_name?.[0] || "?"}
                </div>
              )}
            </div>

            <div className="space-y-3 mt-24">
              <CardTitle
                className="text-4xl font-bold"
                style={{
                  color: profile.primary_color || '#6366f1',
                  textShadow: `0 2px 8px ${profile.primary_color ? profile.primary_color + '40' : '#6366f140'}`,
                }}
              >
                {profile.display_name}
              </CardTitle>
              {profile.tier === "premium" && (
                <Badge className="border-0 text-white shadow inline-flex items-center" style={{ background: profile.primary_color || '#7c3aed' }}>
                  <Crown className="w-4 h-4 mr-1" />
                  Premium
                </Badge>
              )}
              {profile.bio && (
                <p className="text-muted-foreground max-w-2xl mx-auto mt-4" style={{ color: 'rgba(17,24,39,0.85)' }}>
                  {profile.bio}
                </p>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  {socialLinks.map((link) => {
                    // Récupère la plateforme correspondant à link.platform_id
                    const platform = platforms.find((p) => p.id === link.platform_id);
                    const IconComponent = platform
                      ? (LucideIcons as Record<string, any>)[platform.icon_name]
                      : LucideIcons.Link; // fallback

                  return (
                    <a
                      key={link.id}
                      href={
                        link.url.startsWith("http://") || link.url.startsWith("https://")
                          ? link.url
                          : `https://${link.url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 ease-in-out hover:scale-110"
                      style={{
                        backgroundColor: profile.primary_color
                          ? profile.primary_color + "20"
                          : "rgba(0,0,0,0.04)"
                      }}
                      aria-label={`Ouvrir ${platform?.name || "lien"}`}
                    >
                      {IconComponent && (
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: profile.primary_color || "#0f172a" }}
                        />
                      )}
                    </a>

                    );
                  })}
                </div>
              )}

            </div>
          </CardHeader>
        </Card>

        {/* Contact Info */}
          {/* Contact Info (separate section) */}
          <section
            className="p-6 rounded-2xl"
            style={{
              background: profile.secondary_color ? profile.secondary_color + "0b" : "rgba(255,255,255,0.03)",
              boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              border: "1px solid rgba(15,23,42,0.04)",
            }}
          >
            <h2
              className="text-xl font-semibold mb-4"
              style={{
                color: profile.primary_color || '#6366f1',
                textShadow: `0 2px 8px ${profile.primary_color ? profile.primary_color + '40' : '#6366f140'}`,
              }}
            >
              Contacts
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {emails.map((email) => (
                <Card key={email.id} className="shadow-sm rounded-xl transition-shadow" style={{ background: 'transparent', border: 'none' }}>
                  <CardContent className="flex items-center gap-4 py-5">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-sm"
                      style={{ background: profile.primary_color ? profile.primary_color + '18' : '#e6f0ff' }}>
                      <MdEmail className="w-6 h-6" style={{ color: profile.primary_color || '#2563eb' }} />
                    </span>
                    <span className="text-lg font-semibold" style={{ color: 'rgba(2,6,23,0.85)' }}>{email.email}</span>
                  </CardContent>
                </Card>
              ))}

              {phones.map((phone) => (
                <Card key={phone.id} className="shadow-sm rounded-xl transition-shadow" style={{ background: 'transparent', border: 'none' }}>
                  <CardContent className="flex items-center gap-4 py-5">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-sm"
                      style={{ background: profile.primary_color ? profile.primary_color + '18' : '#e6fff0' }}>
                      <MdPhone className="w-6 h-6" style={{ color: profile.primary_color || '#16a34a' }} />
                    </span>
                    <span className="text-lg font-semibold" style={{ color: 'rgba(2,6,23,0.85)' }}>{phone.phone}</span>
                  </CardContent>
                </Card>
              ))}

              {addresses.map((address) => (
                <Card key={address.id} className="shadow-sm rounded-xl transition-shadow" style={{ background: 'transparent', border: 'none' }}>
                  <CardContent className="flex items-center gap-4 py-5">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-sm"
                      style={{ background: profile.primary_color ? profile.primary_color + '18' : '#fff7e6' }}>
                      <MdLocationOn className="w-6 h-6" style={{ color: profile.primary_color || '#d97706' }} />
                    </span>
                    <span className="text-lg font-semibold" style={{ color: 'rgba(2,6,23,0.85)' }}>{address.address}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

        {/* Gallery Block */}
          {/* Gallery Block (separate section) */}
          {gallery.length > 0 && (
            <section
              className="p-6 rounded-2xl"
              style={{
                background: profile.secondary_color ? profile.secondary_color + "0b" : "rgba(255,255,255,0.03)",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                border: "1px solid rgba(15,23,42,0.04)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-2"
                style={{
                  color: profile.primary_color || '#6366f1',
                  textShadow: `0 2px 8px ${profile.primary_color ? profile.primary_color + '40' : '#6366f140'}`,
                }}
              >
                Galerie
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mt-4">
                {gallery.map((image) => (
                  <Card key={image.id} className="overflow-hidden rounded-xl shadow-sm transition-shadow" style={{ background: 'transparent', border: 'none' }}>
                    <CardContent className="p-0">
                      <img
                        src={`${API_URL}${image.image_url}`}
                        alt="Gallery"
                        className="w-full h-44 object-cover transition-transform duration-300 ease-in-out hover:scale-105 rounded-md"
                        onError={(e) => (e.currentTarget.src = "/fallback-image.png")}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

        {/* Localisation Section */}
        {localizations.length > 0 && (
            <section
              className="p-6 rounded-2xl"
              style={{
                background: profile.secondary_color ? profile.secondary_color + "0b" : "rgba(255,255,255,0.03)",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                border: "1px solid rgba(15,23,42,0.04)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  color: profile.primary_color || '#6366f1',
                  textShadow: `0 2px 8px ${profile.primary_color ? profile.primary_color + '40' : '#6366f140'}`,
                }}
              >
                Localisation
              </h2>
              {(() => {
                const primaryLocalization = localizations.find(loc => loc.is_primary) || localizations[0];
                const getMapEmbedUrl = (latitude: number, longitude: number) => {
                    const lat = parseFloat(latitude.toString());
                    const lon = parseFloat(longitude.toString());
                    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05}%2C${lat - 0.025}%2C${lon + 0.05}%2C${lat + 0.025}&amp;layer=mapnik&amp;marker=${lat}%2C${lon}`;
                };

                return (
                    <div>
                        {primaryLocalization && (
                            <div className="mb-4">
                                <iframe
                                    width="100%"
                                    height="300"
                                    src={getMapEmbedUrl(primaryLocalization.latitude, primaryLocalization.longitude)}
                                    style={{ border: "1px solid black", borderRadius: "0.375rem" }}
                                    title="Map Preview"
                                ></iframe>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {localizations.map((loc) => (
                                <a
                                    key={loc.id}
                                    href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 border rounded-md hover:bg-gray-100/50"
                                >
                                    <MdLocationOn className="w-6 h-6" style={{ color: profile.primary_color || '#d97706' }} />
                                    <p className="font-semibold">{loc.address}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                );
              })()}
            </section>
        )}
      </main>
    </div>
  );
};

export default Profile;
