import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("none"); // 'none', 'asc', 'desc'

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [companyNames, setCompanyNames] = useState<string[]>([]);

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
        // Use server-provided type if available, otherwise keep existing or assume 'user'
        type: (p as any).type ? (p as any).type : (p.type ? p.type : "user"),
      }));

      // collect unique company names for the company filter
      const companiesSet = new Set<string>();
      allProfiles.forEach((p) => {
        if ((p as any).type === "company") companiesSet.add(p.display_name);
      });
      setCompanyNames(Array.from(companiesSet));

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
  const toggleFavorite = async (profileId: string, e: any) => {
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

  // helper pour rendre une carte de profil
  const renderProfileCard = (profile: Profile) => {
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
            {profile.tier === "free" ? "FREE" : profile.tier?.toUpperCase()}
          </Badge>

          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={`${favorites.has(profile.id) ? "text-red-600" : "text-gray-400 hover:text-red-500"}`}
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

  const filteredProfiles = (() => {
    const q = search.trim().toLowerCase();
    let filtered = profiles.filter((p) => {
      if (tierFilter !== "all" && p.tier !== tierFilter) return false;

      // Quand une société est sélectionnée, on montre uniquement cette société
      if (companyFilter !== "all") {
        if (p.type !== "company" || p.display_name !== companyFilter) {
          return false;
        }
      } else if (roleFilter !== "all" && p.type !== roleFilter) {
        // Sinon, on applique le filtre de rôle
        return false;
      }

      if (!q) return true;
      return (
        p.display_name.toLowerCase().includes(q) ||
        (p.bio || "").toLowerCase().includes(q)
      );
    });

    if (sortOrder !== "none") {
      filtered.sort((a, b) => {
        if (sortOrder === "asc") return a.display_name.localeCompare(b.display_name);
        return b.display_name.localeCompare(a.display_name);
      });
    }

    return filtered;
  })();

  const companyProfiles = filteredProfiles.filter((p) => p.type === "company");
  const userProfiles = filteredProfiles.filter((p) => p.type !== "company");

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
              <div className="w-full">
                <div className="bg-white/80 dark:bg-slate-800/60 rounded-xl p-4 shadow-sm w-full">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Rechercher par nom, compétence ou biographie..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full shadow-sm"
                        aria-label="Rechercher"
                      />
                    </div>

                    <div className="flex gap-2 flex-wrap items-center">
                      <Select onValueChange={setRoleFilter} value={roleFilter}>
                        <SelectTrigger className="w-full md:w-44">
                          <SelectValue placeholder="Tous les rôles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les rôles</SelectItem>
                          <SelectItem value="user">Utilisateurs</SelectItem>
                          <SelectItem value="company">Sociétés</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select onValueChange={setTierFilter} value={tierFilter}>
                        <SelectTrigger className="w-full md:w-44">
                          <SelectValue placeholder="Toutes les offres" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les offres</SelectItem>
                          <SelectItem value="free">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select onValueChange={setSortOrder} value={sortOrder}>
                        <SelectTrigger className="w-full md:w-44">
                          <SelectValue placeholder="Ordre par défaut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ordre par défaut</SelectItem>
                          <SelectItem value="asc">A-Z (Nom)</SelectItem>
                          <SelectItem value="desc">Z-A (Nom)</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select onValueChange={setCompanyFilter} value={companyFilter}>
                        <SelectTrigger className="w-full md:w-44">
                          <SelectValue placeholder="Toutes les sociétés" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les sociétés</SelectItem>
                          {companyNames.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        className="h-10 border rounded-lg w-full md:w-auto"
                        onClick={() => {
                          setSearch("");
                          setTierFilter("all");
                          setRoleFilter("all");
                          setSortOrder("none");
                          setCompanyFilter("all");
                        }}
                      >
                        Réinitialiser
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aucun profil correspondant à votre recherche.
            </div>
          ) : (
            <div>
              {companyProfiles.length > 0 && (
                <section className="mb-8">
                  <h3 className="text-2xl font-semibold mb-4">Sociétés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companyProfiles.map((profile) => renderProfileCard(profile))}
                  </div>
                </section>
              )}

              {userProfiles.length > 0 && (
                <section>
                  <h3 className="text-2xl font-semibold mb-4">
                    {companyProfiles.length > 0 ? "Utilisateurs" : "Profils"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProfiles.map((profile) => renderProfileCard(profile))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Index;
