import type { Route } from "../+types/admin.content";
import { AdminNav } from "../../components/AdminNav";
import { PageContentService } from "../../services/pageContent";
import { useState, useMemo } from "react";
import { SkeletonLine, SkeletonImage } from "../../components/Skeleton";
import { LoadingWrapper } from "../../components/LoadingWrapper";
import { sanitizeHTML } from "../../utils/sanitizeHTML";
import type { PageContent } from "../../types/db";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const contentService = new PageContentService(db);
  const content = await contentService.getAllContent();
  return { content };
}

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  const contentService = new PageContentService(db);
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      const page = formData.get("page") as string;
      const title = formData.get("title") as string;
      const descriptionRaw = formData.get("description") as string | null;
      const description = sanitizeHTML(descriptionRaw ?? "");
      const content = await contentService.createContent(page, title, description || undefined);
      return { success: true, content };
    }
    case "update": {
      const id = parseInt(formData.get("id") as string);
      const page = formData.get("page") as string;
      const title = formData.get("title") as string;
      const descriptionRaw = formData.get("description") as string | null;
      const description = sanitizeHTML(descriptionRaw ?? "");
      const content = await contentService.updateContent(id, page, title, description || undefined);
      return { success: true, content };
    }
    case "delete": {
      const id = parseInt(formData.get("id") as string);
      await contentService.deleteContent(id);
      return { success: true };
    }
    default:
      return { success: false, error: "Unknown intent" };
  }
}

type AdminContentItem = PageContent;

function ContentEditorRow({ item }: { item: AdminContentItem }) {
  const [title, setTitle] = useState<string>(item.title);
  const [description, setDescription] = useState<string>(item.description ?? "");

  // Lightweight fallback editor to avoid runtime dependency on TinyMCE in this environment
  const TinyEditor: any = ({ value, onEditorChange, init }: any) => (
    <textarea
      value={value}
      onChange={(e) => onEditorChange?.(e.target.value)}
      style={{ width: '100%', minHeight: 120 }}
      placeholder={init?.placeholder ?? 'Description'}
    />
  );

  return (
    <form method="post" className="mb-6 border rounded p-4 bg-white shadow-sm">
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="page" value={item.page} />
      <div className="mb-2">
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-2"
          placeholder="Title"
        />
      </div>
      <div className="mb-2">
        <TinyEditor
          value={description}
          onEditorChange={(newValue: string) => setDescription(newValue ?? "")}
          init={{ height: 180, menubar: false, plugins: ["lists", "link"], toolbar: "undo redo | bold italic | bullist numlist | link" }}
        />
      </div>
      <input type="hidden" name="description" value={description} />
      <div className="flex gap-2 mt-2">
        <button type="submit" name="intent" value="update" className="bg-green-500 text-white px-4 py-2 rounded">Update</button>
        <button type="submit" name="intent" value="delete" className="bg-red-500 text-white px-4 py-2 rounded" onClick={(e)=>{ if(!confirm("Delete this content?")) e.preventDefault(); }}>Delete</button>
      </div>
    </form>
  );
}

export default function AdminContent({ loaderData }: Route.ComponentProps) {
  const content = (loaderData && (loaderData as any).content) ?? [] as PageContent[];
  const groupedContent = useMemo<Record<string, PageContent[]>>(() => {
    return content.reduce((acc: Record<string, PageContent[]>, item: PageContent) => {
      if (!acc[item.page]) acc[item.page] = [];
      acc[item.page].push(item);
      return acc;
    }, {} as Record<string, PageContent[]>);
  }, [content]);

  // New content state
  const [newPage, setNewPage] = useState<string>("home");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <AdminNav />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Page Content</h1>
        <LoadingWrapper isLoading={content.length === 0} variant="grid" skeletonCount={3}>
          {Object.entries(groupedContent).map(([page, items]) => (
            <section key={page} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{page}</h2>
              {items.length > 0 ? items.map((it) => (
                <ContentEditorRow key={it.id} item={it} />
              )) : null}
            </section>
          ))}
        </LoadingWrapper>

        <section className="mt-8 p-4 bg-white rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Create New Content</h3>
          <form method="post" className="flex flex-col gap-3">
            <input type="hidden" name="intent" value="create" />
            <div className="flex gap-2">
              <select name="page" value={newPage} onChange={(e)=>setNewPage(e.target.value)} className="border rounded px-2 py-2">
                {['home','speaking','about','contact','shop'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input type="text" name="title" value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} placeholder="Title" className="border rounded px-2 py-2 flex-1" />
            </div>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full border rounded px-2 py-2"
              placeholder="Description"
              style={{ minHeight: 120 }}
            />
            <input type="hidden" name="description" value={newDesc} />
            <div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
