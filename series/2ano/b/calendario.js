import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  deleteField
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const auth = getAuth();

const telaLogin = document.getElementById("tela-login");
const btnLogin = document.getElementById("btn-login");
const emailInput = document.getElementById("login-email");
const senhaInput = document.getElementById("login-senha");
const erroLogin = document.getElementById("login-erro");

// observa estado de login
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.usuarioLogado = user;
    telaLogin.classList.add("hidden");
  } else {
    window.usuarioLogado = null;
    telaLogin.classList.remove("hidden");
  }
});

// botão entrar
btnLogin.onclick = async () => {
  erroLogin.textContent = "";

  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      emailInput.value,
      senhaInput.value
    );

    window.usuarioLogado = cred.user;
    telaLogin.classList.add("hidden");
  } catch (e) {
    erroLogin.textContent = "Email ou senha inválidos";
  }
};




const campoAvisos = document.getElementById("campo-avisos");



/* ======================
   CONFIGURAÇÃO DA SALA
====================== */
const SERIE = "2ano";
const TURMA = "b";
const SALA_ID = `${SERIE}-${TURMA}`;

let modoEdicao = false;



const SENHA_EDICAO = "1234";

const diasContainer = document.getElementById("dias");
const mesAnoSpan = document.getElementById("mes-ano");
const btnEditar = document.getElementById("btn-editar");
const btnSalvar = document.getElementById("btn-salvar");

let dataAtual = new Date();


const painelDetalhes = document.getElementById("painel-detalhes");
const campoDetalhes = document.getElementById("campo-detalhes");
const tituloDetalhes = document.getElementById("titulo-detalhes");
const fecharDetalhes = document.getElementById("fechar-detalhes");

