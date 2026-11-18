# Revisão — Juana Cosméticos

**Data:** 18/11/2026  
**Resultado:** catálogo publicado no GitHub e no GitHub Pages, com créditos à base e ao contexto de estudo. Testes de armazenamento e publicação concluídos com sucesso; carregamento da página pública confirmado em 18/11/2026.

- [Demonstração online](https://rainerzambrano.github.io/Juana-Cosmetico-catalogo/)
- [Repositório](https://github.com/rainerzambrano/Juana-Cosmetico-catalogo)
- [Execução de publicação bem-sucedida](https://github.com/rainerzambrano/Juana-Cosmetico-catalogo/actions/runs/44395701768)

## Material analisado

O ZIP contém 360 entradas: 69 diretórios, 31 arquivos atuais do projeto, 80 arquivos do histórico Git e 180 arquivos auxiliares do macOS. Os itens foram inventariados; código, documentos, SVGs e histórico foram verificados estaticamente. Os 57 objetos Git permitiram examinar as duas versões disponíveis.

As capturas recebidas foram substituídas por capturas reais da prévia revisada. O ZIP original foi preservado. O pacote preparado não inclui o histórico Git nem os arquivos auxiliares do macOS.

## Achados e tratamento

| Achado | Tratamento |
| --- | --- |
| Origem confirmada em ronaldandrade25/ra-cosmetico, sem licença geral identificada | Créditos e URL adicionados; contexto da mentoria e instrução de publicação de Rainer registrados em ORIGEM-E-LICENCA.md. Nenhuma licença aberta foi atribuída ao conjunto. |
| Dados JSON válidos, porém fora do formato esperado em localStorage, podiam interromper a inicialização | Leitura de carrinho e favoritos passa a validar listas e retornar o padrão para valores incompatíveis. |
| Controles da barra do catálogo ultrapassavam a tela em 320 px | Flexbox passa a permitir quebra de linha; medição final sem transbordamento horizontal. |
| Histórico antigo e metadados do sistema no ZIP | Excluídos da cópia preparada. O repositório publicado iniciou um histórico limpo, sem importar os objetos antigos. |
| Admin e carga de dados não necessários ao catálogo demonstrativo | Preservados em extras/firebase, com caminhos ajustados; excluídos do artefato destinado ao Pages. |
| README não identificava a origem e afirmava desenvolvimento integral | Reescrito para distinguir base, personalização e revisão assistida. |
| Garantia ampla de acessibilidade no README antigo | Substituída por descrição dos recursos efetivos; não se afirma certificação WCAG. |
| Configurações de Vercel/Firebase Hosting desnecessárias para o destino solicitado | Removidas da cópia preparada; substituídas pela preparação específica de GitHub Pages. |

## Dados e segurança

Não foram detectados padrões de chaves privadas, tokens GitHub/OpenAI/AWS, senhas preenchidas ou chaves Firebase na varredura dos arquivos atuais e dos objetos Git. A configuração Firebase fornecida está vazia.

O histórico continha dados e imagens da base anterior, além da identidade do Git local. Esses itens não integram a versão preparada. Os contatos fictícios da Juana permanecem como texto, sem link ativo de WhatsApp.

A varredura é uma revisão de código e padrões conhecidos, não uma garantia de ausência de qualquer vulnerabilidade.

No painel opcional, foram identificados valores remotos interpolados em HTML sem escape uniforme e regras Firestore que confiam apenas na presença de autenticação. Esses fluxos não foram ativados nem considerados prontos para produção.

## Testes realizados

| Verificação | Resultado |
| --- | --- |
| Carregamento local em subpasta /juana-cosmeticos-catalogo/ | Página, CSS, JavaScript e dados responderam com HTTP 200. |
| Imagens | 12 ilustrações de produtos, monograma, favicon e hero com caminhos válidos; imagens exibidas carregadas. |
| Busca | “SERUM” encontrou Sérum Facial Glow C; termo inexistente apresentou estado vazio. |
| Categorias e ordenação | Maquiagem retornou quatro produtos, corretamente ordenados por menor preço; categoria Cabelos e corpo funcionou no celular. |
| Favoritos | Adicionar, filtrar, recarregar e remover verificados. |
| Detalhes | Abertura do produto e seleção de duas unidades verificadas. |
| Carrinho | Adicionar, reduzir quantidade, remover, persistir após recarga e impedir simulação de carrinho vazio verificados. |
| Cupom | JUANA10 aplicado a R$ 119,80 resultou em R$ 11,98 de desconto e R$ 107,82 de total; código inválido rejeitado. |
| Pedido simulado | Resumo com valores corretos e aviso de demonstração; opção de esvaziar testada. |
| Celular | Barra de carrinho, filtros, busca e resumo testados em viewport de 390 × 844 px. |
| Responsividade | Largura da página igual à viewport em 320, 390, 768 e 1440 px após o ajuste. |
| Navegação | Links internos de produtos e serviços verificados. |
| Teclado | Esc fecha o carrinho; Shift+Tab a partir do primeiro controle permanece no carrinho. |
| Sintaxe | script.js, dados, configuração e JavaScript embutido dos extras analisados sem erro de sintaxe. |
| Armazenamento | 10 verificações automatizadas passaram, incluindo JSON inválido, tipos inesperados e armazenamento bloqueado. |
| Preparação do Pages | Artefato gerado e servido em uma subpasta; admin, seed e histórico Git retornaram 404. |
| Console | Sem mensagens de erro ou aviso nos fluxos do catálogo inspecionados. |

## Capturas

- home-desktop.jpg: página inicial, 1440 × 900 px.
- catalogo-desktop.jpg: grade de produtos, 1440 × 900 px.
- mobile.jpg: página inicial em viewport de 390 × 844 px.
- pedido-demonstrativo.jpg: resumo de pedido com cupom.

## Limites e próximos passos

- Os testes ocorreram no navegador local com viewports redimensionadas; não em aparelhos físicos nem em uma matriz completa de navegadores.
- Não houve teste de autenticação, banco real, PDV ou gravações Firebase.
- Fontes e ícones continuam dependentes de CDNs.
- O workflow foi executado com sucesso no GitHub: armazenamento, preparação do artefato e deploy do Pages passaram.
- O repositório público contém 37 arquivos. A página publicada carregou com os 12 produtos e os cinco serviços. A verificação online confirmou esse carregamento; os testes completos de interação da tabela acima foram realizados localmente.
- A origem foi confirmada pelo link fornecido por Rainer e pela igualdade dos 16 arquivos correspondentes. Rainer autorizou a publicação após informar o contexto da mentoria Operação 50K. A conta conectada é rainerzambrano. Rainer ativou GitHub Actions como origem do Pages; a publicação foi concluída e o carregamento público foi confirmado.

## Referências

- [GitHub — licenciamento](https://docs.github.com/pt/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).
- [GitHub — workflows do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Créditos das dependências](CREDITOS.md).

