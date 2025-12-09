import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as LucideIcons from "lucide-react";
import { ForwardRefExoticComponent, SVGProps, RefAttributes } from "react";


interface ContactsEditorProps {
  profileId: string;
}

const API_URL = import.meta.env.VITE_API_URL;



const ContactsEditor = ({ profileId }: ContactsEditorProps) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [phones, setPhones] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);

  useEffect(() => {
    loadContacts();
    loadPlatforms();
  }, [profileId]);

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  /* ============================================================
     LOAD CONTACTS
  ============================================================ */
const loadContacts = async () => {
  try {
    const [emailsRes, phonesRes, addressesRes, socialRes] = await Promise.all([
      fetch(`${API_URL}/profiles/${profileId}/emails`, { headers: getHeaders() }).then(r => r.ok ? r.json() : []),
      fetch(`${API_URL}/profiles/${profileId}/phones`, { headers: getHeaders() }).then(r => r.ok ? r.json() : []),
      fetch(`${API_URL}/profiles/${profileId}/addresses`, { headers: getHeaders() }).then(r => r.ok ? r.json() : []),
      fetch(`${API_URL}/profiles/${profileId}/social-links`, { headers: getHeaders() }).then(r => r.ok ? r.json() : []),
    ]);

    setEmails(Array.isArray(emailsRes) ? emailsRes : []);
    setPhones(Array.isArray(phonesRes) ? phonesRes : []);
    setAddresses(Array.isArray(addressesRes) ? addressesRes : []);
    setSocialLinks(Array.isArray(socialRes) ? socialRes : []);
  } catch (error) {
    toast.error("Erreur lors du chargement des contacts");
    setEmails([]);
    setPhones([]);
    setAddresses([]);
    setSocialLinks([]);
  }
};

  /* ============================================================
     PLATFORMS
  ============================================================ */
  const loadPlatforms = async () => {
    try {
      const res = await fetch(`${API_URL}/social_platforms`);
      const data = await res.json();
      setPlatforms(data);
    } catch {
      toast.error("Erreur lors du chargement des plateformes");
    }
  };

  /* ============================================================
     EMAILS
  ============================================================ */
  const generateTempId = (prefix = "new") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  const addEmail = () => {
    const newEmail = { id: generateTempId("email"), email: "", label: "", isNew: true };
    setEmails((prev) => [...prev, newEmail]);
  };
  const saveEmail = async (emailObj: any) => {
    try {
      const res = await fetch(`${API_URL}/profiles/${profileId}/emails`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email: emailObj.email, label: emailObj.label }),
      });

      await res.json().catch(() => null);
      // replace temp with created and refresh from server to ensure consistency
      await loadContacts();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const cancelEmail = () => {
    // revert by reloading from server
    loadContacts();
  };

  const startEditEmail = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isEditing: true } : e));
  };



  const updateEmailLocal = (id: string, field: string, value: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const updateEmail = async (id: string, field: string, value: string) => {
    // Only PATCH if not isNew and not a temp id
    const emailObj = emails.find(e => e.id === id);
    if (!emailObj || emailObj.isNew || id.startsWith("email-")) return;
    try {
      await fetch(`${API_URL}/profiles/emails/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ [field]: value }),
      });
      // refresh to avoid stale states / 404 after modifications
      await loadContacts();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteEmail = async (id: string) => {
    try {
      await fetch(`${API_URL}/profiles/emails/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      loadContacts();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  /* ============================================================
     PHONES
  ============================================================ */
/* PHONES */
const addPhone = () => {
  const newPhone = { id: generateTempId("phone"), phone: "", label: "", isNew: true };
  setPhones((prev) => [...prev, newPhone]);
};

const savePhone = async (phoneObj: any) => {
  try {
    const res = await fetch(`${API_URL}/profiles/${profileId}/phones`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ phone: phoneObj.phone, label: phoneObj.label }),
    });
    await res.json().catch(() => null);
    await loadContacts();
  } catch {
    toast.error("Erreur lors de l'enregistrement");
  }
};

const cancelPhone = () => {
  loadContacts();
};

const updatePhoneLocal = (id: string, field: string, value: string) => {
  setPhones((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
};

const updatePhone = async (id: string, field: string, value: string) => {
  const phoneObj = phones.find(p => p.id === id);
  if (!phoneObj || phoneObj.isNew || id.startsWith("phone-")) return;
  try {
    await fetch(`${API_URL}/profiles/phones/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ [field]: value }),
    });
    await loadContacts();
  } catch {
    toast.error("Erreur lors de la mise à jour");
  }
};

const deletePhone = async (id: string) => {
  try {
    await fetch(`${API_URL}/profiles/phones/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    loadContacts();
  } catch {
    toast.error("Erreur lors de la suppression");
  }
};


  /* ============================================================
     ADDRESSES
  ============================================================ */
const addAddress = () => {
  const newAddress = { id: generateTempId("address"), address: "", label: "", isNew: true };
  setAddresses((prev) => [...prev, newAddress]);
};

const saveAddress = async (addressObj: any) => {
  try {
    const res = await fetch(`${API_URL}/profiles/${profileId}/addresses`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ address: addressObj.address, label: addressObj.label }),
    });
    await res.json().catch(() => null);
    await loadContacts();
  } catch {
    toast.error("Erreur lors de l'enregistrement");
  }
};

const cancelAddress = () => {
  loadContacts();
};

const updateAddressLocal = (id: string, field: string, value: string) => {
  setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
};

const updateAddress = async (id: string, field: string, value: string) => {
  const addressObj = addresses.find(a => a.id === id);
  if (!addressObj || addressObj.isNew || id.startsWith("address-")) return;
  try {
    await fetch(`${API_URL}/profiles/addresses/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ [field]: value }),
    });
    await loadContacts();
  } catch {
    toast.error("Erreur lors de la mise à jour");
  }
};

const deleteAddress = async (id: string) => {
  try {
    await fetch(`${API_URL}/profiles/addresses/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    loadContacts();
  } catch {
    toast.error("Erreur lors de la suppression");
  }
};
  /* ============================================================
     SOCIAL LINKS
  ============================================================ */
const addSocialLink = () => {
  if (!platforms.length) return toast.error("Aucune plateforme disponible");

  const defaultPlatformId = platforms[0]?.id ?? null;
  const newLink = { id: generateTempId("social"), platform_id: defaultPlatformId, url: "", isNew: true };
  setSocialLinks((prev) => [...prev, newLink]);
};

const saveSocialLink = async (linkObj: any) => {
  try {
    const res = await fetch(`${API_URL}/profiles/${profileId}/social-links`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ platform_id: linkObj.platform_id, url: linkObj.url }),
    });
    await res.json().catch(() => null);
    await loadContacts();
  } catch {
    toast.error("Erreur lors de l'enregistrement");
  }
};

