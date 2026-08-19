import { expect, test, type Page } from '@playwright/test';

const APP_PREFIX = '';
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
  test('o prefixo legado redireciona permanentemente para a raiz canônica', async ({ page }) => {
    await page.goto('/paginalucrativa/');
    await expect(page).toHaveURL(new RegExp('/$'));
    await expect(page.getByRole('link', { name: /Quero conhecer a estrutura/i }).first()).toBeVisible();
  });
  test('a landing pública exibe a marca, navegação e formulário de pedido', async ({ page }) => {
    await page.goto(route('/'));

    await expect(page).toHaveTitle(/Página Lucrativa.*Negócio Digital/i);
    await expect(page.getByRole('link', { name: /Quero conhecer a estrutura/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Quero conhecer a estrutura/i }).first()).toBeVisible();
    await expect(page.locator('#f')).toContainText(/pedido|formulário/i);
  });

  test('WhatsApp público sanitiza a digitação, aplica máscara e bloqueia número incompleto', async ({ page }) => {
    await page.goto(route('/'));
    const whatsapp = page.locator('input[name="whatsapp"]');

    await whatsapp.fill('abc(73) 99999-9999');
    await expect(whatsapp).toHaveValue('(73) 9 9999-9999');
    await expect(whatsapp).toHaveAttribute('inputmode', 'numeric');

    await whatsapp.fill('739999999');
    expect(await whatsapp.evaluate(input => input.validity.valid)).toBe(false);
    expect(await whatsapp.evaluate(input => input.validationMessage)).toMatch(/telefone com DDD/i);
  });

  test('e-mail público normaliza espaços e bloqueia estrutura inválida antes do pedido', async ({ page }) => {
    await page.goto(route('/'));
    const email = page.locator('input[name="email"]');

    await email.fill('  CONTATO@EMPRESA.COM.BR  ');
    await expect(email).toHaveValue('contato@empresa.com.br');

    await email.fill('usuario gmail.com');
    expect(await email.evaluate(input => input.validity.valid)).toBe(false);
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
    await expect(page.getByText('Entre com seus dados para acessar seus conteúdos, ferramentas de divulgação e recursos da sua Página Lucrativa.', { exact: true })).toHaveCount(0);
  });

  test('membro e administrador entram nos respectivos ambientes', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');
    await expect(page.getByText('Página Lucrativa', { exact: true }).first()).toBeVisible();

    await page.context().clearCookies();
    await page.goto(route('/acesso'));
    await signIn(page, 'admin', '123', '/admin');
    await expect(page.getByText('Administração', { exact: true }).first()).toBeVisible();
  });

  test('pedido público recente mantém a data legível dentro do conteúdo no mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'admin', '123', '/admin');

    const row = page.locator('.office-card').first();
    if (await row.count()) {
      await expect(row).toBeVisible();
      const [rowBox, timeBox] = await Promise.all([row.boundingBox(), row.locator('time').first().boundingBox()]);
      expect(rowBox).not.toBeNull();
      expect(timeBox).not.toBeNull();
      expect(timeBox!.x).toBeGreaterThanOrEqual(rowBox!.x - 1);
      expect(timeBox!.x + timeBox!.width).toBeLessThanOrEqual(rowBox!.x + rowBox!.width + 1);
    } else {
      await expect(page.locator('body')).toContainText(/Pedidos recebidos|Nenhum pedido registrado|Não foi possível carregar os pedidos|Carregando pedidos/i);
    }
  });

  test('formulários administrativos empilham e contêm seus campos no celular', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'admin', '123', '/admin');

    for (const destination of ['/admin/pedidos', '/admin/financeiro']) {
      await page.goto(route(destination));
      const form = page.locator('.office-form-grid').first();
      if (!(await form.count())) {
        await expect(page.locator('body')).toContainText(/Pedidos recebidos|Lançamentos e saques|Nenhum pedido registrado|Nenhuma movimentação registrada|Não foi possível|Carregando/);
        continue;
      }
      await expect(form).toBeVisible();

      const [formBox, controlBoxes] = await Promise.all([
        form.boundingBox(),
        form.locator('input, select, textarea').evaluateAll(elements => elements.map(element => {
          const rect = element.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        })),
      ]);

      expect(formBox).not.toBeNull();
      expect(controlBoxes.length).toBeGreaterThan(1);
      for (const control of controlBoxes) {
        expect(control.x).toBeGreaterThanOrEqual(formBox!.x - 1);
        expect(control.x + control.width).toBeLessThanOrEqual(formBox!.x + formBox!.width + 1);
      }
      for (let index = 1; index < controlBoxes.length; index += 1) {
        expect(controlBoxes[index].y).toBeGreaterThanOrEqual(controlBoxes[index - 1].y + controlBoxes[index - 1].height - 1);
      }
    }

    for (const viewport of [
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(route('/admin/financeiro'));
      const controls = page.locator('.office-form-grid').first().locator('select, input, textarea');
      const firstControl = await controls.nth(0).boundingBox();
      const secondControl = await controls.nth(1).boundingBox();

      expect(firstControl).not.toBeNull();
      expect(secondControl).not.toBeNull();
      expect(Math.abs(secondControl!.y - firstControl!.y)).toBeLessThanOrEqual(1);
      expect(secondControl!.x).toBeGreaterThan(firstControl!.x + firstControl!.width);
    }
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
    await expect(page.getByRole('heading', { name: 'Links & campanhas', exact: true })).toBeVisible();
    await expect(page.locator('form').first()).toBeVisible();

    await page.goto(route('/membros/pontos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/pontos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Meu desempenho', exact: true })).toBeVisible();
  });

  test('Mensagem senha especial apresenta configuração, gestão administrativa e estado público indisponível', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');
    await page.goto(route('/membros/mensagem-especial'));

    await expect(page.getByRole('heading', { name: 'Mensagem senha especial', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Configurar acesso especial', exact: true })).toBeVisible();
    await expect(page.getByLabel('Título')).toBeVisible();
    await expect(page.getByLabel('Mensagem')).toBeVisible();
    await expect(page.getByLabel('Destino após a senha')).toHaveAttribute('type', 'url');
    await expect(page.getByRole('button', { name: 'Salvar configuração' })).toBeVisible();

    await page.context().clearCookies();
    await signIn(page, 'admin', '123', '/admin');
    await page.goto(route('/admin/mensagem-especial'));
    await expect(page.getByRole('heading', { name: 'Mensagens senha especial', exact: true })).toBeVisible();
    await expect(page.getByText(/senhas nunca são exibidas/i)).toBeVisible();

    await page.context().clearCookies();
    await page.goto(route('/senha-especial/codigo-inexistente'));
    await expect(page.getByRole('heading', { name: 'Acesso indisponível', exact: true })).toBeVisible();
  });

  test('campos monetários e chave PIX higienizam dados estruturados no Escritório Virtual', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');

    await page.goto(route('/membros/produtos'));
    const price = page.getByLabel('Preço (R$)');
    await price.fill('R$ 12,345');
    await expect(price).toHaveValue('12,34');
    await expect(price).toHaveAttribute('inputmode', 'decimal');

    await page.goto(route('/membros/recebimentos'));
    const pixKey = page.getByPlaceholder('CPF, CNPJ, telefone, e-mail ou chave aleatória');
    await pixKey.fill('chave-invalida');
    await pixKey.blur();
    await expect(page.getByRole('alert')).toContainText(/chave PIX válida/i);
  });

  test('curso publicado abre o e-book associado no leitor integrado', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');

    await page.goto(route('/membros/curso-google-ads'));
    const courseHeading = page.getByRole('heading', { name: 'Google Ads', exact: true });
    if (await courseHeading.count()) {
      await expect(courseHeading).toBeVisible();
      await expect(page.locator('iframe[sandbox]')).toBeVisible();
      await expect(page.getByText('Material indisponível', { exact: true })).toHaveCount(0);
    } else {
      await expect(page.getByText('Material indisponível', { exact: true })).toBeVisible();
    }
  });

  test('leitor integrado contém a página do e-book em celular, tablet e desktop', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');

    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(route('/membros/curso-google-ads'));
      const frame = page.locator('iframe[title^="Leitor de"]');
      if (!(await frame.count())) {
        await expect(page.getByText('Material indisponível', { exact: true })).toBeVisible();
        continue;
      }
      await expect(frame).toBeVisible();

      await expect.poll(async () => frame.evaluate(iframe => {
        const document = iframe.contentDocument;
        const pages = Array.from(document?.querySelectorAll<HTMLElement>("[id^='page'][id$='-div']") || []);
        const maxRight = Math.max(0, ...pages.map(page => page.getBoundingClientRect().right));
        return { maxRight, viewportWidth: iframe.clientWidth, zoom: Number(document?.body.style.zoom || 1) };
      })).toMatchObject({ zoom: expect.any(Number) });

      const layout = await frame.evaluate(iframe => {
        const document = iframe.contentDocument;
        const pages = Array.from(document?.querySelectorAll<HTMLElement>("[id^='page'][id$='-div']") || []);
        return {
          maxRight: Math.max(0, ...pages.map(page => page.getBoundingClientRect().right)),
          viewportWidth: iframe.clientWidth,
          zoom: Number(document?.body.style.zoom || 1),
        };
      });

      expect(layout.maxRight).toBeLessThanOrEqual(layout.viewportWidth + 2);
      if (viewport.width === 390) expect(layout.zoom).toBeLessThan(1);
    }
  });

  test('botão Ampliar alterna o leitor integrado para tela cheia e permite sair com Esc', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'user', '123', '/membros');
    await page.goto(route('/membros/curso-google-ads'));

    const reader = page.locator('[data-ebook-reader="responsive"]');
    if (!(await reader.count())) {
      await expect(page.getByText('Material indisponível', { exact: true })).toBeVisible();
      return;
    }
    await expect(reader).toHaveAttribute('data-reader-mode', 'embedded');
    await page.getByRole('button', { name: 'Ampliar leitor' }).click();
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
    await expect(reader).toHaveAttribute('data-reader-mode', 'fullscreen');
    await expect(page.getByRole('button', { name: 'Sair da tela cheia' })).toBeVisible();

    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
    await expect(reader).toHaveAttribute('data-reader-mode', 'embedded');
  });

  test('menu móvel preserva o catálogo do Escritório Virtual e expande seus grupos', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'user', '123', '/membros');

    await page.goto(route('/membros/mensagem-especial'));
    await expect(page.getByRole('heading', { name: 'Mensagem senha especial', exact: true })).toBeVisible();
    await page.locator('[data-sidebar="trigger"]').click();

    await expect(page.getByText('Minha conta', { exact: true })).toBeVisible();
    await expect(page.getByText('Comunicação', { exact: true })).toBeVisible();
    await expect(page.getByText('Minha operação', { exact: true })).toBeVisible();
    await expect(page.getByText('Conteúdos e materiais', { exact: true })).toBeVisible();
    await expect(page.getByText('Academia', { exact: true })).toBeVisible();

    const businessTools = page.getByRole('button', {
      name: 'Minha operação: expandir submenu',
    });
    await businessTools.click();
    await expect(page.getByText('Meus produtos', { exact: true })).toBeVisible();
    await expect(page.getByText('Minha rede direta', { exact: true })).toBeVisible();

    await page.getByRole('button', {
      name: 'Minha operação: recolher submenu',
    }).click();
    await expect(page.getByText('Meus produtos', { exact: true })).toBeHidden();
  });

  test('fluxo móvel preserva menus visíveis após trocar rotas do Escritório Virtual', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'user', '123', '/membros');

    const openMenu = async () => {
      const officeGroup = page.getByText('Minha conta', { exact: true });
      if (!(await officeGroup.isVisible())) {
        await page.locator('[data-sidebar="trigger"]').click();
      }
      await expect(officeGroup).toBeVisible();
      await expect(page.getByRole('button', { name: /^Comunicação:/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Minha operação:/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Conteúdos e materiais:/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Academia:/ })).toBeVisible();
    };

    await openMenu();
    await page.getByText('Personalização', { exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/mensagem-especial(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Mensagem senha especial', exact: true })).toBeVisible();

    await openMenu();
    await page.getByRole('button', { name: 'Minha operação: expandir submenu' }).click();
    await expect(page.getByText('Meus produtos', { exact: true })).toBeVisible();
    await page.getByText('Meus produtos', { exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/produtos(?:[/?#]|$)`));

    await openMenu();
    await page.getByRole('button', { name: 'Conteúdos e materiais: expandir submenu' }).click();
    await expect(page.getByText('Links & campanhas', { exact: true })).toBeVisible();
    await page.getByText('Links & campanhas', { exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/campanhas(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Links & campanhas', exact: true })).toBeVisible();

    await openMenu();
    const studyTrigger = page.getByRole('button', { name: 'Academia: expandir submenu' });
    await studyTrigger.scrollIntoViewIfNeeded();
    await studyTrigger.click();
    await expect(page.getByText('Curso Google Ads', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/fluxo-menu-mobile.png', fullPage: true });
  });

  test('membro não consegue abrir a administração', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');
    await page.goto(route('/admin'));

    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros(?:[/?#]|$)`));
    await expect(page.getByText('Página Lucrativa', { exact: true }).first()).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Preferências de recebimento', exact: true })).toBeVisible();
    await expect(page.getByText(/não movimenta dinheiro/i)).toBeVisible();

    await page.goto(route('/membros/meus-pedidos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/meus-pedidos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Solicitações atribuídas', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Solicitações atribuídas', exact: true }).nth(1)).toBeVisible();

    await page.locator('[data-sidebar="footer"] button').click();
    await page.getByRole('menuitem', { name: 'Voltar para Administração' }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin(?:[/?#]|$)`));
  });

  test('logout encerra a sessão e retorna à landing pública', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');

    await page.locator('[data-sidebar="footer"] button').click();
    await page.getByRole('menuitem', { name: 'Sair' }).click();

    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/?$`));
    await expect(page.getByRole('link', { name: /Quero conhecer a estrutura/i }).first()).toBeVisible();
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

  test('auditoria mobile percorre todos os destinos dos menus de membro e administração', async ({ page }) => {
    test.setTimeout(420_000);
    await page.setViewportSize({ width: 390, height: 844 });

    const memberItems = [
      ['Minha conta', 'Visão geral', '/membros'],
      ['Minha conta', 'Personalização', '/membros/mensagem-especial'],
      ['Minha conta', 'Meu relato', '/membros/fazer-depoimento'],
      ['Minha conta', 'Meu perfil', '/membros/configuracoes'],
      ['Minha conta', 'Dados da conta', '/membros/meus-dados'],
      ['Minha conta', 'Preferências de recebimento', '/membros/recebimentos'],
      ['Minha conta', 'Pedidos da operação', '/membros/meus-pedidos'],
      ['Minha conta', 'Ferramentas da operação', '/membros/operacao'],
      ['Minha conta', 'Suporte', '/membros/fale-conosco'],
      ['Comece por aqui', 'Saiba como divulgar', '/membros/como-divulgar'],
      ['Comunicação', 'Conteúdos do site', '/membros/emails-site'],
      ['Comunicação', 'Interessados', '/membros/emails-interessados'],
      ['Comunicação', 'WhatsApp', '/membros/emails-whatsapp'],
      ['Minha operação', 'Meus resultados', '/membros/ganhos'],
      ['Minha operação', 'Meu apresentador', '/membros/patrocinador'],
      ['Minha operação', 'Minha rede direta', '/membros/rede'],
      ['Minha operação', 'Meus produtos', '/membros/produtos'],
      ['Minha operação', 'Artigos e blog', '/membros/blog'],
      ['Minha operação', 'Vitrine', '/membros/classificados'],
      ['Minha operação', 'Visitas e histórico', '/membros/historico'],
      ['Minha operação', 'Academia', '/membros/academia'],
      ['Minha operação', 'Ajuda e dúvidas', '/membros/perguntas-frequentes'],
      ['Minha operação', 'Convites', '/membros/convites'],
      ['Conteúdos e materiais', 'Biblioteca de recursos', '/membros/materiais'],
      ['Conteúdos e materiais', 'E-books', '/membros/ebooks'],
      ['Conteúdos e materiais', 'Certificados e cartão', '/membros/cartao-certificado'],
      ['Conteúdos e materiais', 'Pontos e níveis', '/membros/ranking'],
      ['Conteúdos e materiais', 'Artigos e marketing', '/membros/artigos'],
      ['Conteúdos e materiais', 'Preparar comunicações', '/membros/automacoes'],
      ['Conteúdos e materiais', 'Visitas em destaque', '/membros/top-visitas'],
      ['Conteúdos e materiais', 'Links & campanhas', '/membros/campanhas'],
      ['Conteúdos e materiais', 'Bônus', '/membros/bonus'],
      ['Academia', 'Critérios de pontos', '/membros/pontos-niveis'],
      ['Academia', 'Desempenho comparativo (em revisão)', '/membros/mais-lucrativos'],
      ['Academia', 'Curso Google Ads', '/membros/curso-google-ads'],
      ['Academia', 'Curso Facebook Ads', '/membros/curso-facebook-ads'],
      ['Academia', 'Curso posts para Facebook', '/membros/curso-posts-facebook'],
      ['Academia', 'Curso crie designs Canva', '/membros/curso-canva'],
      ['Academia', 'Curso como criar um negócio', '/membros/curso-negocio'],
      ['Academia', 'Curso autônomo digital', '/membros/curso-autonomo'],
      ['Academia', 'Curso de recepcionista', '/membros/curso-recepcionista'],
      ['Academia', 'Curso crie um e-book', '/membros/curso-ebook'],
      ['Academia', 'Curso de importação', '/membros/curso-importacao'],
      ['Academia', 'Curso mestre do Excel', '/membros/curso-excel'],
      ['Academia', 'Curso TikTok Ads', '/membros/curso-tiktok-ads'],
      ['Academia', 'Curso página de captura', '/membros/curso-captura'],
      ['Academia', 'Curso criação de logotipo', '/membros/curso-logotipo'],
      ['Academia', 'Curso capas para vídeos', '/membros/curso-capas-videos'],
      ['Academia', 'Filmes motivacionais', '/membros/filmes'],
    ] as const;

    const adminItems = [
      ['Atuação pessoal', 'Meu Escritório', '/membros'],
      ['Gestão', 'Operação', '/admin'],
      ['Gestão', 'Central de manutenção', '/admin/operacao'],
      ['Gestão', 'Membros', '/admin/membros'],
      ['Gestão', 'Pontuação', '/admin/pontos'],
      ['Gestão', 'Relatos', '/admin/relatos'],
      ['Gestão', 'Pedidos', '/admin/pedidos'],
      ['Gestão', 'Financeiro', '/admin/financeiro'],
      ['Gestão', 'Comunicações', '/admin/comunicacoes'],
      ['Conteúdo', 'Catálogo', '/admin/produtos'],
      ['Conteúdo', 'Academia', '/admin/academia'],
      ['Conteúdo', 'E-books', '/admin/ebooks'],
      ['Conteúdo', 'Publicações', '/admin/publicacoes'],
    ] as const;

    const openSidebar = async () => {
      const sidebar = page.locator('[data-sidebar="sidebar"]');
      if (await sidebar.getAttribute('data-state') === 'collapsed') {
        await page.locator('[data-sidebar="trigger"]').click();
      }
      await expect(sidebar).toBeVisible();
      return sidebar;
    };

    const navigateFromMobileMenu = async (group: string, label: string, destination: string) => {
      const sidebar = await openSidebar();
      const item = sidebar.getByRole('button', { name: label, exact: true }).first();
      const expand = sidebar.getByRole('button', { name: `${group}: expandir submenu`, exact: true }).first();
      if (await expand.count()) {
        await expand.scrollIntoViewIfNeeded();
        await expand.click();
      }
      await expect(item).toBeVisible();
      await item.scrollIntoViewIfNeeded();
      await item.click();
      await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}${destination}(?:[/?#]|$)`));
      await expect(page.locator('main').last()).toBeVisible();
    };

    await signIn(page, 'user', '123', '/membros');
    for (const [group, label, destination] of memberItems) {
      await navigateFromMobileMenu(group, label, destination);
    }

    await page.context().clearCookies();
    await signIn(page, 'admin', '123', '/admin');
    for (const [group, label, destination] of adminItems) {
      await navigateFromMobileMenu(group, label, destination);
      if (destination === '/membros') {
        await page.locator('[data-sidebar="trigger"]').click();
        const sidebar = page.locator('[data-sidebar="sidebar"]');
        await sidebar.locator('[data-sidebar="footer"] button').click();
        await page.getByRole('menuitem', { name: 'Voltar para Administração' }).click();
        await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin(?:[/?#]|$)`));
      }
    }

    await page.screenshot({ path: 'test-results/auditoria-completa-menus-mobile.png', fullPage: true });
  });

});
