## Hello

The site is hosted with GitHub Pages:

Custom domain: https://pizzalord.online/
 GitHub Pages URL: https://pizzalord1.github.io/Pizzalord1/

This site uses Cloudflare technology.

## Staging the static site

The static website files are also staged in `docs/`, separate from the Cloudflare Worker in `cloudflare/`.
GitHub Pages currently publishes from the repository root, so the root files remain unchanged to keep the live site working.
The `docs/` folder is a copy and is not automatically synchronized with the root. To publish from it later, select the `main` branch and `/docs` as the GitHub Pages source in the repository settings.
