import type { Route } from "./+types/admin.books";
import { BooksService } from "../services/books";
import type { Book, BookWithPurchaseLinks, Icon, PurchaseLink } from "../types/db";
import { AdminNav } from "../components/AdminNav";
import { useState, useRef, useEffect } from "react";
import { useFetcher, useRevalidator } from "react-router";
import { r2Image } from "../utils/images";
import { listFiles, deleteFile } from "../utils/r2Client";
import DragDropUploader from "../components/DragDropUploader";
import { IconsService } from "~/services/icons";

export async function loader({ context }: Route["LoaderArgs"]) {
  const db = context.cloudflare.env.DB;
  const booksService = new BooksService(db);
  const books = await booksService.getAllBooksWithPurchaseLinks();
  // Fetch icon filenames from the Cloudflare R2 bucket (icons/ folder)
  // We only need the display names, but keep the full key as the value
  const iconService = new IconsService(db)
  const icons = await iconService.getAllIcons();
  return { books, icons };
}

export async function action({ request, context }: Route["ActionArgs"]) {
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
        return { success: true, imageUrl: key, key };
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
      const byLine = formData.get("byLine") as string | null;
      const altText = formData.get("altText") as string | null;
      const book = await booksService.createBook(
        name,
        imageUrl,
        description || undefined,
        seriesTitle || null,
        seriesNumber ? parseInt(seriesNumber) : null,
        byLine || null,
        altText || null,
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
      const byLine = formData.get("byLine") as string | null;
      const altText = formData.get("altText") as string | null;
      const book = await booksService.updateBook(
        id,
        name,
        imageUrl,
        description || undefined,
        seriesTitle || null,
        seriesNumber ? parseInt(seriesNumber) : null,
        byLine || null,
        altText || null,
      );
      return { success: true, book };
    }
    case "delete-book": {
      const id = parseInt(formData.get("id") as string);
      const book = await booksService.getBookById(id);
      if (book?.image_url) {
        try {
          await deleteFile(bucket, book.image_url);
        } catch {
          // Ignore R2 deletion errors
        }
      }
      await booksService.deleteBook(id);
      return { success: true };
    }
    case "create-purchase-link": {
      const bookId = parseInt(formData.get("bookId") as string);
      const storeName = formData.get("storeName") as string;
      const url = formData.get("url") as string;
      const iconUrl = formData.get("iconUrl") as string;
      const media_type = formData.get("mediaType") as string;
      const link = await (booksService.createPurchaseLink as any)(
        bookId,
        storeName,
        url,
        iconUrl,
        media_type
      );
      return { success: true, link };
    }
    case "update-purchase-link": {
      const id = parseInt(formData.get("id") as string);
      const storeName = formData.get("storeName") as string;
      const url = formData.get("url") as string;
      const iconUrl = formData.get("iconUrl") as string;
      const media_type = formData.get("mediaType") as string;
      const link = await (booksService.updatePurchaseLink as any)(
        id,
        storeName,
        url,
        iconUrl,
        media_type
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

function BookForm({ book, onCancel }: { book?: Book; onCancel?: () => void }) {
  const intent = book ? "update-book" : "create-book";
  const [imageUrl, setImageUrl] = useState(book?.image_url || "");
  const [dragPreview, setDragPreview] = useState<string | null>(null);
  const [bookName, setBookName] = useState<string | null>(book?.name || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [seriesTitle, setSeriesName] = useState(book?.series_title || "");
  const [seriesNumber, setSeriesNumber] = useState(book?.series_number?.toString() || "");
  const [byLine, setByLine] = useState<string>(book?.by_line || "");
  const [altText, setAltText] = useState<string>(book?.alt_text || "");

  const uploadFetcher = useFetcher();
  const bookFetcher = useFetcher();
  const pendingBookData = useRef<FormData | null>(null);
  const { revalidate } = useRevalidator();

  const isUploading = uploadFetcher.state !== "idle" || bookFetcher.state !== "idle";

  // When image upload completes, submit the book form with the returned URL
  useEffect(() => {
    if (uploadFetcher.data && pendingBookData.current) {
      const result = uploadFetcher.data as { success: boolean; imageUrl?: string; error?: string };
      if (result.success && result.imageUrl) {
        pendingBookData.current.set("imageUrl", result.imageUrl);
        bookFetcher.submit(pendingBookData.current, { method: "POST", encType: "multipart/form-data" });
      } else {
        alert(result.error || "Upload failed");
      }
      pendingBookData.current = null;
    }
  }, [uploadFetcher.data]);

  // When book save completes, revalidate the loader and close the form
  useEffect(() => {
    if (bookFetcher.data) {
      const result = bookFetcher.data as { success: boolean; error?: string };
      if (result.success) {
        revalidate();
        onCancel?.();
      } else {
        alert(result.error || "Failed to save book");
      }
    }
  }, [bookFetcher.data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("intent", intent);
    formData.set("imageUrl", imageUrl);
    formData.set("byLine", byLine);
    formData.set("altText", altText);

    if (selectedFile) {
      const uploadData = new FormData();
      uploadData.append("intent", "upload-image");
      uploadData.append("file", selectedFile);
      if (bookName) uploadData.append("name", bookName);
      pendingBookData.current = formData;
      uploadFetcher.submit(uploadData, { method: "POST", encType: "multipart/form-data" });
    } else {
      bookFetcher.submit(formData, { method: "POST", encType: "multipart/form-data" });
    }
  };

  return (
    <form method="post" className="space-y-4" encType="multipart/form-data" onSubmit={handleSubmit}>
      <input type="hidden" name="intent" value={intent} />
      {book && <input type="hidden" name="id" value={book.id} />}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="seriesTitle" value={seriesTitle} />
      <input type="hidden" name="seriesNumber" value={seriesNumber} />
      <input type="hidden" name="byLine" value={byLine} />
      <input type="hidden" name="altText" value={altText} />

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          By Line
        </label>
        <input
          type="text"
          value={byLine}
          onChange={(e) => setByLine(e.currentTarget.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          placeholder="Author by line (optional)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text
        </label>
        <input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.currentTarget.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          placeholder="Alt text for accessibility (optional)"
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
  icons?: Icon[];
  onCancel?: () => void;
}) {
  // Ref to the form element to support client-side reset after submit
  const formRef = useRef<HTMLFormElement | null>(null);
  const intent = link ? "update-purchase-link" : "create-purchase-link";
  const [iconUrl, setIconUrl] = useState<string>(link?.icon_url ?? "");
  const [mediaType, setMediaType] = useState<string>(link?.media_type ?? "")
  const [storeName, setStoreName] = useState<string>(link?.store_name || "");
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data) {
      const result = fetcher.data as { success: boolean; error?: string };
      if (result.success) {
        revalidate();
        onCancel?.();
        // Clear form fields on successful submit. This works well with
        // the non-controlled URL input, which is reset via the DOM form
        // reset and the internal state via React state setters.
        formRef.current?.reset();
        setIconUrl("");
        setMediaType("");
        setStoreName("");
      } else {
        alert(result.error || "Failed to save purchase link");
      }
    }
  }, [fetcher.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    fetcher.submit(formData, { method: "POST", encType: "multipart/form-data" });
  };

  return (
    <form
      method="post"
      className="flex flex-wrap gap-2 items-center"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <input type="hidden" name="intent" value={intent} />
      {link && <input type="hidden" name="id" value={link.id} />} 
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="iconUrl" value={iconUrl} />
      <input type="hidden" name="mediaType" value={mediaType} /> 
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
        name="storeName"
        value={storeName}
        onChange={(e) => {
          const setIcon = icons?.[e.target.options.selectedIndex - 1];
          if (setIcon !== undefined) {
          setIconUrl(setIcon.image_url);
          setStoreName(setIcon.name)
          setMediaType(setIcon.media_type)
          }
          
        }}
        className="border rounded px-3 py-1 text-sm text-black"
      >
        <option value="">None</option>
        {icons?.map((ico, index) => (
          <option key={index} value={ico.name}>
            {ico.name + " (" + ico.media_type + ")"}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
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

export default function AdminBooks({ loaderData }: Route["ComponentProps"]) {
  const { books, icons } = (loaderData as unknown as {
    books: BookWithPurchaseLinks[];
    icons: Icon[];
  });
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);

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
            {books.map((book) => (
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
                      alt={`Cover image for ${book.name}`}
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
                      {(book.series_title || book.series_number) && (
                        <p className="text-sm text-gray-500 mt-1">
                          {book.series_title && <span>{book.series_title}</span>}
                          {book.series_number && <span> #{book.series_number}</span>}
                        </p>
                      )}
                      {book.by_line && (
                        <p className="text-sm text-gray-500 mt-1">By: {book.by_line}</p>
                      )}
                      {book.alt_text && (
                        <p className="text-sm text-gray-500 mt-1">Alt: {book.alt_text}</p>
                      )}
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">
                          Purchase Links
                        </h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {book.purchase_links.map((link) =>
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
                                      alt={`Icon for ${link.store_name}`}
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
                                <form
                                  method="post"
                                  className="inline ml-1"
                                  onSubmit={(e) => {
                                    if (!confirm("Delete this purchase link?"))
                                      e.preventDefault();
                                  }}
                                >
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
                              icons={icons}
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
