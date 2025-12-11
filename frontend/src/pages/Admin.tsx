import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Crown,
  Ban,
  Check,
  Eye,
  EyeOff,
  ArrowLeft
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import QrModal from "@/components/QrModal";

const API_URL = import.meta.env.VITE_API_URL;

const Admin = () => {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [qrProfileId, setQrProfileId] = useState<string | null>(null);

  // State for profiles filtering
  const [profileSearch, setProfileSearch] = useState("");
  const [profileTierFilter, setProfileTierFilter] = useState("all");
  const [profileVisibilityFilter, setProfileVisibilityFilter] = useState("all");
  const [profileStatusFilter, setProfileStatusFilter] = useState("all");

  // State for company-profiles filtering (profiles with type 'company')
  const [companyProfileSearch, setCompanyProfileSearch] = useState("");
  const [companyProfileTierFilter, setCompanyProfileTierFilter] = useState("all");
  const [companyProfileVisibilityFilter, setCompanyProfileVisibilityFilter] = useState("all");
  const [companyProfileStatusFilter, setCompanyProfileStatusFilter] = useState("all");

  // State for companies filtering
  const [companySearch, setCompanySearch] = useState("");
  const [companyStatusFilter, setCompanyStatusFilter] = useState("all");

  useEffect(() => { checkAdminRole(); }, []);

  const checkAdminRole = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { toast.error("Vous devez être connecté"); navigate("/"); return; }

      const res = await fetch(`${API_URL}/auth/check-admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur de vérification");

      const data = await res.json();
      if (!data.isAdmin) { toast.error("Accès refusé"); navigate("/"); }
      else { setIsAdmin(true); await loadProfiles(); await loadCompanies(); }

    } catch (err: any) { toast.error(err.message || "Erreur admin"); navigate("/"); }
  };

  const loadProfiles = async () => {
    try {
      const res = await fetch(`${API_URL}/profiles`);
      if (!res.ok) throw new Error("Erreur chargement profils");
      setProfiles(await res.json());
    } catch (err: any) { toast.error(err.message); }
  };

  const loadCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifié");

      const res = await fetch(`${API_URL}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur chargement sociétés");
      setCompanies(await res.json());
    } catch (err: any) { toast.error(err.message || "Erreur entreprises"); }
    finally { setLoading(false); }
  };

  const updateProfile = async (profileId: string, updates: any) => {
    try {
        const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifié");
            const res = await fetch(`${API_URL}/profiles/${profileId}`, {
              method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // This header is crucial for authentication
          "Authorization": `Bearer ${token}`,
        },        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
      toast.success("Profil mis à jour");
      loadProfiles();
    } catch (err: any) { toast.error(err.message); }
  };

  // filtered user profiles (type != 'company')
  const filteredUserProfiles = useMemo(() => profiles.filter(p => {
    if (p.type === 'company') return false;
    const search = profileSearch.toLowerCase();
    const nameMatch = (p.display_name || "").toLowerCase().includes(search);
    const emailMatch = (p.email || "").toLowerCase().includes(search);
    const tierMatch = profileTierFilter === "all" || p.tier === profileTierFilter;
    const visibilityMatch = profileVisibilityFilter === "all" || p.visibility === profileVisibilityFilter;
    const statusMatch = profileStatusFilter === "all" || (p.is_banned ? "banned" : "active") === profileStatusFilter;
    return (nameMatch || emailMatch) && tierMatch && visibilityMatch && statusMatch;
  }), [profiles, profileSearch, profileTierFilter, profileVisibilityFilter, profileStatusFilter]);

  // filtered company profiles (type === 'company')
  const filteredCompanyProfiles = useMemo(() => profiles.filter(p => {
    if (p.type !== 'company') return false;
    const search = companyProfileSearch.toLowerCase();
    const nameMatch = (p.display_name || "").toLowerCase().includes(search);
    const emailMatch = (p.email || "").toLowerCase().includes(search);
    const tierMatch = companyProfileTierFilter === "all" || p.tier === companyProfileTierFilter;
    const visibilityMatch = companyProfileVisibilityFilter === "all" || p.visibility === companyProfileVisibilityFilter;
    const statusMatch = companyProfileStatusFilter === "all" || (p.is_banned ? "banned" : "active") === companyProfileStatusFilter;
    return (nameMatch || emailMatch) && tierMatch && visibilityMatch && statusMatch;
  }), [profiles, companyProfileSearch, companyProfileTierFilter, companyProfileVisibilityFilter, companyProfileStatusFilter]);

  const filteredCompanies = useMemo(() => companies.filter(c => {
    const search = companySearch.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(search);
    const emailMatch = (c.email || "").toLowerCase().includes(search);
    const statusMatch = companyStatusFilter === 'all' || (c.is_active ? 'active' : 'inactive') === companyStatusFilter;
    return (nameMatch || emailMatch) && statusMatch;
  }), [companies, companySearch, companyStatusFilter]);

  if (loading || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-hero">

      {/* HEADER */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <Button variant="outline" asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">

        {/* TABLE PROFILS UTILISATEURS */}
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white/10 backdrop-blur-md">
          <h2 className="text-xl font-bold p-4">Profils Utilisateurs ({filteredUserProfiles.length})</h2>

          <div className="p-4 flex gap-4 flex-wrap items-center">
            <Input 
              placeholder="Rechercher par nom ou email..."
              value={profileSearch}
              onChange={e => setProfileSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={profileTierFilter} onValueChange={setProfileTierFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={profileVisibilityFilter} onValueChange={setProfileVisibilityFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les visibilités</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="floux">Floux</SelectItem>
                <SelectItem value="private">Privé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={profileStatusFilter} onValueChange={setProfileStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="banned">Banni</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200/30">
              <tr>
                <th className="px-6 py-3 text-left">Nom</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Tier</th>
                <th className="px-6 py-3 text-left">Visibilité</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUserProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-white/10">
                  <td className="px-6 py-2 font-semibold">{p.display_name}</td>
                  <td className="px-6 py-2">{p.email || "-"}</td>

                  <td className="px-6 py-2">
                    <Select value={p.tier} onValueChange={(v) => updateProfile(p.id, { tier: v })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium"><span className="flex items-center gap-1"><Crown className="w-4 h-4" />Premium</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  <td className="px-6 py-2">
                    <Select value={p.visibility} onValueChange={(v) => updateProfile(p.id, { visibility: v })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public"><span className="flex items-center gap-1"><Eye className="w-4 h-4" />Public</span></SelectItem>
                        <SelectItem value="floux"><span className="flex items-center gap-1"><EyeOff className="w-4 h-4" />Floux</span></SelectItem>
                        <SelectItem value="private"><span className="flex items-center gap-1"><EyeOff className="w-4 h-4" />Privé</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  <td className="px-6 py-2">{p.is_banned ? <Badge variant="destructive">Banni</Badge> : <Badge>Actif</Badge>}</td>

                  <td className="px-6 py-2 flex gap-2 flex-wrap">
                    <Button size="sm" variant={p.is_banned ? "default" : "destructive"} onClick={() => updateProfile(p.id, { is_banned: !p.is_banned })}>
                      {p.is_banned ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </Button>

                    <Button size="sm" variant="secondary" onClick={() => setQrProfileId(p.id)}>
                      QR Code
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TABLE PROFILS SOCIETES (profiles with type 'company') */}
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white/10 backdrop-blur-md mt-8">
          <h2 className="text-xl font-bold p-4">Profils Sociétés ({filteredCompanyProfiles.length})</h2>

          <div className="p-4 flex gap-4 flex-wrap items-center">
            <Input 
              placeholder="Rechercher par nom ou email..."
              value={companyProfileSearch}
              onChange={e => setCompanyProfileSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={companyProfileTierFilter} onValueChange={setCompanyProfileTierFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyProfileVisibilityFilter} onValueChange={setCompanyProfileVisibilityFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les visibilités</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="floux">Floux</SelectItem>
                <SelectItem value="private">Privé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyProfileStatusFilter} onValueChange={setCompanyProfileStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="banned">Banni</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200/30">
              <tr>
                <th className="px-6 py-3 text-left">Nom</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Tier</th>
                <th className="px-6 py-3 text-left">Visibilité</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanyProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-white/10">
                  <td className="px-6 py-2 font-semibold">{p.display_name}</td>
                  <td className="px-6 py-2">{p.email || "-"}</td>

                  <td className="px-6 py-2">
                    <Select value={p.tier} onValueChange={(v) => updateProfile(p.id, { tier: v })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium"><span className="flex items-center gap-1"><Crown className="w-4 h-4" />Premium</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  <td className="px-6 py-2">
                    <Select value={p.visibility} onValueChange={(v) => updateProfile(p.id, { visibility: v })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public"><span className="flex items-center gap-1"><Eye className="w-4 h-4" />Public</span></SelectItem>
                        <SelectItem value="floux"><span className="flex items-center gap-1"><EyeOff className="w-4 h-4" />Floux</span></SelectItem>
                        <SelectItem value="private"><span className="flex items-center gap-1"><EyeOff className="w-4 h-4" />Privé</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  <td className="px-6 py-2">{p.is_banned ? <Badge variant="destructive">Banni</Badge> : <Badge>Actif</Badge>}</td>

                  <td className="px-6 py-2 flex gap-2 flex-wrap">
                    <Button size="sm" variant={p.is_banned ? "default" : "destructive"} onClick={() => updateProfile(p.id, { is_banned: !p.is_banned })}>
                      {p.is_banned ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </Button>

                    <Button size="sm" variant="secondary" onClick={() => setQrProfileId(p.id)}>
                      QR Code
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TABLE SOCIÉTÉS */}
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white/10 backdrop-blur-md">
        <h2 className="text-xl font-bold p-4">Sociétés ({filteredCompanies.length})</h2>

        <div className="p-4 flex gap-4 flex-wrap items-center">
            <Input 
              placeholder="Rechercher par nom ou email..."
              value={companySearch}
              onChange={e => setCompanySearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={companyStatusFilter} onValueChange={setCompanyStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200/30">
              <tr>
                <th className="px-6 py-3 text-left">Nom</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Téléphone</th>
                <th className="px-6 py-3 text-left">Site Web</th>
                <th className="px-6 py-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((c) => (
                <tr key={c.id} className="hover:bg-white/10">
                  <td className="px-6 py-2 font-semibold">{c.name}</td>
                  <td className="px-6 py-2">{c.email || "-"}</td>
                  <td className="px-6 py-2">{c.phone || "-"}</td>
                  <td className="px-6 py-2">{c.website ? <a href={c.website} target="_blank" className="text-blue-500 underline">{c.website}</a> : "-"}</td>
                  <td className="px-6 py-2">{c.is_active ? <Badge>Actif</Badge> : <Badge variant="destructive">Inactif</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {qrProfileId && <QrModal profileId={qrProfileId} onClose={() => setQrProfileId(null)} />}
    </div>
  );
};

export default Admin;
