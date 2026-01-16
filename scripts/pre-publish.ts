#!/usr/bin/env bun

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const errors: string[] = []
const warnings: string[] = []

// Check if dist directory exists
if (!existsSync('dist')) {
  errors.push('dist/ directory not found. Run "bun run build" first.')
}

// Check if all dist files exist
const expectedFiles = [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/index.d.cts',
]

for (const file of expectedFiles) {
  if (!existsSync(file)) {
    errors.push(`Missing build file: ${file}`)
  }
}

// Check package.json
try {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))

  // Check required fields
  if (!pkg.name) errors.push('package.json missing "name" field')
  if (!pkg.version) errors.push('package.json missing "version" field')
  if (!pkg.description) warnings.push('package.json missing "description" field')
  if (!pkg.keywords || pkg.keywords.length === 0) warnings.push('package.json missing "keywords"')
  if (!pkg.repository) warnings.push('package.json missing "repository" field')
  if (!pkg.license) errors.push('package.json missing "license" field')

  // Check files field
  if (!pkg.files || pkg.files.length === 0) {
    warnings.push('package.json missing "files" field - all files will be published')
  }

  // Check if version follows semver
  if (pkg.version && !/^\d+\.\d+\.\d+/.test(pkg.version)) {
    errors.push(`Invalid version format: ${pkg.version}`)
  }

  console.log(`📦 Package: ${pkg.name}@${pkg.version}`)

} catch (error) {
  errors.push(`Failed to read package.json: ${error}`)
}

// Check for README
if (!existsSync('README.md')) {
  warnings.push('README.md not found')
}

// Check for LICENSE
if (!existsSync('LICENSE')) {
  warnings.push('LICENSE file not found')
}

// Check for tests
if (!existsSync('tests')) {
  warnings.push('tests/ directory not found')
}

// Print results
console.log('\n📋 Pre-publish Check Results:\n')

if (warnings.length > 0) {
  console.log('⚠️  Warnings:')
  warnings.forEach(w => console.log(`   - ${w}`))
  console.log('')
}

if (errors.length > 0) {
  console.log('❌ Errors:')
  errors.forEach(e => console.log(`   - ${e}`))
  console.log('\n❌ Pre-publish check failed! Fix the errors above before publishing.')
  process.exit(1)
} else {
  console.log('✅ All pre-publish checks passed!')
  console.log('\n🚀 Ready to publish to npm')

  // Show publish command
  console.log('\nTo publish, run:')
  console.log('  bunx npm publish --access public')
  console.log('\nOr use the automated release process:')
  console.log('  bun run changeset')
  console.log('  git push origin main')
}