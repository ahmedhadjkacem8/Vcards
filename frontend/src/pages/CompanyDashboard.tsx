import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // ❌ Pas connecté -> auth
    if (!token || !storedUser) {
      navigate("/auth");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // ❌ Pas un compte company -> dashboard normal
    if (parsedUser.role !== "company") {
      navigate("/dashboard");
      return;
    }

    // ✅ Récupérer la société liée
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${API_URL}/companies/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Erreur serveur");

        if (!data || data.length === 0) {
          // Pas encore de société -> page création
          navigate("/company/create");
          return;
        }

        // Si l'utilisateur peut avoir plusieurs sociétés
        // on prend la première pour le dashboard
        setCompany(data[0]);
      } catch (error: any) {
        console.error("Error fetching company:", error);
        // En cas d'erreur -> créer une société
        navigate("/company/create");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  if (loading) return <p className="text-center mt-20">Chargement...</p>;
  if (!company) return null;

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">🏢 Dashboard Société</h1>
          <Button variant="destructive" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la société</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Nom :</strong> {company.name}</p>
            <p><strong>Description :</strong> {company.description || "—"}</p>
            <p><strong>Site Web :</strong> {company.website || "—"}</p>

            {company.logo && (
              <img
                src={`${API_URL}${company.logo}`}
                alt="Logo"
                className="w-32 h-32 object-contain mt-4 border rounded"
              />
            )}
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Compte connecté</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email :</strong> {user.email}</p>
            <p><strong>Rôle :</strong> {user.role}</p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button onClick={() => navigate(`/company/edit/${company.id}`)}>
            Modifier la société
          </Button>

        <Button
          variant="outline"
          onClick={() => navigate(`/company/${company.id}/employees`)}
        >
          Voir les employés
        </Button>

        </div>
      </div>
    </div>
  </>
  );
};

export default CompanyDashboard;
