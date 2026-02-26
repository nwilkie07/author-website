import { PageContentService } from "~/services/pageContent";
import { AdminNav } from "~/components/AdminNav";
import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

// Loader: fetch all page content entries
export async function loader(_args: any) {
  const { context } = _args;
  const db = context.cloudflare.env.DB;
  const pageContentService = new PageContentService(db);
  const contents = await pageContentService.getAllContent();
  return { contents };
}

// Action: handle create / update / delete content
export async function action(_args: any) {
  const { request, context } = _args;
  const db = context.cloudflare.env.DB;
  const pageContentService = new PageContentService(db);
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create-content": {
      const page = formData.get("page") as string;
      const title = formData.get("title") as string;
      const description = (formData.get("description") as string) || undefined;
      const content = await pageContentService.createContent(
        page,
        title,
        description,
      );
      return { success: true, content };
    }
    case "update-content": {
      const id = parseInt(formData.get("id") as string);
      const page = formData.get("page") as string;
      const title = formData.get("title") as string;
      const description = (formData.get("description") as string) || undefined;
      const content = await pageContentService.updateContent(
        id,
        page,
        title,
        description,
      );
      return { success: true, content };
    }
    case "delete-content": {
      const id = parseInt(formData.get("id") as string);
      await pageContentService.deleteContent(id);
      return { success: true };
    }
    default:
      return { success: false, error: "Unknown intent" };
  }
}

// Inline form used for both creating and editing content
function ContentForm({
  content,
  onCancel,
}: {
  content?: any;
  onCancel?: () => void;
}) {
  const intent = content ? "update-content" : "create-content";
  const [page, setPage] = useState(content?.page ?? "");
  const [title, setTitle] = useState(content?.title ?? "");
  const [description, setDescription] = useState(content?.description ?? "");

  const handleSubmitDescriptor = {
    // placeholder in case we extend in the future
  };

  return (
    <form method="post" className="space-y-4" encType="multipart/form-data">
      <input type="hidden" name="intent" value={intent} />
      {content && (
        <input
          className="text-black"
          type="hidden"
          name="id"
          value={content.id}
        />
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Page
        </label>
        <input
          type="text"
          name="page"
          required
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className="w-full border rounded px-3 py-2 text-black"
          placeholder="e.g. home, about"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2 text-black"
          placeholder="Content title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <>
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            init={{
              height: 500,
              menubar: false,
              plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table paste code help wordcount",
              ],
              toolbar:
                "undo redo | formatselect | " +
                "bold italic backcolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          />
          <button
            onClick={(log) => {
              console.log(log);
            }}
          >
            Log editor content
          </button>
        </>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {content ? "Update Content" : "Add Content"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminContent({ loaderData }: any) {
  const { contents } = loaderData;
  const [editingContentId, setEditingContentId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        <h1 className="text-3xl font-bold mb-6 text-black">
          Manage Page Content
        </h1>

        <div className="flex w-full lg:grid-cols-3 gap-6 mb-6">
          <section className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            {contents.map((c: any) => (
              <div
                key={c.id}
                className="flex gap-4 mb-6 items-start border-b border-gray-200 pb-4"
              >
                {editingContentId === c.id ? (
                  <div className="w-full">
                    <ContentForm
                      content={c}
                      onCancel={() => setEditingContentId(null)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{c.title}</h3>
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            onClick={() => setEditingContentId(c.id)}
                          >
                            Edit
                          </button>
                          <form
                            method="post"
                            className="inline"
                            onSubmit={(e) => {
                              if (!confirm("Delete this content?"))
                                e.preventDefault();
                            }}
                          >
                            <input
                              className="text-black"
                              type="hidden"
                              name="intent"
                              value="delete-content"
                            />
                            <input
                              className="text-black"
                              type="hidden"
                              name="id"
                              value={c.id}
                            />
                            <button
                              type="submit"
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Page: {c.page}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Title: {c.title}
                      </div>
                      {c.description && (
                        <div className="text-sm text-gray-700 mt-2">
                          {c.description}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {c.created_at}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
            {contents.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No content yet. Add content above.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
