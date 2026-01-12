# Deep Life Stack - Web App

A web application for following Cal Newport's "Deep Life Stack" tactical philosophy from "How to Reinvent Your Life in 4 Months".

## Overview

This app guides you through a 120-day journey across 4 layers:
- **Discipline** (Days 1-15): Core system + 3 keystone habits
- **Values** (Days 16-45): Personal code, core values, and rituals
- **Control** (Days 46-75): Weekly/daily planning and household systems
- **Vision** (Days 76-120): Remarkable life aspects and milestones

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Hosting**: Vercel

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

### Dashboard
- Activity grid (GitHub-style heatmap) showing all 120 days of the journey
- Today's Focus with two-column layout: habits and rituals
- Layer progress tracking with visual indicators
- Quick links to daily and weekly plans

### Discipline Layer (Days 1-15)
- Create up to 3 keystone habits
- Daily completion tracking with toggle buttons
- Habit calendar visualization
- Streak calculations and completion rate analytics
- Color-coded habit indicators

### Values Layer (Days 16-45)
- **Personal Code**: Write and auto-save your personal constitution
- **Core Values**: Create and organize values with icons and descriptions
- **Rituals**: Create value-aligned rituals with multiple frequencies (daily, weekly, monthly, quarterly)
- Link rituals to specific values
- Ritual completion tracking on dashboard

### Control Layer (Days 46-75)
- **Weekly Planning**: Set weekly themes, define 3-5 "big rocks", navigate between weeks
- **Daily Planning**: Set top 3 priorities, time blocking, end-of-day reflection
- **Household Systems**: Manage household tasks with categories (cleaning, maintenance, finances, etc.)
- View all past weekly and daily plans

### Vision Layer (Days 76-120)
- **Remarkable Aspects**: Define goals across 6 life categories (Career, Family, Health, Creativity, Community, Lifestyle)
- Scale classification (small vs. large overhauls)
- Status tracking (Planning → In Progress → Completed → On Hold)
- **Milestones**: Break aspects into sequential milestones with target dates and progress tracking

### Core Features
- User authentication (sign up / login)
- Beautiful layer-specific color gradients
- Responsive design

## Project Structure

```
deep-life-web/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard view with activity grid
│   │   ├── discipline/     # Discipline layer (habits)
│   │   ├── values/         # Values layer (personal code, core values, rituals)
│   │   ├── control/        # Control layer (weekly/daily planning, household)
│   │   ├── vision/         # Vision layer (remarkable aspects, milestones)
│   │   ├── landing/        # Marketing landing page
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

The app uses Supabase (PostgreSQL) with the following tables:

### Discipline Layer
- `journeys` - Tracks user's 120-day journey start date and progress
- `habits` - Keystone habits (max 3 per user)
- `completions` - Daily habit completion tracking

### Values Layer
- `personal_code` - User's personal constitution text
- `values` - Core personal values with icons and descriptions
- `rituals` - Value-aligned rituals with frequency settings
- `ritual_completions` - Tracks ritual completion by date

### Control Layer
- `weekly_plans` - Weekly themes and big rocks (priorities)
- `daily_plans` - Daily priorities, time blocks, and reflections

### Vision Layer
- `remarkable_aspects` - Life goals across 6 categories with status tracking
- `milestones` - Sequential milestones for each aspect

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
