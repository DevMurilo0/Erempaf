function acessar() {
  const serie = document.getElementById("serie").value;
  const turma = document.getElementById("turma").value;

  if (!serie || !turma) {
    alert("Selecione a série e a turma!");
    return;
  }

  // depois você ajusta os caminhos
  window.location.href = `/series/${serie}/${turma}/index.html`;
}