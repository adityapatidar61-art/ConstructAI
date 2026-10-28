# GitHub Guide for Beginners (Windows, step by step)

You have never used GitHub before, so we start from zero. Total time: about 15 minutes.

**What is GitHub?** A free website that stores your project online so you can share it with a link.
**What is Git?** A small program on your computer that sends your project to GitHub.

---

## Step 1 - Create your GitHub account

1. Open https://github.com/signup
2. Enter your email (use the one you check regularly), a password, and a **username**.
   Your username becomes part of your link, so pick something professional, e.g. `aditya-trivedi`.
3. Solve the puzzle and click **Create account**.
4. GitHub emails you a code. Enter it to verify.
5. You can skip the personalization questions.

## Step 2 - Install Git

1. Go to https://git-scm.com/downloads and download the Windows version.
2. Run the installer and keep clicking **Next** (defaults are fine).
3. To check: open the **Start menu**, type `cmd`, open Command Prompt and type:
   ```
   git --version
   ```
   You should see a version number.

## Step 3 - Tell Git who you are (one time only)

In Command Prompt, run these two lines (use your own name and the email you used on GitHub):
```
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## Step 4 - Create an empty repository on GitHub

A "repository" (repo) is just a project folder on GitHub.

1. Log in at https://github.com and click the **+** icon (top right) -> **New repository**.
2. **Repository name:** `ConstructAI`
3. **Description:** AI-powered construction decision-support platform
4. Choose **Public** (anyone with the link can view; required if you want to share the link freely).
5. **Do NOT tick** "Add a README", ".gitignore" or "license" (the project already has these).
6. Click **Create repository**.
7. You land on a page showing a URL like `https://github.com/YOUR-USERNAME/ConstructAI.git`. Keep it open.

## Step 5 - Upload your project

1. Unzip the `ConstructAI.zip` I gave you. You get a folder named `ConstructAI`.
2. Open that folder in File Explorer, click the address bar at the top, type `cmd` and press Enter. A Command Prompt opens **inside** the folder.
3. Run these commands one by one (replace `YOUR-USERNAME`):
   ```
   git init
   git add .
   git commit -m "Initial commit: ConstructAI"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/ConstructAI.git
   git push -u origin main
   ```
4. A browser window may pop up asking you to sign in to GitHub. Sign in and click **Authorize**.
   (If it asks for a password in the terminal instead, GitHub no longer accepts account passwords there; use the browser sign-in, or create a Personal Access Token under Settings -> Developer settings.)
5. When it finishes, refresh your repository page. Your files are there.

## Step 6 - Your shareable link

Your project link is:

```
https://github.com/YOUR-USERNAME/ConstructAI
```

Copy it from the browser address bar and share it.

## Important safety checks

- The `.gitignore` file already stops your secret `.env` file from being uploaded. After uploading, open the repo and make sure there is **no** `.env` file (only `.env.example`). Never paste your Groq API key anywhere public.
- If you ever upload a key by mistake, delete the key on the Groq console and create a new one.

## Later: uploading changes

After editing files, run in the project folder:
```
git add .
git commit -m "Describe what you changed"
git push
```

## Optional: upload your screenshots

Create a `screenshots` folder inside ConstructAI, put your UI images there, and link them in README.md with `![Safety Monitor](screenshots/safety.png)`. Then run the three commands above.

## Common problems

| Problem | Fix |
|---|---|
| `'git' is not recognized` | Close and reopen Command Prompt after installing Git |
| `remote origin already exists` | Run `git remote set-url origin https://github.com/YOUR-USERNAME/ConstructAI.git` |
| `failed to push` / `rejected` | You ticked "Add README" in Step 4. Run `git pull origin main --allow-unrelated-histories`, then `git push` |
| Browser sign-in does not open | Run `git push` again, or use GitHub Desktop (https://desktop.github.com), which has buttons instead of commands |
