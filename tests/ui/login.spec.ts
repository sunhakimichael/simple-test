import { test, expect } from '../../fixtures/pages.fixture';
import { USERS } from '../../test-data/users';
import { INVENTORY_SIZE } from '../../test-data/products';
import { LOGIN_ERRORS } from '../../test-data/checkout';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('login berhasil dengan kredensial valid lalu logout', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(USERS.standard);
    await inventoryPage.expectLoaded(INVENTORY_SIZE);

    await inventoryPage.logout();
    await loginPage.expectToBeOnPage();
    await loginPage.expectLoginFormVisible();
  });

  test('login gagal dengan kredensial salah', async ({ loginPage }) => {
    await loginPage.login(USERS.invalid);
    await loginPage.expectError(LOGIN_ERRORS.invalidCredentials);
  });

  test('login gagal untuk user yang terkunci', async ({ loginPage }) => {
    await loginPage.login(USERS.lockedOut);
    await loginPage.expectError(LOGIN_ERRORS.lockedOut);
  });

  test('login gagal bila username kosong', async ({ loginPage }) => {
    await loginPage.login({ username: '', password: USERS.standard.password });
    await loginPage.expectError(LOGIN_ERRORS.usernameRequired);
  });

  test('login gagal bila password kosong', async ({ loginPage }) => {
    await loginPage.login({ username: USERS.standard.username, password: '' });
    await loginPage.expectError(LOGIN_ERRORS.passwordRequired);
  });

  test('akses langsung ke inventory tanpa login ditolak', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await loginPage.expectToBeOnPage();
    await expect(loginPage.errorMessage).toContainText(LOGIN_ERRORS.inventoryRequiresLogin);
  });
});
