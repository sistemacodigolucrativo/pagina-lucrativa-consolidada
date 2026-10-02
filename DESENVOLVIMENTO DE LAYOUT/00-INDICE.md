# Desenvolvimento de Layout — Página Pública de Vendas

Esta pasta organiza a documentação técnica para evoluir a Página Pública de Vendas do Código Lucrativo para um sistema de templates plug and play, responsivo e consistente entre desktop real, desktop em navegador mobile, tablet e mobile.

## Documentos

1. `01-MAPEAMENTO-LAYOUT-PAGINA-PUBLICA.md`
   - Mapeia os arquivos responsáveis pela página pública, templates, editor visual, runtime, conteúdo e persistência.

2. `02-ARQUITETURA-TEMPLATES-PLUG-AND-PLAY.md`
   - Define a arquitetura-alvo do sistema de templates plug and play.
   - Estabelece contrato entre conteúdo, template, layout, breakpoints e funcionalidades.

3. `03-PLANO-DE-ACAO.md`
   - Organiza a execução técnica em etapas seguras.
   - Prioriza diagnóstico, extração da arquitetura, migração e validação.

4. `04-ROADMAP.md`
   - Distribui a evolução em marcos de implementação.
   - Define entregáveis, dependências e critérios de conclusão.

5. `05-CHECKLIST-DE-VALIDACAO.md`
   - Lista os testes obrigatórios antes de considerar a evolução concluída.
   - Inclui validação visual, responsiva, funcional, administrativa e de persistência.

## Regra central

Os templates devem trocar a apresentação visual da Página Pública de Vendas sem duplicar textos, quebrar funcionalidades ou alterar a lógica comercial existente.

O mesmo conteúdo textual deve alimentar todos os templates. Cada template decide apenas como exibir esse conteúdo.
