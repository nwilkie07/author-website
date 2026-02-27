import { Link, useLocation } from "react-router";

export function AdminNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const tabs = [
    { to: "/admin/books", label: "Books" },
    {to: "/admin/icons", label: "Icons"},
    { to: "/admin/content", label: "Content" },
    { to: "/admin/testimonials", label: "Testimonials" },
  ];

  return (
    <nav className="mb-4 border-b border-gray-200 bg-white rounded-md shadow-sm">
      <ul className="flex space-x-4 p-2">
        {tabs.map((t) => {
          const isActive = currentPath.startsWith(t.to);
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                className={isActive
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-blue-600 pb-1"
                }
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
