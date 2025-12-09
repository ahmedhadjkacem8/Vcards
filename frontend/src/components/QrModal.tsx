import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const API_URL = import.meta.env.VITE_API_URL;

type Props = {
  profileId: string;
  onClose: () => void;
  logoUrl?: string;
  profileImageUrl?: string;
};


const QrModal = ({ profileId, onClose, logoUrl, profileImageUrl }: Props) => {
  const qrRef = useRef<QRCodeStyling | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("transparent");
  const [gradient, setGradient] = useState<{ from: string; to: string; type?: "linear" | "radial" } | null>(null);

  const [cornerShape, setCornerShape] = useState<"square" | "dots" | "rounded">("square");
  const [cornerDotShape, setCornerDotShape] = useState<"square" | "dots" | "rounded">("dots");

  const [frameStyle, setFrameStyle] = useState<"none" | "circle" | "rounded-square" | "double-line">("none");
  const [modulePattern, setModulePattern] = useState<"square" | "dots" | "rounded" | "classy" | "extra-rounded">("square");

  const [logoSize, setLogoSize] = useState(0.2);
  const [qrSize, setQrSize] = useState(280);
  const [downloadSize, setDownloadSize] = useState(1024);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("H");
  const [tempLogo, setTempLogo] = useState<string | null>(null);
  const [useProfilePhoto, setUseProfilePhoto] = useState(false);
  const [logoShape, setLogoShape] = useState<"square" | "circle">("square");

  const [activeTab, setActiveTab] = useState<"colors" | "style" | "logo" | "size" | "presets">("colors");
  const [presets, setPresets] = useState<any[]>([]);
  const [presetName, setPresetName] = useState("");

  const url = `${window.location.origin}/profile/${profileId}?source=qr`;

  const getOriginalLogo = () => {
    if (useProfilePhoto && profileImageUrl) return profileImageUrl;
    if (tempLogo) return tempLogo;
    return logoUrl || undefined;
  };

  // State to hold the processed logo (e.g., rounded)
  const [processedLogo, setProcessedLogo] = useState<string | undefined>(getOriginalLogo());

  useEffect(() => {
    const processLogo = async () => {
      const originalLogo = getOriginalLogo();
      if (!originalLogo) {
        setProcessedLogo(undefined);
        return;
      }

      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (logoShape === 'circle') {
          ctx.beginPath();
          ctx.arc(image.width / 2, image.height / 2, image.width / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
        }

        ctx.drawImage(image, 0, 0, image.width, image.height);
        setProcessedLogo(canvas.toDataURL('image/png'));
      };
      image.src = originalLogo;
    };

    processLogo();
  }, [logoShape, tempLogo, useProfilePhoto, profileImageUrl, logoUrl]);

  const qrOptionsConfig = () => {
    const dotsGradient = gradient
      ? {
          type: gradient.type || "linear",
          rotation: 0,
          colorStops: [
            { offset: 0, color: gradient.from },
            { offset: 1, color: gradient.to },
          ],
        }
      : undefined;

    return {
      width: qrSize,
      height: qrSize,
      data: url,
      margin: 0,
      qrOptions: { errorCorrectionLevel: errorCorrection },
      dotsOptions: {
        type: modulePattern,
        color: gradient ? undefined : color,
        gradient: dotsGradient,
      },
      cornersSquareOptions: { type: cornerShape },
      cornersDotOptions: { type: cornerDotShape },
      image: processedLogo,
      imageOptions: { crossOrigin: "anonymous", hideBackgroundDots: true, imageSize: logoSize },
      backgroundOptions: { color: bgColor },
      qrFrameOptions: frameStyle !== "none" ? { type: frameStyle, color } : undefined,
    };
  };

  // --- Preset Management ---

  const fetchPresets = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPresets([]);
        return;
      }
      const res = await fetch(`${API_URL}/profiles/${profileId}/qr-styles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // For client errors (e.g., 401, 404), fail silently.
        if (res.status >= 400 && res.status < 500) {
          setPresets([]);
          return;
        }
        // For server errors, show a toast.
        const errorData = await res.json().catch(() => ({ message: "Could not load presets" }));
        throw new Error(errorData.message);
      }
      const data = await res.json();
      setPresets(data);
    } catch (error: any) {
      toast.error(error.message);
      setPresets([]);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, [profileId]);

  const getCurrentStyle = () => ({
    color,
    bgColor,
    gradient,
    cornerShape,
    cornerDotShape,
    frameStyle,
    modulePattern,
    logoSize,
    errorCorrection,
    useProfilePhoto,
    logoShape,
  });

  const applyPreset = (preset: any) => {
    const styles = typeof preset.options === 'string' ? JSON.parse(preset.options) : preset.options;
    if (!styles) return;
    setColor(styles.color || "#000000");
    setBgColor(styles.bgColor || "transparent");
    setGradient(styles.gradient || null);
    setCornerShape(styles.cornerShape || "square");
    setCornerDotShape(styles.cornerDotShape || "dots");
    setFrameStyle(styles.frameStyle || "none");
    setModulePattern(styles.modulePattern || "square");
    setLogoSize(styles.logoSize ?? 0.2);
    setErrorCorrection(styles.errorCorrection || "H");
    setUseProfilePhoto(styles.useProfilePhoto || false);
    setLogoShape(styles.logoShape === "rounded" ? "circle" : styles.logoShape || "square");
    toast.success(`Preset "${preset.name}" applied.`);
  };

  const handleSavePreset = async () => {
    if (!presetName) {
      toast.error("Please enter a name for the preset.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to save presets.");
        return;
      }
      const res = await fetch(`${API_URL}/profiles/${profileId}/qr-styles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: presetName, options: getCurrentStyle() }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save preset.");
      }
      toast.success("Preset saved!");
      setPresetName("");
      fetchPresets(); // Refresh list
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const handleUpdatePreset = async (presetId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to update presets.");
        return;
      }
      const res = await fetch(`${API_URL}/profiles/${profileId}/qr-styles/${presetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ options: getCurrentStyle() }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update preset.");
      }
      toast.success("Preset updated with current style.");
      fetchPresets(); // Refresh list
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to delete presets.");
        return;
      }
      const res = await fetch(`${API_URL}/profiles/${profileId}/qr-styles/${presetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete preset.");
      }
      toast.success("Preset deleted.");
      fetchPresets(); // Refresh list
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // --- End Preset Management ---

  // Unified effect for creating and updating the QR code
  useEffect(() => {
    // Create a new instance with the latest config
    const qrCode = new QRCodeStyling(qrOptionsConfig());
    qrRef.current = qrCode;

    // Clear the preview container and append the new QR code
    if (previewRef.current) {
      previewRef.current.innerHTML = "";
      qrCode.append(previewRef.current);
    }
  }, [
    // List all dependencies that should trigger a re-render
    color,
    bgColor,
    gradient,
    qrSize,
    frameStyle,
    modulePattern,
    processedLogo,
    cornerShape,
    cornerDotShape,
    logoSize,
    errorCorrection,
  ]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setTempLogo(reader.result as string);
      setUseProfilePhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const download = async (format: "png" | "svg" | "pdf") => {
    if (format === "pdf") {
      if (!previewRef.current) return;
      const canvas = await html2canvas(previewRef.current!);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "p",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`qr-${profileId}.pdf`);
      return;
    }

    const downloadOptions = {
      ...qrOptionsConfig(),
      width: downloadSize,
      height: downloadSize,
    };
    // Exclude preview-only size from download config
    delete (downloadOptions as any).qrSize;

    const tempQr = new QRCodeStyling(downloadOptions);
    const file = await tempQr.getRawData(format);

    if (!file) return;
    let blob: Blob;
    if (file instanceof Blob) blob = file;
    else if (file instanceof ArrayBuffer) blob = new Blob([file], { type: `image/${format}` });
    else blob = new Blob([new Uint8Array(file as any)], { type: `image/${format}` });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `qr-${profileId}.${format}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-auto">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full flex flex-col md:flex-row gap-6 p-6 md:p-10 animate-slide-up">
        
        {/* Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold text-3xl transition"
        >
          ×
        </button>

        {/* Tabs */}
        <div className="flex flex-col md:flex-1">
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setActiveTab("colors")} className={`px-3 py-1 rounded-lg ${activeTab === "colors" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Couleurs</button>
            <button onClick={() => setActiveTab("style")} className={`px-3 py-1 rounded-lg ${activeTab === "style" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Style</button>
            <button onClick={() => setActiveTab("logo")} className={`px-3 py-1 rounded-lg ${activeTab === "logo" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Logo</button>
            <button onClick={() => setActiveTab("size")} className={`px-3 py-1 rounded-lg ${activeTab === "size" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Taille</button>
            <button onClick={() => setActiveTab("presets")} className={`px-3 py-1 rounded-lg ${activeTab === "presets" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Presets</button>
          </div>

          {/* Contenu des tabs */}
          {activeTab === "presets" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Sauvegarder le style actuel</h3>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Nom du preset..."
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                  />
                  <Button onClick={handleSavePreset}>Sauvegarder</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Presets sauvegardés</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {presets.map((preset) => (
                        <tr key={preset.id}>
                          <td className="px-4 py-2 whitespace-nowrap font-medium">{preset.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => applyPreset(preset)}>Appliquer</Button>
                            <Button size="sm" onClick={() => handleUpdatePreset(preset.id)}>Mettre à jour</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePreset(preset.id)}>Supprimer</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {presets.length === 0 && (
                    <p className="text-center py-4 text-gray-500">Aucun preset sauvegardé.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === "colors" && (
            <div className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-gray-700">Couleur principale</label>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-24 h-10 rounded-lg border" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-gray-700">Fond</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor === "transparent" ? "#ffffff" : bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-16 h-10 rounded-lg border"
                    />
                    <Button variant="ghost" onClick={() => setBgColor("transparent")} className="text-sm">
                      Transparent
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Dégradé (optionnel)</label>
                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    type="color"
                    value={gradient?.from || "#000000"}
                    onChange={(e) => setGradient((prev) => ({ from: e.target.value, to: prev?.to || "#000000", type: prev?.type || "linear" }))}
                    className="w-12 h-10 rounded-lg border"
                  />
                  <input
                    type="color"
                    value={gradient?.to || "#000000"}
                    onChange={(e) => setGradient((prev) => ({ from: prev?.from || "#000000", to: e.target.value, type: prev?.type || "linear" }))}
                    className="w-12 h-10 rounded-lg border"
                  />
                  <select
                    value={gradient?.type || "linear"}
                    onChange={(e) => setGradient((prev) => ({ from: prev?.from || "#000000", to: prev?.to || "#ffffff", type: e.target.value as "linear" | "radial" }))} className="border rounded-lg p-1">
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                  </select>
                  <Button variant="outline" onClick={() => setGradient(null)}>Annuler</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "style" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Motif du QR</label>
                <select value={modulePattern} onChange={(e) => setModulePattern(e.target.value as any)} className="border rounded-lg p-1">
                  <option value="square">Carré</option>
                  <option value="dots">Points</option>
                  <option value="rounded">Arrondi</option>
                  <option value="classy">Classy</option>
                  <option value="extra-rounded">Très arrondi</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Style des coins</label>
                <select value={cornerShape} onChange={(e) => setCornerShape(e.target.value as any)} className="border rounded-lg p-1">
                  <option value="square">Carré</option>
                  <option value="dots">Points</option>
                  <option value="rounded">Arrondi</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Style des coins intérieurs</label>
                <select value={cornerDotShape} onChange={(e) => setCornerDotShape(e.target.value as any)} className="border rounded-lg p-1">
                  <option value="square">Carré</option>
                  <option value="dots">Points</option>
                  <option value="rounded">Arrondi</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Cadre du QR</label>
                <select value={frameStyle} onChange={(e) => setFrameStyle(e.target.value as any)} className="border rounded-lg p-1">
                  <option value="none">Aucun</option>
                  <option value="circle">Cercle</option>
                  <option value="rounded-square">Carré arrondi</option>
                  <option value="double-line">Double ligne</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "logo" && (
            <div className="flex flex-col gap-4">
              <label className="font-medium text-gray-700">Logo central</label>
              <div className="flex gap-2 items-center flex-wrap">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="border rounded-lg p-1" />
                {profileImageUrl && (
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={useProfilePhoto} onChange={() => setUseProfilePhoto(prev => !prev)} />
                    Utiliser photo profil
                  </label>
                )}
              </div>
              {getOriginalLogo() && <img src={getOriginalLogo()} className="w-16 h-16 mt-2 rounded-full shadow-md object-cover" />}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Forme du logo</label>
                <select value={logoShape} onChange={(e) => setLogoShape(e.target.value as "square" | "circle")} className="border rounded-lg p-1 w-40">
                  <option value="square">Carré</option>
                  <option value="circle">Cercle</option>
                </select>
              </div>
              <label className="font-medium text-gray-700">Taille du logo (0-0.5)</label>
              <input type="number" min={0} max={0.5} step={0.01} value={logoSize} onChange={(e) => setLogoSize(parseFloat(e.target.value))} className="border rounded-lg p-1 w-32" />
            </div>
          )}

          {activeTab === "size" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Taille de l'aperçu (px)</label>
                <input type="number" min={100} max={600} step={10} value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))} className="border rounded-lg p-1 w-32" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Taille de téléchargement (px)</label>
                <input type="number" min={100} max={4096} step={128} value={downloadSize} onChange={(e) => setDownloadSize(parseInt(e.target.value))} className="border rounded-lg p-1 w-32" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Correction d'erreur</label>
                <select value={errorCorrection} onChange={(e) => setErrorCorrection(e.target.value as "L" | "M" | "Q" | "H")} className="border rounded-lg p-1 w-32">
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          )}

          {/* Téléchargement */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button onClick={() => download("png")}>PNG</Button>
            <Button variant="secondary" onClick={() => download("svg")}>SVG</Button>
            <Button variant="destructive" onClick={() => download("pdf")}>PDF</Button>
          </div>
        </div>

        {/* Aperçu QR */}
        <div className="flex-1 flex justify-center items-center mt-6 md:mt-0 overflow-hidden">
          <div
            ref={previewRef}
            className="bg-gray-50 p-4 rounded-xl shadow-inner max-w-full max-h-full flex justify-center items-center"
            style={{ width: qrSize, height: qrSize, minWidth: 150, minHeight: 150 }}
          />
        </div>

      </div>
    </div>
  );
};

export default QrModal;
