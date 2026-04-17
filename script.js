"use strict"; 
// Ativa o modo estrito do JavaScript
// Evita erros silenciosos e torna o código mais seguro

const container   = document.getElementById("cards-container");
// Pega o container onde os cards serão inseridos

const overlay     = document.getElementById("overlay");
// Pega o elemento do loader (overlay de carregamento)

const loadMoreBtn = document.getElementById("load-more");
// Botão de "carregar mais personagens"

const searchInput = document.getElementById("search");
// Input de busca de personagens

const QUANTIDADE = 10;
// Define quantos personagens serão carregados por vez

let inicio = 1;
// Controla o ID inicial da busca (paginação manual por ID)

let debounceTimer = null;
// Timer usado para evitar chamadas excessivas na busca (debounce)


// ====================== UTIL ======================

function delay(ms) {
  // Cria uma promessa que espera um tempo (ms)
  return new Promise(r => setTimeout(r, ms));
}

function limparContainer() {
  // Remove todos os elementos filhos do container
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function mostrarMensagem(texto) {
  // Mostra uma mensagem simples no container
  const p = document.createElement("p");
  p.textContent = texto;
  container.appendChild(p);
}


// ====================== LOADER CONTROL ======================

function showLoader() {
  // Exibe o overlay de carregamento
  overlay.hidden = false;

  // Adiciona classe no body para possíveis estilos (ex: bloquear scroll)
  document.body.classList.add("carregando");

  // Esconde botão de carregar mais enquanto carrega
  loadMoreBtn.hidden = true;
}

function hideLoader() {
  // Oculta o overlay de carregamento
  overlay.hidden = true;

  // Remove classe de carregamento do body
  document.body.classList.remove("carregando");
}


// ====================== CARD ======================

function criarCard(personagem, index = 0) {
  // Cria um card para um personagem

  const card = document.createElement("div");
  // Cria elemento div principal do card

  card.className = "card";
  // Aplica classe CSS do card

  card.style.transitionDelay = `${index * 70}ms`;
  // Cria efeito em cascata (animação escalonada)

  const img = document.createElement("img");
  // Cria imagem do personagem

  img.src = personagem.image;
  // Define URL da imagem

  const info = document.createElement("div");
  // Container de informações do card

  info.className = "card-info";
  // Classe para estilização

  const nome = document.createElement("h2");
  // Nome do personagem

  nome.textContent = personagem.name;
  // Define texto do nome

  const status = document.createElement("p");
  // Status + espécie

  status.textContent = `${personagem.status} — ${personagem.species}`;
  // Monta string de status

  const origem = document.createElement("p");
  // Origem do personagem

  origem.textContent = personagem.origin.name;
  // Define origem

  info.append(nome, status, origem);
  // Adiciona textos dentro do container info

  card.append(img, info);
  // Monta o card completo

  container.appendChild(card);
  // Insere card no DOM

  requestAnimationFrame(() => {
    // Aguarda próximo frame de renderização

    requestAnimationFrame(() => card.classList.add("visivel"));
    // Adiciona classe para ativar animação (efeito suave)
  });
}


// ====================== LOAD INITIAL ======================

async function carregarPersonagens() {
  // Função principal de carregamento inicial

  try {
    limparContainer();
    // Limpa os cards antigos

    showLoader();
    // Mostra loader

    const ids = Array.from({ length: QUANTIDADE }, (_, i) => inicio + i).join(",");
    // Cria lista de IDs para buscar múltiplos personagens

    const [res] = await Promise.all([
      fetch(`https://rickandmortyapi.com/api/character/${ids}`),
      delay(2000)
      // Simula delay para garantir que o loader seja visível
    ]);

    const data = await res.json();
    // Converte resposta em JSON

    hideLoader();
    // Esconde loader após carregamento

    const lista = Array.isArray(data) ? data : [data];
    // Garante que sempre será um array

    lista.forEach((p, i) => criarCard(p, i));
    // Cria cards dos personagens

    inicio += QUANTIDADE;
    // Avança paginação manual

    loadMoreBtn.hidden = false;
    // Mostra botão de carregar mais

  } catch (err) {
    // Captura erros de rede ou API

    hideLoader();
    // Garante que loader seja escondido

    limparContainer();
    // Limpa conteúdo da tela

    mostrarMensagem("Failed to load characters.");
    // Mostra erro amigável
  }
}


// ====================== LOAD MORE ======================

async function carregarMais() {
  // Carrega próxima "página" de personagens

  try {
    showLoader();
    // Mostra loader

    const ids = Array.from({ length: QUANTIDADE }, (_, i) => inicio + i).join(",");
    // Gera próximos IDs

    const [res] = await Promise.all([
      fetch(`https://rickandmortyapi.com/api/character/${ids}`),
      delay(2000)
      // Mantém UX consistente com delay
    ]);

    const data = await res.json();
    // Converte resposta

    hideLoader();
    // Esconde loader

    const lista = Array.isArray(data) ? data : [data];
    // Garante array

    lista.forEach((p, i) => criarCard(p, i));
    // Cria novos cards

    inicio += QUANTIDADE;
    // Atualiza paginação

    loadMoreBtn.hidden = false;
    // Reexibe botão

  } catch (err) {
    // Tratamento de erro

    hideLoader();
    // Esconde loader mesmo com erro

    loadMoreBtn.hidden = false;
    // Garante botão visível
  }
}


// ====================== SEARCH ======================

async function buscarPersonagem(termo) {
  // Busca personagem por nome

  if (!termo) {
    // Se campo vazio

    inicio = 1;
    // Reseta paginação

    return carregarPersonagens();
    // Recarrega lista inicial
  }

  try {
    limparContainer();
    // Limpa cards

    showLoader();
    // Mostra loader

    const [res] = await Promise.all([
      fetch(`https://rickandmortyapi.com/api/character/?name=${termo}`),
      delay(1500)
      // Delay para UX consistente
    ]);

    const data = await res.json();
    // Converte resposta

    hideLoader();
    // Esconde loader

    if (data.results) {
      // Se encontrou resultados

      data.results.forEach((p, i) => criarCard(p, i));
      // Cria cards

    } else {
      // Se não encontrou

      mostrarMensagem("No characters found.");
      // Mensagem de vazio
    }

    loadMoreBtn.hidden = true;
    // Esconde botão na busca

  } catch (err) {
    // Erro na busca

    hideLoader();
    // Esconde loader

    limparContainer();
    // Limpa tela

    mostrarMensagem("No characters found.");
    // Mensagem de erro

    loadMoreBtn.hidden = true;
    // Esconde botão
  }
}


// ====================== EVENTS ======================

loadMoreBtn.addEventListener("click", carregarMais);
// Evento do botão carregar mais

searchInput.addEventListener("input", (e) => {
  // Evento de digitação na busca

  clearTimeout(debounceTimer);
  // Cancela chamada anterior (debounce)

  debounceTimer = setTimeout(() => {
    // Aguarda o usuário parar de digitar

    buscarPersonagem(e.target.value.trim());
    // Executa busca
  }, 400);
});


// ====================== INIT ======================

carregarPersonagens();
// Inicializa carregamento ao abrir a página