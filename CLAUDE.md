# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TYPO3 v13.4 CMS project using DDEV for local development. The project includes a custom sitepackage (`vt13sitepackage`) and uses Content Blocks for content element creation.

## Architecture

- **TYPO3 Version**: 13.4 LTS
- **PHP Version**: 8.3
- **Database**: MySQL 8.0
- **Local Development**: DDEV with Apache-FPM
- **Sitepackage**: `packages/vt13sitepackage/` (local package)
- **Content Blocks**: Enabled for content element creation
- **Additional Extensions**:
  - `friendsoftypo3/content-blocks` for content elements
  - `b13/container` for container elements
  - `helhum/typo3-console` for CLI commands
  - `sitegeist/image-jack` for image processing
  - `t3/min` for asset minification

## Development Commands

### DDEV Container Management
```bash
# Start development environment
ddev start

# Stop development environment
ddev stop

# Access web container
ddev ssh

# Access database
ddev mysql

# Import database
ddev import-db --file=database.sql

# Clear all caches
ddev typo3 cache:flush

# Flush specific cache
ddev typo3 cache:flush --groups=pages,all
```

### TYPO3 Console Commands
```bash
# Setup extensions after composer changes
ddev typo3 extension:setup

# Update database schema
ddev typo3 database:updateschema

# Fix folder structure
ddev typo3 install:fixfolderstructure

# Clear all caches
ddev typo3 cache:flush
```

### Composer Commands
```bash
# Install dependencies
ddev composer install

# Update dependencies
ddev composer update

# Require new package
ddev composer require vendor/package
```

### Database Management
```bash
# Export database snapshot
ddev export-db --file=snapshot.sql.gz

# Import database from snapshot
ddev import-db --file=snapshot.sql.gz

# Custom database fetch script
./fetchdatabase.sh
```

## Directory Structure

- `/config/` - TYPO3 configuration files
  - `/config/system/` - System configuration (settings.php, additional.php)
  - `/config/sites/` - Site configuration
- `/packages/vt13sitepackage/` - Custom sitepackage extension
  - `/Configuration/` - Extension configuration (TCA, TypoScript, etc.)
  - `/ContentBlocks/` - Content Blocks definitions
  - `/Resources/` - Frontend assets and templates
- `/public/` - Web document root (contains index.php)
- `/var/` - Runtime files (cache, logs, session data)
- `/vendor/` - Composer dependencies

## Content Blocks Configuration

Content Blocks are configured in `content-blocks.yaml`:
- Vendor: `wwagner`
- Extension: `vt13sitepackage`
- Skeleton path: `packages/vt13sitepackage/ContentBlocks/content-blocks-skeleton/`

New content elements should be created in the ContentBlocks directory following the Content Blocks specification.

## Development Workflow

1. Start DDEV: `ddev start`
2. Make code changes in `packages/vt13sitepackage/`
3. Clear caches: `ddev typo3 cache:flush`
4. Test changes in browser at `https://myproject.ddev.site`

## Testing

### Playwright E2E Tests
```bash
# Install dependencies
npm install

# Run all tests locally (all browsers)
npx playwright test

# Run specific smoke tests (CI tests)
npx playwright test smoke.spec.ts

# Run tests in UI mode
npx playwright test --ui

# View test report
npx playwright show-report
```

### Test Coverage
- **Homepage**: "Willkommen bei Innovatech Solutions" text, "Schreib mir ne Mail" link
- **Blog page**: "Content im Hauptbereich" text
- **Contact page**: Contact form field `#kontaktformular-30-text-1`
- **All pages**: Search field `#tx-indexedsearch-searchbox-sword`, Logo `innovatech_logo.svg`
- **Multilingual**: German/English language support
- **Backend**: TYPO3 admin accessibility

## Production Deployment

The project uses Deployer for deployment (see `deploy.php` and `.hosts.yml`). Deployment commands are configured for production server deployment.

## Important Notes

- Always work within the DDEV container for TYPO3 commands
- Use `ddev` prefix for all commands when working locally
- The sitepackage follows TYPO3 extension conventions
- Content Blocks provide a modern way to create content elements
- TYPO3_CONTEXT is set to "Development" in DDEV environment