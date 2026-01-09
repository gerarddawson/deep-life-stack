# Deploying Deep Life Stack to Vercel

## Prerequisites
- GitHub account
- Vercel account (free tier works great)
- Your Supabase project URL and anon key

## Step 1: Push to GitHub

1. Create a new repository on GitHub (https://github.com/new)
   - Name it: `deep-life-stack` (or whatever you prefer)
   - Make it public or private
   - **Do NOT** initialize with README, .gitignore, or license (we already have them)

2. Copy the repository URL (e.g., `https://github.com/yourusername/deep-life-stack.git`)

3. Run these commands in your terminal:
   ```bash
   git remote add origin https://github.com/yourusername/deep-life-stack.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to https://vercel.com and sign up/log in
2. Click "Add New..." → "Project"
3. Import your GitHub repository (you may need to authorize Vercel first)
4. Configure your project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. **Add Environment Variables** (CRITICAL):
   Click "Environment Variables" and add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

   ⚠️ Make sure to use the same values from your local `.env` file!

6. Click "Deploy"

7. Wait 1-2 minutes for the build to complete

8. Your app will be live at: `https://your-project-name.vercel.app`

### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project? **N**
   - What's your project's name? **deep-life-stack**
   - In which directory is your code located? **./`**
   - Want to override settings? **N**

5. Add environment variables:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Supabase for Production

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel deployment URL to:
   - **Site URL**: `https://your-project-name.vercel.app`
   - **Redirect URLs**: Add `https://your-project-name.vercel.app/**`

This ensures authentication redirects work correctly in production.

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. You should see the landing page
3. Click "Start Your Journey" → Sign Up
4. Create an account and test the app

## Automatic Deployments

Now that you're connected to Vercel:
- Every `git push` to `main` branch will automatically deploy to production
- Pull requests create preview deployments automatically
- You can see all deployments in your Vercel dashboard

## Troubleshooting

### Build Fails
- Check the Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Authentication Doesn't Work
- Double-check Supabase redirect URLs include your Vercel domain
- Verify environment variables in Vercel match your Supabase project

### App Shows Blank Page
- Check browser console for errors
- Verify environment variables are prefixed with `VITE_`
- Ensure Supabase credentials are correct

### Database Connection Issues
- Verify your Supabase project is active
- Check that your anon key has the correct permissions
- Ensure RLS policies are set up correctly

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions
5. Update Supabase redirect URLs to include your custom domain

## Monitoring

- View analytics in Vercel dashboard
- Check function logs for errors
- Monitor Supabase usage in Supabase dashboard

## Costs

- **Vercel Free Tier**:
  - 100GB bandwidth/month
  - Unlimited projects
  - Automatic HTTPS
  - Perfect for personal use

- **Supabase Free Tier**:
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
  - 2GB bandwidth

Both free tiers are more than enough for personal use and small teams!

---

**Your app is now live and accessible to anyone! 🎉**
