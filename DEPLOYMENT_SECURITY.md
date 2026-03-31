# Deployment Security Checklist

## 1) Rotate exposed key first
A Supabase key was previously hardcoded in backend code. Rotate/revoke that key in Supabase before production deploy.

## 2) Configure environment variables in your host
Set these in your deployment platform (Render/Railway/Heroku/Vercel serverless/others):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGIN` (your frontend domain)
- `PORT` (optional, many hosts set this automatically)

Do not commit secret values to git.

## 3) Local development
Create a local `.env` file from `.env.example` and add real values.

## 4) Verify CORS in production
Set `ALLOWED_ORIGIN` to your exact frontend URL (for example `https://bmw-showroom.example.com`).

## 5) Validate before go-live
- Login/register endpoints work.
- Admin/salesman/customer API calls succeed.
- No secrets appear in browser source or frontend JS.
- No secret appears in git history after rotation.
