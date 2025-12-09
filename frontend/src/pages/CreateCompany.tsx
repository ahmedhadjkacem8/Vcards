import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


const API_URL = import.meta.env.VITE_API_URL;

const CreateCompany = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, website }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      localStorage.setItem("company", JSON.stringify(data));
      navigate("/company-dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Créer votre société</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Nom de la société"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          placeholder="Site web"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer la société"}
        </Button>
      </form>
    </div>
  );
};

export default CreateCompany;
