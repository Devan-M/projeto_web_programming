const container = document.getElementById("cards-container");
const searchInput = document.getElementById("search");
const loadMoreBtn = document.getElementById("load-more");

let inicio = 1; // primeiro ID
const quantidade = 14; // quantos personagens por vez
let fim = quantidade;

// Função para criar card
function criarCard(personagem, index) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.style.animationDelay = `${index * 100}ms`;

  const img = document.createElement("img");
  img.src = personagem.image;
  img.alt = personagem.name;

  const nome = document.createElement("h2");
  nome.textContent = personagem.name;

  const status = document.createElement("p");
  status.classList.add(`status-${personagem.status.toLowerCase()}`);
  status.textContent = `${personagem.status} — ${personagem.species}`;

  const origem = document.createElement("p");
  origem.textContent = `Origem: ${personagem.origin.name}`;

  card.appendChild(img);
  card.appendChild(nome);
  card.appendChild(status);
  card.appendChild(origem);

  container.appendChild(card);
}

// Função para carregar personagens em blocos de 14
async function carregarPersonagens() {
  try {
    const ids = Array.from({ length: quantidade }, (_, i) => inicio + i).join(",");
    const response = await fetch(`https://rickandmortyapi.com/api/character/${ids}`);
    const data = await response.json();

    data.forEach((personagem, index) => criarCard(personagem, index));

    // Atualiza intervalo para próxima carga
    inicio += quantidade;
    fim += quantidade;

    // Mostra botão após primeira carga
    loadMoreBtn.style.display = "block";

    // Esconde botão se passar do total de personagens (826 na API)
    if (inicio > 826) {
      loadMoreBtn.style.display = "none";
    }
  } catch (err) {
    console.error("Erro de rede:", err.message);
  }
}

// Evento de busca
searchInput.addEventListener("input", (e) => {
  const termo = e.target.value.toLowerCase();
  document.querySelectorAll(".card").forEach(card => {
    const nome = card.querySelector("h2").textContent.toLowerCase();
    card.style.display = nome.includes(termo) ? "block" : "none";
  });
});

// Evento de carregar mais
loadMoreBtn.addEventListener("click", () => {
  carregarPersonagens();
});

// Carregar primeiros 14 personagens
carregarPersonagens();