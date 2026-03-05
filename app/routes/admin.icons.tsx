import type { Route } from "./+types/admin.icons";
import { AdminNav } from "../components/AdminNav";
import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { IconsService } from "../services/icons";
import { listFiles, deleteFile } from "../utils/r2Client";
import DragDropUploader from "../components/DragDropUploader";
import { r2Image } from "../utils/images";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const iconsService = new IconsService(db);
  const icons = await iconsService.getAllIcons();
  return { icons };
}

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  const bucket = context.cloudflare.env.IMAGES_BUCKET;
  const iconsService = new IconsService(db);
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create-icon": {
      const file = formData.get("file") as File;
      const name = formData.get("name") as string;
      if (!file) {
        return { success: false, error: "No file provided" };
      }
      if (!name) {
        return { success: false, error: "Icon name is required" };
      }
      
      // Determine format from file type
      const format = file.type.split("/").pop() || "png";
      
      // Upload to R2
      const extName = file.name.split(".").pop() || format;
      let iconName = name;
      if (!iconName.includes(".")) {
        iconName = `${iconName}.${extName}`;
      }
      const key = `icons/${iconName}`;
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        await bucket.put(key, arrayBuffer, {
          httpMetadata: { contentType: file.type },
        });
        const imageUrl = key;
        
        // Store in database
        await iconsService.createIcon(name, imageUrl, format);
        return { success: true };
      } catch (err: any) {
        console.error("Upload icon failed:", err?.message ?? err);
        return { success: false, error: err?.message ?? "Upload failed" };
      }
    }
    case "update-icon": {
      const id = parseInt(formData.get("id") as string);
      const name = formData.get("name") as string;
      const file = formData.get("file") as File | null;
      
      if (!name) {
        return { success: false, error: "Icon name is required" };
      }
      
      const existingIcon = await iconsService.getIconById(id);
      if (!existingIcon) {
        return { success: false, error: "Icon not found" };
      }
      
      let imageUrl = existingIcon.image_url;
      let format = existingIcon.format;
      
      // If a new file was uploaded, replace the image
      if (file) {
        // Delete old file from R2
        try {
          await deleteFile(bucket, existingIcon.image_url);
        } catch (e) {
          // Ignore deletion errors
        }
        
        // Upload new file
        format = file.type.split("/").pop() || "png";
        const extName = file.name.split(".").pop() || format;
        let iconName = name;
        if (!iconName.includes(".")) {
          iconName = `${iconName}.${extName}`;
        }
        const key = `icons/${iconName}`;
        
        try {
          const arrayBuffer = await file.arrayBuffer();
          await bucket.put(key, arrayBuffer, {
            httpMetadata: { contentType: file.type },
          });
          imageUrl = key;
        } catch (err: any) {
          return { success: false, error: err?.message ?? "Upload failed" };
        }
      }
      
      await iconsService.updateIcon(id, name, imageUrl, format);
      return { success: true };
    }
    case "delete-icon": {
      const id = parseInt(formData.get("id") as string);
      const icon = await iconsService.getIconById(id);
      if (!icon) {
        return { success: false, error: "Icon not found" };
      }
      
      // Delete from R2
      try {
        await deleteFile(bucket, icon.image_url);
      } catch (e) {
        // Ignore deletion errors
      }
      
      // Delete from database
      await iconsService.deleteIcon(id);
      return { success: true };
    }
    default:
      return { success: false, error: "Unknown intent" };
  }
}

function IconForm({
  icon,
  onCancel,
}: {
  icon?: { id: number; name: string; image_url: string; format: string };
  onCancel?: () => void;
}) {
  const [name, setName] = useState(icon?.name || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data) {
      const result = fetcher.data as { success: boolean; error?: string };
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error || "Failed to save icon");
      }
    }
  }, [fetcher.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Icon name is required");
      return;
    }

    const formData = new FormData();
    formData.append("intent", icon ? "update-icon" : "create-icon");
    if (icon) {
      formData.append("id", icon.id.toString());
    }
    formData.append("name", name);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    fetcher.submit(formData, { method: "POST", encType: "multipart/form-data" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="e.g. amazon, barnes-noble"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon Image {icon && "(leave empty to keep existing)"}
        </label>
        <DragDropUploader
          accept="image/*"
          onFileSelected={(file) => {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);
          }}
          label="Upload Icon Image"
        />
        {preview ? (
          <img src={preview} alt="Preview" className="mt-2 w-16 h-16 object-contain" />
        ) : icon ? (
          <img src={r2Image(icon.image_url)} alt={icon.name} className="mt-2 w-16 h-16 object-contain" />
        ) : null}
      </div>
      
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : icon ? "Update Icon" : "Add Icon"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminIcons({ loaderData }: any) {
  const { icons } = loaderData;
  const [editingIconId, setEditingIconId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-black">Icon Library</h1>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {icons?.map((ico: any) => (
            <div key={ico.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center gap-2">
              {editingIconId === ico.id ? (
                <div className="w-full">
                  <IconForm
                    icon={ico}
                    onCancel={() => setEditingIconId(null)}
                  />
                </div>
              ) : (
                <>
                  <img 
                    src={r2Image(ico.image_url)} 
                    alt={ico.name || 'Icon'} 
                    className="w-24 h-24 object-contain" 
                  />
                  <div className="text-sm text-gray-700 font-medium">{ico.name}</div>
                  <div className="text-xs text-gray-400">Format: .{ico.format}</div>
                  <div className="text-xs text-gray-400 truncate max-w-full">URL: {ico.image_url}</div>
                  <div className="text-xs text-gray-400">
                    Created: {ico.created_at ? new Date(ico.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">
                    Updated: {ico.updated_at ? new Date(ico.updated_at).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setEditingIconId(ico.id)}
                      className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <form method="post" className="flex-1" onSubmit={(e)=>{ if(!confirm("Delete this icon?")) e.preventDefault(); }}>
                      <input type="hidden" name="intent" value="delete-icon" />
                      <input type="hidden" name="id" value={ico.id} />
                      <button type="submit" className="w-full bg-red-600 text-white py-1 rounded hover:bg-red-700">Delete</button>
                    </form>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">
            {showAddForm ? "Upload New Icon" : "Add New Icon"}
          </h2>
          {showAddForm ? (
            <IconForm onCancel={() => setShowAddForm(false)} />
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Icon
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
