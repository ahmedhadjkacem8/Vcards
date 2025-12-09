import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, User, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";

const API_URL = import.meta.env.VITE_API_URL;

interface UserType {
  id: string;
  display_name?: string;
  role?: "user" | "company" | "admin";
  isAdmin?: boolean;
}

const Navbar = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Utilisateur non connecté");

      const data = await res.json();

      const userData: UserType = {
        id: data.user.id,
        display_name: data.user.profile?.display_name || data.user.email,
        role: data.user.role || data.user.profile?.role,
      };

      let isAdmin = false;
      try {
        const adminRes = await fetch(`${API_URL}/auth/check-admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (adminRes.ok) {
          const adminData = await adminRes.json().catch(() => ({}));
          isAdmin =
            adminData?.isAdmin === true ||
            adminData?.admin === true ||
            adminData?.is_admin === true ||
            Object.keys(adminData).length === 0;
        }
      } catch (e) {
        console.warn("check-admin failed", e);
      }

      userData.isAdmin = isAdmin;
      setUser(userData);
    } catch (err) {
      setUser(null);
      console.error("[Navbar] fetchUser error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Déconnecté avec succès !");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logoImg} alt="ProfileHub" className="h-10 w-auto" />
        </Link>


        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost">Home</Button>
          </Link>

          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">
                  <User className="w-4 h-4 mr-2" />
                  {user.display_name || "Mon profil"}
                </Button>
              </Link>

              <Link to="/favorites">
                <Button variant="ghost">
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites
                </Button>
              </Link>

              {user.isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" className="text-yellow-600 font-bold">
                    Admin
                  </Button>
                </Link>
              )}

              {user.role === "company" && (
                <Link to="/company-dashboard">
                  <Button variant="ghost">Dashboard Société</Button>
                </Link>
              )}

              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default">Connexion</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card/90 backdrop-blur-lg border-t border-border/50">
          <div className="flex flex-col px-4 py-3 gap-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-left">
                Home
              </Button>
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-left">
                    <User className="w-4 h-4 mr-2" />
                    {user.display_name || "Mon profil"}
                  </Button>
                </Link>

                <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-left">
                    <Heart className="w-4 h-4 mr-2" />
                    Favorites
                  </Button>
                </Link>

                {user.isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-left text-yellow-600 font-bold">
                      Admin
                    </Button>
                  </Link>
                )}

                {user.role === "company" && (
                  <Link to="/company-dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-left">
                      Dashboard Société
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  className="w-full text-left"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full">
                  Connexion
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
