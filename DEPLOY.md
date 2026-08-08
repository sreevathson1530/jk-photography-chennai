# JK Photography — Deploy Guide

## GitHub

Repository uses **Git LFS** for large wedding film clips (`public/media/films/clips/*.mp4`).

```bash
cd website
git lfs install
gh auth login
gh repo create jk-photography-chennai --public --source=. --remote=origin --push
```

If the repo already exists on your account:

```bash
git remote add origin https://github.com/YOUR_USERNAME/jk-photography-chennai.git
git push -u origin main
```

> First push may take 15–30 minutes because of video files (~2.7 GB via Git LFS).

## Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** the GitHub repo `jk-photography-chennai`
3. Framework: **Next.js** (auto-detected)
4. Root directory: `website` if repo root is parent folder, or `.` if repo is the website folder
5. Add environment variable:
   - `ADMIN_PASSWORD` = your secure admin password
6. Click **Deploy**

Or via CLI (after GitHub is connected):

```bash
npx vercel link
npx vercel env add ADMIN_PASSWORD
npx vercel --prod
```

### Live URLs

- Site: `https://jk-photography-chennai.vercel.app` (or your custom domain)
- Admin: `/admin`

## Notes

- **Admin uploads on Vercel**: file writes do not persist on serverless hosting. Use admin on your local machine, then commit & push changes, or upgrade to persistent storage later.
- **Videos**: included in `public/media/` and deployed as static assets when using Git-based Vercel deploys.
