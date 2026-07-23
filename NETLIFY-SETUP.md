# Project Little Bridge — Netlify setup

## Fastest option

Upload the separate `project-little-bridge-netlify-deploy.zip` file to Netlify Drop.

## Deploy from this source folder

1. Upload this folder to GitHub.
2. In Netlify, choose **Add new project** and import the GitHub repository.
3. Netlify will read `netlify.toml`, run `npm run build`, and publish the `out` folder.
4. In Netlify, open **Forms** and enable form detection.
5. Redeploy once after enabling form detection.
6. Under **Configuration → Notifications → Form submission notifications**, add `projectlittlebridge@gmail.com`.

The contact form is named `project-little-bridge-contact`.
