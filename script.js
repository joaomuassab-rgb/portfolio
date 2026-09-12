document.addEventListener("DOMContentLoaded", () => {
  renderProjetos();
  animarTerminal();
  ativarScrollReveal();
  ativarMenuMobile();
});

/* =========================================================
   MENU MOBILE — abre/fecha o dropdown do hamburguer
========================================================= */
function ativarMenuMobile() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const aberto = links.classList.toggle("open");
    toggle.classList.toggle("open", aberto);
    toggle.setAttribute("aria-expanded", aberto ? "true" : "false");
  });

  // fecha o menu ao clicar em qualquer link
  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* =========================================================
   PROJETOS — busca projects.json e renderiza os cards
========================================================= */
function renderProjetos() {
  const container = document.getElementById("lista-projetos");
  if (!container) {
    console.error("Não achei #lista-projetos no HTML");
    return;
  }

  fetch("./projects.json")
    .then((res) => {
      if (!res.ok) throw new Error("projects.json não carregou");
      return res.json();
    })
    .then((projetos) => {
      container.innerHTML = "";
      container.className = "projetos-accordion";

      projetos.forEach((p) => {
        const card = document.createElement("div");
        card.className = "accordion-card reveal";

        const tags = (p.tecnologias || [])
          .map((t) => `<span class="tag">${t}</span>`)
          .join("");

        const linkGithub =
          p.github && p.github !== "#"
            ? `<a class="btn" href="${p.github}" target="_blank" rel="noopener">GitHub</a>`
            : "";
        const linkDemo =
          p.demo && p.demo !== "#"
            ? `<a class="btn" href="${p.demo}" target="_blank" rel="noopener">Demo</a>`
            : "";

        const imagemHtml = p.imagem
          ? `<img src="${p.imagem}" alt="Captura de tela do projeto ${p.titulo}">`
          : "";

        card.innerHTML = `
          <div class="accordion-bg">${imagemHtml}</div>
          <div class="accordion-overlay"></div>
          <span class="accordion-titulo-vertical">${p.titulo}</span>
          <div class="accordion-conteudo">
            <h3>${p.titulo}</h3>
            <p>${p.descricao}</p>
            <div class="tag-list">${tags}</div>
            <div class="botoes">${linkGithub}${linkDemo}</div>
          </div>
        `;

        container.appendChild(card);
      });

      ativarScrollReveal();
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML = `<p style="color:#9aa2ab;">Erro ao carregar projetos: ${err.message}</p>`;
    });
}

/* =========================================================
   TERMINAL — efeito de "digitação" do perfil em JS
========================================================= */
function animarTerminal() {
  const el = document.getElementById("terminal-code");
  if (!el) return;

  const linhas = [
    { punct: "const", key: " dev", punct2: " = {" },
    { key: "  nome", punct: ": ", str: '"João Lucas",' },
    { key: "  foco", punct: ": ", str: '"interfaces modernas e minimalistas",' },
    { key: "  status", punct: ": ", str: '"em busca de estágio"' },
    { punct: "}" },
  ];

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    el.innerHTML = linhas
      .map(
        (l) =>
          `${l.punct ? `<span class="punct">${l.punct}</span>` : ""}${
            l.key ? `<span class="key">${l.key}</span>` : ""
          }${l.punct ? "" : ""}${l.str ? `<span class="punct">: </span><span class="str">${l.str}</span>` : ""}${
            l.punct2 ? `<span class="punct">${l.punct2}</span>` : ""
          }`
      )
      .join("\n");
    return;
  }

  let linhaAtual = 0;
  let charAtual = 0;
  let textoMontado = "";

  function proximoCaractere() {
    if (linhaAtual >= linhas.length) return;

    const l = linhas[linhaAtual];
    const textoCompleto =
      (l.punct || "") + (l.key || "") + (l.punct2 || "") + (l.str ? ": " + l.str : "");

    if (charAtual < textoCompleto.length) {
      charAtual++;
      const parcial = textoCompleto.slice(0, charAtual);
      el.innerHTML = destacarLinhasAnteriores() + parcial;
      setTimeout(proximoCaractere, 18 + Math.random() * 22);
    } else {
      textoMontado += formatarLinha(l) + "\n";
      linhaAtual++;
      charAtual = 0;
      setTimeout(proximoCaractere, 120);
    }
  }

  function destacarLinhasAnteriores() {
    return textoMontado;
  }

  function formatarLinha(l) {
    let out = "";
    if (l.punct) out += `<span class="punct">${l.punct}</span>`;
    if (l.key) out += `<span class="key">${l.key}</span>`;
    if (l.punct2) out += `<span class="punct">${l.punct2}</span>`;
    if (l.str) out += `<span class="punct">: </span><span class="str">${l.str}</span>`;
    return out;
  }

  proximoCaractere();
}

/* =========================================================
   SCROLL REVEAL — IntersectionObserver para elementos .reveal
========================================================= */
function ativarScrollReveal() {
  const alvos = document.querySelectorAll(".reveal:not(.show)");
  if (!alvos.length) return;

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("show");
          observer.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  alvos.forEach((el) => observer.observe(el));
}