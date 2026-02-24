import type { Route } from "./+types/admin.books";
import { BooksService } from "../services/books";
import type { Book, PurchaseLink } from "../types/db";
import { useState, useRef, useCallback } from "react";
import { r2Image } from "../utils/images";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const booksService = new BooksService(db);
  const books = await booksService.getAllBooksWithPurchaseLinks();
  return { books };
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
      const key = `books/${timestamp}-${file.name.replace(/\s+/g, "-")}`;
      
      const arrayBuffer = await file.arrayBuffer();
      await bucket.put(key, arrayBuffer, {
        httpMetadata: { contentType: file.type },
      });

      const imageUrl = r2Image(key);
      return { success: true, imageUrl, key };
    }
    case "create-book": {
      const name = formData.get("name") as string;
      const imageUrl = formData.get("imageUrl") as string;
      const description = formData.get("description") as string | null;
      const book = await booksService.createBook(name, imageUrl, description || undefined);
      return { success: true, book };
    }
    case "update-book": {
      const id = parseInt(formData.get("id") as string);
      const name = formData.get("name") as string;
      const imageUrl = formData.get("imageUrl") as string;
      const description = formData.get("description") as string | null;
      const book = await booksService.updateBook(id, name, imageUrl, description || undefined);
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
      const link = await booksService.createPurchaseLink(bookId, storeName, url, iconUrl || undefined);
      return { success: true, link };
    }
    case "update-purchase-link": {
      const id = parseInt(formData.get("id") as string);
      const storeName = formData.get("storeName") as string;
      const url = formData.get("url") as string;
      const iconUrl = formData.get("iconUrl") as string | null;
      const link = await booksService.updatePurchaseLink(id, storeName, url, iconUrl || undefined);
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
  onImageUrlChange 
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

      const result = await response.json() as { success: boolean; imageUrl?: string; error?: string };
      
      if (result.success && result.imageUrl) {
        onImageUrlChange(result.imageUrl);
        setPreview(null);
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (error) {
      alert("Upload failed");
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
      <label className="block text-sm font-medium text-gray-700">Book Cover Image</label>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
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
              src={displayImage} 
              alt="Book cover preview" 
              className="mx-auto h-40 object-cover rounded"
            />
            <p className="text-sm text-gray-500">Click or drag to replace</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📚</div>
            <p className="text-sm text-gray-600">
              {isUploading ? "Uploading..." : "Drag and drop an image here, or click to select"}
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
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

function BookForm({ book, onCancel }: { book?: Book; onCancel?: () => void }) {
  const intent = book ? "update-book" : "create-book";
  const [imageUrl, setImageUrl] = useState(book?.image_url || "");

  return (
    <form method="post" className="space-y-4" encType="multipart/form-data">
      <input type="hidden" name="intent" value={intent} />
      {book && <input type="hidden" name="id" value={book.id} />}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Book Name <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          name="name" 
          required 
          defaultValue={book?.name || ""} 
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          placeholder="Enter book title"
        />
      </div>

      <ImageUpload imageUrl={imageUrl} onImageUrlChange={setImageUrl} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea 
          name="description" 
          defaultValue={book?.description || ""} 
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          rows={4}
          placeholder="Enter book description..."
        />
      </div>
      
      <div className="flex gap-2">
        <button 
          type="submit" 
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {book ? "Update Book" : "Add Book"}
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

function PurchaseLinkForm({ bookId, link, onCancel }: { bookId: number; link?: PurchaseLink; onCancel?: () => void }) {
  const intent = link ? "update-purchase-link" : "create-purchase-link";
  return (
    <form method="post" className="flex flex-wrap gap-2 items-center">
      <input type="hidden" name="intent" value={intent} />
      {link && <input type="hidden" name="id" value={link.id} />}
      <input type="hidden" name="bookId" value={bookId} />
      <input 
        type="text" 
        name="storeName" 
        placeholder="Store name" 
        required 
        defaultValue={link?.store_name || ""} 
        className="border rounded px-3 py-1 text-sm" 
      />
      <input 
        type="text" 
        name="url" 
        placeholder="URL" 
        required 
        defaultValue={link?.url || ""} 
        className="border rounded px-3 py-1 text-sm flex-1 min-w-[200px]" 
      />
      <input 
        type="text" 
        name="iconUrl" 
        placeholder="Icon URL (optional)" 
        defaultValue={link?.icon_url || ""} 
        className="border rounded px-3 py-1 text-sm" 
      />
      <button 
        type="submit" 
        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
      >
        {link ? "Update" : "Add"}
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
  const { books } = loaderData;
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Books</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <section className="bg-white rounded-lg shadow p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
            <BookForm />
          </section>
          <section className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Books</h2>
            {books.map((book) => (
              <div key={book.id} className="flex gap-4 mb-6 items-start border-b border-gray-200 pb-4">
                {editingBookId === book.id ? (
                  <div className="w-full">
                    <BookForm book={book} onCancel={() => setEditingBookId(null)} />
                  </div>
                ) : (
                  <>
                    <img src={book.image_url} alt={book.name} className="w-28 h-40 object-cover rounded shadow" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{book.name}</h3>
                        <div className="flex gap-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium" 
                            onClick={() => setEditingBookId(book.id)}
                          >
                            Edit
                          </button>
                          <form method="post" className="inline" onSubmit={(e)=>{ if(!confirm("Delete this book?")) e.preventDefault(); }}>
                            <input type="hidden" name="intent" value="delete-book" />
                            <input type="hidden" name="id" value={book.id} />
                            <button type="submit" className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                          </form>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{book.description}</p>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">Purchase Links</h4>
                        <div className="flex flex-wrap gap-2">
                          {book.purchase_links.map((link)=> (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
                            >
                              {link.icon_url && <img src={link.icon_url} alt="" className="w-3 h-3" />}
                              {link.store_name}
                            </a>
                          ))}
                        </div>
                        {editingLinkId === null && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium mb-2">Add Purchase Link</h5>
                            <PurchaseLinkForm bookId={book.id} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            {books.length === 0 && (
              <div className="text-center text-gray-500 py-8">No books yet. Add one above.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
