"use strict";

// =============================================================================
// SELETORES DO DOM
// =============================================================================

const container   = document.getElementById("cards-container");
const overlay     = document.getElementById("overlay");
const searchInput = document.getElementById("search");
const sentinel    = document.getElementById("scroll-sentinel");

// Modal
const modal         = document.getElementById("modal");
const modalImg      = document.getElementById("modal-img");
const modalName     = document.getElementById("modal-name");
const modalStatus   = document.getElementById("modal-status");
const modalOrigin   = document.getElementById("modal-origin");
const modalLocation = document.getElementById("modal-location");
const modalClose    = document.getElementById("modal-close");

// Tooltip
const tooltip = document.getElementById("tooltip");


// =============================================================================
// ESTADO DA APLICAÇÃO
// =============================================================================

let proximaUrl    = null; // URL da próxima página retornada pela API
let pagina        = 1;    // Página atual (usada apenas na carga inicial)
let debounceTimer = null; // Timer para evitar múltiplas requisições durante a digitação
let delayContador = 0;    // Controla o delay escalonado das animações dos cards


// =============================================================================
// TOOLTIP
// =============================================================================

function showTooltip(e, message) {
  tooltip.textContent = message;
  tooltip.hidden = false;
  tooltip.style.left = (e.clientX + 140) + "px";
  tooltip.style.top  = (e.clientY + 30) + "px";
}

function moveTooltip(e) {
  tooltip.style.left = (e.clientX + 140) + "px";
  tooltip.style.top  = (e.clientY + 30) + "px";
}

function hideTooltip() {
  tooltip.hidden = true;
}


// =============================================================================
// MODAL
// =============================================================================

function abrirModal(personagem) {
  modalImg.src              = personagem.image;
  modalImg.alt              = personagem.name;
  modalName.textContent     = personagem.name;
  modalStatus.textContent   = `${personagem.status} — ${personagem.species}`;
  modalOrigin.textContent   = `Origin: ${personagem.origin.name}`;
  modalLocation.textContent = `Last known location: ${personagem.location.name}`;

  modal.hidden = false;
}

function fecharModal() {
  modal.hidden = true;
}

modalClose.addEventListener("click", fecharModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) fecharModal();
});


// =============================================================================
// LOADER
// =============================================================================

function showLoader() {
  overlay.hidden = false;
  document.body.classList.add("carregando");
}

function hideLoader() {
  overlay.hidden = true;
  document.body.classList.remove("carregando");
}


// =============================================================================
// OBSERVERS
// =============================================================================

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${delayContador * 100}ms`;
      entry.target.classList.add("visivel");

      delayContador++;
      cardObserver.unobserve(entry.target);

      setTimeout(() => { delayContador = 0; }, 100);
    }
  });
}, { threshold: 0.1 });

const scrollObserver = new IntersectionObserver((entries) => {
  const entry = entries[0];

  if (entry.isIntersecting && !document.body.classList.contains("carregando") && proximaUrl) {
    carregarMais();
  }
}, { rootMargin: "300px" });

scrollObserver.observe(sentinel);


// =============================================================================
// CARDS
// =============================================================================

function criarCard(personagem) {
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.src = personagem.image;
  img.alt = personagem.name;

  // Dados do personagem removidos do card — exibidos apenas no modal ao clicar
  card.append(img);
  container.appendChild(card);

  cardObserver.observe(card);

  card.addEventListener("mouseenter", (e) => showTooltip(e, "Clique para detalhes do personagem"));
  card.addEventListener("mousemove", moveTooltip);
  card.addEventListener("mouseleave", hideTooltip);

  card.addEventListener("click", () => abrirModal(personagem));
}


// =============================================================================
// UTILITÁRIOS
// =============================================================================

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function limparContainer() {
  container.innerHTML = "";
}

function mostrarMensagem(texto) {
  const p = document.createElement("p");
  p.textContent = texto;
  container.appendChild(p);
}


// =============================================================================
// FETCH / LÓGICA DE DADOS
// =============================================================================

/**
 * Função central de carregamento.
 *
 * CORREÇÃO 1 — res.ok:
 *   Antes, apenas o bloco catch tratava erros. Mas erros HTTP como 404
 *   (personagem não encontrado) NÃO lançam exceção — o fetch retorna
 *   normalmente com status 404. Isso fazia a API retornar uma resposta de
 *   erro sem o header CORS, o que o navegador interpretava como bloqueio
 *   de CORS. Agora checamos res.ok antes de tentar parsear o JSON.
 *
 * @param {string}  url         - Endpoint da API a ser consumido.
 * @param {boolean} isNewSearch - Se true, limpa o container antes de inserir os resultados.
 */
async function carregarDados(url, isNewSearch = false) {
  try {
    if (isNewSearch) limparContainer();
    showLoader();

    const [res] = await Promise.all([
      fetch(url),
      delay(800)
    ]);

    // CORREÇÃO 1: Verifica se a resposta HTTP foi bem-sucedida (status 200–299).
    // Sem isso, um 404 passava direto para res.json() e causava o falso erro de CORS.
    if (!res.ok) {
      hideLoader();
      proximaUrl = null; // Garante que o scroll infinito não tente recarregar
      if (isNewSearch) mostrarMensagem("No characters found.");
      return; // Encerra a função sem tentar parsear a resposta de erro
    }

    const data = await res.json();
    hideLoader();

    if (data.results) {
      data.results.forEach(p => criarCard(p));
      proximaUrl = data.info.next;
    } else {
      if (isNewSearch) mostrarMensagem("No characters found.");
      proximaUrl = null;
    }

  } catch (err) {
    // Captura erros reais de rede (sem conexão, timeout, etc.)
    hideLoader();
    proximaUrl = null;
    if (isNewSearch) {
      limparContainer();
      mostrarMensagem("Failed to load characters.");
    }
  }
}

// CORREÇÃO 2 — URL padronizada com "?" antes dos query params:
// A URL original usava "character?page=" (sem barra antes do ?).
// Padronizamos para "character/?page=" igual às demais funções.
// Inconsistência de URL pode gerar redirecionamentos que perdem o header CORS.
const carregarPersonagens = () =>
  carregarDados(`https://rickandmortyapi.com/api/character/?page=${pagina}`, true);

const carregarMais = () =>
  proximaUrl && carregarDados(proximaUrl, false);

// CORREÇÃO 3 — Limpar proximaUrl antes de iniciar uma nova busca:
// Sem isso, o scrollObserver podia disparar carregarMais() usando a URL
// da página anterior (ex.: "page=6&name=rick"), que é inválida e retorna
// 404 — gerando o falso erro de CORS que você estava vendo no console.
const buscarPersonagem = (termo) => {
  proximaUrl = null; // Invalida qualquer paginação anterior antes de buscar
  return carregarDados(`https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(termo)}`, true);
  //                                                                  ↑ encodeURIComponent garante que
  //                                                                    nomes com espaços ou acentos
  //                                                                    sejam codificados corretamente na URL
};


// =============================================================================
// EVENTOS
// =============================================================================

/**
 * Busca com debounce:
 * Aguarda 500ms após o usuário parar de digitar antes de disparar a requisição.
 */
searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  const termo = e.target.value.trim();

  debounceTimer = setTimeout(() => {
    if (termo === "") {
      pagina = 1;
      carregarPersonagens();
    } else {
      buscarPersonagem(termo);
    }
  }, 500);
});


// =============================================================================
// INICIALIZAÇÃO
// =============================================================================

carregarPersonagens();