# E2E Tests - Family Story Archive

Playwright end-to-end tests for the Family Story Archive application.

## Setup

Install dependencies (already done if you ran npm install):

```bash
npm install -D @playwright/test
npx playwright install chromium
```

## Running Tests

### Run all tests (headless)
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see the browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Test Suites

### 01-auth.spec.ts
Tests authentication flows:
- Login with valid credentials
- Login with invalid credentials
- Logout
- Protected routes
- Session persistence

### 02-module-workflow.spec.ts
Tests the core module-based story building workflow:
- Creating projects with interviewee information
- Generating Module 1 questions
- Answering questions with auto-save
- Generating chapters from Q&A
- Regenerating chapters with feedback
- Approving modules
- Creating Module 2 with context-aware questions
- Auto-polling during chapter generation

### 03-pdf-export.spec.ts
Tests PDF export functionality:
- Downloading individual chapter PDFs
- Downloading complete book with multiple chapters
- PDF generation loading states
- Error handling

## Test Data

### Using the Test Seed Script

Before running E2E tests, create a complete test project:

```bash
npm run test:seed
```

This creates a project with:
- 2 approved modules (Robert Johnson)
- All questions answered
- Chapters generated and approved
- Ready for PDF export testing

### Manual Cleanup

```bash
# Delete test projects from database
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.project.deleteMany({ where: { title: { contains: 'E2E Test' } } });
await prisma.\$disconnect();
"
```

## Configuration

Edit `playwright.config.ts` to customize:
- Test timeout
- Number of workers
- Browser options
- Screenshots/videos on failure
- Base URL

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Best Practices

1. **Use test utilities** - Leverage `utils/auth.ts` and `utils/test-data.ts` for common operations
2. **Clean up after tests** - Use `beforeAll` and `afterAll` hooks to manage test data
3. **Wait for elements** - Use Playwright's auto-waiting instead of hardcoded timeouts
4. **Use data-testid** - Add `data-testid` attributes to elements for stable selectors
5. **Test user journeys** - Focus on complete user workflows rather than individual actions

## Troubleshooting

### Tests fail with "page not found"
- Make sure dev server is running (`npm run dev`)
- Check baseURL in `playwright.config.ts`

### Tests timeout waiting for elements
- Increase timeout in individual tests
- Check that test data exists (run `npm run test:seed`)
- Verify selectors match actual DOM elements

### Download tests fail
- Check that `test-downloads` directory is created
- Verify PDF generation is working manually first

## Adding New Tests

1. Create a new `.spec.ts` file in `tests/e2e/`
2. Import utilities from `utils/`
3. Follow existing test patterns
4. Add cleanup in `afterAll` hooks
5. Run tests locally before committing

Example:

```typescript
import { test, expect } from '@playwright/test';
import { login } from './utils/auth';

test.describe('My New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should do something', async ({ page }) => {
    // Your test here
  });
});
```
