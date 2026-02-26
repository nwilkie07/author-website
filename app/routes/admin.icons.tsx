import type { Route } from "./+types/admin.icons";
import { AdminNav } from "../components/AdminNav";
import { useState } from "react";
import { listFiles } from "../utils/r2Client";
import DragDropUploader from "../components/DragDropUploader";
import { r2Image } from "../utils/images";

export async function loader({ context }: Route.LoaderArgs) {
  const bucket = context.cloudflare.env.IMAGES_BUCKET;
  let icons: { key: string; name: string }[] = [];
  try {
    const files = await listFiles(bucket, "icons/");
    console.log(files)
    icons = files.map((f) => {
      const segments = f.key.split("/");
      const name = segments.length > 1 ? segments[segments.length - 1] : f.key;
      return { key: f.key, name };
    });
    icons = icons.filter((f) => {
      if (f.key !== "icons/") {
        return f;
      }
    })
  } catch {
    icons = [];
  }
  return { icons };
}

export async function action({ request, context }: Route.ActionArgs) {
  const bucket = context.cloudflare.env.IMAGES_BUCKET;
  const formData = await request.formData();
  const intent = formData.get("intent");
  switch (intent) {
    case "upload-icon": {
      const file = formData.get("file") as File;
      if (!file) {
        return { success: false, error: "No file provided" };
      }
      // Build icon name from input and file extension safely
      const extName = file.name.split(".").pop() || "png";
      const inputName = (formData.get("iconName") as string) ?? "";
      let iconName = inputName;
      if (iconName) {
        if (!iconName.includes(".")) {
          iconName = `${iconName}.${extName}`;
        }
      } else {
        iconName = `icon.${extName}`;
      }
      const key = `icons/${iconName}`;
      const arrayBuffer = await file.arrayBuffer();
      await bucket.put(key, arrayBuffer, {
        httpMetadata: { contentType: file.type },
      });
      return { success: true, key };
    }
    case "delete-icon": {
      const key = formData.get("key") as string;
      if (!key) {
        return { success: false, error: "No key provided" };
      }
      await bucket.delete(key);
      return { success: true };
    }
    default:
      return { success: false, error: "Unknown intent" };
  }
}

export default function AdminIcons({ loaderData }: any) {
  const { icons } = loaderData;
  console.log(icons)
  const [iconNameInput, setIconNameInput] = useState<string>("");
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
            <div key={ico.key} className="bg-white rounded-lg shadow p-4 flex flex-col items-center gap-2">
              <img src={r2Image(ico.key)} alt={ico.name} className="w-24 h-24 object-contain" />
              <div className="text-sm text-gray-700" title={ico.name}>{ico.name}</div>
              <form method="post" className="w-full" onSubmit={(e)=>{ if(!confirm("Delete this icon?")) e.preventDefault(); }}>
                <input type="hidden" name="intent" value="delete-icon" />
                <input type="hidden" name="key" value={ico.key} />
                <button type="submit" className="w-full bg-red-600 text-white py-1 rounded hover:bg-red-700">Delete</button>
              </form>
            </div>
          ))}
        </div>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Upload New Icon</h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={iconNameInput}
                onChange={(e) => setIconNameInput(e.target.value)}
                placeholder="Icon file name"
                className="border rounded px-3 py-2 text-black"
              />
            </div>
            <DragDropUploader
              accept="image/*"
              onFileSelected={async (file: File) => {
                if (!iconNameInput) {
                  alert("You must enter a name for the icon first before adding the icon.");
                  return;
                }
                const formData = new FormData();
                formData.append("intent", "upload-icon");
                formData.append("iconName", iconNameInput);
                formData.append("file", file);
                const resp = await fetch(window.location.pathname, { method: "POST", body: formData });
                let result: { success: boolean; error?: string; key?: string } | undefined;
                try {
                  result = await resp.json() as { success: boolean; error?: string; key?: string };
                } catch {
                  if (resp.ok) {
                    window.location.reload();
                    return;
                  }
                  alert("Upload failed");
                  return;
                }
                if (result?.success) {
                  window.location.reload();
                } else {
                  alert(result?.error || "Upload failed");
                }
              }}
              label="Upload Icon"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
