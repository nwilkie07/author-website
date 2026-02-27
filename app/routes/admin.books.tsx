import type { Route } from "./+types/admin.books";
import { BooksService } from "../services/books";
import type { Book, PurchaseLink } from "../types/db";
import { AdminNav } from "../components/AdminNav";
import { useState, useRef, useCallback } from "react";
import { r2Image } from "../utils/images";
import { listFiles } from "../utils/r2Client";
import DragDropUploader from "../components/DragDropUploader";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const booksService = new BooksService(db);
  const books = await booksService.getAllBooksWithPurchaseLinks();
  // Fetch icon filenames from the Cloudflare R2 bucket (icons/ folder)
  // We only need the display names, but keep the full key as the value
  const bucket = context.cloudflare.env.IMAGES_BUCKET;
  let icons: { key: string; name: string }[] = [];
  try {
    const files = await listFiles(bucket, "icons/");
    icons = files.map((f) => {
      const segments = f.key.split("/");
      const name = segments.length > 1 ? segments[segments.length - 1] : f.key;
      return { key: f.key, name };
    });
  } catch {
    icons = [];
  }
  return { books, icons };
}

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  const bucket = context.cloudflare.env.IMAGES_BUCKET;
  const booksService = new BooksService(db);
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "upload-image": {
      const file = formData.get("file") as File;
      if (!file) {
        return { success: false, error: "No file provided" };
      }

      const extension = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      // Try to derive image name from book name if provided
      const bookNameForSlug = (formData.get("name") as string) || "";
      let key: string;
      if (bookNameForSlug && bookNameForSlug.trim()) {
        const slug = bookNameForSlug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        key = `book_covers/${slug}.${extension}`;
      } else {
        key = `book_covers/${file.name.replace(/\s+/g, "-")}`;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        await bucket.put(key, arrayBuffer, {
          httpMetadata: { contentType: file.type },
        });
        const imageUrl = r2Image(key);
        return { success: true, imageUrl, key };
      } catch (err: any) {
        console.error("Upload image failed:", err?.message ?? err);
        return { success: false, error: err?.message ?? "Upload failed" };
      }
    }
    case "create-book": {
      const name = formData.get("name") as string;
      let imageUrl = formData.get("imageUrl") as string;
      // If no image was uploaded, use a default placeholder
      if (!imageUrl) {
        imageUrl = "book_covers/placeholder.jpg";
      }
      const description = formData.get("description") as string | null;
      const seriesTitle = formData.get("seriesTitle") as string | null;
      const seriesNumber = formData.get("seriesNumber") as string | null;
      const book = await booksService.createBook(
        name,
        imageUrl,
        description || undefined,
        seriesTitle || null,
        seriesNumber ? parseInt(seriesNumber) : null,
      );
      return { success: true, book };
    }
    case "update-book": {
      const id = parseInt(formData.get("id") as string);
      const name = formData.get("name") as string;
      const imageUrl = formData.get("imageUrl") as string;
      const description = formData.get("description") as string | null;
      const seriesTitle = formData.get("seriesTitle") as string | null;
      const seriesNumber = formData.get("seriesNumber") as string | null;
      const book = await booksService.updateBook(
        id,
        name,
        imageUrl,
        description || undefined,
        seriesTitle || null,
        seriesNumber ? parseInt(seriesNumber) : null,
      );
      return { success: true, book };
    }
    case "delete-book": {
      const id = parseInt(formData.get("id") as string);
      await booksService.deleteBook(id);
      return { success: true };
    }
    case "create-purchase-link": {
      const bookId = parseInt(formData.get("bookId") as string);
      const storeName = formData.get("storeName") as string;
      const url = formData.get("url") as string;
      const iconUrl = formData.get("iconUrl") as string | null;
      const link = await booksService.createPurchaseLink(
        bookId,
        storeName,
        url,
        iconUrl || undefined,
      );
      return { success: true, link };
    }
    case "update-purchase-link": {
      const id = parseInt(formData.get("id") as string);
      const storeName = formData.get("storeName") as string;
      const url = formData.get("url") as string;
      const iconUrl = formData.get("iconUrl") as string | null;
      const link = await booksService.updatePurchaseLink(
        id,
        storeName,
        url,
        iconUrl || undefined,
      );
      return { success: true, link };
    }
    case "delete-purchase-link": {
      const id = parseInt(formData.get("id") as string);
      await booksService.deletePurchaseLink(id);
      return { success: true };
    }
    default:
      return { success: false, error: "Unknown intent" };
  }
}

