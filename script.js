"use strict";

const container   = document.getElementById("cards-container");
const overlay     = document.getElementById("overlay");
const loadMoreBtn = document.getElementById("load-more");
const searchInput = document.getElementById("search");
const footer      = document.querySelector("footer"); // Referência para o scroll

const modal       = document.getElementById("modal");
const modalImg    = document.getElementById("modal-img");
const modalName   = document.getElementById("modal-name");
const modalStatus = document.getElementById("modal-status");
const modalOrigin = document.getElementById("modal-origin");
const modalLocation = document.getElementById("modal-location");
const modalClose  = document.getElementById("modal-close");
const tooltip = document.getElementById("tooltip");

function showTooltip(e, message) {
  tooltip.textContent = message;
  tooltip.hidden = false;
  tooltip.style.left = (e.clientX + 140) + "px";
  tooltip.style.top = (e.clientY + 30) + "px";
}

function moveTooltip(e) {
  tooltip.style.left = (e.clientX + 140) + "px";
  tooltip.style.top = (e.clientY + 30) + "px";
}

function hideTooltip() {
  tooltip.hidden = true;
}

// Exemplo: adicionar tooltip em cada card
function criarCard(personagem) {
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.src = personagem.image;
  img.alt = personagem.name;

  const info = document.createElement("div");
  info.className = "card-info";

  const nome = document.createElement("h2");
  nome.textContent = personagem.name;

  const status = document.createElement("p");
  status.textContent = `${personagem.status} — ${personagem.species}`;

  const origem = document.createElement("p");
  origem.textContent = personagem.origin.name;

  info.append(nome, status, origem);
  card.append(img, info);
  container.appendChild(card);

  cardObserver.observe(card);

  // Tooltip ao passar o mouse
  card.addEventListener("mouseenter", (e) => showTooltip(e, "Clique para detalhes do personagem"));
  card.addEventListener("mousemove", moveTooltip);
  card.addEventListener("mouseleave", hideTooltip);

  // Modal ao clicar
  card.addEventListener("click", () => abrirModal(personagem));
}


function abrirModal(personagem) {
  modalImg.src = personagem.image;
  modalImg.alt = personagem.name;
  modalName.textContent = personagem.name;
  modalStatus.textContent = `${personagem.status} — ${personagem.species}`;
  modalOrigin.textContent = `Origin: ${personagem.origin.name}`;
  modalLocation.textContent = `Last known location: ${personagem.location.name}`;
  
  modal.hidden = false;
}

function fecharModal() {
  modal.hidden = true;
}

modalClose.addEventListener("click", fecharModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) fecharModal(); // fecha clicando fora
});


let proximaUrl = null;
let pagina = 1;
let debounceTimer = null;
let delayContador = 0; // Contador para delay incremental dos cards

// ====================== OBSERVERS ======================

// 1. Observer para animar os cards quando entrarem na tela
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Aplica um delay incremental apenas para o lote que entrou junto
      entry.target.style.transitionDelay = `${delayContador * 100}ms`;
      entry.target.classList.add("visivel");
      
      delayContador++;
      cardObserver.unobserve(entry.target);

      // Reseta o contador após um curto período para o próximo lote/scroll
      setTimeout(() => { delayContador = 0; }, 100);
    }
  });
}, { threshold: 0.1 });

// 2. Observer para Infinite Scroll (observa o footer)
const scrollObserver = new IntersectionObserver((entries) => {
  const entry = entries[0];
  // Se o footer aparecer, não estiver carregando e houver próxima página
  if (entry.isIntersecting && !document.body.classList.contains("carregando") && proximaUrl) {
    carregarMais();
  }
}, { rootMargin: "300px" }); // Carrega 300px antes de chegar ao fim

// Inicia a observação do scroll
scrollObserver.observe(footer);


// ====================== UTIL ======================

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

// ====================== LOADER ======================

function showLoader() {
  overlay.hidden = false;
  document.body.classList.add("carregando");
}

function hideLoader() {
  overlay.hidden = true;
  document.body.classList.remove("carregando");
}


// ====================== CARD ======================
/*
function criarCard(personagem) {
  const card = document.createElement("div");
  card.className = "card";

  // Imagem
  const img = document.createElement("img");
  img.src = personagem.image;
  img.onerror = () => img.src = "https://via.placeholder.com/300x300?text=No+Image";

  // Conteúdo
  const info = document.createElement("div");
  info.className = "card-info";

  const nome = document.createElement("h2");
  nome.textContent = personagem.name;

  const status = document.createElement("p");
  status.textContent = `${personagem.status} — ${personagem.species}`;

  const origem = document.createElement("p");
  origem.textContent = personagem.origin.name;

  info.append(nome, status, origem);
  card.append(img, info);
  container.appendChild(card);

  // Ativa o observer para este novo card
  cardObserver.observe(card);

  card.addEventListener("click", () => abrirModal(personagem));

}
  */


// ====================== FETCH LOGIC ======================

async function carregarDados(url, isNewSearch = false) {
  try {
    if (isNewSearch) limparContainer();
    showLoader();

    const [res] = await Promise.all([
      fetch(url),
      delay(800)
    ]);

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
    hideLoader();
    if (isNewSearch) {
      limparContainer();
      mostrarMensagem("Failed to load characters.");
    }
  }
}

// Funções de gatilho
const carregarPersonagens = () => carregarDados(`https://rickandmortyapi.com/api/character?page=${pagina}`, true);
const carregarMais = () => proximaUrl && carregarDados(proximaUrl, false);
const buscarPersonagem = (termo) => carregarDados(`https://rickandmortyapi.com/api/character/?name=${termo}`, true);


// ====================== EVENTS ======================

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


// ====================== INIT ======================

carregarPersonagens();