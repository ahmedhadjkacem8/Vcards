import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Crown, Lock, Globe } from "lucide-react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string;
  cover_url?: string;
  primary_color?: string;
  tier: string;
  visibility: "public" | "private" | "floux";
  bio?: string;
  blurred: boolean;
  type?: "user" | "company";
}

interface Favorite {
  profile_id: string;
}

interface UserType {
  id: string;
  email: string;
  profile?: {
    id: string;
    display_name: string;
    tier: string; // Add tier to the profile
  };
}

const Index = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all"); // 'all', 'user', 'company'
  const [sortOrder, setSortOrder] = useState<string>("none"); // 'none', 'asc', 'desc'

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // -------- helper pour récupérer le token --------
  const getToken = () => localStorage.getItem("token");

  // -------- récupérer utilisateur connecté --------
  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
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
        localStorage.removeItem("token"); // supprime token invalide
        setUser(null);
        return;
      }

      const data = await res.json();
      // Assuming data.user contains { id, email, profile: { id, display_name, tier } }
      setUser(data.user ? {
        id: data.user.id,
        email: data.user.email,
        profile: data.user.profile ? {
          id: data.user.profile.id,
          display_name: data.user.profile.display_name,
          tier: data.user.profile.tier,
        } : undefined
      } : null);
    } catch (err) {
      console.error("[fetchUser] Erreur:", err);
      setUser(null);
    }
  }, []);


  // -------- charger profils --------
  const loadProfiles = useCallback(async () => {
    try {
      // 1) Charger tous les profils PUBLIC
      const publicRes = await fetch(`${API_URL}/profiles?visibility=public`);
      const publicData = await publicRes.json();

      // 2) Charger toujours les FLOUX (même si user n'est pas premium)
      const flouxRes = await fetch(`${API_URL}/profiles?visibility=floux`);
      const flouxData = await flouxRes.json();

      // éviter doublons
      let allProfiles: Profile[] = [...publicData];

      const flouxToAdd = flouxData.filter(
        (p: Profile) => !allProfiles.some((x) => x.id === p.id)
      );

      allProfiles = [...allProfiles, ...flouxToAdd];

      // 3) marquer les profils floux comme "blurred" si user free
      const isUserPremium = user?.profile?.tier === "premium";

      allProfiles = allProfiles.map((p) => ({
        ...p,
        blurred: p.visibility === "floux" && !isUserPremium,
        type: "user", // Temporary: Assume all are 'user' for now
      }));

      setProfiles(allProfiles);
    } catch (err) {
      console.error("[loadProfiles] Erreur:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);


  // -------- charger favoris --------
  const loadFavorites = useCallback(async () => {
    const token = getToken();
    if (!token || !user) return;

    try {
      const res = await fetch(`${API_URL}/favorites`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Impossible de charger les favoris");
      const data: Favorite[] = await res.json();
      setFavorites(new Set(data.map(f => f.profile_id)));
    } catch (err) {
      console.error("[loadFavorites] Erreur:", err);
    }
  }, [user]);

  // -------- toggle favori --------
  const toggleFavorite = async (profileId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();
    if (!token) {
      toast.error("Vous devez être connecté pour ajouter des favoris");
      return;
    }

    try {
      if (favorites.has(profileId)) {
        const res = await fetch(`${API_URL}/favorites/${profileId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        await loadFavorites();
        if (!res.ok) throw new Error("Impossible de retirer le favori");
        toast.success("Retiré des favoris");
      } else {
        const res = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profile_id: profileId }),
        });
        await loadFavorites();
        if (!res.ok) throw new Error("Profile déja ajouté aux favoris");
        toast.success("Ajouté aux favoris");
      }
    } catch (err: any) {
      await loadFavorites();
      toast.error(err.message || "Erreur lors de la mise à jour");
    }
  };

  // -------- effets --------
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    if (user) loadFavorites();
  }, [user, loadFavorites]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-hero pt-20">
        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-6 space-y-4">
            <h2 className="text-5xl font-bold">
              Découvrez les{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                profils
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explorez notre collection de profils professionnels et connectez-vous
              avec des talents
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <Input
                placeholder="Rechercher par nom, compétence ou biographie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 shadow-sm"
              />

              <div className="flex items-center gap-3">
                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-10 w-44 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="user">Utilisateurs</option>
                  <option value="company">Sociétés</option>
                </select>

                {/* Tier Filter */}
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="h-10 w-44 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">Toutes les offres</option>
                  <option value="free">Standard</option>
                  <option value="premium">Premium</option>
                </select>

                {/* Sort Order */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="h-10 w-44 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="none">Ordre par défaut</option>
                  <option value="asc">A-Z (Nom)</option>
                  <option value="desc">Z-A (Nom)</option>
                </select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setTierFilter("all");
                    setRoleFilter("all");
                    setSortOrder("none");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : (
            <div>
              {/* filtered list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles
                  .filter((p) => {
                    if (tierFilter !== "all" && p.tier !== tierFilter) return false;
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      p.display_name.toLowerCase().includes(q) ||
                      (p.bio || "").toLowerCase().includes(q)
                    );
                  })
                  .map((profile) => {
                    const shouldBlur = profile.blurred === true;

                    const CardContentBlock = (
                      <Card
                        className={`group h-full rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl ${shouldBlur ? "blur-sm select-none pointer-events-none" : ""
                          }`}
                      >
                        <div className="relative">
                          {profile.cover_url ? (
                            <div className="h-36 w-full overflow-hidden">
                              <img
                                src={`${API_URL}${profile.cover_url}`}
                                alt="Cover"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-36 w-full bg-gradient-to-r from-gray-100 to-gray-50" />
                          )}

                          <div className="absolute -bottom-10 left-6">
                            {profile.avatar_url ? (
                              <img
                                src={`${API_URL}${profile.avatar_url}`}
                                alt={profile.display_name}
                                className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
                              />
                            ) : (
                              <div
                                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold ring-4 ring-white shadow-md"
                                style={{ backgroundColor: profile.primary_color }}
                              >
                                {profile.display_name[0]}
                              </div>
                            )}
                          </div>
                        </div>

                        <CardContent className="pt-12 pb-6 px-6">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            {profile.display_name}
                            {profile.tier === "premium" && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </h3>

                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {profile.bio}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="w-4 h-4" />{" "}
                              {profile.visibility === "public" ? "Public" : "Privé"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );

                    return (
                      <div key={profile.id} className="relative">
                        {/* Empêcher le clic si flouté */}
                        {shouldBlur ? (
                          CardContentBlock
                        ) : (
                          <Link to={`/profile/${profile.id}`}>{CardContentBlock}</Link>
                        )}

                        {/* Top-right controls */}
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                          <Badge
                            className="uppercase text-xs px-2 py-1 rounded-md shadow"
                            style={{
                              background:
                                profile.tier === "premium"
                                  ? "linear-gradient(90deg,#f6d365,#fda085)"
                                  : undefined,
                            }}
                          >
                            {profile.tier === "free"
                              ? "FREE"
                              : profile.tier?.toUpperCase()}
                          </Badge>

                          {user && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`${favorites.has(profile.id)
                                  ? "text-red-600"
                                  : "text-gray-400 hover:text-red-500"
                                }`}
                              onClick={(e) => toggleFavorite(profile.id, e)}
                            >
                              {favorites.has(profile.id) ? (
                                <FaHeart className="w-5 h-5" />
                              ) : (
                                <FaRegHeart className="w-5 h-5" />
                              )}
                            </Button>
                          )}
                        </div>

                        {/* OVERLAY FLOU */}
                        {shouldBlur && (
                          <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center text-white font-bold text-sm rounded-2xl">
                            Réservé aux membres Premium
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* empty state */}
              {profiles.filter(
                (p) =>
                  (tierFilter === "all" || p.tier === tierFilter) &&
                  (search.trim() === "" ||
                    p.display_name
                      .toLowerCase()
                      .includes(search.trim().toLowerCase()) ||
                    (p.bio || "")
                      .toLowerCase()
                      .includes(search.trim().toLowerCase()))
              ).length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    Aucun profil correspondant à votre recherche.
                  </div>
                )}
            </div>
          )}
        </main>
      </div>
    </>
  );

};

export default Index;
