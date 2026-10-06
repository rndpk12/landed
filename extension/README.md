# Landed Browser Extension

The Chrome extension imports the active job-posting URL, lets the user review extracted information, and saves the application to Landed.

## Folder map

```text
extension/
├── manifest.json       # Chrome MV3 permissions and extension configuration
├── background.js       # Google sign-in, API bridge, and tab actions
├── content.js          # Safe extraction from supported job pages
├── popup.html          # Extension popup structure
├── popup.css           # Landed popup styling
├── popup.js            # Popup interaction and save flow
└── landed-lockup.svg   # Extension brand asset
```

## Install locally

1. For full Landed, build and start the API. For the no-account Lite flow, start the frontend with `npm run dev` from `frontend/` and leave it running at `http://localhost:5173`.
2. In Chrome, open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select this `extension` folder.
4. Copy the extension ID shown by Chrome and add `chrome-extension://<extension-id>` to `CORS_ALLOWED_ORIGINS` alongside the web app origin. Restart the API after changing it.
5. Open the extension on a supported job page. For full Landed, sign in and choose **Read job page** and **Save to Landed**. For Lite, choose **Save to Landed Lite** without signing in. It opens `http://localhost:5173/lite/import` with the URL and any available page data pre-filled.

For local development, replace the API URL with `http://localhost:8080/api/v1` before signing in.

### Use Landed Lite locally

Landed Lite does not use an account or database. Start the frontend, load the unpacked extension, visit a job post, and choose **Save to Landed Lite**. The extension opens `http://localhost:3000/lite/import`; review the fields and save the application in your browser. Direct URL auto-fill additionally uses the local API importer.

For local development, use `http://localhost:8080/api/v1`. For production, enter the public API base URL ending in `/api/v1`.

## Enable Google sign-in

Google sign-in needs a separate OAuth client because Chrome binds it to the extension ID.

1. Load the extension once and copy its ID from `chrome://extensions`.
2. In Google Cloud Console, create an **OAuth client ID** with application type **Chrome extension** and enter that extension ID.
3. Copy the client ID into `extension/manifest.json` under `oauth2.client_id`, replacing the placeholder value.
4. Add the same value to the API configuration without replacing the existing web client:

   ```env
   GOOGLE_ADDITIONAL_CLIENT_IDS=your-chrome-extension-client-id.apps.googleusercontent.com
   ```

5. Restart the API, then click **Continue with Google** in the extension and reload the extension from `chrome://extensions` after editing the manifest.

Landed's API validates this extension client ID in addition to the normal web client ID, so both the portal and extension can use Google sign-in safely.

## Security model

- The extension signs in directly to Landed's existing `/auth/login` endpoint and stores the issued JWT in `chrome.storage.local`.
- It requests permission for only the API origin entered by the user at connection time.
- The JWT is never written to a job page, injected into a page DOM, or sent to any domain other than the configured Landed API.

## Supported import behavior

Landed first calls the server-side `/job-import` endpoint, which uses the existing job-source provider system. If server import is unavailable, the content script uses JSON-LD JobPosting data and safe visible-page fallbacks to prefill the editable form.

Before publishing, replace the development version, add the production API origin to the extension's optional host permissions during installation, and prepare store privacy disclosures for the job-page data the user chooses to save.
