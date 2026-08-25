# Origem do banner de página não publicada

A mensagem `This page is not live and cannot be shared directly. Please publish to get a public link.` é renderizada pelo runtime externo do ambiente de preview, no componente compilado `src/modules/Alert/PreviewerModeAlert.tsx` do `#manus-runtime`. Ela não pertence ao código funcional da aplicação.

A configuração própria `hideExternalPreviewNotice` foi removida definitivamente do backend, schema funcional, router, painel Admin e menu. A página `AdminSettings.tsx` também foi removida porque existia apenas para controlar esse aviso.

A validação do preview mostrou que o banner continua visível na composição final, embora não apareça no DOM acessível ao contexto da aplicação. Isso confirma que o alerta está em uma camada/iframe do host de preview, fora do alcance de CSS ou JavaScript executado pela aplicação. Portanto, não é tecnicamente possível removê-lo definitivamente editando somente o projeto; a origem real depende da plataforma de preview/publicação. A publicação do projeto é o mecanismo da plataforma para retirar esse aviso.
