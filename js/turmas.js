const serie = localStorage.getItem("serieSelecionada");

if (!serie) {
  window.location.href = "index.html";
}

// título dinâmico
const titulo = document.getElementById("tituloSerie");
titulo.textContent = `Série selecionada: ${serie.replace("ano", "º Ano")}`;

// clique na turma
document.querySelectorAll(".turmas button").forEach(botao => {
  botao.addEventListener("click", () => {
    const turma = botao.dataset.turma;

    const caminho = `series/${serie}/${turma}/index.html`;
    window.location.href = caminho;
  });
});