campoDetalhes.addEventListener("input", async () => {
  if (!modoEdicao || !diaDetalheAtual) return;

  const mesAno = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`;

  const dados = {
    detalhes: {
      [diaDetalheAtual]: campoDetalhes.value.trim()
    }
  };

  await setDoc(
    doc(window.db, "salas", SALA_ID, "calendario", mesAno),
    dados,
    { merge: true }
  );
});


let diaDetalheAtual = null;


/* ======================
   RENDERIZA CALENDÁRIO
====================== */
function renderizarCalendario() {
  diasContainer.innerHTML = "";

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();

  mesAnoSpan.textContent = dataAtual.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  const ultimoDia = new Date(ano, mes + 1, 0).getDate();

  // 🔹 dia da semana do dia 1 (0=dom, 1=seg...)
const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
// 1 = segunda, 5 = sexta → offset = dia - 1
let offset = 0;

if (primeiroDiaSemana >= 1 && primeiroDiaSemana <= 5) {
  offset = primeiroDiaSemana - 1;
}


  // 🔹 cria espaços vazios antes do primeiro dia útil
  for (let i = 0; i < offset; i++) {
    const vazio = document.createElement("div");
    vazio.className = "dia vazio";
    diasContainer.appendChild(vazio);
  }

  // 🔹 cria os dias do mês
  for (let dia = 1; dia <= ultimoDia; dia++) {
    const data = new Date(ano, mes, dia);
    const diaSemana = data.getDay(); // 0 dom ... 6 sáb

    // somente dias úteis (seg a sex)
    if (diaSemana >= 1 && diaSemana <= 5) {
      const div = document.createElement("div");
    div.className = "dia";

    const hoje = new Date();
    if (
        dia === hoje.getDate() &&
        mes === hoje.getMonth() &&
        ano === hoje.getFullYear()
) {
  div.classList.add("hoje");
}


      const dataISO = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

        div.innerHTML = `
            <div class="topo-dia">
            <span class="numero">${dia}</span>
            <span class="info" data-dia="${dataISO}" title="Ver detalhes">ℹ️</span>
            </div>
            <textarea data-dia="${dataISO}" disabled placeholder=""></textarea>
        `;


      diasContainer.appendChild(div);
    }
  }

  document.querySelectorAll(".info").forEach(icon => {
  icon.onclick = async () => {
    diaDetalheAtual = icon.dataset.dia;

    tituloDetalhes.textContent = `Detalhes do dia ${diaDetalheAtual.split("-").reverse().join("/")}`;
    campoDetalhes.value = "";
    campoDetalhes.disabled = !modoEdicao;

    painelDetalhes.classList.remove("hidden");

    await carregarDetalhesDia(diaDetalheAtual);
  };
});

}




/* ======================
   SALVAR NO FIRESTORE
====================== */
async function salvarCalendario() {
  const mesAno = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`;
  const dados = {};

  // dias do calendário
  document.querySelectorAll("[data-dia]").forEach(el => {
    const dia = el.dataset.dia;

    if (el.value.trim()) {
      dados[dia] = el.value.trim();
    } else {
      dados[dia] = deleteField();
    }
  });

  // avisos
  if (campoAvisos.value.trim()) {
    dados.avisos = campoAvisos.value.trim();
  } else {
    dados.avisos = deleteField();
  }

  if (!window.usuarioLogado) {
    alert("⚠️ Você precisa estar logado para salvar.");
    return;
  }
  
// 🔹 salvar detalhes do dia (CORRETO)
if (diaDetalheAtual) {
  dados.detalhes = {};

  if (campoDetalhes.value.trim()) {
    dados.detalhes[diaDetalheAtual] = campoDetalhes.value.trim();
  } else {
    dados.detalhes[diaDetalheAtual] = deleteField();
  }
}






  await setDoc(
    doc(window.db, "salas", SALA_ID, "calendario", mesAno),
    dados,
    { merge: true }
  );

  alert("✅ Dados salvos com sucesso!");
}


/* ======================
   CARREGAR DO FIRESTORE
====================== */
async function carregarCalendario() {
  const mesAno = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`;

  const ref = doc(window.db, "salas", SALA_ID, "calendario", mesAno);
  const snap = await getDoc(ref);

  campoAvisos.value = "";

  if (!snap.exists()) return;

  const dados = snap.data();

  // carregar avisos
  if (dados.avisos) {
    campoAvisos.value = dados.avisos;
  }

  // carregar dias
  document.querySelectorAll("[data-dia]").forEach(el => {
    el.value = dados[el.dataset.dia] || "";
  });
}


async function carregarDetalhesDia(diaISO) {
  const mesAno = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`;

  const ref = doc(window.db, "salas", SALA_ID, "calendario", mesAno);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const dados = snap.data();

  if (dados.detalhes && dados.detalhes[diaISO]) {
    campoDetalhes.value = dados.detalhes[diaISO];
  }
}


/* ======================
   CONTROLE DE EDIÇÃO
====================== */
btnEditar.onclick = () => {
  const senha = prompt("Digite a senha para editar:");
  if (senha === SENHA_EDICAO) {
    modoEdicao = true;
    atualizarEdicao();
  } else {
    alert("Senha incorreta!");
  }
};

btnSalvar.onclick = async () => {
  try {
    await salvarCalendario();
  } catch (e) {
    console.error("Erro ao salvar:", e);
    alert("❌ Erro ao salvar no Firebase");
  }

  // 🔒 desativa edição SEMPRE
  document.querySelectorAll("textarea").forEach(t => {
    t.disabled = true;
  });

  // 🔁 volta botão para Editar SEMPRE
  btnSalvar.hidden = true;
  btnEditar.hidden = false;

  // 🔄 recarrega dados
  await carregarCalendario();
};




function atualizarEdicao() {
  document.querySelectorAll("textarea").forEach(t => {
    t.disabled = !modoEdicao;
  });

  campoAvisos.disabled = !modoEdicao;
  btnSalvar.hidden = !modoEdicao;
  btnEditar.hidden = modoEdicao;
}


/* ======================
   NAVEGAÇÃO DE MÊS
====================== */
document.getElementById("mes-anterior").onclick = async () => {
  dataAtual.setMonth(dataAtual.getMonth() - 1);
  renderizarCalendario();
  await carregarCalendario();
};

document.getElementById("mes-proximo").onclick = async () => {
  dataAtual.setMonth(dataAtual.getMonth() + 1);
  renderizarCalendario();
  await carregarCalendario();
};

/* ======================
   INICIALIZAÇÃO
====================== */
const esperarLogin = setInterval(async () => {
  if (window.usuarioLogado) {
    clearInterval(esperarLogin);
    renderizarCalendario();
    await carregarCalendario();
  }
}, 300);


// 🔥 torna acessível ao auth
window.carregarCalendario = carregarCalendario;

document.getElementById("fechar-detalhes").onclick = () => {
  document.getElementById("painel-detalhes").classList.add("hidden");
};


fecharDetalhes.onclick = () => {
  painelDetalhes.classList.add("hidden");
  diaDetalheAtual = null;
};








/* ======================
   MENU LATERAL GLOBAL
====================== */

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}


document.addEventListener("click", (e) => {
  if (
    sidebar?.classList.contains("open") &&
    !sidebar.contains(e.target) &&
    e.target !== menuBtn
  ) {
    sidebar.classList.remove("open");
  }
});


document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
});
