# Pizzalord.online

The static website source is in [`pizzalordWebsite/`](./pizzalordWebsite/). The contact Worker is in [`cloudflare/contact-worker.js`](./cloudflare/contact-worker.js), with its Wrangler configuration at the repository root.

GitHub Pages is expected to publish from the repository root. The root `index.html` redirects visitors to the site folder, and the root `CNAME` keeps the custom domain configured. Keep both files at the root unless the Pages publishing source is changed.
