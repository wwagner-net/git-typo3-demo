# Playwright E2E Testing Setup für TYPO3-Projekte

Diese Anleitung erklärt, wie du das Playwright E2E Testing Setup aus diesem Projekt in andere TYPO3-Projekte integrierst.

## 🎯 Voraussetzungen

- TYPO3 v13+ Projekt mit DDEV
- GitHub Repository
- Deployer für Production-Deployment konfiguriert
- Apache Webserver mit .htaccess-Support

## 📋 Schritt 1: Node.js Dependencies

### 1.1 package.json erstellen
```json
{
  "name": "your-project-e2e-tests",
  "version": "1.0.0",
  "description": "End-to-end tests for TYPO3 project",
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test smoke.spec.ts",
    "test:ci": "playwright test smoke.spec.ts --timeout=30000",
    "test:forms": "playwright test forms.spec.ts",
    "test:multilingual": "playwright test multilingual.spec.ts",
    "test:performance": "playwright test performance.spec.ts",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```

### 1.2 Dependencies installieren
```bash
npm install
npx playwright install
```

## 📋 Schritt 2: Playwright Konfiguration

### 2.1 playwright.config.ts erstellen
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: process.env.CI ? 30000 : 60000,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['github'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://testing.your-domain.de',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: process.env.CI ? [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ] : [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'ddev start && echo "TYPO3 development server ready"',
    url: 'https://your-project.ddev.site',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**🔧 Anpassen:**
- `baseURL`: Deine Testing-Subdomain
- `webServer.url`: Deine DDEV-URL

## 📋 Schritt 3: Test-Dateien erstellen

### 3.1 Verzeichnisstruktur
```
tests/
└── e2e/
    └── smoke.spec.ts
```

### 3.2 smoke.spec.ts (Basis-Template)
```typescript
import { test, expect, Page } from '@playwright/test';

// Helper functions
async function checkCommonElements(page: Page) {
  // Such-Input (falls vorhanden)
  const searchInput = page.locator('#tx-indexedsearch-searchbox-sword');
  if (await searchInput.count() > 0) {
    await expect(searchInput).toBeAttached();
  }

  // Logo im Header (anpassen an dein Projekt)
  const logo = page.locator('#header img, .logo img, header img');
  if (await logo.count() > 0) {
    await expect(logo.first()).toBeVisible();
  }
}

async function navigateAndWait(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}

test.describe('Your Project - Site Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await navigateAndWait(page, '/');

    // Basis-Check: Seite lädt
    await expect(page).toHaveTitle(/.*/, { timeout: 15000 });
    await expect(page.locator('body')).toBeVisible();

    // TODO: Anpassen an deine Homepage-Inhalte
    // await expect(page.getByText('Dein spezifischer Text')).toBeVisible();

    await checkCommonElements(page);
  });

  test('TYPO3 Backend accessibility', async ({ page }) => {
    const response = await page.goto('/typo3');
    expect(response?.status()).toBeLessThan(400);

    const loginForm = page.locator('form, input[name="username"], input[name="userident"]');
    await expect(loginForm.first()).toBeVisible({ timeout: 10000 });
  });
});
```

**🔧 Anpassen:**
- Ersetze `'Dein spezifischer Text'` mit tatsächlichen Inhalten
- Füge weitere spezifische Tests hinzu

## 📋 Schritt 4: TYPO3 Site-Konfiguration

### 4.1 config/sites/[site]/config.yaml erweitern
```yaml
baseVariants:
  -
    base: 'https://your-project.ddev.site/'
    condition: 'applicationContext == "Development"'
  -
    base: 'https://testing.your-domain.de/'
    condition: 'applicationContext == "Development/Testing"'
```

**🔧 Anpassen:**
- `testing.your-domain.de`: Deine Testing-Subdomain

## 📋 Schritt 5: Deployer-Konfiguration

### 5.1 .hosts.yml erweitern
```yaml
hosts:
  testing:
    hostname: 'your-server-ip'
    remote_user: 'your-user'
    port: 22
    deploy_path: '/path/to/your/project/testing'
    url: 'https://testing.your-domain.de'
    typo3_context: 'Development/Testing'
  production:
    hostname: 'your-server-ip'
    remote_user: 'your-user'
    port: 22
    deploy_path: '/path/to/your/project/production'
    url: 'https://your-domain.de'
    typo3_context: 'Production'
```

### 5.2 deploy.php erweitern

#### TYPO3 Context Task hinzufügen:
```php
// Set TYPO3_CONTEXT for testing environment
task('typo3:set_context', function () {
    $context = get('typo3_context', 'Production');

    if ($context === 'Development/Testing') {
        run('cp {{release_path}}/{{typo3_webroot}}/.htaccess.testing {{release_path}}/{{typo3_webroot}}/.htaccess');
        writeln('<info>Set TYPO3_CONTEXT to Development/Testing via .htaccess</info>');
    } else {
        if (test('[ -f {{release_path}}/{{typo3_webroot}}/.htaccess.production ]')) {
            run('cp {{release_path}}/{{typo3_webroot}}/.htaccess.production {{release_path}}/{{typo3_webroot}}/.htaccess');
        }
        writeln('<info>Set TYPO3_CONTEXT to Production</info>');
    }
});
```

#### Rsync Excludes erweitern:
```php
$exclude = [
    // ... existing excludes
    // Node.js / Playwright files
    'node_modules',
    'package.json',
    'package-lock.json',
    'playwright.config.ts',
    '/tests/',
    '/test-results/',
    '/playwright-report/',
    '/blob-report/',
    '/playwright/.cache/',
    'npm-debug.log*',
    // GitHub Actions
    '.github',
    // Environment-specific .htaccess files
    '/public/.htaccess.testing',
    '/public/.htaccess.production',
];
```

#### Deployment-Pipeline anpassen:
```php
before('deploy:symlink', function () {
    // ... existing tasks
    invoke('typo3:set_context');
    // ... rest
});
```

## 📋 Schritt 6: .htaccess-Dateien

### 6.1 public/.htaccess.testing
```apache
# Set TYPO3 Context for Testing Environment
SetEnv TYPO3_CONTEXT Development/Testing

# Standard TYPO3 .htaccess rules
RewriteEngine On

# ... (Standard TYPO3 .htaccess Inhalt kopieren)
```

### 6.2 public/.htaccess.production
```apache
# Set TYPO3 Context for Production Environment
SetEnv TYPO3_CONTEXT Production

# Standard TYPO3 .htaccess rules
RewriteEngine On

# ... (Standard TYPO3 .htaccess Inhalt kopieren)
```

## 📋 Schritt 7: GitHub Actions Workflow

### 7.1 .github/workflows/deploy.yml
```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    outputs:
      staging-url: ${{ steps.deploy-staging.outputs.url }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install PHP and Composer
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mbstring, intl

      - name: Install Deployer
        run: |
          composer global require deployer/deployer
          export PATH="$HOME/.composer/vendor/bin:$PATH"

      - name: SSH-Agent starten und Schlüssel hinzufügen
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: SSH konfigurieren
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
          chmod 644 ~/.ssh/known_hosts

      - name: Abhängigkeiten installieren
        run: |
          composer install --no-dev --no-ansi --no-interaction --no-scripts --prefer-dist --ignore-platform-reqs

      - name: Deployment auf Testing-Environment
        id: deploy-staging
        run: |
          dep deploy testing -vvv
          echo "url=https://testing.your-domain.de" >> $GITHUB_OUTPUT

  playwright-tests:
    runs-on: ubuntu-latest
    needs: deploy-staging
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Wait for deployment
        run: |
          echo "Warte auf Deployment-Verfügbarkeit..."
          sleep 60

          for i in {1..20}; do
            if curl -f -s "${{ needs.deploy-staging.outputs.staging-url }}" > /dev/null; then
              echo "Testing-Environment ist verfügbar"
              if curl -s "${{ needs.deploy-staging.outputs.staging-url }}" | grep -q "typo3"; then
                echo "TYPO3 ist vollständig geladen"
                break
              fi
            fi
            echo "Warte auf Testing-Environment... Versuch $i/20"
            sleep 15
          done

      - name: Run Playwright tests
        run: |
          npx playwright test smoke.spec.ts --timeout=30000
        env:
          BASE_URL: ${{ needs.deploy-staging.outputs.staging-url }}
          CI: true

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  deploy-production:
    runs-on: ubuntu-latest
    needs: [deploy-staging, playwright-tests]
    if: success()
    concurrency:
      group: production
      cancel-in-progress: false
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install PHP and Composer
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mbstring, intl

      - name: Install Deployer
        run: |
          composer global require deployer/deployer
          export PATH="$HOME/.composer/vendor/bin:$PATH"

      - name: SSH-Agent starten und Schlüssel hinzufügen
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: SSH konfigurieren
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
          chmod 644 ~/.ssh/known_hosts

      - name: Abhängigkeiten installieren
        run: |
          composer install --no-dev --no-ansi --no-interaction --no-scripts --prefer-dist --ignore-platform-reqs

      - name: Deployment auf Produktion
        run: |
          dep deploy production -vvv
```

**🔧 Anpassen:**
- Alle URLs mit deinen Domains ersetzen
- PHP-Version anpassen falls nötig

## 📋 Schritt 8: .gitignore erweitern

```gitignore
# Node.js
node_modules/
npm-debug.log*

# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/

# Environment-specific .htaccess ausschließen (falls gewünscht)
!/public/.htaccess.testing
!/public/.htaccess.production
```

## 📋 Schritt 9: GitHub Secrets konfigurieren

Im GitHub Repository unter Settings > Secrets:

- `SSH_PRIVATE_KEY`: Dein SSH Private Key
- `SSH_HOST`: Deine Server-IP

## 📋 Schritt 10: Testing-Subdomain einrichten

### Server-Konfiguration:
1. **Subdomain erstellen**: `testing.your-domain.de`
2. **Document Root setzen**: `/path/to/your/project/testing/current/public`
3. **SSL-Zertifikat konfigurieren**

## 🚀 Schritt 11: Tests anpassen

### 11.1 Spezifische Tests hinzufügen
Erweitere `smoke.spec.ts` mit deinen spezifischen Inhalten:

```typescript
test('Homepage - Specific Content', async ({ page }) => {
  await navigateAndWait(page, '/');

  // Beispiele - anpassen an dein Projekt:
  await expect(page.getByText('Dein Willkommenstext')).toBeVisible();
  await expect(page.locator('a:has-text("Dein wichtiger Link")')).toBeVisible();

  await checkCommonElements(page);
});
```

### 11.2 Weitere Test-Dateien hinzufügen
- `forms.spec.ts` für Formulare
- `multilingual.spec.ts` für mehrsprachige Sites
- `performance.spec.ts` für Performance-Tests

## ✅ Fertig!

Nach dem ersten `git push` auf `main` sollte der komplette Workflow laufen:

1. **Deploy Testing** → 2. **Playwright Tests** → 3. **Deploy Production** (nur bei erfolgreichen Tests)

## 🔧 Troubleshooting

### Häufige Probleme:
- **Tests schlagen fehl**: URLs und Selektoren in Tests anpassen
- **Deployment hängt**: SSH-Keys und Server-Pfade prüfen
- **TYPO3_CONTEXT falsch**: .htaccess-Dateien und Deployer-Konfiguration prüfen

### Lokale Tests:
```bash
# Lokal testen
npm run test:smoke

# Mit UI
npm run test:ui

# Debug-Modus
npm run test:debug
```
