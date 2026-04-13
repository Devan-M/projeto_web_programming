const container = document.getElementById("cards-container");

async function carregarHerois() {
  const ids = [1, 2, 3, 4, 5]; // IDs de heróis
  for (const id of ids) {
    const response = await fetch(`/api/proxy?id=${id}`);
    const hero = await response.json();

    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    img.src = hero.image.url;
    img.alt = hero.name;

    const nome = document.createElement("h2");
    nome.textContent = hero.name;

    const poder = document.createElement("p");
    poder.textContent = `Força: ${hero.powerstats.strength}`;

    card.appendChild(img);
    card.appendChild(nome);
    card.appendChild(poder);

    container.appendChild(card);
  }
}

carregarHerois();