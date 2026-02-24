# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Previewing the Production Build

Preview the production build locally:

```bash
npm run preview
```

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
npm run deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Cloudflare Resources Setup

### D1 Database Setup

1. Create the D1 database:

```bash
wrangler d1 create author-website-db
```

2. Copy the `database_id` from the output and update `wrangler.jsonc`:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "author-website-db",
    "database_id": "YOUR_DATABASE_ID_HERE"
  }
]
```

3. Run the migrations to create tables:

```bash
wrangler d1 execute author-website-db --file=./migrations/0001_init.sql
wrangler d1 execute author-website-db --file=./migrations/0002_add_page_contents.sql
```

For local development, the database will be created automatically when you run `npm run dev`.

### R2 Bucket Setup

1. Create the R2 bucket:

```bash
wrangler r2 bucket create author-website-images
```

2. Upload images to the bucket:

```bash
# Example: Upload book cover
wrangler r2 object put author-website-images/books/book-1.jpg --file=./path/to/book-1.jpg

# Example: Upload hero background
wrangler r2 object put author-website-images/hero/hero-bg.jpg --file=./path/to/hero-bg.jpg
```

### Admin Interface

Access the admin interfaces to manage content:

- `/admin/books` - Manage books and purchase links
- `/admin/content` - Manage page content (titles, descriptions)

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
