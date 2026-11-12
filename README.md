# Good Deed

A small, responsive Next.js app for finding simple ways to make someone's day a little brighter. The daily deed card is interactive; it runs entirely in the browser and does not need a database or environment variables.

## Run it on your computer

1. Install [Node.js](https://nodejs.org/) if it is not already installed.
2. Open a terminal in this project folder.
3. Run `npm install` once.
4. Run `npm run dev`.
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

To check the production build locally, run `npm run build`, then `npm run start`.

## Put it online with Vercel

The easiest beginner-friendly path is to put this project on GitHub, then let Vercel build it whenever you push an update. If this project is already connected to the GitHub repository you want to use, skip the repository-creation and remote-setup steps below.

### 1. Create a GitHub repository

1. Sign in to [GitHub](https://github.com/) and create a **new repository**. Give it a name such as `good-deed`; do not add a README or other starter files.
2. In your computer's terminal, change into this project folder (`Good Deed Project`), then stage and commit just the app files:

   ```bash
   git add .gitignore README.md package.json package-lock.json tsconfig.json eslint.config.mjs src
   git commit -m "Add Good Deed Next.js app"
   ```

3. If you created a new GitHub repository, connect it by replacing `YOUR-USERNAME` with your GitHub username:

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/good-deed.git
   ```

   If `origin` already exists and points to the repository you want, do not add it again. If it points somewhere else, replace it with `git remote set-url origin https://github.com/YOUR-USERNAME/good-deed.git`.
4. Push the `main` branch:

   ```bash
   git push -u origin main
   ```

   If Git says there is nothing to commit, continue to the push step.

### 2. Import it into Vercel

1. Sign in to [Vercel](https://vercel.com/) using GitHub.
2. On the Vercel dashboard, choose **Add New… → Project**.
3. Find your `good-deed` repository (or the existing repository you chose) and choose **Import**. If it is not listed, use the GitHub connection/import option to give Vercel access to that repository.
4. If asked for a **Root Directory**, choose `./` (the repository root). Leave the detected framework as **Next.js** and the build settings at their defaults.
5. Choose **Deploy** and wait for the build to finish. Vercel will show you a `*.vercel.app` link to open and share.

### 3. Publish later changes

Edit the project on your computer, then run:

```bash
git add README.md package.json package-lock.json tsconfig.json eslint.config.mjs src
git commit -m "Describe your change"
git push
```

Vercel automatically builds and publishes the new version after each push to `main`. You can see deployment progress and errors in your Vercel project's **Deployments** tab.

Vercel's Hobby plan is free for personal projects; check Vercel's current plan terms if the hackathon project will be used commercially. This app has no server-side database or secret configuration to set up.
