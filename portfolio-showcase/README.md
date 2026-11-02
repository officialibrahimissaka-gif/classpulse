# A portfolio page you can put on Netlify

This folder is a **static project showcase**, clearly labeled. It is not the interactive application or its backend. All example records are fictional; report files were generated through the actual app/worker.

1. Download the current GitHub review branch ZIP and extract it.
2. Open the extracted `portfolio-showcase` folder. Double-click `index.html` to view it immediately on Windows; no Node.js or Docker is needed to view this page or open the sample PDF/CSV/XLSX files.
3. To give this showcase a public link, sign in to your own Netlify account and use its manual drag-and-drop deployment area. Upload **this `portfolio-showcase` folder only**, with `index.html` at its root. No build command is required for these static files.
4. Netlify supplies the resulting showcase URL after you deploy it. No Netlify account is connected here and no public deployment has been made by the assistant. Do not call this URL the interactive app; the page explicitly explains the difference.

For the **real interactive app**, follow [OPEN_MY_PROJECT.md](../OPEN_MY_PROJECT.md). That runs the actual backend, data services and report worker locally. Deploying the interactive app publicly is a separate remaining task requiring service/provider/access setup.

Never upload the repository root as a static website: private local `.env.local`, `.local` and `.data` files must stay off public file hosting. GitHub's repository may be private; public showcase visitors need repository access to view private source links, but the screenshot and report downloads in this folder work independently when deployed.

You can edit your project title, owner byline and presentation directly in `index.html`; the image and sample downloads are neighboring files. Keep the static/not-live labels accurate.
