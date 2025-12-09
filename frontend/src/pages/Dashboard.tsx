import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProfileEditor from "@/components/ProfileEditor";
import Navbar from "@/components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  // -----------------------
  //   Vérifier token + session
  // -----------------------
  const fetchSession = async () => {
    const token = localStorage.getItem("token");
    console.log("[DASHBOARD] token localStorage:", token);

    if (!token) {
      navigate("/auth");
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
        console.log("[DASHBOARD] Token invalide → redirection");
        localStorage.removeItem("token");
        navigate("/auth");
        return;
      }

      const data = await res.json();
      console.log("[DASHBOARD] user session:", data.user);

      setUser(data.user);

      // Si le user a déjà un profil dans la session
      if (data.user.profile) {
        setProfile(data.user.profile);
      } else {
        setProfile(null); // Aucun profil → formulaire création
      }
    } catch (err) {
      console.error("[DASHBOARD] session error:", err);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  //   Création ou mise à jour du profil
  // -----------------------
  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profiles/${user.profile?.id || ""}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        // Si 404 → profil inexistant → création possible
        setProfile(null);
        return;
      }

      const data = await res.json();
      setProfile(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Impossible de charger le profil");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // 1️⃣ Au montage : vérifier la session
  useEffect(() => {
    fetchSession();
  }, []);

  // -----------------------
  //   Loading UI
  // -----------------------
  if (loading || !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  // -----------------------
  //   UI principale
  // -----------------------
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-hero pt-20">
        <main className="container mx-auto px-4 py-8">
          {/* Si profil existant → édition, sinon → création */}
          <ProfileEditor profile={profile} onUpdate={loadProfile} />
        </main>
      </div>
    </>
  );
};

export default Dashboard;
