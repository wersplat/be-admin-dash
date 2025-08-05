# Admin Dashboard for Supabase

A modern, responsive admin dashboard built with Next.js, TypeScript, and Tailwind CSS, designed to manage your Supabase backend.

## Features

- 🔐 Authentication with Supabase Auth
- 📊 Dashboard with key metrics
- 👥 User management
- 🗃️ Database management
- 📱 Responsive design
- 🚀 Built with Next.js 14 App Router

## Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase project

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/be-admin-dash.git
   cd be-admin-dash
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Update the Supabase URL and anon key with your project's credentials

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: For social logins
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
# NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

## Project Structure

```
src/
├── app/                    # App router
│   ├── dashboard/         # Protected dashboard routes
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── context/               # React context providers
├── lib/                   # Utility functions and configurations
└── types/                 # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Other Platforms

You can also deploy to other platforms that support Next.js:

- [Netlify](https://www.netlify.com/with/nextjs/)
- [AWS Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html)
- [Railway](https://railway.app/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
