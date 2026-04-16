const container = document.getElementById("cards-container");
const searchInput = document.getElementById("search");
const loadMoreBtn = document.getElementById("load-more");

const QUANTIDADE = 14;
let inicio = 1;
let totalPersonagens = null; // será preenchido dinamicamente pela API
let buscaAtiva = false;
let debounceTimer = null;

// Intersection Observer — anima o card só quando ele entra na tela
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visivel");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// Função para criar card
function criarCard(personagem, index) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("role", "article");
  card.setAttribute("aria-label", `Personagem: ${personagem.name}`);
  card.style.transitionDelay = `${index * 60}ms`;

  const img = document.createElement("img");
  img.src = personagem.image;
  img.alt = personagem.name;

  const nome = document.createElement("h2");
  nome.textContent = personagem.name;

  const status = document.createElement("p");
  const statusKey = personagem.status.toLowerCase();
  status.classList.add(`status-${statusKey}`);
  status.textContent = `${personagem.status} — ${personagem.species}`;

  const origem = document.createElement("p");
  origem.textContent = `Origem: ${personagem.origin.name}`;

  card.appendChild(img);
  card.appendChild(nome);
  card.appendChild(status);
  card.appendChild(origem);

  container.appendChild(card);
  observer.observe(card);
}

// Carrega o total de personagens da API (evita hardcode do 826)
async function carregarTotal() {
  try {
    const response = await fetch("https://rickandmortyapi.com/api/character");
    const data = await response.json();
    totalPersonagens = data.info.count;
  } catch {
    // Fallback: usa o total conhecido caso a requisição inicial falhe
    totalPersonagens = 826;
  }
}

// Carrega personagens em blocos de 14
async function carregarPersonagens() {
  try {
    const ids = Array.from({ length: QUANTIDADE }, (_, i) => inicio + i).join(",");
    const response = await fetch(`https://rickandmortyapi.com/api/character/${ids}`);
    const data = await response.json();

    // A API retorna objeto quando é 1 ID, array quando são vários
    const lista = Array.isArray(data) ? data : [data];
    lista.forEach((personagem, index) => criarCard(personagem, index));

    inicio += QUANTIDADE;

    if (inicio > totalPersonagens) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "block";
    }
  } catch (err) {
    console.error("Erro de rede:", err.message);
    mostrarErro("Não foi possível carregar os personagens. Verifique sua conexão.");
  }
}

// Busca com suporte a paginação de resultados
async function buscarPersonagens(termo) {
  if (!termo) {
    buscaAtiva = false;
    container.innerHTML = "";
    inicio = 1;
    await carregarPersonagens();
    return;
  }

  buscaAtiva = true;
  container.innerHTML = "";
  loadMoreBtn.style.display = "none";

  try {
    let pagina = 1;
    let todasPaginas = [];

    // Busca todas as páginas de resultado para o termo
    while (pagina) {
      const response = await fetch(
        `https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(termo)}&page=${pagina}`
      );
      const data = await response.json();

      if (!data.results) {
        break;
      }

      todasPaginas = todasPaginas.concat(data.results);

      // Se há próxima página, continua; caso contrário, encerra
      pagina = data.info.next ? pagina + 1 : null;
    }

    if (todasPaginas.length > 0) {
      todasPaginas.forEach((personagem, index) => criarCard(personagem, index));
    } else {
      container.innerHTML = "<p style='text-align:center;'>Nenhum personagem encontrado.</p>";
    }
  } catch (err) {
    console.error("Erro na busca:", err.message);
    container.innerHTML = "<p style='text-align:center;'>Nenhum personagem encontrado.</p>";
  }
}

// Exibe mensagem de erro na tela
function mostrarErro(mensagem) {
  const aviso = document.createElement("p");
  aviso.textContent = mensagem;
  aviso.style.color = "#e84040";
  aviso.style.textAlign = "center";
  aviso.style.fontWeight = "bold";
  container.appendChild(aviso);
}

// Busca com debounce de 400ms — evita chamada a cada tecla
searchInput.addEventListener("input", (e) => {
  const termo = e.target.value.trim();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => buscarPersonagens(termo), 400);
});

// Carregar mais (só ativo quando não há busca ativa)
loadMoreBtn.addEventListener("click", () => {
  if (!buscaAtiva) {
    carregarPersonagens();
  }
});

// Inicialização: busca o total e carrega os primeiros personagens
(async () => {
  await carregarTotal();
  carregarPersonagens();
})();