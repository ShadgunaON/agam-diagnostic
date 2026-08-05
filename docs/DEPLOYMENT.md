# Deployment

This Next.js application is designed to be **Deployment-Platform Agnostic**.

## Build Output
Running `npm run build` generates a fully optimized static export (or Node.js server build, depending on Next.js config). 

## Supported Platforms
- **Vercel / Netlify**: Works out of the box with zero configuration.
- **AWS S3 + CloudFront**: Set `output: 'export'` in `next.config.js` to deploy as a static site.
- **Docker / Kubernetes**: Use a standard Node.js Dockerfile to host the built `.next` folder.

## Environment Variables
- Ensure all environment variables are centrally managed.
- Never hardcode API keys or region specifics directly into components.
