ALTER TABLE courses
  ADD COLUMN routeKey varchar(160) NULL AFTER title,
  ADD COLUMN ebookId int(11) NULL AFTER level;

UPDATE courses
SET routeKey = CONCAT('curso-', id)
WHERE routeKey IS NULL OR routeKey = '';

ALTER TABLE courses
  MODIFY COLUMN routeKey varchar(160) NOT NULL,
  ADD UNIQUE KEY courses_route_key_unique (routeKey),
  ADD KEY courses_ebook_idx (ebookId);

INSERT INTO courses (title, routeKey, summary, category, durationMinutes, level, ebookId, isPublished) VALUES
  ('Google Ads', 'curso-google-ads', 'Aprenda princípios de anúncios e persuasão para estruturar campanhas de busca.', 'Tráfego pago', 60, 'fundamentos', 1, 1),
  ('Facebook Ads', 'curso-facebook-ads', 'Fundamentos de comunicação publicitária aplicados à criação de anúncios.', 'Tráfego pago', 60, 'fundamentos', 1, 1),
  ('Posts para Facebook', 'curso-posts-facebook', 'Estruture conteúdos e textos que apoiam uma presença consistente nas redes sociais.', 'Conteúdo', 45, 'fundamentos', 37, 1),
  ('Canva', 'curso-canva', 'Organize os fundamentos visuais de uma marca antes de produzir peças de divulgação.', 'Design', 45, 'fundamentos', 10, 1),
  ('Negócio Digital', 'curso-negocio', 'Conheça etapas práticas para desenvolver um produto digital e uma operação online.', 'Negócio digital', 75, 'pratica', 11, 1),
  ('Profissional Autônomo', 'curso-autonomo', 'Material de apoio para organizar uma atuação profissional com autonomia.', 'Produtividade', 60, 'fundamentos', 24, 1),
  ('Recepcionista', 'curso-recepcionista', 'Apoio à organização de contatos e à condução inicial de oportunidades.', 'Atendimento', 45, 'fundamentos', 44, 1),
  ('Criação de E-book', 'curso-ebook', 'Orientações para compreender a produção e a disponibilização de materiais digitais.', 'Produtos digitais', 60, 'fundamentos', 51, 1),
  ('Importação', 'curso-importacao', 'Material de estudo sobre oportunidades e métodos de negócios na internet.', 'Negócio digital', 60, 'fundamentos', 43, 1),
  ('Excel Financeiro', 'curso-excel', 'Introdução à organização financeira para apoiar decisões da operação.', 'Gestão', 75, 'fundamentos', 4, 1),
  ('TikTok Ads', 'curso-tiktok-ads', 'Fundamentos de mensagens publicitárias aplicáveis a campanhas de tráfego pago.', 'Tráfego pago', 60, 'fundamentos', 1, 1),
  ('Captura de Leads', 'curso-captura', 'Estruture páginas de captura e processos de geração de contatos.', 'Captação', 60, 'pratica', 45, 1),
  ('Logotipo', 'curso-logotipo', 'Fundamentos de uma marca coerente para posicionar sua presença digital.', 'Design', 45, 'fundamentos', 10, 1),
  ('Capas para Vídeos', 'curso-capas-videos', 'Apoio para criar e organizar materiais visuais voltados a conteúdo em vídeo.', 'Conteúdo', 45, 'fundamentos', 18, 1),
  ('Filmes e Vídeos', 'filmes', 'Estude princípios de criação de vídeos para uso na sua comunicação.', 'Conteúdo', 60, 'fundamentos', 18, 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title), summary = VALUES(summary), category = VALUES(category), durationMinutes = VALUES(durationMinutes), level = VALUES(level), ebookId = VALUES(ebookId), isPublished = VALUES(isPublished);
