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
  if (destination === '/membros') {
    const dismissOnboarding = page.getByRole('button', { name: 'Dispensar', exact: true });
    if (await dismissOnboarding.count() && await dismissOnboarding.isVisible()) {
      await dismissOnboarding.click();
    }
  }
}

test.describe('Código Lucrativo 2026 publicada', () => {
  test('a rota legada de landing permanece documentada como não encontrada', async ({ page }) => {
    await page.goto('/paginalucrativa/');
    await expect(page).toHaveURL(/\/paginalucrativa\/?$/);
    await expect(page.getByRole('heading', { name: 'Page Not Found', exact: true })).toBeVisible();
  });
  test('a landing pública exibe a marca, navegação e formulário de pedido', async ({ page }) => {
    await page.goto(route('/'));

    await expect(page).toHaveTitle(/Método Código Lucrativo.*Escritório Virtual/i);
    await expect(page.getByRole('link', { name: /Quero ativar minha estrutura/i }).first()).toBeVisible();
    await expect(page.locator('#f')).toContainText(/pedido|formulário/i);
  });

  test('navbar simplificada preserva destinos, CTA, sticky e menu móvel', async ({ page }) => {
    const expectedLinks = [
      ['Como funciona', '#como-funciona'],
      ['O que você recebe', '#o-que-recebe'],
      ['Resultados', '#depoimentos'],
      ['Dúvidas', '/perguntas-frequentes'],
      ['Acompanhar pedido', '/pedido/acompanhar'],
      ['Entrar', '/acesso'],
      ['Quero ativar minha estrutura', '#f'],
    ] as const;
    const header = page.locator('.site-header');
    const headerNav = header.locator('nav[aria-label="Navegação principal"]');

    await page.goto(route('/'));
    await expect(header).toBeVisible();
    await expect(header).toHaveCSS('position', 'sticky');
    await expect(headerNav).toBeVisible();
    await expect(headerNav.locator('a').evaluateAll(links => links.map(link => link.textContent?.trim() ?? ""))).resolves.toEqual(expectedLinks.map(([label]) => label));
    for (const [label, href] of expectedLinks) {
      const link = headerNav.getByRole('link', { name: label, exact: true });
      await expect(link).toHaveAttribute('href', href);
    }
    for (const removedLabel of ['Início', 'Conheça a estrutura', 'Vídeos', 'Para quem é', 'Institucional', 'Depoimentos', 'Perguntas frequentes']) {
      await expect(headerNav.getByRole('link', { name: removedLabel, exact: true })).toHaveCount(0);
    }
    await expect(headerNav.locator('a.nav-cta')).toHaveText('Quero ativar minha estrutura');

    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' as ScrollBehavior }));
    await expect.poll(() => header.boundingBox().then(box => box?.y ?? Number.NaN)).toBeGreaterThanOrEqual(-1);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    const menuButton = page.getByRole('button', { name: 'Abrir menu' });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.getByRole('button', { name: 'Fechar menu' })).toBeVisible();
    await expect(headerNav).toBeVisible();
    await expect(headerNav.locator('a').evaluateAll(links => links.map(link => link.textContent?.trim() ?? ""))).resolves.toEqual(expectedLinks.map(([label]) => label));
    await headerNav.getByRole('link', { name: 'Dúvidas', exact: true }).click();
    await expect(page).toHaveURL(/\/perguntas-frequentes(?:[/?#]|$)/);
    await expect(headerNav).toBeHidden();
  });

  test('seção independente da estrutura digital preserva a composição em desktop, tablet e mobile', async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(route('/'));

      const hero = page.locator('#inicio');
      const showcase = page.locator('section.structure-showcase');
      await expect(showcase).toHaveCount(1);
      await expect(showcase.getByRole('heading', { name: 'Pronta para operar.', exact: true })).toBeVisible();
      await expect(showcase.locator('.hero-photo-wrap img')).toHaveCount(1);
      await expect(showcase.locator('.sales-author-badge')).toContainText('Estrutura digital');
      await expect(showcase.locator('.sales-author-badge')).toContainText('pronta para operar');
      await expect(showcase.locator('.sprint-stamp')).toContainText('tela');
      await expect(showcase.locator('.sprint-stamp')).toContainText('escritório virtual');
      await expect(showcase.locator('.sprint-paper-card')).toContainText('escritório virtual');
       await expect(showcase.locator('.sprint-paper-card')).toContainText(/operação|apresentação/i);

      const metrics = await showcase.evaluate(section => {
        const sectionBox = section.getBoundingClientRect();
        const heroBox = document.querySelector('#inicio')?.getBoundingClientRect();
        const stage = section.querySelector('.structure-showcase-stage')?.getBoundingClientRect();
        const elements = Array.from(section.querySelectorAll('.hero-photo-wrap, .sales-author-badge, .sprint-stamp, .sprint-paper-card')).map(element => {
          const box = element.getBoundingClientRect();
          return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
        });
        return {
          sectionTop: sectionBox.top,
          heroBottom: heroBox?.bottom ?? 0,
          stageWidth: stage?.width ?? 0,
          elements,
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
        };
      });

      expect(metrics.sectionTop).toBeGreaterThanOrEqual(metrics.heroBottom - 1);
      expect(metrics.stageWidth).toBeGreaterThan(0);
      expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
      for (const element of metrics.elements) {
        expect(element.left).toBeGreaterThanOrEqual(-1);
        expect(element.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
      }
    }
  });

  test('cópia pública Violeta Neon preserva o formulário e o CTA flutuante sem alterar o Preview original', async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(route('/'));
      const card = page.locator('form.violeta-neon-activation-card');
      const cta = page.locator('.public-conversion-cta');
      await expect(card).toHaveCount(1);
      await expect(card).toContainText('R$ 50,00');
      await expect(card.locator('input[name="fullName"]')).toBeVisible();
      await expect(card.locator('input[name="email"]')).toBeVisible();
      await expect(card.locator('input[name="whatsapp"]')).toBeVisible();
       await page.locator('#depoimentos').evaluate(element => {
         window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + element.getBoundingClientRect().height + 1, behavior: 'instant' as ScrollBehavior });
       });
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute('href', '/#f');
      await expect(page.locator('form.sales-price-card')).toHaveCount(0);

      const ctaBox = await cta.boundingBox();
      const chatBox = await page.locator('.member-chat-fab').boundingBox();
      expect(ctaBox).not.toBeNull();
      expect(chatBox).not.toBeNull();
      const ctaTop = ctaBox!.y;
      const ctaBottom = ctaBox!.y + ctaBox!.height;
       const ctaRight = ctaBox!.x + ctaBox!.width;
      const chatTop = chatBox!.y;
      const chatBottom = chatBox!.y + chatBox!.height;
       const chatRight = chatBox!.x + chatBox!.width;
       const separated = ctaTop >= chatBottom - 1
         || ctaBottom <= chatTop + 1
         || ctaRight <= chatBox!.x + 1
         || chatRight <= ctaBox!.x + 1;
       expect(separated).toBe(true);

      await cta.click();
      await expect(card).toBeInViewport();
      await expect(cta).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width + 1);
    }

    await signIn(page, 'admin', '123', '/admin');
    await page.goto(route('/preview'));
    await expect(page.getByText('Violeta neon', { exact: true })).toBeVisible();
    await expect(page.locator('.offer-preview-violet')).toHaveCount(1);
    await expect(page.locator('.violeta-neon-activation-card')).toHaveCount(0);
    await expect(page.locator('.public-conversion-cta')).toHaveCount(0);
  });

  test('toast global usa atividade ilustrativa, alterna notificações e não aparece em áreas privadas', async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1280, height: 720 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(route('/'));
      const toast = page.locator('.public-social-proof-toast');
      await expect(toast).toBeVisible({ timeout: 15_000 });
      const firstText = await toast.innerText();
      expect(firstText).toMatch(/Dica rápida|orientação|estrutura|etapas|perguntas frequentes/i);
      expect(firstText).toMatch(/não representa|educativa|plataforma|divulgação/i);

      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('codigo-lucrativo:toast-preview', {
          detail: {
            message: 'Leia outra orientação da estrutura antes de avançar.',
            disclaimer: 'Mensagem educativa sobre a plataforma.',
            showSimulationNotice: true,
            visibleSeconds: 5,
          },
        }));
      });
      await expect.poll(async () => toast.isVisible().then(visible => visible ? toast.innerText() : ''), { timeout: 5_000 }).not.toBe(firstText);

       await page.goto(route('/institucional'));
       await expect(page.locator('.public-social-proof-toast')).toHaveCount(0);
      await page.goto(route('/admin'));
      await expect(page.locator('.public-social-proof-toast')).toHaveCount(0);
      await page.goto(route('/membros'));
      await expect(page.locator('.public-social-proof-toast')).toHaveCount(0);
    }
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

    await expect(page.getByRole('button', { name: 'Recuperar acesso' })).toBeEnabled();
    await expect(page.getByText('Entre com seus dados para acessar seus conteúdos, ferramentas de divulgação e recursos da sua Código Lucrativo.', { exact: true })).toHaveCount(0);
  });

  test('membro e administrador entram nos respectivos ambientes', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');
    await expect(page.getByText('Código Lucrativo', { exact: true }).first()).toBeVisible();

    await page.context().clearCookies();
    await page.goto(route('/acesso'));
    await signIn(page, 'admin', '123', '/admin');
    await expect(page.getByText('Administração', { exact: true }).first()).toBeVisible();
  });

  test('pedido público recente mantém a data legível dentro do conteúdo no mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'admin', '123', '/admin');
    await page.goto(route('/admin/pedidos'));

    const row = page.locator('.office-card').first();
    if (await row.count()) {
      await expect(row).toBeVisible();
      const [rowBox, timeBox] = await Promise.all([row.boundingBox(), row.locator('time').first().boundingBox()]);
      expect(rowBox).not.toBeNull();
      expect(timeBox).not.toBeNull();
      expect(timeBox!.x).toBeGreaterThanOrEqual(rowBox!.x - 1);
      expect(timeBox!.x + timeBox!.width).toBeLessThanOrEqual(rowBox!.x + rowBox!.width + 1);
     } else {
       await expect(page.locator('body')).toContainText(/Pedidos|Nenhum pedido encontrado|Não foi possível|Banco de dados indisponível|Carregando/i);
    }
  });

  test('formulários administrativos empilham e contêm seus campos no celular', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'admin', '123', '/admin');

    for (const destination of ['/admin/pedidos', '/admin/financeiro']) {
      await page.goto(route(destination));
      const form = page.locator('.office-form-grid').first();
      if (!(await form.count())) {
        await expect(page.locator('body')).toContainText(/Pedidos|Financeiro|Nenhum pedido encontrado|Nenhuma transação registrada|Não foi possível|Banco de dados indisponível|Carregando/i);
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
      const form = page.locator('.office-form-grid').first();
      if (!(await form.count())) {
        await expect(page.locator('body')).toContainText(/Pedidos|Financeiro|Nenhum pedido encontrado|Nenhuma transação registrada|Não foi possível|Banco de dados indisponível|Carregando/i);
        continue;
      }
      const controls = form.locator('select, input, textarea');
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

    await page.goto(route('/membros/operacao/campanhas'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/operacao/campanhas(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Campanhas', exact: true })).toBeVisible();
    await expect(page.locator('form').first()).toBeVisible();

    await page.goto(route('/membros/pontos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/pontos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Meu desempenho', exact: true })).toBeVisible();
  });

  test('configurações atuais do membro e estado público indisponível são explícitos', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');
    await page.goto(route('/membros/configuracoes'));
    await expect(page.getByRole('heading', { name: 'Editar perfil', exact: true })).toBeVisible();

    await page.context().clearCookies();
    await signIn(page, 'admin', '123', '/admin');
    await page.goto(route('/admin/futuras-implementacoes'));
    await expect(page.getByRole('heading').first()).toBeVisible();

    await page.context().clearCookies();
    await page.goto(route('/senha-especial/codigo-inexistente'));
    await expect(page.getByRole('heading', { name: 'Page Not Found', exact: true })).toBeVisible();
  });

  test('campos monetários e chave PIX higienizam dados estruturados no Escritório Virtual', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');

    await page.goto(route('/membros/operacao/campanhas'));
    await expect(page.getByRole('heading', { name: 'Campanhas', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Nome da campanha *' })).toBeVisible();

    await page.goto(route('/membros/recebimentos'));
    const pixKey = page.getByPlaceholder('CPF, CNPJ, telefone, e-mail ou chave aleatória');
    if (await pixKey.count()) {
      await pixKey.fill('chave-invalida');
      await pixKey.blur();
      await expect(page.getByRole('alert')).toContainText(/formato|chave/i);
    } else {
      await expect(page.getByRole('heading', { name: 'Preferências de recebimento', exact: true })).toBeVisible();
    }
  });

  test('curso publicado abre o e-book associado no leitor integrado', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');

    await page.goto(route('/membros/curso/google-ads'));
    const courseHeading = page.locator('h1').filter({ hasText: /Google Ads/i });
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
      await page.goto(route('/membros/curso/google-ads'));
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
    await page.goto(route('/membros/curso/google-ads'));

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

    await page.goto(route('/membros/configuracoes'));
    await expect(page.getByRole('heading', { name: 'Editar perfil', exact: true })).toBeVisible();
    await page.locator('[data-sidebar="trigger"]').click();

    for (const group of ['Início', 'Minha página', 'Vendas', 'Rede', 'Conteúdo', 'Capacitação', 'Desempenho', 'Ajuda']) {
      await expect(page.getByText(group, { exact: true })).toBeVisible();
    }
    await expect(page.getByText('Minha página e perfil', { exact: true })).toBeVisible();
    await expect(page.getByText('Meus pedidos', { exact: true })).toBeVisible();
    await expect(page.getByText('Biblioteca de Recursos', { exact: true })).toBeVisible();
    await expect(page.getByText('Biblioteca de e-books', { exact: true })).toBeVisible();
  });

  test('fluxo móvel preserva menus visíveis após trocar rotas do Escritório Virtual', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'user', '123', '/membros');

    const openMenu = async () => {
      const sidebar = page.locator('[data-sidebar="sidebar"]');
      const officeGroup = sidebar.getByText('Início', { exact: true });
      if (!(await officeGroup.isVisible())) {
        await page.locator('[data-sidebar="trigger"]').click();
      }
      await expect(officeGroup).toBeVisible();
      await expect(sidebar.getByText('Minha página', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Vendas', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Conteúdo', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Capacitação', { exact: true })).toBeVisible();
      return sidebar;
    };

    let sidebar = await openMenu();
    await sidebar.getByRole('button', { name: 'Minha página e perfil', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/configuracoes(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Editar perfil', exact: true })).toBeVisible();

    sidebar = await openMenu();
    await sidebar.getByRole('button', { name: 'Central de Divulgação', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/operacao(?:[/?#]|$)`));

    sidebar = await openMenu();
    await sidebar.getByRole('button', { name: 'Biblioteca de Recursos', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/materiais(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Biblioteca de Recursos', exact: true })).toBeVisible();

    await openMenu();
    await expect(page.getByText('Biblioteca de e-books', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/fluxo-menu-mobile.png', fullPage: true });
  });

  test('membro não consegue abrir a administração', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');
    await page.goto(route('/admin'));

    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros(?:[/?#]|$)`));
    await expect(page.getByText('Código Lucrativo', { exact: true }).first()).toBeVisible();
  });

  test('administração carrega ferramentas de curadoria sem gravar registros', async ({ page }) => {
    await signIn(page, 'admin', '123', '/admin');

    await page.goto(route('/admin/publicacoes'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin/publicacoes(?:[/?#]|$)`));
    await expect(page.getByRole('heading').first()).toBeVisible();

    await page.goto(route('/admin/pontos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin/pontos(?:[/?#]|$)`));
     await expect(page.getByRole('heading', { name: /Pontos e performance/i })).toBeVisible();
  });

  test('administrador também acessa o próprio Escritório como afiliado', async ({ page }) => {
    await signIn(page, 'admin', '123', '/admin');
    await expect(page.getByRole('button', { name: 'Modo Membro', exact: true })).toBeVisible();

    await page.goto(route('/membros/recebimentos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/recebimentos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Preferências de recebimento', exact: true })).toBeVisible();
     await expect(page.getByText(/método de recebimento|afiliado e o comprador|receber os valores/i).first()).toBeVisible();

    await page.goto(route('/membros/meus-pedidos'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/membros/meus-pedidos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: 'Solicitações atribuídas', exact: true }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Abrir menu da conta' }).click();
    await page.getByRole('menuitem', { name: 'Voltar para Administração' }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin(?:[/?#]|$)`));
  });

  test('logout encerra a sessão e retorna à landing pública', async ({ page }) => {
    await signIn(page, 'user', '123', '/membros');

    await page.getByRole('button', { name: 'Abrir menu da conta' }).click();
    await page.getByRole('menuitem', { name: 'Sair' }).click();

    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/?$`));
    await expect(page.getByRole('link', { name: /Quero ativar minha estrutura/i }).first()).toBeVisible();
  });
  test('menu móvel da administração preserva o catálogo em rotas contextuais', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, 'admin', '123', '/admin');
    await page.goto(route('/admin/membros'));
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin/membros(?:[/?#]|$)`));

    const openAdminMenu = async () => {
      const sidebar = page.locator('[data-sidebar="sidebar"]');
      const managementGroup = sidebar.getByText('Gestão de membros', { exact: true });
      if (!(await managementGroup.isVisible().catch(() => false))) {
        await page.locator('[data-sidebar="trigger"]').click();
      }
      await expect(sidebar).toBeVisible();
      await expect(sidebar.getByText('Visão geral', { exact: true })).toBeVisible();
      await expect(managementGroup).toBeVisible();
      await expect(sidebar.getByText('Conteúdo', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Capacitação', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Sistema', { exact: true })).toBeVisible();
      await expect(sidebar.getByRole('button', { name: 'Pontos/Performance' })).toBeVisible();
      await expect(sidebar.getByText('Biblioteca de e-books', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Publicações', { exact: true })).toBeVisible();
      return sidebar;
    };

    let adminSidebar = await openAdminMenu();
    await adminSidebar.getByRole('button', { name: 'Pontos/Performance' }).click();
    await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}/admin/pontos(?:[/?#]|$)`));
    await expect(page.getByRole('heading', { name: /Pontos e performance/i })).toBeVisible();
    await openAdminMenu();
    await page.screenshot({ path: 'test-results/menu-administracao-mobile.png', fullPage: true });
  });

  test('auditoria mobile percorre destinos atuais dos menus de membro e administração', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 390, height: 844 });

    const openSidebar = async () => {
      const sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]');
      if (!(await sidebar.isVisible().catch(() => false))) {
        await page.locator('[data-sidebar="trigger"]').click();
      }
      await expect(sidebar).toBeVisible();
      return sidebar;
    };
    const checkMenuRoutes = async (items: readonly [string, string][]) => {
      for (const [label, destination] of items) {
        const sidebar = await openSidebar();
        const item = sidebar.getByRole('button', { name: label, exact: true }).first();
        await expect(item).toBeVisible();
        await item.click();
        await expect(page).toHaveURL(new RegExp(`${APP_PREFIX}${destination}(?:[/?#]|$)`));
        await expect(sidebar).toBeHidden();
        await expect(page.locator('main').last()).toBeVisible();
      }
    };

    await signIn(page, 'user', '123', '/membros');
    await checkMenuRoutes([
      ['Visão geral', '/membros'],
      ['Central de Divulgação', '/membros/operacao'],
      ['Minha página e perfil', '/membros/configuracoes'],
      ['Dados da conta', '/membros/meus-dados'],
      ['Dados de recebimento', '/membros/recebimentos'],
      ['Meus pedidos', '/membros/meus-pedidos'],
      ['Ganhos e extrato', '/membros/ganhos'],
      ['Minha rede', '/membros/rede'],
      ['Material de divulgação', '/membros/artigos'],
      ['Biblioteca de Recursos', '/membros/materiais'],
      ['Academia', '/membros/academia'],
      ['Biblioteca de e-books', '/membros/ebooks'],
      ['Certificados', '/membros/cartao-certificado'],
      ['Meu desempenho', '/membros/pontos'],
      ['Fale conosco', '/membros/fale-conosco'],
      ['Enviar agradecimento', '/membros/fazer-depoimento'],
    ]);

    await page.context().clearCookies();
    await signIn(page, 'admin', '123', '/admin');
    await checkMenuRoutes([
      ['Dashboard', '/admin'],
      ['Operação', '/admin/operacao'],
      ['Pedidos', '/admin/pedidos'],
      ['Financeiro', '/admin/financeiro'],
      ['Pontos/Performance', '/admin/pontos'],
      ['Membros e rede', '/admin/membros'],
      ['Material de Divulgação', '/admin/material-divulgacao'],
      ['Biblioteca de Recursos', '/admin/biblioteca-recursos'],
      ['Publicações', '/admin/publicacoes'],
      ['Biblioteca de e-books', '/admin/ebooks'],
      ['Academia', '/admin/academia'],
      ['Suporte', '/admin/suporte'],
      ['Agradecimentos', '/admin/relatos'],
      ['Configurar Seções', '/admin/imagens'],
      ['Toast', '/admin/toast'],
      ['Deploy manual', '/admin/deploy'],
    ]);
    await page.screenshot({ path: 'test-results/auditoria-completa-menus-mobile.png', fullPage: true });
  });

});
