import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, ChevronUp, ChevronDown, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface GalleryEditorProps {
  profileId: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const GalleryEditor = ({ profileId }: GalleryEditorProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profileId) loadGallery();
  }, [profileId]);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // ---------------------------------------
  // LOAD IMAGES
  // ---------------------------------------
  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/gallery/${profileId}`, {
        headers: getHeaders(),
      });

      const data = await res.json();
      // assure que c'est toujours un tableau
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement de la galerie");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // UPLOAD IMAGE
  // ---------------------------------------
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/gallery/${profileId}`, {
        method: "POST",
        headers: {
          Authorization: getHeaders().Authorization,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Upload échoué");
      }

      toast.success("Image ajoutée avec succès");
      loadGallery();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------------------
  // DELETE IMAGE
  // ---------------------------------------
  const deleteImage = async (imageId: string) => {
    try {
      const res = await fetch(`${API_URL}/gallery/image/${imageId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Suppression échouée");
      }

      toast.success("Image supprimée");
      loadGallery();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  // ---------------------------------------
  // MOVE IMAGE ORDER
  // ---------------------------------------
  const moveImage = async (imageId: string, direction: "up" | "down") => {
    const currentIndex = images.findIndex((img) => img.id === imageId);
    if (currentIndex === -1) return;

    if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === images.length - 1)) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newImages = [...images];

    // swap
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

    try {
      await Promise.all(
        newImages.map((img, idx) =>
          fetch(`${API_URL}/gallery/image/${img.id}/order`, {
            method: "PATCH",
            headers: { ...getHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ display_order: idx }),
          })
        )
      );

      setImages(newImages);
      toast.success("Ordre mis à jour");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // ---------------------------------------
  // LOADING UI
  // ---------------------------------------
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // ---------------------------------------
  // UI
  // ---------------------------------------
  return (
    <Card>
      <CardHeader>
        <CardTitle>Galerie d'images</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* UPLOAD ZONE */}
        <div>
          <Label htmlFor="gallery-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {uploading ? "Upload en cours..." : "Cliquez pour ajouter une image"}
              </p>
            </div>
          </Label>

          <Input
            id="gallery-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading || images.length >= 5}
          />
          {images.length >= 5 && (
            <p className="text-xs text-red-500 mt-1">Maximum 5 images par profil</p>
          )}
        </div>

        {/* IMAGES GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <img
                src={`${API_URL}${image.image_url}`}
                alt="Gallery"
                className="w-full h-32 object-cover rounded-lg"
              />

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => moveImage(image.id, "up")}
                  disabled={index === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => moveImage(image.id, "down")}
                  disabled={index === images.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => deleteImage(image.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GalleryEditor;
