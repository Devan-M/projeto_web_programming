# Rick and Morty — Personagens

Projeto front-end para a disciplina de **Web Programming for Front End** — UniFECAF (2026).

Exibe cards de personagens da série Rick and Morty consumindo a [Rick and Morty API](https://rickandmortyapi.com/) pública.

---

## Funcionalidades

- **Listagem em cards**: exibe nome, imagem, status (Alive/Dead/Unknown), espécie e origem de cada personagem
- **Carregamento em blocos**: carrega 14 personagens por vez via botão "Carregar mais"
- **Busca em tempo real**: campo de busca com debounce de 400ms que consulta a API pelo nome do personagem, percorrendo todas as páginas do resultado
- **Animação de entrada**: cada card aparece com fade-in e deslocamento vertical ao entrar na viewport, usando `IntersectionObserver`
- **Total dinâmico**: o total de personagens disponíveis é buscado da API na inicialização, sem valor hardcoded

---

## Estrutura de arquivos

```
├── index.html    # Estrutura da página (header com busca, container de cards, botão carregar mais)
├── script.js     # Lógica de consumo da API, criação dos cards e eventos
└── styles.css    # Estilização com tema escuro inspirado na série
```

---

## Como usar

Abra o arquivo `index.html` diretamente no browser. Não é necessário servidor ou instalação de dependências.

> **Dica**: se o browser bloquear requisições (ex.: ad blocker ativo), desative-o para o endereço local (`127.0.0.1` ou `localhost`).

---

## API utilizada

**Rick and Morty API** — https://rickandmortyapi.com/

- Pública, sem necessidade de token ou autenticação
- Endpoint principal: `GET /api/character/{ids}` — busca múltiplos personagens por IDs separados por vírgula
- Endpoint de busca: `GET /api/character/?name={termo}&page={pagina}`

---

## Detalhes técnicos

| Item | Detalhe |
|---|---|
| Linguagens | HTML5, CSS3, JavaScript (ES2020+) |
| API | Rick and Morty API (REST, pública) |
| Carregamento | Blocos de 14 IDs por requisição |
| Busca | Debounce 400ms + paginação automática |
| Animação | `IntersectionObserver` + `transition` CSS |
| Status cores | Verde (Alive), Vermelho (Dead), Cinza (Unknown) |

---

## Cores do tema

| Elemento | Cor |
|---|---|
| Fundo da página | `#1a1a2e` |
| Fundo dos cards / header | `#16213e` |
| Destaque / borda | `#00d26a` |
| Status Alive | `#00d26a` |
| Status Dead | `#e84040` |
| Status Unknown | `#aaa` |
