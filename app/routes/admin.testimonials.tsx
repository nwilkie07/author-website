import { TestimonialsService } from "../services/testimonials";
import { AdminNav } from "~/components/AdminNav";
import { useState } from "react";
import type { Testimonial } from "../types/db";

// Loader: fetch all testimonials
export async function loader({ context }: any) {
  const db = context.cloudflare.env.DB;
  const testimonialsService = new TestimonialsService(db);
  const testimonials = await testimonialsService.getAllTestimonials();
  return { testimonials };
}

// Action: handle create / update / delete testimonial
export async function action({ request, context }: any) {
  const db = context.cloudflare.env.DB;
  const testimonialsService = new TestimonialsService(db);
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create-testimonial": {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string | null;
      const store = formData.get("store") as string | null;
      const testimonial = await testimonialsService.createTestimonial(name, description ?? null, store ?? undefined);
      return { success: true, testimonial };
    }
    case "update-testimonial": {
      const id = parseInt(formData.get("id") as string);
      const name = formData.get("name") as string;
      const description = formData.get("description") as string | null;
      const store = formData.get("store") as string | null;
      const testimonial = await testimonialsService.updateTestimonial(id, name, description ?? null, store ?? undefined);
      return { success: true, testimonial };
    }
    case "delete-testimonial": {
      const id = parseInt(formData.get("id") as string);
      await testimonialsService.deleteTestimonial(id);
      return { success: true };
    }
    default:
      return { success: false, error: "Unknown intent" };
  }
}

function TestimonialForm({ testimonial, onCancel }: { testimonial?: Testimonial; onCancel?: () => void }) {
  const intent = testimonial ? "update-testimonial" : "create-testimonial";
  const [name, setName] = useState(testimonial?.name ?? "");
  const [description, setDescription] = useState(testimonial?.description ?? "");
  const [store, setStore] = useState(testimonial?.store ?? "");

  return (
    <form method="post" className="space-y-4">
      <input type="hidden" name="intent" value={intent} />
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Person's name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
          placeholder="Description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
        <input
          type="text"
          name="store"
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Store name (optional)"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {testimonial ? "Update Testimonial" : "Add Testimonial"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

import React from "react"; // ensure React is in scope for JSX in some environments

export default function AdminTestimonials({ loaderData }: any) {
  const { testimonials } = loaderData;
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        <h1 className="text-3xl font-bold mb-6">Manage Testimonials</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <section className="bg-white rounded-lg shadow p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Add New Testimonial</h2>
            <TestimonialForm />
          </section>
          <section className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Testimonials</h2>
            {testimonials.map((t: Testimonial) => (
              <div key={t.id} className="flex gap-4 mb-6 items-start border-b border-gray-200 pb-4">
                {editingId === t.id ? (
                  <div className="w-full">
                    <TestimonialForm testimonial={t} onCancel={() => setEditingId(null)} />
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{t.name}</h3>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm" onClick={() => setEditingId(t.id)}>Edit</button>
                          <form method="post" className="inline" onSubmit={(e)=>{ if(!confirm("Delete this testimonial?")) e.preventDefault(); }}>
                            <input type="hidden" name="intent" value="delete-testimonial" />
                            <input type="hidden" name="id" value={t.id} />
                            <button type="submit" className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                          </form>
                        </div>
                      </div>
                      {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
                      {t.store && <p className="text-xs text-gray-500 mt-1">Store: {t.store}</p>}
                      <p className="text-xs text-gray-400 mt-1">Created: {t.created_at}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
            {testimonials.length === 0 && (
              <div className="text-center text-gray-500 py-8">No testimonials yet. Add one above.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
