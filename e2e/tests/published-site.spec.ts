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

  test('Área de acesso é enxuta, permite mostrar a senha e sinaliza a recuperação futura', async ({ page }) => {
    await page.goto(route('/acesso'));

    await expect(page.getByText('Entrar na sua conta', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Use seu usuário e senha para continuar.', { exact: true })).toHaveCount(0);

    const password = page.locator('#demo-password');
    await password.fill('123');
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Ocultar senha' }).click();
    await expect(password).toHaveAttribute('type', 'password');

    await expect(page.getByRole('button', { name: 'Recuperar acesso' })).toBeDisabled();
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

  test('fluxo móvel preserva menus visíveis após trocar rotas do Escritório Virtual', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'user', '123', '/membros');

    const openMenu = async () => {
      const officeGroup = page.getByText('Escritório', { exact: true });
      if (!(await officeGroup.isVisible())) {
        await page.locator('[data-sidebar="trigger"]').click();
      }
      await expect(officeGroup).toBeVisible();
      await expect(page.getByRole('button', { name: /^Seus e-mails no sistema:/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Ferramentas administrativas:/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Complemento:/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Área de estudo:/ })).toBeVisible();
    };

    await openMenu();
    await page.getByText('Mensagem senha especial', { exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/mensagem-especial(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Mensagem e acesso especial', exact: true })).toBeVisible();

    await openMenu();
    await page.getByRole('button', { name: 'Ferramentas administrativas: expandir submenu' }).click();
    await expect(page.getByText('Venda seus produtos', { exact: true })).toBeVisible();
    await page.getByText('Venda seus produtos', { exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/produtos(?:[/?#]|$)`));

    await openMenu();
    await page.getByRole('button', { name: 'Complemento: expandir submenu' }).click();
    await expect(page.getByText('Encurtador de URL', { exact: true })).toBeVisible();
    await page.getByText('Encurtador de URL', { exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/campanhas(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Encurtador de URL e campanhas', exact: true })).toBeVisible();

    await openMenu();
    const studyTrigger = page.getByRole('button', { name: 'Área de estudo: expandir submenu' });
    await studyTrigger.scrollIntoViewIfNeeded();
    await studyTrigger.click();
    await expect(page.getByText('Curso Google Ads', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/fluxo-menu-mobile.png', fullPage: true });
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

  test('administrador também acessa o próprio Escritório como afiliado', async ({ page }) => {
    await signIn(page, 'admin', '123', '/admin');
    await expect(page.getByText('Meu Escritório', { exact: true }).first()).toBeVisible();

    await page.goto(route('/membros/recebimentos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/recebimentos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Dados de recebimento', exact: true })).toBeVisible();
    await expect(page.getByText(/não movimenta dinheiro/i)).toBeVisible();

    await page.goto(route('/membros/meus-pedidos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/meus-pedidos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Meus pedidos', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Carteira atribuída', exact: true })).toBeVisible();

    await page.locator('[data-sidebar="footer"] button').click();
    await page.getByRole('menuitem', { name: 'Voltar para Administração' }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin(?:[/?#]|$)`));
  });

  test('logout encerra a sessão e retorna à landing pública', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');

    await page.locator('[data-sidebar="footer"] button').click();
    await page.getByRole('menuitem', { name: 'Sair' }).click();

    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/?$`));
    await expect(page.getByRole('button', { name: /Realizar pedido/i })).toBeVisible();
  });
  test('menu móvel da administração preserva o catálogo em rotas contextuais', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'admin', '123', '/admin');
    await page.goto(route('/admin/membros'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin/membros(?:[/?#]|$)`));

    const openAdminMenu = async () => {
      const managementGroup = page.getByText('Gestão', { exact: true });
      if (!(await managementGroup.isVisible())) {
        await page.locator('[data-sidebar="trigger"]').click();
      }
      await expect(page.getByText('Atuação pessoal', { exact: true })).toBeVisible();
      await expect(managementGroup).toBeVisible();
      await expect(page.getByText('Conteúdo', { exact: true })).toBeVisible();
      await expect(page.getByText('Meu Escritório', { exact: true })).toBeVisible();
      await expect(page.getByText('Central de manutenção', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Pontuação' })).toBeVisible();
      await expect(page.getByText('E-books', { exact: true })).toBeVisible();
      await expect(page.getByText('Publicações', { exact: true })).toBeVisible();
    };

    await openAdminMenu();
    await page.getByRole('button', { name: 'Pontuação' }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin/pontos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Pontuação', exact: true })).toBeVisible();
    await openAdminMenu();
    await page.screenshot({ path: 'test-results/menu-administracao-mobile.png', fullPage: true });
  });
});
