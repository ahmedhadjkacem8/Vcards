import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FaHeart } from "react-icons/fa";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface Profile {
  id: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  primary_color?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les favoris au montage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vous devez être connecté pour voir vos favoris");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/favorites`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expirée, veuillez vous reconnecter");
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Erreur lors du chargement des favoris");

      const data: Profile[] = await res.json();
      // Filtrer les profils valides
      setFavorites(data.filter(p => p && p.id && p.display_name));
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement des favoris");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un favori
  const removeFavorite = async (profileId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vous devez être connecté pour retirer un favori");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/favorites/${profileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erreur lors de la suppression");
      }

      setFavorites(prev => prev.filter(p => p.id !== profileId));
      toast.success("Favori retiré");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-hero pt-20">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
            Mes Favoris
          </h1>

          {favorites.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Aucun profil favori pour le moment</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map(profile => (
                <Card
                  key={profile.id}
                  className="overflow-visible rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/profile/${profile.id}`)}
                  style={{ position: 'relative' }}
                >
                  <CardContent className="p-8 pb-6">
                    <div className="flex items-center gap-5 mb-4">
                      <div className="relative">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url.startsWith("http") ? profile.avatar_url : `${API_URL}${profile.avatar_url}`}
                            alt={profile.display_name || "Profil"}
                            className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg -mt-10"
                            style={{ position: 'relative', zIndex: 2 }}
                          />
                        ) : (
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white shadow-lg -mt-10"
                            style={{ backgroundColor: profile.primary_color || "#4F46E5", position: 'relative', zIndex: 2 }}
                          >
                            {profile.display_name ? profile.display_name[0].toUpperCase() : "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl mb-1">
                          {profile.display_name || "Nom inconnu"}
                        </h3>
                        {profile.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {profile.bio}
                          </p>
                        )}
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow">
                          Favori
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 transition-transform duration-200"
                        style={{ position: 'relative', zIndex: 3 }}
                        onClick={e => {
                          e.stopPropagation();
                          removeFavorite(profile.id);
                        }}
                        aria-label="Retirer des favoris"
                      >
                        <FaHeart className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Favorites;
