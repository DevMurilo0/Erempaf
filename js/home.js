document.querySelectorAll(".series button").forEach(botao => {
  botao.addEventListener("click", () => {
    const serie = botao.dataset.serie;

    localStorage.setItem("serieSelecionada", serie);

    window.location.href = "turmas.html";
  });
});


// menu mobile
const btnMenu = document.getElementById("menuToggle");
const menuMobile = document.getElementById("menuMobile");

btnMenu.addEventListener("click", () => {
  menuMobile.classList.toggle("open");
});
