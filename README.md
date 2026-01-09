# Deep Life Stack - Web App

A web application for following Cal Newport's "Deep Life Stack" tactical philosophy from "How to Reinvent Your Life in 4 Months".

## Overview

This app guides you through a 4-month journey across 4 layers:
- **Discipline** (Month 1): Core system + 3 keystone habits
- **Values** (Month 2): Personal code and rituals
- **Control** (Month 3): Multi-scale planning and organization
- **Vision** (Month 4): Remarkable life transformation

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Hosting**: Vercel (free tier)

## Setup Instructions

### 1. Install Dependencies

```bash
cd deep-life-web
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy the contents of `supabase-schema.sql` and run it to create all tables

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to **Project Settings** > **API** in your Supabase dashboard
   - Copy the **Project URL** and **anon public** key

3. Update `.env` with your credentials:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Deploy to Vercel (Optional)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Features

### Currently Implemented
- ✅ User authentication (sign up / login)
- ✅ Dashboard with journey progress
- ✅ Discipline Layer with habit tracking
- ✅ Streak calculations
- ✅ Completion rate analytics
- ✅ Beautiful layer-specific color gradients

### Coming Soon
- 🔄 Values Layer (personal code + rituals)
- 🔄 Control Layer (weekly/daily planning)
- 🔄 Vision Layer (remarkable life aspects)

## Project Structure

```
deep-life-web/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard view
│   │   ├── discipline/     # Discipline layer (habits)
│   │   └── shared/         # Shared components (Sidebar, etc.)
│   ├── lib/
│   │   ├── supabase.js     # Supabase client
│   │   └── calculations.js # Streak and analytics functions
│   ├── styles/
│   │   └── index.css       # Global styles + Tailwind
│   ├── App.jsx             # Main app with routing
│   └── main.jsx            # Entry point
├── supabase-schema.sql     # Database schema
├── tailwind.config.js      # TailwindCSS config with layer colors
└── vite.config.js          # Vite configuration
```

## Layer Color Palette

Each layer has its own gradient color scheme:

- **Discipline**: Deep Blue (#1E3A8A) → Cyan (#06B6D4)
- **Values**: Purple (#7C3AED) → Pink (#EC4899)
- **Control**: Forest Green (#059669) → Emerald (#10B981)
- **Vision**: Orange (#EA580C) → Gold (#F59E0B)

## Database Schema

The app uses Supabase (PostgreSQL) with the following main tables:

- `journeys` - Tracks user's 4-month journey
- `habits` - Keystone habits (max 3 per user)
- `completions` - Daily habit completion tracking
- `values` - Core personal values (future)
- `rituals` - Value-aligned rituals (future)
- `weekly_plans` - Weekly planning (future)
- `daily_plans` - Daily time blocking (future)
- `remarkable_aspects` - Vision board items (future)
- `milestones` - Sequential milestones (future)

## Troubleshooting

### "Invalid API key" error
Make sure your `.env` file has the correct Supabase URL and anon key from your project settings.

### Build errors
Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

### Supabase RLS errors
Make sure you ran the entire `supabase-schema.sql` file, including the Row Level Security policies.

## Resources

- [Cal Newport's Video](https://www.youtube.com/watch?v=example) - "How to Reinvent Your Life in 4 Months"
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## License

MIT
