# Arquivos opcionais com Firebase

Preservados da base, mas **fora da demonstração preparada para o GitHub Pages**:

- `admin.html`: painel administrativo.
- `seed-firebase.html`: ferramenta que grava dados no Firestore.
- `regras-originais.md`: documentação de regras recebida.

Os HTMLs usam `<base href="../../">` para manter os caminhos relativos à raiz após a mudança de pasta. Não foram configurados usuários, banco ou autenticação.

## Limites da revisão

O JavaScript foi verificado quanto à sintaxe. Login, gravações, upload de imagens, PDV e relatórios não foram testados com um serviço real.

O painel interpola valores remotos em `innerHTML` sem escape uniforme. As regras recebidas permitem escrita a qualquer usuário autenticado, sem verificar papel administrativo. Este material não deve ser apresentado como um sistema de produção validado.

A carga de dados não foi executada. Suas operações `set` podem sobrescrever documentos existentes. Uma eventual ativação exigirá revisão de autorização, validação dos dados e testes próprios. Neste portfólio, use os dados locais e a configuração vazia.
