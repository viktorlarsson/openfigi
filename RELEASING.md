# Release Process

This document describes how to release a new version of the OpenFIGI SDK.

## Prerequisites

1. **npm account**: You need an npm account with publish access to `openfigi`
2. **GitHub access**: You need write access to the repository
3. **npm token**: Set up `NPM_TOKEN` as a repository secret in GitHub

## Release Methods

### Method 1: Using Changesets (Recommended)

This is the recommended approach for managing releases with proper changelogs.

#### Step 1: Create a changeset

When you've made changes that should be released:

```bash
bun run changeset
```

This will prompt you to:
1. Select the type of change (patch/minor/major)
2. Write a summary of the changes

The changeset will be created in `.changeset/` directory.

#### Step 2: Create a PR

1. Commit the changeset file:
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature-branch
```

2. Create a pull request to `main` branch

#### Step 3: Merge and Release

1. Once the PR is merged to `main`, the GitHub Action will automatically:
   - Create a "Release PR" with version bumps
   - Update CHANGELOG.md
   - When you merge the Release PR, it will:
     - Publish to npm
     - Create a GitHub release
     - Tag the version

### Method 2: Manual Release with Tags

For direct releases without changesets:

#### Step 1: Update version

```bash
# Update version in package.json
bun version patch  # or minor, major
# Or manually edit package.json and commit
```

#### Step 2: Push changes and tag

```bash
git push origin main
git push origin --tags
```

#### Step 3: Create GitHub Release

1. Go to GitHub repository
2. Click "Releases" → "Create a new release"
3. Select the tag you just pushed
4. Add release notes
5. Click "Publish release"

This will trigger the `publish.yml` workflow to publish to npm.

### Method 3: Manual Bun Publish (Emergency Only)

If automated processes fail:

```bash
# Ensure you're on the correct version
git checkout v0.1.0  # or your tag

# Install and build
bun install
bun run build

# Run all checks
bun test
bun run lint
bun run typecheck

# Set npm token
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

# Publish with bun
bunx npm publish --access public
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking API changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

## Pre-release Checklist

Before any release, ensure:

- [ ] All tests pass: `bun test`
- [ ] No lint errors: `bun run lint`
- [ ] TypeScript compiles: `bun run typecheck`
- [ ] Build succeeds: `bun run build`
- [ ] Documentation is updated
- [ ] CHANGELOG is updated (if manual)
- [ ] Version number is correct

## Post-release Checklist

After releasing:

- [ ] Verify npm package: `npm view openfigi`
- [ ] Test installation: `npm install openfigi`
- [ ] Check GitHub release page
- [ ] Update any dependent projects
- [ ] Announce release if major/minor version

## Troubleshooting

### Bun publish fails

1. Check npm authentication:
```bash
bunx npm whoami
```

2. Verify publish access:
```bash
bunx npm access ls-packages
```

3. Check registry:
```bash
bunx npm config get registry
# Should be: https://registry.npmjs.org/
```

### GitHub Action fails

1. Check `NPM_TOKEN` secret is set in repository settings
2. Verify token has publish permissions
3. Check workflow logs for specific errors

### Version mismatch

If package.json version doesn't match git tag:

```bash
# Fix package.json version manually in package.json
# Then commit and push
git add package.json
git commit -m "chore: fix version"
git push
```

## Setting up npm Token

1. Login to [npmjs.com](https://www.npmjs.com/)
2. Go to Account Settings → Access Tokens
3. Generate new token (Classic Token)
4. Select "Publish" permission
5. Copy token
6. Add to GitHub repository:
   - Settings → Secrets → Actions
   - New repository secret
   - Name: `NPM_TOKEN`
   - Value: Your token

## Rollback Process

If a release has issues:

1. **Deprecate the broken version**:
```bash
bunx npm deprecate openfigi@0.1.0 "Critical bug in this version"
```

2. **Publish a fix**:
- Create a fix
- Bump patch version
- Release immediately

3. **Notify users** (if critical):
- Create GitHub issue
- Update README with notice

## Contact

For release access or questions:
- GitHub: @viktorlarsson
- npm: Organization admin access required