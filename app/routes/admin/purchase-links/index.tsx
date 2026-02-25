import type { Route } from "../../+types/admin.purchase-links";
import { BooksService } from "../../../services/books";
import type { BookWithPurchaseLinks } from "../../../types/db";
import { AdminNav } from "../../../components/AdminNav";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const booksService = new BooksService(db);
  const books = await booksService.getAllBooksWithPurchaseLinks();
  return { books };
}

export async function action({ request, context }: Route.ActionArgs) {
  // For brevity, this index route provides read-only display and a redirection surface for future actions.
  // Implement follow-up actions (create/update/delete) as needed using the same BooksService methods.
  return { success: true };
}

export default function AdminPurchaseLinksIndex({ loaderData }: Route.ComponentProps) {
  const { books } = loaderData as { books: BookWithPurchaseLinks[] };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <AdminNav />
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Manage Purchase Links</h1>
        {books.map((b) => (
          <section key={b.id} className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">{b.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{b.description}</p>
            <div className="space-y-2">
              {b.purchase_links.map((pl) => (
                <div key={pl.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {pl.icon_url && <img src={pl.icon_url} alt="icon" className="w-5 h-5" />} {pl.store_name}
                  </span>
                  <a href={pl.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">Visit</a>
                </div>
              ))}
            </div>
          </section>
        ))}
        {books.length === 0 && (
          <div className="text-center text-gray-600">No purchase links found.</div>
        )}
      </div>
    </div>
  );
}
