"use strict";

const container   = document.getElementById("cards-container");
const overlay     = document.getElementById("overlay");
const loadMoreBtn = document.getElementById("load-more");
const searchInput = document.getElementById("search");

const QUANTIDADE = 10;
let inicio = 1;
let debounceTimer = null;

// ====================== UTIL ======================
function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function limparContainer() {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function mostrarMensagem(texto) {
  const p = document.createElement("p");
  p.textContent = texto;
  container.appendChild(p);
}

// ====================== LOADER CONTROL ======================
function showLoader() {
  overlay.hidden = false;
  document.body.classList.add("carregando");
  loadMoreBtn.hidden = true;
}

function hideLoader() {
  overlay.hidden = true;
  document.body.classList.remove("carregando");
}

// ====================== CARD ======================
function criarCard(personagem, index = 0) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.transitionDelay = `${index * 70}ms`;

  const img = document.createElement("img");
  img.src = personagem.image;

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

  requestAnimationFrame(() => {
    requestAnimationFrame(() => card.classList.add("visivel"));
  });
}

// ====================== LOAD INITIAL ======================
async function carregarPersonagens() {
  try {
    limparContainer();
    showLoader();

    const ids = Array.from({ length: QUANTIDADE }, (_, i) => inicio + i).join(",");

    const [res] = await Promise.all([
      fetch(`https://rickandmortyapi.com/api/character/${ids}`),
      delay(2000)
    ]);

    const data = await res.json();

    hideLoader();

    const lista = Array.isArray(data) ? data : [data];
    lista.forEach((p, i) => criarCard(p, i));

    inicio += QUANTIDADE;
    loadMoreBtn.hidden = false;
  } catch (err) {
    hideLoader();
    limparContainer();
    mostrarMensagem("Failed to load characters.");
  }
}

// ====================== LOAD MORE ======================
async function carregarMais() {
  try {
    showLoader();

    const ids = Array.from({ length: QUANTIDADE }, (_, i) => inicio + i).join(",");

    const [res] = await Promise.all([
      fetch(`https://rickandmortyapi.com/api/character/${ids}`),
      delay(2000)
    ]);

    const data = await res.json();

    hideLoader();

    const lista = Array.isArray(data) ? data : [data];
    lista.forEach((p, i) => criarCard(p, i));

    inicio += QUANTIDADE;
    loadMoreBtn.hidden = false;
  } catch (err) {
    hideLoader();
    loadMoreBtn.hidden = false;
  }
}

// ====================== SEARCH ======================
async function buscarPersonagem(termo) {
  if (!termo) {
    inicio = 1;
    return carregarPersonagens();
  }

  try {
    limparContainer();
    showLoader();

    const [res] = await Promise.all([
      fetch(`https://rickandmortyapi.com/api/character/?name=${termo}`),
      delay(1500)
    ]);

    const data = await res.json();

    hideLoader();

    if (data.results) {
      data.results.forEach((p, i) => criarCard(p, i));
    } else {
      mostrarMensagem("No characters found.");
    }

    loadMoreBtn.hidden = true;
  } catch (err) {
    hideLoader();
    limparContainer();
    mostrarMensagem("No characters found.");
    loadMoreBtn.hidden = true;
  }
}

// ====================== EVENTS ======================
loadMoreBtn.addEventListener("click", carregarMais);

searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    buscarPersonagem(e.target.value.trim());
  }, 400);
});

// ====================== INIT ======================
carregarPersonagens();