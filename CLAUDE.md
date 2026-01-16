# Claude Code Context for Deep Life Stack

## Project Overview

This is a React web app implementing Cal Newport's "Deep Life Stack" methodology - a personal development system across 4 layers: Discipline, Values, Control, and Vision. The app is designed to align closely with Newport's teachings from his podcast and books.

## Cal Newport's Deep Life Stack Methodology

### The Four Layers
1. **Discipline Layer** - Foundation of daily habits in three areas:
   - **Body**: Physical health (exercise, sleep, nutrition)
   - **Mind**: Mental acuity (reading, learning, meditation)
   - **Heart**: Emotional connection (relationships, community)

2. **Values Layer** - Defining what matters:
   - Core personal values
   - Rituals aligned with each value
   - Personal code document

3. **Control Layer** - Multi-scale planning (Newport's signature system):
   - **Quarterly Planning**: 3-5 major objectives per quarter
   - **Weekly Planning**: Theme + big rocks that advance quarterly goals
   - **Daily Planning**: Top priorities + time blocking
   - **Shutdown Ritual**: End-of-day checklist to mentally close work

4. **Vision Layer** - Long-term life design:
   - Remarkable aspects of life to develop
   - Milestones for tracking progress

### Key Principle: Connected Planning Scales
Each planning scale should reference the level above:
- Weekly planner shows quarterly objectives for context
- Daily planner shows weekly big rocks for context

This ensures daily actions align with bigger goals.

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Hosting**: Vercel (auto-deploys from GitHub main branch)

## Key Architecture Patterns

### View/Edit Mode (Control Layer)
`DailyPlannerView.jsx`, `WeeklyPlannerView.jsx`, and `QuarterlyPlannerView.jsx` use a view/edit toggle:
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

### Timezone-Safe Date Handling (CRITICAL)
**Never use `toISOString().split('T')[0]`** for date strings. This returns UTC dates which can be off by a day depending on the user's timezone.

Instead, use the `getLocalDateString` helper (defined in each component that needs it):
```javascript
function getLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
```

Similarly, when parsing a date string from the database back to a Date object, use:
```javascript
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}
```

**Why this matters**: `new Date("2026-01-12")` creates midnight UTC, which in US timezones (UTC-5 to UTC-8) displays as January 11th. This causes:
- Habits showing as completed on wrong days
- Daily/weekly plans appearing on wrong dates
- "Today" badges on wrong items

**Files with timezone-safe date handling**:
- `src/components/dashboard/Dashboard.jsx`
- `src/components/discipline/DisciplineLayer.jsx`
- `src/components/discipline/HabitCard.jsx`
- `src/components/discipline/HabitCalendar.jsx`
- `src/components/control/DailyPlannerView.jsx`
- `src/components/control/WeeklyPlannerView.jsx`
- `src/lib/calculations.js`

### Component Data Flow
Parent components (e.g., `ControlLayer`) fetch data and pass to children via props. Children call `onUpdate()` after saves to trigger parent refetch.

## Project Structure

```
src/components/
├── auth/          # Login, signup
├── dashboard/     # Main dashboard, activity grid, today's focus
├── discipline/    # Habit tracking (DisciplineLayer, HabitCard, HabitCalendar, AddHabitModal)
├── values/        # Personal code, core values, rituals
├── control/       # Quarterly/weekly/daily planning, time blocks
├── vision/        # Remarkable aspects, milestones
├── landing/       # Marketing landing page
└── shared/        # Sidebar navigation
```

## Important Files

| File | Purpose |
|------|---------|
| `src/components/control/QuarterlyPlannerView.jsx` | Quarterly objectives and reflection |
| `src/components/control/WeeklyPlannerView.jsx` | Weekly theme and big rocks (shows quarterly context) |
| `src/components/control/DailyPlannerView.jsx` | Daily priorities, time blocks, reflection, shutdown ritual (shows weekly context) |
| `src/components/control/TimeBlockingView.jsx` | Time block add/edit/remove component |
| `src/components/discipline/DisciplineLayer.jsx` | Habits organized by Body/Mind/Heart categories |
| `src/components/discipline/AddHabitModal.jsx` | Create/edit habits with Body/Mind/Heart category selection |
| `src/components/dashboard/Dashboard.jsx` | Main dashboard with activity grid |
| `src/lib/supabase.js` | Supabase client initialization |
| `src/lib/calculations.js` | Streak and completion rate calculations |
| `supabase-schema.sql` | Complete database schema with RLS policies |
| `vercel.json` | Vercel config for SPA routing (rewrites all routes to index.html) |

## Database Tables

- `journeys` - User's journey tracking (unique per user)
- `habits` - Keystone habits with `category` field (body/mind/heart)
- `completions` - Daily habit completion records
- `personal_code` - User's personal code document (Values layer)
- `values` - Core personal values
- `rituals` - Value-aligned rituals (linked to values via `value_id`)
- `ritual_completions` - Ritual completion tracking
- `quarterly_plans` - Quarterly objectives and reflection
- `weekly_plans` - Weekly theme and big rocks
- `daily_plans` - Daily priorities, time blocks, reflection, shutdown ritual data
- `remarkable_aspects` - Vision layer life aspects
- `milestones` - Milestones for remarkable aspects

All tables have Row Level Security - users can only access their own data.

## Coding Conventions

- Functional components with hooks
- TailwindCSS for styling (no separate CSS files)
- Layer-specific colors: `control-primary`, `values-primary`, `discipline-primary`, `vision-primary`
- Gradient buttons: `gradient-control`, `gradient-values`, etc.
- Card styling: `className="card p-6"` for consistent cards
- Context boxes use colored backgrounds: purple for quarterly, blue for weekly

## Testing Changes

1. Run `npm run dev` for local development
2. Run `npm run build` to check for build errors before committing
3. Push to main branch → Vercel auto-deploys

## Current State (January 2026)

All 4 layers are fully implemented and aligned with Cal Newport's methodology:

- **Discipline**: Habits organized by Body/Mind/Heart categories (max 1 per category)
- **Values**: Personal code (auto-save), core values, rituals linked to values
- **Control**: Multi-scale planning (Quarterly → Weekly → Daily) with connected context, shutdown ritual
- **Vision**: Remarkable aspects with milestones and progress tracking

Recent work:
- Aligned app with Cal Newport's actual Deep Life Stack methodology
- Restructured habits into Body/Mind/Heart categories
- Added Quarterly Planning as top of multi-scale planning system
- Connected planning scales (weekly shows quarterly context, daily shows weekly context)
- Added Shutdown Ritual checklist to daily planning
- Removed non-Newport features (Household Systems, Automations tabs)
- Added habit delete functionality
- Fixed timezone bugs across all date handling
- Added Tasks and Ideas note-taking sections to Daily Planner
- Improved Tasks & Ideas UX: now a separate left panel with auto-save, independent of daily plan edit/view mode
- Added collapsible sidebar navigation

## Common Tasks

**Adding a new field to a plan:**
1. Update the database schema (add column)
2. Update the component state
3. Update loadPlan to read the field
4. Update handleSave to write the field
5. Add UI for view mode and edit mode

**Fixing upsert errors:**
Check that `onConflict` matches the unique constraint columns in `supabase-schema.sql`

**Adding database columns (for existing tables):**
```sql
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name DATA_TYPE;
```

Note: PostgreSQL doesn't support `IF NOT EXISTS` for `CREATE POLICY`, so run policy creation separately and expect errors if already exists.
