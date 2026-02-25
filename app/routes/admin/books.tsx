import type { Route } from "../+types/admin.books";
import { BooksService } from "../../services/books";
import type { Book, PurchaseLink, BookWithPurchaseLinks } from "../../types/db";
import { AdminNav } from "../../components/AdminNav";
import { useState, useRef, useCallback } from "react";
import { r2Image } from "../../utils/images";

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

  // The rest of the handlers mirror the old admin.books.tsx logic
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
      await bucket.put(key, arrayBuffer, { httpMetadata: { contentType: file.type } });
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

export default function AdminBooks({ loaderData }: Route.ComponentProps) {
  const { books } = loaderData as { books: BookWithPurchaseLinks[] };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <AdminNav />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Books</h1>
        {books.map((b) => (
          <div key={b.id} className="p-4 mb-4 bg-white rounded shadow-sm flex items-center gap-4">
            <img src={b.image_url} alt={b.name} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <div className="font-semibold">{b.name}</div>
              <div className="text-sm text-gray-600">{b.description}</div>
              <div className="text-xs text-gray-500">{b.purchase_links?.length ?? 0} purchase link(s)</div>
            </div>
          </div>
        ))}
        {books.length === 0 && (
          <div className="text-center text-gray-600">No books found. Add one via the create form (not implemented in this skeleton).</div>
        )}
      </div>
    </div>
  );
}
