import type { Route } from "./+types/admin.content";
import { PageContentService } from "../services/pageContent";

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
      const description = formData.get("description") as string | null;
      const content = await contentService.createContent(page, title, description || undefined);
      return { success: true, content };
    }
    case "update": {
      const id = parseInt(formData.get("id") as string);
      const page = formData.get("page") as string;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string | null;
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

export default function AdminContent({ loaderData }: Route.ComponentProps) {
  const { content } = loaderData;

  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.page]) {
      acc[item.page] = [];
    }
    acc[item.page].push(item);
    return acc;
  }, {} as Record<string, typeof content>);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Page Content</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Content</h2>
          <form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="create" />
            <div>
              <label className="block text-sm font-medium mb-1">Page</label>
              <select name="page" required className="w-full border rounded px-3 py-2">
                <option value="home">Home</option>
                <option value="about">About</option>
                <option value="speaking">Speaking</option>
                <option value="contact">Contact</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" name="title" required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" className="w-full border rounded px-3 py-2" rows={4} />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Content</button>
          </form>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedContent).map(([page, items]) => (
            <div key={page} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold capitalize">{page}</h3>
              </div>
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.title}</h4>
                      <form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                      </form>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {content.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No content yet. Add some above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