function ImageUpload({
  imageUrl,
  onImageUrlChange,
}: {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("intent", "upload-image");
      formData.append("file", file);

      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        success: boolean;
        imageUrl?: string;
        error?: string;
      };
      console.log("test")
      console.log(result)

      if (result.success && result.imageUrl) {
        onImageUrlChange(result.imageUrl);
        setPreview(null);
      } else {
        alert(result);
      }
    } catch (error) {
      alert("Upload Failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      handleUpload(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      handleUpload(file);
    }
  };

  const displayImage = preview || imageUrl;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Book Cover Image
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        {displayImage ? (
          <div className="space-y-2">
            <img
              src={r2Image(displayImage)}
              alt="Book cover preview"
              className="mx-auto h-40 object-cover rounded"
            />
            <p className="text-sm text-gray-500">Click or drag to replace</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📚</div>
            <p className="text-sm text-gray-600">
              {isUploading
                ? "Uploading..."
                : "Drag and drop an image here, or click to select"}
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP up to 10MB</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
          placeholder="Or enter image URL manually"
          className="flex-1 border rounded px-3 py-2 text-sm text-black"
        />
      </div>
    </div>
  );
}

function BookForm({ book, onCancel }: { book?: Book; onCancel?: () => void }) {
  const intent = book ? "update-book" : "create-book";
  const [imageUrl, setImageUrl] = useState(book?.image_url || "");
  const [dragPreview, setDragPreview] = useState<string | null>(null);
  const [bookName, setBookName] = useState<string | null>(book?.name || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [seriesTitle, setSeriesName] = useState(book?.series_title || "");
  const [seriesNumber, setSeriesNumber] = useState(book?.series_number?.toString() || "");

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("intent", "upload-image");
    formData.append("file", file);
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement | null;
    if (nameInput?.value) {
      formData.append("name", nameInput.value);
    }
    try {
      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: formData,
      });
      let result: { success: boolean; imageUrl?: string; error?: string } | undefined;
      try {
        result = (await response.json()) as {
          success: boolean;
          imageUrl?: string;
          error?: string;
        };
      } catch {
        alert("Upload failed - could not parse server response");
        return null;
      }
      if (result?.success && result.imageUrl) {
        return result.imageUrl;
      } else {
        alert(result?.error || "Upload failed");
        return null;
      }
    } catch {
      alert("Upload failed");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    let finalImageUrl = imageUrl;

    if (selectedFile) {
      const uploadedUrl = await uploadImage(selectedFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("intent", intent);
    formData.set("imageUrl", finalImageUrl);

    try {
      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: formData,
      });
      let result: { success: boolean; error?: string } | undefined;
      try {
        result = (await response.json()) as { success: boolean; error?: string };
      } catch {
        alert("Failed to save book - could not parse server response");
        return;
      }
      if (result?.success) {
        window.location.reload();
      } else {
        alert(result?.error || "Failed to save book");
      }
    } catch {
      alert("Failed to save book");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form method="post" className="space-y-4" encType="multipart/form-data" onSubmit={handleSubmit}>
      <input type="hidden" name="intent" value={intent} />
      {book && <input type="hidden" name="id" value={book.id} />}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="seriesTitle" value={seriesTitle} />
      <input type="hidden" name="seriesNumber" value={seriesNumber} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Book Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          onChange={(e) => setBookName(e.currentTarget.value)}
          value={bookName ?? ""}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          placeholder="Enter book title"
        />
      </div>
      <DragDropUploader
        accept="image/*"
        onFileSelected={async (file: File) => {
          if (!bookName) {
            alert(
              "You must enter a book name before uploading the book image.",
            );
            return;
          }
          setSelectedFile(file);
        }}
        onPreviewChange={(src) => {
          if (!bookName) {
            return;
          }
          setDragPreview(src);
        }}
        label="Book Cover Image"
      />
      {dragPreview ? (
        <img
          src={dragPreview}
          alt="Book cover preview"
          className="mx-auto h-40 object-cover rounded"
        />
      ) : (
        imageUrl && (
          <img
            src={r2Image(imageUrl)}
            alt={book?.name ?? "Book cover"}
            className="mx-auto h-40 object-cover rounded"
          />
        )
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={book?.description || ""}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          rows={4}
          placeholder="Enter book description..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Series Name
          </label>
          <input
            type="text"
            name="seriesTitle"
            value={seriesTitle}
            onChange={(e) => setSeriesName(e.currentTarget.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder="e.g. The XYZ Series"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Book Number
          </label>
          <input
            type="number"
            name="seriesNumber"
            value={seriesNumber}
            onChange={(e) => setSeriesNumber(e.currentTarget.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder="e.g. 1"
            min="1"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isUploading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Saving..." : book ? "Update Book" : "Add Book"}
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

function PurchaseLinkForm({
  bookId,
  link,
  icons,
  onCancel,
}: {
  bookId: number;
  link?: PurchaseLink;
  icons?: { key: string; name: string }[];
  onCancel?: () => void;
}) {
  const intent = link ? "update-purchase-link" : "create-purchase-link";
  const [iconUrl, setIconUrl] = useState<string>(link?.icon_url ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeName, setStoreName] = useState<string>(link?.store_name || "");
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const resp = await fetch(window.location.pathname, {
        method: "POST",
        body: formData,
      });
      let result:
        | { success: boolean; error?: string; key?: string }
        | undefined;
      try {
        result = (await resp.json()) as {
          success: boolean;
          error?: string;
          key?: string;
        };
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
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form
      method="post"
      className="flex flex-wrap gap-2 items-center"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="intent" value={intent} />
      {link && <input type="hidden" name="id" value={link.id} />}
      <input type="hidden" name="bookId" value={bookId} />
      <input
        type="text"
        name="storeName"
        placeholder="Store name"
        required
        value={storeName}
        onChange={(e) => setStoreName(e.currentTarget.value)}
        className="border rounded px-3 py-1 text-sm text-black"
      />
      <input
        type="text"
        name="url"
        placeholder="URL"
        required
        defaultValue={link?.url || ""}
        className="border rounded px-3 py-1 text-sm flex-1 min-w-[200px] text-black"
      />
      {/* Icon dropdown sourced from Cloudflare R2 icons/ folder */}
      <select
        name="iconUrl"
        value={iconUrl}
        onChange={(e) => {
          setIconUrl(e.target.value);
        }}
        className="border rounded px-3 py-1 text-sm text-black"
      >
        <option value="">None</option>
        {icons?.map((ico) => (
          <option key={ico.key} value={ico.key}>
            {ico.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 text-black"
      >
        {link ? "Update" : "Add"}
        {isSubmitting && (
          <span className="ml-2 inline-block w-4 h-4 border-2 border-white border-t-transparent border-l-transparent rounded-full animate-spin" />
        )}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
        >
          Cancel
        </button>
      )}
    </form>
  );
}

export default function AdminBooks({ loaderData }: Route.ComponentProps) {
  const { books: initialBooks, icons } = (loaderData as any) || {
    books: [],
    icons: [],
  };
  const [books, setBooks] = useState<any[]>(initialBooks);
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);

  // Refresh books data from API
  const refreshBooks = async () => {
    try {
      const resp = await fetch("/api/books");
      if (!resp.ok) return;
      const data = (await resp.json()) as any;
      setBooks(data?.books ?? []);
    } catch {
      // ignore
    }
  };

  const filteredIcons = icons.filter((icon) => {
    if (icon.key !== "icons/") {
      return icon;
    }
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        <h1 className="text-3xl font-bold mb-6">Manage Books</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <section className="bg-white rounded-lg shadow p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
            <BookForm />
          </section>
          <section className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Books</h2>
            {books.map((book: any) => (
              <div
                key={book.id}
                className="flex gap-4 mb-6 items-start border-b border-gray-200 pb-4"
              >
                {editingBookId === book.id ? (
                  <div className="w-full">
                    <BookForm
                      book={book}
                      onCancel={() => setEditingBookId(null)}
                    />
                  </div>
                ) : (
                  <>
                    <img
                      src={r2Image(book.image_url)}
                      alt={book.name}
                      className="w-28 h-40 object-cover rounded shadow"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-black">
                          {book.name}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            onClick={() => setEditingBookId(book.id)}
                          >
                            Edit
                          </button>
                          <form
                            method="post"
                            className="inline"
                            onSubmit={(e) => {
                              if (!confirm("Delete this book?"))
                                e.preventDefault();
                            }}
                          >
                            <input
                              type="hidden"
                              name="intent"
                              value="delete-book"
                            />
                            <input type="hidden" name="id" value={book.id} />
                            <button
                              type="submit"
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {book.description}
                      </p>
                      {(book.series_name || book.series_number) && (
                        <p className="text-sm text-gray-500 mt-1">
                          {book.series_name && <span>{book.series_name}</span>}
                          {book.series_number && <span> #{book.series_number}</span>}
                        </p>
                      )}
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">
                          Purchase Links
                        </h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {book.purchase_links.map((link: any) =>
                            editingLinkId === link.id ? (
                              <PurchaseLinkForm
                                key={link.id}
                                bookId={book.id}
                                link={link}
                                icons={icons}
                                onCancel={() => setEditingLinkId(null)}
                              />
                            ) : (
                              <div
                                key={link.id}
                                className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-xs"
                              >
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-black"
                                >
                                  {link.icon_url && (
                                    <img
                                      src={r2Image(link.icon_url)}
                                      alt=""
                                      className="w-3 h-3"
                                    />
                                  )}
                                  {link.store_name}
                                </a>
                                <button
                                  type="button"
                                  className="text-blue-600 hover:text-blue-800 ml-1"
                                  onClick={() => setEditingLinkId(link.id)}
                                >
                                  Edit
                                </button>
                                <form method="post" className="inline ml-1" onSubmit={(e) => { if (!confirm("Delete this purchase link?")) e.preventDefault(); }}>
                                  <input type="hidden" name="intent" value="delete-purchase-link" />
                                  <input type="hidden" name="id" value={link.id} />
                                  <button type="submit" className="text-red-600 hover:text-red-800">
                                    Delete
                                  </button>
                                </form>
                              </div>
                            ),
                          )}
                        </div>
                        {editingLinkId === null && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium mb-2">
                              Add Purchase Link
                            </h5>
                            <PurchaseLinkForm
                              bookId={book.id}
                              icons={filteredIcons}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            {books.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No books yet. Add one above.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
