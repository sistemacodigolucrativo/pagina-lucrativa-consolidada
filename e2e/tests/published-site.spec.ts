import { expect, test, type Page } from '@playwright/test';

const APP_PREFIX = '/paginalucrativa';
const route = (path = '/') => `${APP_PREFIX}${path}`;

async function signIn(page: Page, username: string, password: string, destination: string) {
  await page.goto(route('/acesso'));
  await expect(page.locator('#demo-username')).toBeVisible();
  await page.locator('#demo-username').fill(username);
  await page.locator('#demo-password').fill(password);
  await page.getByRole('button', { name: 'Entrar na conta' }).click();
  await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}${destination}(?:[/?#]|$)`));
}

test.describe('Página Lucrativa 2026 publicada', () => {
  test('a landing pública exibe a marca, navegação e formulário de pedido', async ({ page }) => {
    await page.goto(route('/'));

    await expect(page).toHaveTitle(/Página Lucrativa 2026/i);
    await expect(page.getByRole('link', { name: /Escritório Virtual/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Realizar pedido/i })).toBeVisible();
    await expect(page.locator('#f')).toContainText(/pedido|formulário/i);
  });

  test('credenciais inválidas permanecem no acesso e informam o erro', async ({ page }) => {
    await page.goto(route('/acesso'));
    await page.locator('#demo-username').fill('credencial-invalida');
    await page.locator('#demo-password').fill('senha-invalida');
    await page.getByRole('button', { name: 'Entrar na conta' }).click();

    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/acesso(?:[/?#]|$)`));
    await expect(page.getByRole('alert')).toContainText(/inválid|credenciais|acesso/i);
  });

  test('membro e administrador entram nos respectivos ambientes', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');
    await expect(page.getByText('Escritório Virtual', { exact: true }).first()).toBeVisible();

    await page.context().clearCookies();
    await page.goto(route('/acesso'));
    await signIn(page, 'admin', '123', '/admin');
    await expect(page.getByText('Administração', { exact: true }).first()).toBeVisible();
  });

  test('rotas de painéis sem sessão redirecionam ao acesso local', async ({ page }) => {
    for (const protectedPath of ['/membros', '/admin']) {
      await page.context().clearCookies();
      await page.goto(route(protectedPath));
      await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/acesso(?:[/?#]|$)`));
      await expect(page.locator('#demo-username')).toBeVisible();
    }
  });

  test('membro navega pelas ferramentas sem alterar dados', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');

    await page.goto(route('/membros/campanhas'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/campanhas(?:[/?#]|$)`));
    await expect(page.getByText('Encurtador de URL e campanhas', { exact: true })).toBeVisible();
    await expect(page.locator('form').first()).toBeVisible();

    await page.goto(route('/membros/pontos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/pontos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Meu desempenho', exact: true })).toBeVisible();
  });

  test('menu móvel preserva o catálogo do Escritório Virtual e expande seus grupos', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'user', '123', '/membros');

    await page.goto(route('/membros/mensagem-especial'));
    await expect(page.getByRole('heading', { name: 'Mensagem e acesso especial', exact: true })).toBeVisible();
    await page.locator('[data-sidebar="trigger"]').click();

    await expect(page.getByText('Escritório', { exact: true })).toBeVisible();
    await expect(page.getByText('Seus e-mails no sistema', { exact: true })).toBeVisible();
    await expect(page.getByText('Ferramentas administrativas', { exact: true })).toBeVisible();
    await expect(page.getByText('Complemento', { exact: true })).toBeVisible();
    await expect(page.getByText('Área de estudo', { exact: true })).toBeVisible();

    const businessTools = page.getByRole('button', {
      name: 'Ferramentas administrativas: expandir submenu',
    });
    await businessTools.click();
    await expect(page.getByText('Venda seus produtos', { exact: true })).toBeVisible();
    await expect(page.getByText('Meus indicados', { exact: true })).toBeVisible();

    await page.getByRole('button', {
      name: 'Ferramentas administrativas: recolher submenu',
    }).click();
    await expect(page.getByText('Venda seus produtos', { exact: true })).toBeHidden();
  });

  test('membro não consegue abrir a administração', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');
    await page.goto(route('/admin'));

    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros(?:[/?#]|$)`));
    await expect(page.getByText('Escritório Virtual', { exact: true }).first()).toBeVisible();
  });

  test('administração carrega ferramentas de curadoria sem gravar registros', async ({ page }) => {
    await signIn(page, 'admin', '123', '/admin');

    await page.goto(route('/admin/produtos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin/produtos(?:[/?#]|$)`));
    await expect(page.getByRole('heading').filter({ hasText: /produto|catálogo/i }).first()).toBeVisible();

    await page.goto(route('/admin/pontos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin/pontos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Pontuação', exact: true })).toBeVisible();
  });

  test('logout encerra a sessão e retorna à landing pública', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');

    await page.locator('[data-sidebar="footer"] button').click();
    await page.getByRole('menuitem', { name: 'Sair' }).click();

    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/?$`));
    await expect(page.getByRole('button', { name: /Realizar pedido/i })).toBeVisible();
  });
});