const cancelSocialLink = () => {
  loadContacts();
};

const startEditPhone = (id: string) => {
  setPhones(prev => prev.map(p => p.id === id ? { ...p, isEditing: true } : p));
};

const startEditAddress = (id: string) => {
  setAddresses(prev => prev.map(a => a.id === id ? { ...a, isEditing: true } : a));
};

const startEditSocial = (id: string) => {
  setSocialLinks(prev => prev.map(s => s.id === id ? { ...s, isEditing: true } : s));
};

const updateSocialLinkLocal = (id: string, field: string, value: any) => {
  setSocialLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
};

const updateSocialLink = async (id: string, field: string, value: any) => {
  const linkObj = socialLinks.find(l => l.id === id);
  if (!linkObj || linkObj.isNew || id.startsWith("social-")) return;
  try {
    await fetch(`${API_URL}/social-links/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ [field]: value }),
    });
    await loadContacts();
  } catch {
    toast.error("Erreur lors de la mise à jour");
  }
};

const deleteSocialLink = async (id: string) => {
  try {
    await fetch(`${API_URL}/social-links/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    loadContacts();
  } catch {
    toast.error("Erreur lors de la suppression");
  }
};

  const moveSocialLink = async (id: string, direction: "up" | "down") => {
    const index = socialLinks.findIndex((l) => l.id === id);

    if ((direction === "up" && index === 0) ||
        (direction === "down" && index === socialLinks.length - 1)) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;

    const newOrder = [...socialLinks];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];

    try {
      await Promise.all(
        newOrder.map((link, idx) =>
          fetch(`${API_URL}/social-links/${link.id}/order`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ display_order: idx }),
          })
        )
      );

      setSocialLinks(newOrder);
    } catch {
      toast.error("Erreur lors du tri");
    }
  };



  
  /* ============================================================
     RENDER
  ============================================================ */
