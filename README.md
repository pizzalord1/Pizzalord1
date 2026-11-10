## Hello

The site is hosted with GitHub Pages:

Custom domain: https://pizzalord.online/
 GitHub Pages URL: https://pizzalord1.github.io/Pizzalord1/

## Contact form setup

The contact form uses Cloudflare Turnstile and a Cloudflare Worker. The recipient address and Turnstile secret are kept in Worker secrets, not in the public site files.

1. In Cloudflare, create a Turnstile widget for `pizzalord.online`. Copy its public site key into `CONTACT_TURNSTILE_SITE_KEY` in `contact.js`.
2. In Cloudflare Email Service, onboard `pizzalord.online` for Email Sending and verify `contact@pizzalord.online` as the sender. Email Sending to an arbitrary recipient requires the Workers Paid plan. Add the MX, SPF, and DKIM sending records Cloudflare provides under `cf-bounce`.
3. Leave the existing apex MX and SPF records unchanged; remove them only if you intentionally discontinue the registrar's email forwarding. Do not add a second DMARC record; this domain already publishes one at `_dmarc.pizzalord.online`. Review any DMARC suggestion from Cloudflare and retain a single valid record.
4. From the repository directory, log in and add the private Worker secrets:

   ```sh
   npx wrangler login
   npx wrangler secret put TURNSTILE_SECRET_KEY
   npx wrangler secret put CONTACT_RECIPIENT
   ```

   Enter the Turnstile secret key and the intended inbox address when prompted. Do not put either value in a committed file.
5. Deploy the Worker and publish the site:

   ```sh
   npx wrangler deploy
   ```

   The Worker route is configured for `https://pizzalord.online/api/contact`.
