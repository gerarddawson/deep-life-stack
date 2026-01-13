# Claude Code Context for Deep Life Stack

## Project Overview

This is a React web app for Cal Newport's "Deep Life Stack" - a 120-day personal development journey across 4 layers: Discipline, Values, Control, and Vision. Users track habits, set values/rituals, plan their weeks/days, and define life goals.

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Hosting**: Vercel (auto-deploys from GitHub main branch)

## Key Architecture Patterns

### View/Edit Mode (Control Layer)
`DailyPlannerView.jsx` and `WeeklyPlannerView.jsx` use a view/edit toggle:
- `isEditing` state controls which UI is shown
- Saved plans load in view mode (read-only styled text)
- New plans start in edit mode
- "Edit" button → edit mode; "Save" → view mode; "Cancel" → revert + view mode
- `currentPlan` holds the saved data for reverting on cancel

### Parallel Data Loading (Dashboard)
The Dashboard uses `Promise.all()` to run all queries in parallel:
```javascript
const [result1, result2, result3] = await Promise.all([
  supabase.from('table1').select('*').eq('user_id', user.id),
  supabase.from('table2').select('*').eq('user_id', user.id),
  supabase.from('table3').select('*').eq('user_id', user.id)
])
```
Derived values (journey start date, current layer, progress) are computed from fetched data, not additional queries.

### Supabase Upsert
Always use `onConflict` with upsert to prevent duplicate key errors:
```javascript
await supabase.from('weekly_plans').upsert({
  user_id: user.id,
  week_start: weekStartStr,
  theme: theme,
  big_rocks: filteredBigRocks,
}, { onConflict: 'user_id,week_start' })
```

### Component Data Flow
Parent components (e.g., `ControlLayer`) fetch data and pass to children via props. Children call `onUpdate()` after saves to trigger parent refetch.

## Project Structure

```
src/components/
├── auth/          # Login, signup
├── dashboard/     # Main dashboard, activity grid, today's focus
├── discipline/    # Habit tracking (DisciplineLayer, HabitCard, HabitCalendar)
├── values/        # Personal code, core values, rituals
├── control/       # Weekly/daily planning, time blocks, household
├── vision/        # Remarkable aspects, milestones
├── landing/       # Marketing landing page
└── shared/        # Sidebar navigation
```

## Important Files

| File | Purpose |
|------|---------|
| `src/components/control/DailyPlannerView.jsx` | Daily planning with priorities, time blocks, reflection |
| `src/components/control/WeeklyPlannerView.jsx` | Weekly theme and big rocks |
| `src/components/control/TimeBlockingView.jsx` | Time block add/remove component |
| `src/components/dashboard/Dashboard.jsx` | Main dashboard with activity grid |
| `src/lib/supabase.js` | Supabase client initialization |
| `supabase-schema.sql` | Complete database schema with RLS policies |

## Database Tables

- `journeys` - User's 120-day journey (unique per user)
- `habits` / `completions` - Discipline layer
- `personal_code` / `values` / `rituals` / `ritual_completions` - Values layer
- `weekly_plans` / `daily_plans` - Control layer
- `remarkable_aspects` / `milestones` - Vision layer

All tables have Row Level Security - users can only access their own data.

## Coding Conventions

- Functional components with hooks
- TailwindCSS for styling (no separate CSS files)
- Layer-specific colors: `control-primary`, `values-primary`, `discipline-primary`, `vision-primary`
- Gradient buttons: `gradient-control`, `gradient-values`, etc.
- Card styling: `className="card p-6"` for consistent cards

## Testing Changes

1. Run `npm run dev` for local development
2. Run `npm run build` to check for build errors before committing
3. Push to main branch → Vercel auto-deploys

## Current State (January 2025)

All 4 layers are fully implemented:
- **Discipline**: Habit tracking with streaks and calendar
- **Values**: Personal code (auto-save), core values, rituals with completion tracking
- **Control**: Weekly/daily planning with view/edit modes, time blocking
- **Vision**: Remarkable aspects with milestones and progress tracking

Recent work focused on Control Layer UX improvements (view/edit modes, cleaner UI).

## Areas That May Need Work

- Household Systems tab uses localStorage only (not synced to database)
- Automations tab is a placeholder
- Time blocking UI is minimal
- No mobile-specific optimizations yet

## Common Tasks

**Adding a new field to a plan:**
1. Update the database schema (add column)
2. Update the component state
3. Update loadPlan to read the field
4. Update handleSave to write the field
5. Add UI for view mode and edit mode

**Fixing upsert errors:**
Check that `onConflict` matches the unique constraint columns in `supabase-schema.sql`
