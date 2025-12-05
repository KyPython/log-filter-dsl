# Deployment Guide

## Push to GitHub

### 1. Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `log-filter-dsl`
3. Description: "A domain-specific language for filtering log lines"
4. Set to **Public**
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/log-filter-dsl.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

### 3. Update package.json

After pushing, update the repository URLs in `package.json`:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
sed -i '' 's/YOUR_USERNAME/your-actual-username/g' package.json
git add package.json
git commit -m "Update repository URLs"
git push
```

## Publish to npm (Optional)

### 1. Create npm Account

If you don't have one, create an account at https://www.npmjs.com/signup

### 2. Login to npm

```bash
npm login
```

### 3. Update package.json

Make sure to:
- Update the `repository` URLs with your actual GitHub username
- Add your name/email to `author` field if desired
- Verify the package name is available: https://www.npmjs.com/package/log-filter-dsl

### 4. Publish

```bash
# Test the build first
npm run build

# Publish to npm
npm publish --access public
```

After publishing, users can install it with:

```bash
npm install -g log-filter-dsl
log-filter 'level = ERROR' < logs.txt
```

## Alternative: GitHub Releases

You can also create GitHub releases for distribution:

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: `v1.0.0 - Initial Release`
5. Description: Copy from README.md
6. Upload the `dist/` folder as a release asset (optional)

