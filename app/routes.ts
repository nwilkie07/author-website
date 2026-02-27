import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("images/*", "routes/images.$.tsx"),
  route("admin/books", "routes/admin.books.tsx"),
  route("api/books", "routes/api.books.tsx"),
  route("admin/icons", "routes/admin.icons.tsx"),
  route("admin/testimonials", "routes/admin.testimonials.tsx"),
  route("admin/content", "routes/admin.content.tsx"),
  route("contact", "routes/contact.tsx"),
  route("speaking", "routes/speaking.tsx"),
  route("shop", "routes/shop.tsx"),
] satisfies RouteConfig;