/* ============================================================
   RENDER
============================================================ */
return (
  <div className="space-y-10">
    {/* EMAILS */}
    <Card className="p-6 shadow-lg border rounded-xl bg-white">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-lg text-blue-700 flex items-center gap-2">
          <LucideIcons.Mail className="h-5 w-5 text-blue-500" /> Emails
        </h3>
        <Button onClick={addEmail} size="sm" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>
      <div className="space-y-3">
        {emails.map((email) => (
          <div key={email.id} className="flex gap-2 items-center bg-gray-50 rounded-lg px-3 py-2">
            <Input
              value={email.email}
              onChange={(e) => updateEmailLocal(email.id, "email", e.target.value)}
              disabled={!email.isEditing && !email.isNew}
              className="flex-1"
              placeholder="Adresse email"
            />
            <Input
              value={email.label || ""}
              onChange={(e) => updateEmailLocal(email.id, "label", e.target.value)}
              disabled={!email.isEditing && !email.isNew}
              className="w-32"
              placeholder="Label"
            />
            {email.isNew ? (
              <>
                <Button onClick={() => saveEmail(email)} className="bg-green-100 text-green-700 hover:bg-green-200">Valider</Button>
                <Button variant="destructive" onClick={() => cancelEmail()} className="ml-1">Annuler</Button>
              </>
            ) : email.isEditing ? (
              <>
                <Button onClick={() => { updateEmail(email.id, "email", email.email); updateEmail(email.id, "label", email.label); loadContacts(); }} className="bg-green-100 text-green-700 hover:bg-green-200">Valider</Button>
                <Button variant="secondary" onClick={() => loadContacts()} className="ml-1">Annuler</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => startEditEmail(email.id)} className="mr-1">Modifier</Button>
                <Button variant="destructive" onClick={() => deleteEmail(email.id)} className="ml-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
    {/* PHONES */}
    <Card className="p-6 shadow-lg border rounded-xl bg-white">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-lg text-purple-700 flex items-center gap-2">
          <LucideIcons.Phone className="h-5 w-5 text-purple-500" /> Téléphones
        </h3>
        <Button onClick={addPhone} size="sm" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>
      <div className="space-y-3">
        {phones.map((p) => (
          <div key={p.id} className="flex gap-2 items-center bg-gray-50 rounded-lg px-3 py-2">
            <Input
              value={p.phone}
              onChange={(e) => updatePhoneLocal(p.id, "phone", e.target.value)}
              disabled={!p.isEditing && !p.isNew}
              className="flex-1"
              placeholder="Numéro de téléphone"
            />
            <Input
              value={p.label || ""}
              onChange={(e) => updatePhoneLocal(p.id, "label", e.target.value)}
              disabled={!p.isEditing && !p.isNew}
              className="w-32"
              placeholder="Label"
            />
            {p.isNew ? (
              <>
                <Button onClick={() => savePhone(p)} className="bg-green-100 text-green-700 hover:bg-green-200">Valider</Button>
                <Button variant="destructive" onClick={() => cancelPhone()} className="ml-1">Annuler</Button>
              </>
            ) : p.isEditing ? (
              <>
                <Button onClick={() => { updatePhone(p.id, "phone", p.phone); updatePhone(p.id, "label", p.label); loadContacts(); }} className="bg-green-100 text-green-700 hover:bg-green-200">Valider</Button>
                <Button variant="secondary" onClick={() => loadContacts()} className="ml-1">Annuler</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => startEditPhone(p.id)} className="mr-1">Modifier</Button>
                <Button size="icon" variant="destructive" onClick={() => deletePhone(p.id)} className="ml-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
    {/* ADDRESSES */}
    <Card className="p-6 shadow-lg border rounded-xl bg-white">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-lg text-teal-700 flex items-center gap-2">
          <LucideIcons.MapPin className="h-5 w-5 text-teal-500" /> Adresses
        </h3>
        <Button onClick={addAddress} size="sm" className="bg-teal-100 text-teal-700 hover:bg-teal-200">
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>
      <div className="space-y-3">
        {addresses.map((a) => (
          <div key={a.id} className="flex gap-2 items-center bg-gray-50 rounded-lg px-3 py-2">
            <Input
              value={a.address}
              onChange={(e) => updateAddressLocal(a.id, "address", e.target.value)}
              disabled={!a.isEditing && !a.isNew}
              className="flex-1"
              placeholder="Adresse"
            />
            <Input
              value={a.label || ""}
              onChange={(e) => updateAddressLocal(a.id, "label", e.target.value)}
              disabled={!a.isEditing && !a.isNew}
              className="w-32"
              placeholder="Label"
            />
            {a.isNew ? (
              <>
                <Button onClick={() => saveAddress(a)} className="bg-green-100 text-green-700 hover:bg-green-200">Valider</Button>
                <Button variant="destructive" onClick={() => cancelAddress()} className="ml-1">Annuler</Button>
              </>
            ) : a.isEditing ? (
              <>
                <Button onClick={() => { updateAddress(a.id, "address", a.address); updateAddress(a.id, "label", a.label); loadContacts(); }} className="bg-green-100 text-green-700 hover:bg-green-200">Valider</Button>
                <Button variant="secondary" onClick={() => loadContacts()} className="ml-1">Annuler</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => startEditAddress(a.id)} className="mr-1">Modifier</Button>
                <Button size="icon" variant="destructive" onClick={() => deleteAddress(a.id)} className="ml-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
    {/* SOCIAL LINKS */}
    <Card className="p-6 shadow-lg border rounded-xl bg-white">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-lg text-pink-700 flex items-center gap-2">
          <LucideIcons.Users className="h-5 w-5 text-pink-500" /> Réseaux sociaux
        </h3>
        <Button onClick={addSocialLink} size="sm" className="bg-pink-100 text-pink-700 hover:bg-pink-200">
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>
      <div className="space-y-3">
        {socialLinks.map((s, index) => {
          const currentPlatform = platforms.find(p => p.id === s.platform_id);
          const IconComponent = currentPlatform?.icon_name
            ? (LucideIcons as unknown as Record<string, ForwardRefExoticComponent<SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>>>)[currentPlatform.icon_name]
            : null;
          return (
            <div key={s.id} className="flex gap-2 items-center bg-gray-50 rounded-lg px-3 py-2">
              {/* Déplacement */}
              <div className="flex flex-col mr-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => moveSocialLink(s.id, "up")}
                  disabled={index === 0}
                  className="h-6 w-6"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => moveSocialLink(s.id, "down")}
                  disabled={index === socialLinks.length - 1}
                  className="h-6 w-6"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              <Select
                value={String(s.platform_id)}
                onValueChange={(val) => updateSocialLinkLocal(s.id, "platform_id", val)}
                disabled={!s.isEditing && !s.isNew}
              >
                <SelectTrigger className="w-48 flex items-center gap-2">
                  <SelectValue asChild>
                    <div className="flex items-center gap-2">
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      <span>{currentPlatform?.name || "Sélectionner"}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => {
                    const ItemIcon = (LucideIcons as unknown as Record<string, ForwardRefExoticComponent<SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>>>)[p.icon_name];
                    return (
                      <SelectItem key={p.id} value={String(p.id)}>
                        <div className="flex items-center gap-2">
                          {ItemIcon && <ItemIcon className="h-4 w-4" />}
                          <span>{p.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Input
                value={s.url}
                onChange={(e) => updateSocialLinkLocal(s.id, "url", e.target.value)}
                disabled={!s.isEditing && !s.isNew}
                className="flex-1"
                placeholder="Lien du profil"
              />
              {s.isNew ? (
                <>
                  <Button onClick={() => saveSocialLink(s)} className="bg-green-100 text-green-700 hover:bg-green-200">Valider</Button>
                  <Button variant="destructive" onClick={() => cancelSocialLink()} className="ml-1">Annuler</Button>
                </>
              ) : s.isEditing ? (
                <>
                  <Button onClick={() => { updateSocialLink(s.id, "platform_id", s.platform_id); updateSocialLink(s.id, "url", s.url); loadContacts(); }} className="bg-green-100 text-green-700 hover:bg-green-200">Valider</Button>
                  <Button variant="secondary" onClick={() => loadContacts()} className="ml-1">Annuler</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => startEditSocial(s.id)} className="mr-1">Modifier</Button>
                  <Button size="icon" variant="destructive" onClick={() => deleteSocialLink(s.id)} className="ml-1">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  </div>
);

};

export default ContactsEditor;
