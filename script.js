const container = document.getElementById("cards-container");

async function carregarPersonagens() {
  const ids = Array.from({ length: 100 }, (_, i) => i + 1).join(",");
  let data;
  try {
    const response = await fetch(`https://rickandmortyapi.com/api/character/${ids}`);
    data = await response.json();
  } catch (err) {
    console.error("Erro de rede:", err.message);
    return;
  }

  data.forEach((personagem, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.style.animationDelay = `${index * 50}ms`;

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
  });
}

carregarPersonagens();