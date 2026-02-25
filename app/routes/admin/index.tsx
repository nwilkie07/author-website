import { useEffect } from "react";

// Admin landing page: redirect to the main admin section (books)
export default function AdminIndex() {
  useEffect(() => {
    // Use a full-page redirect to ensure we land on the canonical admin page
    window.location.replace("/admin/books");
  }, []);
  return null;
}
