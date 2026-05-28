/* ================================================
   CLUB 21 — script.js
   ================================================ */

/* ================================================
   CONFIGURAÇÃO — EmailJS
   ─────────────────────────────────────────────
   1. Acesse https://www.emailjs.com/ e crie conta grátis
   2. "Add New Service" → conecte seu Gmail → copie SERVICE ID
   3. "Create New Template" → use as variáveis:
      {{to_name}} {{to_email}} {{pedido_itens}}
      {{pedido_total}} {{endereco}} {{data_pedido}}
   4. Copie o TEMPLATE ID
   5. "Account" → "General" → copie a PUBLIC KEY
   ================================================ */

var EMAILJS_PUBLIC_KEY =
  "HutCIUJU3oScnFUWo"; /* Account → General → Public Key  */
var EMAILJS_SERVICE_ID =
  "service_au77b35"; /* Email Services → Service ID     */
var EMAILJS_TEMPLATE_ID =
  "template_d50zlqd"; /* Email Templates → Template ID   */

/* ================================================
   GUIA DE MEDIDAS (cm) — padrão brasileiro
   ================================================ */

var guiaMedidas = {
  PP: {
    busto: "80–83",
    cintura: "60–63",
    quadril: "86–89",
    caimento: "Muito justo",
    barra: 12,
  },
  P: {
    busto: "84–87",
    cintura: "64–67",
    quadril: "90–93",
    caimento: "Justo",
    barra: 28,
  },
  M: {
    busto: "88–91",
    cintura: "68–71",
    quadril: "94–97",
    caimento: "Regular",
    barra: 46,
  },
  G: {
    busto: "92–95",
    cintura: "72–75",
    quadril: "98–101",
    caimento: "Leve folga",
    barra: 62,
  },
  GG: {
    busto: "96–99",
    cintura: "76–79",
    quadril: "102–105",
    caimento: "Folgado",
    barra: 78,
  },
  XGG: {
    busto: "100–104",
    cintura: "80–84",
    quadril: "106–110",
    caimento: "Extra folgado",
    barra: 94,
  },
};

var listaTamanhos = ["PP", "P", "M", "G", "GG", "XGG"];

/* ================================================
   DADOS DOS PRODUTOS
   ================================================ */

var produtosFemininos = [
  {
    id: 1,
    nome: "Jaqueta de Couro",
    preco: 349.9,
    imagem: "imgs/jaquetaf.png",
    imagemHover: null,
    ocasioes: ["Casual", "Noite"],
    estilos: [
      "Vestido slip dress + ankle boot preta",
      "Jeans skinny + moletom branco por baixo",
      "Calça wide leg + blusa de seda",
    ],
  },
  {
    id: 2,
    nome: "Vestido Preto Slim",
    preco: 189.9,
    imagem: "imgs/vestidof.png",
    imagemHover: null,
    ocasioes: ["Trabalho", "Noite"],
    estilos: [
      "Scarpin nude + brinco ear cuff dourado",
      "Tênis chunky + meia cano alto branca",
      "Blazer oversized bege + sapatilha preta",
    ],
  },
  {
    id: 4,
    nome: "Blusa Stripes Off-White",
    preco: 129.9,
    imagem: "imgs/blusaf.png",
    imagemHover: null,
    ocasioes: ["Casual", "Trabalho"],
    estilos: [
      "Calça reta preta + mule de couro",
      "Jeans straight leg + tênis branco",
      "Saia midi + sandália rasteira dourada",
    ],
  },
  {
    id: 3,
    nome: "Saia Envelope Assimétrica",
    preco: 149.9,
    imagem: "imgs/saiaf.png",
    imagemHover: null,
    ocasioes: ["Trabalho", "Noite"],
    estilos: [
      "Body preto + sandália de salto fino",
      "Blusa de seda tucked in + mule bege",
      "Moletom cropped + tênis chunky branco",
    ],
  },
];

var produtosMasculinos = [
  {
    id: 5,
    nome: "Jaqueta Aviador de Couro",
    preco: 489.9,
    imagem: "imgs/jaquetam.png",
    imagemHover: null,
    ocasioes: ["Casual", "Noite"],
    estilos: [
      "Camiseta branca + calça cargo + bota de couro",
      "Moletom cinza + jeans skinny + tênis preto",
      "Camisa xadrez aberta + calça reta + bota chelsea",
    ],
  },
  {
    id: 6,
    nome: "Camisa Oversized Areia",
    preco: 129.9,
    imagem: "imgs/camisam.png",
    imagemHover: null,
    ocasioes: ["Casual", "Praia"],
    estilos: [
      "Bermuda de linho + sandália de couro",
      "Calça de alfaiataria + mocassim bege",
      "Short jeans + tênis branco + óculos de sol",
    ],
  },
  {
    id: 7,
    nome: "Calça Reta Preta",
    preco: 199.9,
    imagem: "imgs/calcam.png",
    imagemHover: null,
    ocasioes: ["Trabalho", "Casual", "Noite"],
    estilos: [
      "Blazer + oxford + meia estampada colorida",
      "Camiseta branca oversized + tênis chunky",
      "Camisa social + loafer + cinto fino",
    ],
  },
];

var todosProdutos = produtosFemininos.concat(produtosMasculinos);

/* ================================================
   CARRINHO
   Chave = id + '-' + tamanho
   ================================================ */

var carrinho = [];
var cupomAtivo = null; /* código do cupom aplicado no checkout */
var metodoPagamento = null; /* cartao | pix | boleto */
var timeoutFecharCheckout = null;
var DESCONTO = 0.15; /* 15% de desconto */
var FRETE = 19.9; /* frete padrão */
var FRETE_GRATIS_ACIMA = 299.9; /* frete grátis acima deste valor */

/* Filtros e busca */
var filtroCategoria = "todos";
var filtroPreco = "todos";
var filtroTamanho =
  "todos"; /* seleção visual — todos os produtos têm todos os tamanhos */
var termoBusca = "";

function calcularSubtotal() {
  return carrinho.reduce(function (acc, i) {
    return acc + i.preco * i.quantidade;
  }, 0);
}

function calcularValorDesconto() {
  return cupomAtivo ? calcularSubtotal() * DESCONTO : 0;
}

function calcularFrete() {
  return calcularSubtotal() >= FRETE_GRATIS_ACIMA ? 0 : FRETE;
}

function calcularTotal() {
  return calcularSubtotal() - calcularValorDesconto() + calcularFrete();
}

function formatarPreco(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

function adicionarAoCarrinho(produto, tamanho, btnEl) {
  var chave = produto.id + "-" + tamanho;
  var existente = carrinho.find(function (i) {
    return i.chave === chave;
  });
  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({
      chave: chave,
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      tamanho: tamanho,
      quantidade: 1,
    });
  }
  atualizarContador();
  renderizarDrawer();
  if (btnEl) feedbackBotao(btnEl);
  pulsarIconeCarrinho();
}

function removerItem(chave) {
  carrinho = carrinho.filter(function (i) {
    return i.chave !== chave;
  });
  atualizarContador();
  renderizarDrawer();
}

function alterarQtd(chave, delta) {
  var item = carrinho.find(function (i) {
    return i.chave === chave;
  });
  if (!item) return;
  item.quantidade += delta;
  if (item.quantidade <= 0) {
    removerItem(chave);
  } else {
    atualizarContador();
    renderizarDrawer();
  }
}

function atualizarContador() {
  var total = carrinho.reduce(function (acc, i) {
    return acc + i.quantidade;
  }, 0);
  var badge = document.getElementById("c21-badge");
  if (!badge) return;
  badge.textContent = total;
  badge.style.display = total > 0 ? "flex" : "none";
}

/* ================================================
   FEEDBACK VISUAL
   ================================================ */

function feedbackBotao(btn) {
  if (!btn) return;
  btn.textContent = "Adicionado ✓";
  btn.classList.add("btn-adicionado");
  setTimeout(function () {
    btn.textContent = "Adicionar ao carrinho";
    btn.classList.remove("btn-adicionado");
  }, 1600);
}

function pulsarIconeCarrinho() {
  var btn = document.getElementById("c21-btn-carrinho");
  if (!btn) return;
  btn.classList.remove("c21-pulsar");
  void btn.offsetWidth;
  btn.classList.add("c21-pulsar");
}

function mostrarAvisoTamanho(card) {
  var aviso = card.querySelector(".c21-aviso-tamanho");
  if (!aviso) return;
  aviso.classList.add("c21-aviso--visivel");
  setTimeout(function () {
    aviso.classList.remove("c21-aviso--visivel");
  }, 2500);
}

/* ================================================
   POPUP DE BOAS-VINDAS — Cupom 15% OFF
   ================================================ */

function gerarCupom() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var sufixo = "";
  for (var i = 0; i < 4; i++) {
    sufixo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "CLUB" + sufixo; /* ex: CLUBX3K9 */
}

function criarPopupDesconto() {
  /* Overlay */
  var overlay = document.createElement("div");
  overlay.id = "c21-popup-overlay";
  overlay.className = "c21-popup-overlay";
  document.body.appendChild(overlay);

  /* Modal */
  var popup = document.createElement("div");
  popup.id = "c21-popup";
  popup.className = "c21-popup";
  popup.innerHTML =
    '<button id="c21-popup-fechar" class="c21-popup-fechar" aria-label="Fechar">×</button>' +
    '<div id="c21-popup-conteudo" class="c21-popup-conteudo">' +
    '<div class="c21-popup-badge">15% OFF</div>' +
    '<p class="c21-popup-supertitle">Bem-vindo à Club 21</p>' +
    '<h2 class="c21-popup-titulo">Ganhe 15% de desconto<br>na sua primeira compra</h2>' +
    '<p class="c21-popup-subtexto">Cadastre seu e-mail e receba um cupom exclusivo agora.</p>' +
    '<div class="c21-popup-form">' +
    '<input type="email" id="c21-popup-email" class="c21-popup-input"' +
    ' placeholder="seu@email.com" autocomplete="email">' +
    '<p id="c21-popup-erro" class="c21-popup-erro"></p>' +
    '<button id="c21-popup-btn" class="c21-popup-btn">Quero meu desconto</button>' +
    "</div>" +
    '<button id="c21-popup-dispensar" class="c21-popup-dispensar">Não, obrigado</button>' +
    "</div>";

  document.body.appendChild(popup);

  document
    .getElementById("c21-popup-fechar")
    .addEventListener("click", dispensarPopup);
  document
    .getElementById("c21-popup-dispensar")
    .addEventListener("click", dispensarPopup);
  document
    .getElementById("c21-popup-btn")
    .addEventListener("click", submeterEmailPopup);
  document
    .getElementById("c21-popup-email")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") submeterEmailPopup();
    });

  /* Exibe após 3s se o usuário ainda não se cadastrou nem dispensou */
  setTimeout(function () {
    var cadastrado = localStorage.getItem("c21-cadastro");
    var dispensado = localStorage.getItem("c21-popup-dispensado");
    if (!cadastrado && !dispensado) abrirPopup();
  }, 3000);
}

function abrirPopup() {
  document
    .getElementById("c21-popup-overlay")
    .classList.add("c21-popup-overlay--visivel");
  document.getElementById("c21-popup").classList.add("c21-popup--aberto");
}

function fecharPopup() {
  document.getElementById("c21-popup").classList.remove("c21-popup--aberto");
  document
    .getElementById("c21-popup-overlay")
    .classList.remove("c21-popup-overlay--visivel");
}

function dispensarPopup() {
  localStorage.setItem("c21-popup-dispensado", "1");
  fecharPopup();
}

function submeterEmailPopup() {
  var emailEl = document.getElementById("c21-popup-email");
  var erroEl = document.getElementById("c21-popup-erro");
  var email = emailEl.value.trim();

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    erroEl.textContent = "Informe um e-mail válido.";
    emailEl.focus();
    return;
  }
  erroEl.textContent = "";

  var codigo = gerarCupom();
  localStorage.setItem("c21-cadastro", email);
  localStorage.setItem("c21-cupom", codigo);

  mostrarSucessoPopup(codigo);
}

function mostrarSucessoPopup(codigo) {
  document.getElementById("c21-popup-conteudo").innerHTML =
    '<div class="c21-popup-sucesso-icone">✓</div>' +
    '<h2 class="c21-popup-titulo">Seu cupom chegou!</h2>' +
    '<p class="c21-popup-subtexto">Use o código abaixo no checkout<br>para ganhar 15% de desconto.</p>' +
    '<div class="c21-cupom-box">' +
    '<span class="c21-cupom-codigo">' +
    codigo +
    "</span>" +
    '<button id="c21-btn-copiar" class="c21-btn-copiar"' +
    " onclick=\"copiarCupom('" +
    codigo +
    "')\">Copiar</button>" +
    "</div>" +
    '<button class="c21-popup-btn c21-popup-btn--outline" onclick="fecharPopup()">' +
    "Começar a comprar" +
    "</button>";
}

function copiarCupom(codigo) {
  function feedback() {
    var btn = document.getElementById("c21-btn-copiar");
    if (!btn) return;
    btn.textContent = "Copiado ✓";
    setTimeout(function () {
      if (btn) btn.textContent = "Copiar";
    }, 1800);
  }
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(codigo)
      .then(feedback)
      .catch(function () {
        _copiarFallback(codigo, feedback);
      });
  } else {
    _copiarFallback(codigo, feedback);
  }
}

function _copiarFallback(texto, cb) {
  var ta = document.createElement("textarea");
  ta.value = texto;
  ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
  } catch (e) {}
  document.body.removeChild(ta);
  if (cb) cb();
}

/* ================================================
   CRIAR CARD DE PRODUTO
   ================================================ */

function criarCard(produto) {
  var card = document.createElement("div");
  card.className = "card-produto";
  card.dataset.id = produto.id;

  var tamanhoSelecionado = null;

  if (produto.imagemHover) card.classList.add("tem-hover-img");

  var imgHoverHTML = produto.imagemHover
    ? '<img class="card-img-hover" src="' +
      produto.imagemHover +
      '" alt="' +
      produto.nome +
      ' — alternativa" loading="lazy">'
    : "";

  var btnsTam = listaTamanhos
    .map(function (t) {
      return (
        '<button class="c21-size-btn" data-tamanho="' +
        t +
        '">' +
        t +
        "</button>"
      );
    })
    .join("");

  card.innerHTML =
    '<div class="card-imagem-wrapper">' +
    '<div class="card-shimmer"></div>' +
    '<img class="card-img-principal" src="' +
    produto.imagem +
    '" alt="' +
    produto.nome +
    '" loading="lazy">' +
    imgHoverHTML +
    '<div class="card-overlay">' +
    '<button class="btn-ver-detalhes">Sugestões <span class="btn-sparkle">✦</span></button>' +
    "</div>" +
    "</div>" +
    '<div class="card-info">' +
    "<h3>" +
    produto.nome +
    "</h3>" +
    '<p class="preco">R$ ' +
    produto.preco.toFixed(2) +
    "</p>" +
    '<div class="c21-tamanhos">' +
    '<span class="c21-tamanho-label">Tamanho</span>' +
    '<div class="c21-size-btns">' +
    btnsTam +
    "</div>" +
    '<p class="c21-aviso-tamanho">Selecione um tamanho</p>' +
    "</div>" +
    '<button class="btn-adicionar-carrinho">Adicionar ao carrinho</button>' +
    "</div>";

  /* Shimmer */
  var imgPrincipal = card.querySelector(".card-img-principal");
  var shimmer = card.querySelector(".card-shimmer");
  function ocultarShimmer() {
    shimmer.classList.add("shimmer-oculto");
  }
  if (imgPrincipal.complete) ocultarShimmer();
  else {
    imgPrincipal.addEventListener("load", ocultarShimmer);
    imgPrincipal.addEventListener("error", ocultarShimmer);
  }

  /* Tamanhos */
  card.querySelectorAll(".c21-size-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      tamanhoSelecionado = btn.dataset.tamanho;
      card.querySelectorAll(".c21-size-btn").forEach(function (b) {
        b.classList.toggle("c21-size-btn--ativo", b === btn);
      });
    });
  });

  /* Adicionar ao carrinho */
  var btnAdicionar = card.querySelector(".btn-adicionar-carrinho");
  btnAdicionar.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!tamanhoSelecionado) {
      mostrarAvisoTamanho(card);
      return;
    }
    adicionarAoCarrinho(produto, tamanhoSelecionado, btnAdicionar);
  });

  /* Experimentar → Provador */
  card
    .querySelector(".btn-ver-detalhes")
    .addEventListener("click", function (e) {
      e.stopPropagation();
      abrirProvador(produto, tamanhoSelecionado);
    });

  /* Touch */
  card.addEventListener(
    "touchstart",
    function () {
      card.classList.add("touch-ativo");
    },
    { passive: true },
  );
  card.addEventListener(
    "touchend",
    function () {
      setTimeout(function () {
        card.classList.remove("touch-ativo");
      }, 380);
    },
    { passive: true },
  );

  card.addEventListener("transitionend", function limpar(e) {
    if (
      e.propertyName === "opacity" &&
      card.classList.contains("card-visivel")
    ) {
      card.style.transitionDelay = "0s";
      card.removeEventListener("transitionend", limpar);
    }
  });

  return card;
}

/* ================================================
   PROVADOR VIRTUAL
   ================================================ */

var provadorProduto = null;
var provadorTamanho = null;

/* ── Sugestões de estilo no provador ── */

function renderizarEstilosProv(produto) {
  var tagsEl = document.getElementById("c21-prov-tags");
  var dicasEl = document.getElementById("c21-prov-dicas");
  if (!tagsEl || !dicasEl) return;
  tagsEl.innerHTML = (produto.ocasioes || [])
    .map(function (o) {
      return '<span class="c21-prov-tag">' + o + "</span>";
    })
    .join("");
  dicasEl.innerHTML = (produto.estilos || [])
    .map(function (e) {
      return "<li>" + e + "</li>";
    })
    .join("");
}

function criarProvadorUI() {
  var overlay = document.createElement("div");
  overlay.id = "c21-prov-overlay";
  overlay.className = "c21-prov-overlay";
  overlay.addEventListener("click", fecharProvador);
  document.body.appendChild(overlay);

  var modal = document.createElement("div");
  modal.id = "c21-provador";
  modal.className = "c21-provador";

  var btnsTamProv = listaTamanhos
    .map(function (t) {
      return (
        '<button class="c21-prov-size-btn" data-tamanho="' +
        t +
        '">' +
        t +
        "</button>"
      );
    })
    .join("");

  modal.innerHTML =
    '<div class="c21-prov-inner">' +
    '<div class="c21-prov-col-img"><img id="c21-prov-img" src="" alt=""></div>' +
    '<div class="c21-prov-col-info">' +
    '<button id="c21-prov-fechar" class="c21-prov-fechar" aria-label="Fechar">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    "</button>" +
    '<p class="c21-prov-label">Provador Virtual</p>' +
    '<h2 id="c21-prov-nome"  class="c21-prov-nome"></h2>' +
    '<p  id="c21-prov-preco" class="c21-prov-preco"></p>' +
    /* ── Sugestões de estilo ── */
    '<div class="c21-prov-estilos">' +
    '<p class="c21-prov-section-title">Como usar</p>' +
    '<div id="c21-prov-tags" class="c21-prov-tags"></div>' +
    '<ul id="c21-prov-dicas" class="c21-prov-dicas"></ul>' +
    "</div>" +
    '<div class="c21-prov-section">' +
    '<p class="c21-prov-section-title">Selecione o tamanho</p>' +
    '<div class="c21-prov-sizes">' +
    btnsTamProv +
    "</div>" +
    "</div>" +
    '<div id="c21-prov-medidas" class="c21-prov-medidas c21-prov-medidas--oculto">' +
    '<div class="c21-prov-fit-row">' +
    '<span class="c21-prov-fit-label">Caimento</span>' +
    '<span id="c21-prov-fit-txt" class="c21-prov-fit-txt"></span>' +
    "</div>" +
    '<div class="c21-barra-wrap">' +
    '<span class="c21-barra-extremo">Justo</span>' +
    '<div class="c21-barra-track"><div id="c21-barra-fill" class="c21-barra-fill"></div></div>' +
    '<span class="c21-barra-extremo">Folgado</span>' +
    "</div>" +
    '<table class="c21-prov-table">' +
    "<thead><tr><th></th><th>Busto</th><th>Cintura</th><th>Quadril</th></tr></thead>" +
    '<tbody id="c21-prov-tbody"></tbody>' +
    "</table>" +
    '<p class="c21-prov-hint">* Medidas em centímetros</p>' +
    "</div>" +
    '<button id="c21-prov-adicionar" class="c21-prov-adicionar" disabled>Selecione um tamanho</button>' +
    "</div>" +
    "</div>";

  document.body.appendChild(modal);
  document
    .getElementById("c21-prov-fechar")
    .addEventListener("click", fecharProvador);

  modal.querySelectorAll(".c21-prov-size-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      provadorTamanho = btn.dataset.tamanho;
      modal.querySelectorAll(".c21-prov-size-btn").forEach(function (b) {
        b.classList.toggle("c21-prov-size-btn--ativo", b === btn);
      });
      atualizarMedidasProvador(provadorTamanho);
      var btnAdd = document.getElementById("c21-prov-adicionar");
      btnAdd.disabled = false;
      btnAdd.textContent = "Adicionar ao carrinho";
    });
  });

  document
    .getElementById("c21-prov-adicionar")
    .addEventListener("click", function () {
      if (!provadorProduto || !provadorTamanho) return;
      adicionarAoCarrinho(provadorProduto, provadorTamanho, null);
      fecharProvador();
      setTimeout(abrirDrawer, 320);
    });
}

function abrirProvador(produto, tamanhoAtual) {
  fecharDrawer();
  provadorProduto = produto;
  provadorTamanho = tamanhoAtual;

  renderizarEstilosProv(produto);

  document.getElementById("c21-prov-img").src = produto.imagem;
  document.getElementById("c21-prov-img").alt = produto.nome;
  document.getElementById("c21-prov-nome").textContent = produto.nome;
  document.getElementById("c21-prov-preco").textContent =
    "R$ " + produto.preco.toFixed(2);

  document.querySelectorAll(".c21-prov-size-btn").forEach(function (b) {
    b.classList.toggle(
      "c21-prov-size-btn--ativo",
      b.dataset.tamanho === tamanhoAtual,
    );
  });

  var btnAdd = document.getElementById("c21-prov-adicionar");
  if (tamanhoAtual) {
    atualizarMedidasProvador(tamanhoAtual);
    btnAdd.disabled = false;
    btnAdd.textContent = "Adicionar ao carrinho";
  } else {
    document
      .getElementById("c21-prov-medidas")
      .classList.add("c21-prov-medidas--oculto");
    btnAdd.disabled = true;
    btnAdd.textContent = "Selecione um tamanho";
  }

  document.getElementById("c21-provador").classList.add("c21-provador--aberto");
  document
    .getElementById("c21-prov-overlay")
    .classList.add("c21-prov-overlay--visivel");
  document.body.style.overflow = "hidden";
}

function fecharProvador() {
  var el = document.getElementById("c21-provador");
  var ov = document.getElementById("c21-prov-overlay");
  if (el) el.classList.remove("c21-provador--aberto");
  if (ov) ov.classList.remove("c21-prov-overlay--visivel");
  document.body.style.overflow = "";
}

function atualizarMedidasProvador(tamanho) {
  var m = guiaMedidas[tamanho];
  if (!m) return;
  document.getElementById("c21-prov-fit-txt").textContent = m.caimento;
  document.getElementById("c21-barra-fill").style.width = m.barra + "%";
  document.getElementById("c21-prov-tbody").innerHTML = listaTamanhos
    .map(function (t) {
      var med = guiaMedidas[t];
      var at = t === tamanho ? ' class="c21-tr--ativo"' : "";
      return (
        "<tr" +
        at +
        "><td><strong>" +
        t +
        "</strong></td>" +
        "<td>" +
        med.busto +
        "</td><td>" +
        med.cintura +
        "</td><td>" +
        med.quadril +
        "</td></tr>"
      );
    })
    .join("");
  document
    .getElementById("c21-prov-medidas")
    .classList.remove("c21-prov-medidas--oculto");
}

/* ================================================
   CARRINHO — UI
   ================================================ */

function criarCarrinhoUI() {
  var btnCarrinho = document.createElement("button");
  btnCarrinho.id = "c21-btn-carrinho";
  btnCarrinho.className = "c21-btn-carrinho";
  btnCarrinho.setAttribute("aria-label", "Abrir carrinho");
  btnCarrinho.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>' +
    '<line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>' +
    "</svg>" +
    '<span id="c21-badge" class="c21-badge" style="display:none">0</span>';
  btnCarrinho.addEventListener("click", abrirDrawer);
  document.body.appendChild(btnCarrinho);

  var overlay = document.createElement("div");
  overlay.id = "c21-overlay";
  overlay.className = "c21-overlay";
  overlay.addEventListener("click", fecharDrawer);
  document.body.appendChild(overlay);

  var drawer = document.createElement("div");
  drawer.id = "c21-drawer";
  drawer.className = "c21-drawer";
  drawer.innerHTML =
    '<div class="c21-drawer-header">' +
    '<h2 class="c21-drawer-titulo">Carrinho</h2>' +
    '<button id="c21-btn-fechar" class="c21-btn-fechar" aria-label="Fechar">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    "</button>" +
    "</div>" +
    '<div id="c21-lista" class="c21-lista"></div>' +
    '<div class="c21-drawer-footer">' +
    '<div class="c21-subtotal-row"><span>Total da compra</span><strong id="c21-total">R$ 0,00</strong></div>' +
    '<button class="c21-btn-finalizar">Finalizar compra</button>' +
    "</div>";
  document.body.appendChild(drawer);

  document
    .getElementById("c21-btn-fechar")
    .addEventListener("click", fecharDrawer);
  drawer
    .querySelector(".c21-btn-finalizar")
    .addEventListener("click", function () {
      if (carrinho.length === 0) return;
      fecharDrawer();
      setTimeout(abrirCheckout, 380);
    });

  renderizarDrawer();
}

function abrirDrawer() {
  fecharProvador();
  document.getElementById("c21-drawer").classList.add("c21-drawer--aberto");
  document.getElementById("c21-overlay").classList.add("c21-overlay--visivel");
  document.body.style.overflow = "hidden";
}

function fecharDrawer() {
  var el = document.getElementById("c21-drawer");
  var ov = document.getElementById("c21-overlay");
  if (el) el.classList.remove("c21-drawer--aberto");
  if (ov) ov.classList.remove("c21-overlay--visivel");
  document.body.style.overflow = "";
}

function renderizarDrawer() {
  var lista = document.getElementById("c21-lista");
  var totalEl = document.getElementById("c21-total");
  if (!lista) return;
  if (carrinho.length === 0) {
    lista.innerHTML = '<p class="c21-vazio">Seu carrinho está vazio.</p>';
  } else {
    lista.innerHTML = carrinho
      .map(function (item) {
        var ch = item.chave;
        return (
          '<div class="c21-item">' +
          '<img src="' +
          item.imagem +
          '" alt="' +
          item.nome +
          '">' +
          '<div class="c21-item-info">' +
          '<p class="c21-item-nome">' +
          item.nome +
          "</p>" +
          '<p class="c21-item-tam">Tamanho: <strong>' +
          item.tamanho +
          "</strong></p>" +
          '<p class="c21-item-preco">' +
          formatarPreco(item.preco) +
          "</p>" +
          '<div class="c21-item-qtd">' +
          '<button class="c21-qtd-btn" onclick="alterarQtd(\'' +
          ch +
          "',-1)\">−</button>" +
          "<span>" +
          item.quantidade +
          "</span>" +
          '<button class="c21-qtd-btn" onclick="alterarQtd(\'' +
          ch +
          "',1)\">+</button>" +
          "</div>" +
          "</div>" +
          '<button class="c21-item-remover" onclick="removerItem(\'' +
          ch +
          '\')" aria-label="Remover">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          "</button>" +
          "</div>"
        );
      })
      .join("");
  }
  if (totalEl) totalEl.textContent = formatarPreco(calcularSubtotal());
}

/* ================================================
   CHECKOUT — ViaCEP + EmailJS + Cupom
   ================================================ */

function criarCheckoutUI() {
  var overlay = document.createElement("div");
  overlay.id = "c21-checkout-overlay";
  overlay.className = "c21-checkout-overlay";
  overlay.addEventListener("click", function () {
    var nome = document.getElementById("c21-nome");
    if (nome && nome.value.trim()) return;
    fecharCheckout();
  });
  document.body.appendChild(overlay);

  var modal = document.createElement("div");
  modal.id = "c21-checkout";
  modal.className = "c21-checkout";
  modal.innerHTML =
    '<div class="c21-checkout-inner">' +
    '<div class="c21-checkout-header">' +
    '<h2 class="c21-checkout-titulo">Confirmar Pedido</h2>' +
    '<button id="c21-checkout-fechar" class="c21-checkout-fechar" aria-label="Fechar">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    "</button>" +
    "</div>" +
    '<div id="c21-checkout-body" class="c21-checkout-body">' +
    /* ── Resumo do pedido ── */
    '<div class="c21-checkout-resumo">' +
    '<p class="c21-checkout-section-title">Resumo</p>' +
    '<div id="c21-checkout-itens"></div>' +
    '<div class="c21-checkout-valores">' +
    '<div class="c21-checkout-val-row">' +
    "<span>Subtotal</span>" +
    '<span id="c21-checkout-subtotal">R$ 0,00</span>' +
    "</div>" +
    '<div class="c21-checkout-val-row c21-checkout-val-row--frete">' +
    '<span>Frete <em id="c21-frete-hint" class="c21-frete-hint">(grátis acima de R$ 299,90)</em></span>' +
    '<span id="c21-checkout-frete">R$ 19,90</span>' +
    "</div>" +
    '<div class="c21-checkout-val-row c21-checkout-val-row--desconto" id="c21-desc-row" style="display:none">' +
    "<span>Desconto <em>(15%)</em></span>" +
    '<span id="c21-checkout-desconto" class="c21-preco-desconto">−R$ 0,00</span>' +
    "</div>" +
    '<div class="c21-checkout-val-row c21-checkout-val-row--total">' +
    "<span>Total</span>" +
    '<strong id="c21-checkout-total">R$ 0,00</strong>' +
    "</div>" +
    "</div>" +
    "</div>" +
    /* ── Formulário de entrega ── */
    '<div class="c21-checkout-form-col">' +
    '<p class="c21-checkout-section-title">Dados de entrega</p>' +
    '<div class="c21-campo"><label for="c21-nome">Nome completo <span class="c21-obrigatorio">*</span></label>' +
    '<input type="text" id="c21-nome" placeholder="Seu nome" autocomplete="name"></div>' +
    '<div class="c21-campo"><label for="c21-email">E-mail <span class="c21-obrigatorio">*</span></label>' +
    '<input type="email" id="c21-email" placeholder="seu@email.com" autocomplete="email"></div>' +
    '<div class="c21-campo"><label for="c21-cep">CEP <span class="c21-obrigatorio">*</span></label>' +
    '<div class="c21-cep-wrapper">' +
    '<input type="text" id="c21-cep" placeholder="00000-000" maxlength="9" autocomplete="postal-code">' +
    '<span id="c21-cep-status" class="c21-cep-status"></span>' +
    "</div></div>" +
    '<div class="c21-campo"><label for="c21-rua">Rua</label>' +
    '<input type="text" id="c21-rua" placeholder="—" readonly tabindex="-1"></div>' +
    '<div class="c21-campo-row">' +
    '<div class="c21-campo c21-campo--numero"><label for="c21-numero">Número <span class="c21-obrigatorio">*</span></label>' +
    '<input type="text" id="c21-numero" placeholder="Nº"></div>' +
    '<div class="c21-campo"><label for="c21-complemento">Complemento</label>' +
    '<input type="text" id="c21-complemento" placeholder="Apto, bloco..."></div>' +
    "</div>" +
    '<div class="c21-campo"><label for="c21-bairro">Bairro</label>' +
    '<input type="text" id="c21-bairro" placeholder="—" readonly tabindex="-1"></div>' +
    '<div class="c21-campo-row">' +
    '<div class="c21-campo"><label for="c21-cidade">Cidade</label>' +
    '<input type="text" id="c21-cidade" placeholder="—" readonly tabindex="-1"></div>' +
    '<div class="c21-campo c21-campo--uf"><label for="c21-estado">UF</label>' +
    '<input type="text" id="c21-estado" placeholder="—" readonly maxlength="2" tabindex="-1"></div>' +
    "</div>" +
    /* Campo de cupom */
    '<div class="c21-campo">' +
    '<label for="c21-cupom-input">Cupom de desconto</label>' +
    '<div class="c21-cupom-input-wrapper">' +
    '<input type="text" id="c21-cupom-input" placeholder="Ex: CLUBX3K9" autocomplete="off">' +
    '<button type="button" id="c21-btn-aplicar-cupom" class="c21-btn-aplicar-cupom">Aplicar</button>' +
    "</div>" +
    '<p id="c21-cupom-feedback" class="c21-cupom-feedback"></p>' +
    "</div>" +
    /* ── Pagamento ── */
    '<p class="c21-checkout-section-title">Pagamento</p>' +
    '<div class="c21-pag-metodos">' +
    '<button type="button" class="c21-pag-btn" data-metodo="cartao">Cartão</button>' +
    '<button type="button" class="c21-pag-btn" data-metodo="pix">PIX</button>' +
    '<button type="button" class="c21-pag-btn" data-metodo="boleto">Boleto</button>' +
    "</div>" +
    '<div id="c21-pag-cartao" class="c21-pag-detalhe" style="display:none">' +
    '<div class="c21-campo"><label for="c21-card-num">Número do cartão <span class="c21-obrigatorio">*</span></label>' +
    '<input type="text" id="c21-card-num" placeholder="0000 0000 0000 0000" maxlength="19" autocomplete="cc-number"></div>' +
    '<div class="c21-campo"><label for="c21-card-nome">Nome no cartão <span class="c21-obrigatorio">*</span></label>' +
    '<input type="text" id="c21-card-nome" placeholder="Como aparece no cartão" autocomplete="cc-name"></div>' +
    '<div class="c21-campo-row">' +
    '<div class="c21-campo"><label for="c21-card-val">Validade <span class="c21-obrigatorio">*</span></label>' +
    '<input type="text" id="c21-card-val" placeholder="MM/AA" maxlength="5" autocomplete="cc-exp"></div>' +
    '<div class="c21-campo c21-campo--cvv"><label for="c21-card-cvv">CVV <span class="c21-obrigatorio">*</span></label>' +
    '<input type="text" id="c21-card-cvv" placeholder="000" maxlength="4" autocomplete="cc-csc"></div>' +
    "</div>" +
    "</div>" +
    '<div id="c21-pag-pix" class="c21-pag-detalhe c21-pag-info" style="display:none">' +
    "<p>Após confirmar, a chave PIX será gerada e enviada por e-mail para pagamento.</p>" +
    "</div>" +
    '<div id="c21-pag-boleto" class="c21-pag-detalhe c21-pag-info" style="display:none">' +
    "<p>O boleto será enviado por e-mail em até 1 hora útil após a confirmação.</p>" +
    "</div>" +
    '<p class="c21-obrigatorio-nota"><span class="c21-obrigatorio">*</span> Campos obrigatórios</p>' +
    '<p id="c21-form-erro" class="c21-form-erro"></p>' +
    '<button id="c21-btn-confirmar" class="c21-btn-confirmar">Confirmar pedido</button>' +
    "</div>" +
    "</div>" +
    "</div>";

  document.body.appendChild(modal);

  document
    .getElementById("c21-checkout-fechar")
    .addEventListener("click", fecharCheckout);

  /* Máscara e auto-busca CEP */
  document.getElementById("c21-cep").addEventListener("input", function () {
    var val = this.value.replace(/\D/g, "");
    this.value = val.length > 5 ? val.slice(0, 5) + "-" + val.slice(5, 8) : val;
    if (val.length === 8) buscarCEP(val);
    else if (val.length < 8) {
      document.getElementById("c21-cep-status").textContent = "";
      document.getElementById("c21-cep-status").className = "c21-cep-status";
      limparEndereco();
    }
  });

  /* Cupom em maiúsculo automaticamente */
  document
    .getElementById("c21-cupom-input")
    .addEventListener("input", function () {
      this.value = this.value.toUpperCase();
    });

  document
    .getElementById("c21-btn-aplicar-cupom")
    .addEventListener("click", aplicarCupom);
  document
    .getElementById("c21-btn-confirmar")
    .addEventListener("click", confirmarPedido);

  /* Métodos de pagamento */
  modal.querySelectorAll(".c21-pag-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      modal.querySelectorAll(".c21-pag-btn").forEach(function (b) {
        b.classList.remove("c21-pag-btn--ativo");
      });
      btn.classList.add("c21-pag-btn--ativo");
      metodoPagamento = btn.dataset.metodo;
      ["c21-pag-cartao", "c21-pag-pix", "c21-pag-boleto"].forEach(
        function (id) {
          var el = document.getElementById(id);
          if (el) el.style.display = "none";
        },
      );
      var detalhe = document.getElementById("c21-pag-" + metodoPagamento);
      if (detalhe) detalhe.style.display = "";
      document.getElementById("c21-form-erro").textContent = "";
    });
  });

  /* Máscara número do cartão */
  document
    .getElementById("c21-card-num")
    .addEventListener("input", function () {
      var val = this.value.replace(/\D/g, "");
      var partes = val.match(/.{1,4}/g);
      this.value = partes ? partes.join(" ").slice(0, 19) : val;
    });

  /* Máscara validade */
  document
    .getElementById("c21-card-val")
    .addEventListener("input", function () {
      var val = this.value.replace(/\D/g, "");
      if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
      this.value = val;
    });

  /* Apenas dígitos no CVV */
  document
    .getElementById("c21-card-cvv")
    .addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
    });
}

/* ── Cupom ── */

function aplicarCupom() {
  var inputEl = document.getElementById("c21-cupom-input");
  var feedbackEl = document.getElementById("c21-cupom-feedback");
  var codigoSalvo = localStorage.getItem("c21-cupom");
  var codigo = inputEl.value.trim().toUpperCase();

  if (!codigo) {
    feedbackEl.textContent = "Insira um código de cupom.";
    feedbackEl.className = "c21-cupom-feedback c21-cupom-feedback--erro";
    return;
  }

  if (codigoSalvo && codigo === codigoSalvo) {
    cupomAtivo = codigo;
    feedbackEl.textContent = "✓ Desconto de 15% aplicado!";
    feedbackEl.className = "c21-cupom-feedback c21-cupom-feedback--ok";
    inputEl.readOnly = true;
    document.getElementById("c21-btn-aplicar-cupom").disabled = true;
  } else {
    cupomAtivo = null;
    feedbackEl.textContent = "Cupom inválido ou inexistente.";
    feedbackEl.className = "c21-cupom-feedback c21-cupom-feedback--erro";
  }

  atualizarTotaisCheckout();
}

function atualizarTotaisCheckout() {
  var subtotalEl = document.getElementById("c21-checkout-subtotal");
  var descontoEl = document.getElementById("c21-checkout-desconto");
  var freteEl = document.getElementById("c21-checkout-frete");
  var freteHint = document.getElementById("c21-frete-hint");
  var totalEl = document.getElementById("c21-checkout-total");
  var descRowEl = document.getElementById("c21-desc-row");

  var subtotal = calcularSubtotal();
  var desconto = calcularValorDesconto();
  var frete = calcularFrete();
  var total = calcularTotal();

  if (subtotalEl) subtotalEl.textContent = formatarPreco(subtotal);
  if (totalEl) totalEl.textContent = formatarPreco(total);

  if (freteEl) {
    if (frete === 0) {
      freteEl.textContent = "GRÁTIS";
      freteEl.style.color = "#4a7c59";
      freteEl.style.fontWeight = "600";
      if (freteHint) freteHint.style.display = "none";
    } else {
      freteEl.textContent = formatarPreco(frete);
      freteEl.style.color = "";
      freteEl.style.fontWeight = "";
      if (freteHint) freteHint.style.display = "";
    }
  }

  if (descRowEl) {
    if (cupomAtivo) {
      descontoEl.textContent = "−" + formatarPreco(desconto);
      descRowEl.style.display = "flex";
    } else {
      descRowEl.style.display = "none";
    }
  }
}

function abrirCheckout() {
  if (carrinho.length === 0) return;

  /* Resumo de itens */
  document.getElementById("c21-checkout-itens").innerHTML = carrinho
    .map(function (item) {
      return (
        '<div class="c21-checkout-item">' +
        '<img src="' +
        item.imagem +
        '" alt="' +
        item.nome +
        '">' +
        '<div class="c21-checkout-item-detalhe">' +
        '<p class="c21-checkout-item-nome">' +
        item.nome +
        "</p>" +
        '<p class="c21-checkout-item-meta">Tam. ' +
        item.tamanho +
        " · Qtd. " +
        item.quantidade +
        "</p>" +
        '<p class="c21-checkout-item-preco">' +
        formatarPreco(item.preco * item.quantidade) +
        "</p>" +
        "</div>" +
        "</div>"
      );
    })
    .join("");

  /* Reseta formulário */
  [
    "c21-nome",
    "c21-email",
    "c21-cep",
    "c21-rua",
    "c21-numero",
    "c21-complemento",
    "c21-bairro",
    "c21-cidade",
    "c21-estado",
  ].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("c21-cep-status").textContent = "";
  document.getElementById("c21-cep-status").className = "c21-cep-status";
  document.getElementById("c21-form-erro").textContent = "";

  /* Reseta cupom */
  cupomAtivo = null;
  var inputCupom = document.getElementById("c21-cupom-input");
  var feedbackCup = document.getElementById("c21-cupom-feedback");
  var btnAplicar = document.getElementById("c21-btn-aplicar-cupom");
  var cupomSalvo = localStorage.getItem("c21-cupom");

  if (inputCupom) {
    inputCupom.value = cupomSalvo || "";
    inputCupom.readOnly = false;
  }
  if (feedbackCup) {
    feedbackCup.textContent = "";
    feedbackCup.className = "c21-cupom-feedback";
  }
  if (btnAplicar) {
    btnAplicar.disabled = false;
  }

  /* Se tem cupom salvo, exibe dica */
  if (cupomSalvo && feedbackCup) {
    feedbackCup.textContent =
      "Você tem um cupom de boas-vindas! Clique em Aplicar.";
    feedbackCup.className = "c21-cupom-feedback c21-cupom-feedback--dica";
  }

  /* Reseta pagamento */
  metodoPagamento = null;
  document.querySelectorAll(".c21-pag-btn").forEach(function (b) {
    b.classList.remove("c21-pag-btn--ativo");
  });
  ["c21-pag-cartao", "c21-pag-pix", "c21-pag-boleto"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  ["c21-card-num", "c21-card-nome", "c21-card-val", "c21-card-cvv"].forEach(
    function (id) {
      var el = document.getElementById(id);
      if (el) el.value = "";
    },
  );

  var btnConf = document.getElementById("c21-btn-confirmar");
  if (btnConf) {
    btnConf.disabled = false;
    btnConf.textContent = "Confirmar pedido";
  }

  atualizarTotaisCheckout();

  document.getElementById("c21-checkout").classList.add("c21-checkout--aberto");
  document
    .getElementById("c21-checkout-overlay")
    .classList.add("c21-checkout-overlay--visivel");
  document.body.style.overflow = "hidden";
}

function fecharCheckout() {
  if (timeoutFecharCheckout) {
    clearTimeout(timeoutFecharCheckout);
    timeoutFecharCheckout = null;
  }
  document
    .getElementById("c21-checkout")
    .classList.remove("c21-checkout--aberto");
  document
    .getElementById("c21-checkout-overlay")
    .classList.remove("c21-checkout-overlay--visivel");
  document.body.style.overflow = "";
}

/* ── ViaCEP ── */

function buscarCEP(cep) {
  var statusEl = document.getElementById("c21-cep-status");
  statusEl.textContent = "buscando...";
  statusEl.className = "c21-cep-status";

  fetch("https://viacep.com.br/ws/" + cep + "/json/")
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (data.erro) {
        statusEl.textContent = "CEP não encontrado";
        statusEl.className = "c21-cep-status cep-erro";
        limparEndereco();
        return;
      }
      document.getElementById("c21-rua").value = data.logradouro || "";
      document.getElementById("c21-bairro").value = data.bairro || "";
      document.getElementById("c21-cidade").value = data.localidade || "";
      document.getElementById("c21-estado").value = data.uf || "";
      statusEl.textContent = "✓";
      statusEl.className = "c21-cep-status cep-ok";
      var numero = document.getElementById("c21-numero");
      if (numero) numero.focus();
    })
    .catch(function () {
      statusEl.textContent = "Erro de conexão";
      statusEl.className = "c21-cep-status cep-erro";
    });
}

function limparEndereco() {
  ["c21-rua", "c21-bairro", "c21-cidade", "c21-estado"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/* ── Validação + EmailJS ── */

function confirmarPedido() {
  var nome = document.getElementById("c21-nome").value.trim();
  var email = document.getElementById("c21-email").value.trim();
  var rua = document.getElementById("c21-rua").value.trim();
  var numero = document.getElementById("c21-numero").value.trim();
  var complemento = document.getElementById("c21-complemento").value.trim();
  var bairro = document.getElementById("c21-bairro").value.trim();
  var cidade = document.getElementById("c21-cidade").value.trim();
  var estado = document.getElementById("c21-estado").value.trim();
  var cep = document.getElementById("c21-cep").value.trim();
  var erroEl = document.getElementById("c21-form-erro");

  if (!nome) {
    erroEl.textContent = "Preencha seu nome completo.";
    return;
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    erroEl.textContent = "Informe um e-mail válido.";
    return;
  }
  if (!rua) {
    erroEl.textContent = "Informe um CEP válido.";
    return;
  }
  if (!numero) {
    erroEl.textContent = "Informe o número do endereço.";
    return;
  }
  if (!metodoPagamento) {
    erroEl.textContent = "Selecione uma forma de pagamento.";
    return;
  }
  if (metodoPagamento === "cartao") {
    var cardNum = document
      .getElementById("c21-card-num")
      .value.replace(/\D/g, "");
    var cardNome = document.getElementById("c21-card-nome").value.trim();
    var cardVal = document.getElementById("c21-card-val").value.trim();
    var cardCvv = document.getElementById("c21-card-cvv").value.trim();
    if (cardNum.length < 16) {
      erroEl.textContent = "Número do cartão inválido.";
      return;
    }
    if (!cardNome) {
      erroEl.textContent = "Informe o nome no cartão.";
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardVal)) {
      erroEl.textContent = "Validade inválida. Use MM/AA.";
      return;
    }
    if (cardCvv.length < 3) {
      erroEl.textContent = "CVV inválido.";
      return;
    }
  }
  erroEl.textContent = "";

  var itensTexto = carrinho
    .map(function (item) {
      return (
        "• " +
        item.nome +
        " (Tam. " +
        item.tamanho +
        ")" +
        (item.quantidade > 1 ? " x" + item.quantidade : "") +
        " — " +
        formatarPreco(item.preco * item.quantidade)
      );
    })
    .join("\n");

  var frete = calcularFrete();
  var freteStr = frete === 0 ? "GRÁTIS" : formatarPreco(frete);
  var totalStr = formatarPreco(calcularTotal());
  if (cupomAtivo) totalStr += " (15% desconto — cupom " + cupomAtivo + ")";

  var endereco =
    rua +
    ", " +
    numero +
    (complemento ? " " + complemento : "") +
    " — " +
    bairro +
    ", " +
    cidade +
    "/" +
    estado +
    " — CEP: " +
    cep;

  var btnConf = document.getElementById("c21-btn-confirmar");
  btnConf.disabled = true;
  btnConf.textContent = "Enviando...";

  var emailJSAtivo =
    typeof emailjs !== "undefined" &&
    EMAILJS_PUBLIC_KEY !== "SUA_PUBLIC_KEY" &&
    EMAILJS_SERVICE_ID !== "SEU_SERVICE_ID" &&
    EMAILJS_TEMPLATE_ID !== "SEU_TEMPLATE_ID";

  if (emailJSAtivo) {
    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_name: nome,
        to_email: email,
        pedido_itens: itensTexto,
        pedido_total: totalStr,
        frete: freteStr,
        endereco: endereco,
        data_pedido: new Date().toLocaleDateString("pt-BR"),
        metodo_pagamento:
          metodoPagamento === "cartao"
            ? "Cartão de Crédito"
            : metodoPagamento === "pix"
              ? "PIX"
              : "Boleto",
        /* variáveis alternativas usadas por alguns templates */
        cost: {
          shipping: freteStr,
          tax: "R$ 0,00",
          total: totalStr,
        },
      })
      .then(function () {
        finalizarPedido(email);
      })
      .catch(function (err) {
        console.error("EmailJS erro:", err);
        var detalhe = err && err.text ? " (" + err.text + ")" : "";
        erroEl.textContent = "Erro ao enviar e-mail." + detalhe;
        btnConf.disabled = false;
        btnConf.textContent = "Confirmar pedido";
      });
  } else {
    console.info("Club 21: EmailJS não configurado — modo demo.");
    setTimeout(function () {
      finalizarPedido(email);
    }, 900);
  }
}

function finalizarPedido(email) {
  var temDesconto = !!cupomAtivo;
  var totalFinal = formatarPreco(calcularTotal());
  var metodoLabel =
    metodoPagamento === "cartao"
      ? "Cartão de Crédito"
      : metodoPagamento === "pix"
        ? "PIX"
        : "Boleto";

  carrinho = [];
  cupomAtivo = null;
  atualizarContador();
  renderizarDrawer();

  var body = document.getElementById("c21-checkout-body");
  if (!body) return;

  /* Tela 1 — pagamento confirmado */
  body.innerHTML =
    '<div class="c21-sucesso c21-sucesso--pag">' +
    '<div class="c21-sucesso-icone c21-sucesso-icone--pag">✓</div>' +
    "<h3>Pagamento confirmado</h3>" +
    '<p class="c21-pag-metodo-label">' +
    metodoLabel +
    "</p>" +
    "</div>";

  /* Tela 2 — pedido confirmado (após 1.8s) */
  setTimeout(function () {
    var b = document.getElementById("c21-checkout-body");
    if (!b) return;
    b.innerHTML =
      '<div class="c21-sucesso">' +
      '<div class="c21-sucesso-icone">✓</div>' +
      "<h3>Pedido confirmado!</h3>" +
      (temDesconto
        ? '<p class="c21-sucesso-desconto">Desconto de 15% aplicado — ' +
          totalFinal +
          "</p>"
        : "") +
      "<p>Confirmação enviada para<br><strong>" +
      email +
      "</strong></p>" +
      '<button class="c21-btn-continuar" onclick="fecharCheckout()">Continuar comprando</button>' +
      "</div>";

    timeoutFecharCheckout = setTimeout(fecharCheckout, 4000);
  }, 1800);
}

/* ================================================
   EXIBIR SEÇÕES DE PRODUTOS
   ================================================ */

function exibirSecaoF() {
  var grade = document.getElementById("grade-feminino");
  if (!grade) return;
  grade.innerHTML = "";
  produtosFemininos.forEach(function (p) {
    grade.appendChild(criarCard(p));
  });
}

function exibirSecaoM() {
  var grade = document.getElementById("grade-masculino");
  if (!grade) return;
  grade.innerHTML = "";
  produtosMasculinos.forEach(function (p) {
    grade.appendChild(criarCard(p));
  });
}

/* ================================================
   ANIMAÇÃO DE ENTRADA — IntersectionObserver
   ================================================ */

function iniciarAnimacaoEntrada() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".card-produto").forEach(function (c) {
      c.style.transitionDelay = "0s";
      c.classList.add("card-visivel");
    });
    return;
  }
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("card-visivel");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll(".grade").forEach(function (grade) {
    grade.querySelectorAll(".card-produto").forEach(function (card, i) {
      card.style.transitionDelay = ((i % 4) * 0.1).toFixed(2) + "s";
      observer.observe(card);
    });
  });
}

/* ================================================
   PAINEL "SOBRE" — clique no logo
   ================================================ */

function criarSobreUI() {
  var overlay = document.createElement("div");
  overlay.id = "c21-sobre-overlay";
  overlay.className = "c21-sobre-overlay";
  overlay.addEventListener("click", fecharSobre);
  document.body.appendChild(overlay);

  var painel = document.createElement("div");
  painel.id = "c21-sobre";
  painel.className = "c21-sobre";
  painel.innerHTML =
    '<div class="c21-sobre-inner">' +
    '<div class="c21-sobre-col">' +
    '<p class="c21-sobre-label">Sobre</p>' +
    '<h2 class="c21-sobre-titulo">Club 21</h2>' +
    '<p class="c21-sobre-desc">Essenciais modernos para quem vive com intenção. Peças criadas para durar, pensadas para expressar quem você é — do guarda-roupa ao cotidiano.</p>' +
    "</div>" +
    '<div class="c21-sobre-col">' +
    '<p class="c21-sobre-label">Coleção Outono / Inverno 2026</p>' +
    '<p class="c21-sobre-texto">Uma tensão entre estrutura e fluidez. Couros, tecidos encorpados e cortes precisos formam uma coleção que equilibra funcionalidade e elegância atemporal.</p>' +
    "</div>" +
    '<div class="c21-sobre-col">' +
    '<p class="c21-sobre-label">Redes sociais</p>' +
    '<nav class="c21-sobre-redes">' +
    '<a href="https://instagram.com" target="_blank" rel="noopener" class="c21-sobre-rede">Instagram</a>' +
    '<a href="https://tiktok.com" target="_blank" rel="noopener" class="c21-sobre-rede">TikTok</a>' +
    '<a href="https://pinterest.com" target="_blank" rel="noopener" class="c21-sobre-rede">Pinterest</a>' +
    "</nav>" +
    "</div>" +
    "</div>";
  document.body.appendChild(painel);

  var logo = document.querySelector(".logo");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", function () {
      if (painel.classList.contains("c21-sobre--aberto")) fecharSobre();
      else abrirSobre();
    });
  }
}

function abrirSobre() {
  document.getElementById("c21-sobre").classList.add("c21-sobre--aberto");
  document
    .getElementById("c21-sobre-overlay")
    .classList.add("c21-sobre-overlay--visivel");
}

function fecharSobre() {
  document.getElementById("c21-sobre").classList.remove("c21-sobre--aberto");
  document
    .getElementById("c21-sobre-overlay")
    .classList.remove("c21-sobre-overlay--visivel");
}

/* ================================================
   BUSCA — LUPA NO NAVBAR
   ================================================ */

function criarBuscaUI() {
  var painel = document.createElement("div");
  painel.id = "c21-busca";
  painel.className = "c21-busca";
  painel.innerHTML =
    '<div class="c21-busca-inner">' +
    '<svg class="c21-busca-icone" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
    '<input type="text" id="c21-busca-input" class="c21-busca-input" placeholder="Buscar produtos..." autocomplete="off">' +
    '<button id="c21-busca-fechar" class="c21-busca-fechar" aria-label="Fechar busca">×</button>' +
    "</div>" +
    '<p id="c21-busca-resultado" class="c21-busca-resultado"></p>';

  document.body.appendChild(painel);

  document
    .getElementById("c21-search-btn")
    .addEventListener("click", abrirBusca);
  document
    .getElementById("c21-busca-fechar")
    .addEventListener("click", fecharBusca);

  document
    .getElementById("c21-busca-input")
    .addEventListener("input", function () {
      termoBusca = this.value.trim();
      filtrarProdutos();
    });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharBusca();
  });
}

function abrirBusca() {
  document.getElementById("c21-busca").classList.add("c21-busca--aberta");
  document
    .getElementById("c21-search-btn")
    .classList.add("c21-search-btn--ativo");
  setTimeout(function () {
    var inp = document.getElementById("c21-busca-input");
    if (inp) inp.focus();
  }, 200);
}

function fecharBusca() {
  var painel = document.getElementById("c21-busca");
  if (!painel || !painel.classList.contains("c21-busca--aberta")) return;
  painel.classList.remove("c21-busca--aberta");
  document
    .getElementById("c21-search-btn")
    .classList.remove("c21-search-btn--ativo");
  document.getElementById("c21-busca-input").value = "";
  termoBusca = "";
  filtrarProdutos();
}

/* ================================================
   FILTROS DE PRODUTOS
   ================================================ */

function criarFiltrosUI() {
  var tamBtns = listaTamanhos
    .map(function (t) {
      return (
        '<button class="c21-filtro-btn" data-valor="' +
        t +
        '">' +
        t +
        "</button>"
      );
    })
    .join("");

  var wrap = document.createElement("div");
  wrap.className = "c21-filtro-widget-wrap";
  wrap.innerHTML =
    '<div class="c21-filtro-widget" id="c21-filtro-widget">' +
    '<button class="c21-filtro-trigger" id="c21-filtro-trigger">' +
    'Todos <span class="c21-filtro-trigger-arrow">▾</span>' +
    "</button>" +
    '<div class="c21-filtro-dropdown" id="c21-filtro-dropdown">' +
    '<div class="c21-filtro-grupo">' +
    '<span class="c21-filtro-label">Categoria</span>' +
    '<div class="c21-filtro-btns" id="c21-filtro-cat">' +
    '<button class="c21-filtro-btn c21-filtro-btn--ativo" data-valor="todos">Todos</button>' +
    '<button class="c21-filtro-btn" data-valor="feminino">Feminino</button>' +
    '<button class="c21-filtro-btn" data-valor="masculino">Masculino</button>' +
    "</div></div>" +
    '<div class="c21-filtro-grupo">' +
    '<span class="c21-filtro-label">Preço</span>' +
    '<div class="c21-filtro-btns" id="c21-filtro-preco">' +
    '<button class="c21-filtro-btn c21-filtro-btn--ativo" data-valor="todos">Todos</button>' +
    '<button class="c21-filtro-btn" data-valor="ate150">Até R$150</button>' +
    '<button class="c21-filtro-btn" data-valor="150-300">R$150–R$300</button>' +
    '<button class="c21-filtro-btn" data-valor="acima300">Acima de R$300</button>' +
    "</div></div>" +
    '<div class="c21-filtro-grupo">' +
    '<span class="c21-filtro-label">Tamanho</span>' +
    '<div class="c21-filtro-btns" id="c21-filtro-tam">' +
    '<button class="c21-filtro-btn c21-filtro-btn--ativo" data-valor="todos">Todos</button>' +
    tamBtns +
    "</div></div>" +
    '<button id="c21-filtro-limpar" class="c21-filtro-limpar" style="display:none">Limpar filtros</button>' +
    "</div>" /* fecha dropdown */ +
    "</div>"; /* fecha widget */

  /* Insere logo após o hero, antes dos produtos */
  var hero = document.querySelector(".hero");
  if (hero && hero.nextElementSibling) {
    hero.parentNode.insertBefore(wrap, hero.nextElementSibling);
  } else {
    var secao = document.querySelector(".secao-produtos");
    if (secao) secao.parentNode.insertBefore(wrap, secao);
  }

  /* Toggle ao clicar em "Todos" */
  document
    .getElementById("c21-filtro-trigger")
    .addEventListener("click", function (e) {
      e.stopPropagation();
      var dd = document.getElementById("c21-filtro-dropdown");
      if (dd.classList.contains("c21-filtro-dropdown--aberto")) fecharFiltros();
      else abrirFiltros();
    });

  /* Fecha ao clicar fora */
  document.addEventListener("click", function (e) {
    var widget = document.getElementById("c21-filtro-widget");
    if (widget && !widget.contains(e.target)) fecharFiltros();
  });

  /* Fecha com Escape */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharFiltros();
  });

  var grupos = [
    { id: "c21-filtro-cat", chave: "cat" },
    { id: "c21-filtro-preco", chave: "preco" },
    { id: "c21-filtro-tam", chave: "tam" },
  ];

  grupos.forEach(function (g) {
    var group = document.getElementById(g.id);
    if (!group) return;
    group.querySelectorAll(".c21-filtro-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        group.querySelectorAll(".c21-filtro-btn").forEach(function (b) {
          b.classList.remove("c21-filtro-btn--ativo");
        });
        btn.classList.add("c21-filtro-btn--ativo");
        if (g.chave === "cat") filtroCategoria = btn.dataset.valor;
        if (g.chave === "preco") filtroPreco = btn.dataset.valor;
        if (g.chave === "tam") filtroTamanho = btn.dataset.valor;
        filtrarProdutos();
        atualizarBotaoLimpar();
      });
    });
  });

  document
    .getElementById("c21-filtro-limpar")
    .addEventListener("click", limparFiltros);
}

function abrirFiltros() {
  var dd = document.getElementById("c21-filtro-dropdown");
  var trigger = document.getElementById("c21-filtro-trigger");
  if (dd) dd.classList.add("c21-filtro-dropdown--aberto");
  if (trigger) trigger.classList.add("c21-filtro-trigger--aberto");
}

function fecharFiltros() {
  var dd = document.getElementById("c21-filtro-dropdown");
  var trigger = document.getElementById("c21-filtro-trigger");
  if (dd) dd.classList.remove("c21-filtro-dropdown--aberto");
  if (trigger) trigger.classList.remove("c21-filtro-trigger--aberto");
}

function filtrarProdutos() {
  var idsFem = produtosFemininos.map(function (p) {
    return p.id;
  });
  var total = 0;

  todosProdutos.forEach(function (produto) {
    var card = document.querySelector(
      ".card-produto[data-id='" + produto.id + "']",
    );
    if (!card) return;

    var ehFem = idsFem.indexOf(produto.id) !== -1;

    var catOk =
      filtroCategoria === "todos" ||
      (filtroCategoria === "feminino" && ehFem) ||
      (filtroCategoria === "masculino" && !ehFem);

    var precoOk =
      filtroPreco === "todos" ||
      (filtroPreco === "ate150" && produto.preco <= 150) ||
      (filtroPreco === "150-300" &&
        produto.preco > 150 &&
        produto.preco <= 300) ||
      (filtroPreco === "acima300" && produto.preco > 300);

    var buscaOk =
      !termoBusca ||
      produto.nome.toLowerCase().indexOf(termoBusca.toLowerCase()) !== -1;

    var tamOk = true; /* todos os produtos têm todos os tamanhos */
    var visivel = catOk && precoOk && buscaOk && tamOk;
    card.classList.toggle("c21-card-oculto", !visivel);
    if (visivel) total++;
  });

  /* Oculta secções sem resultados */
  var secF = document.getElementById("feminino");
  var secM = document.getElementById("masculino");
  var divisor = document.querySelector(".divisor");
  var gradeF = document.getElementById("grade-feminino");
  var gradeM = document.getElementById("grade-masculino");

  if (secF && gradeF) {
    var vF =
      gradeF.querySelectorAll(".card-produto:not(.c21-card-oculto)").length > 0;
    secF.style.display = vF ? "" : "none";
  }
  if (secM && gradeM) {
    var vM =
      gradeM.querySelectorAll(".card-produto:not(.c21-card-oculto)").length > 0;
    secM.style.display = vM ? "" : "none";
    if (divisor) divisor.style.display = vM ? "" : "none";
  }

  /* Atualiza contador de busca */
  var resEl = document.getElementById("c21-busca-resultado");
  var painel = document.getElementById("c21-busca");
  if (
    resEl &&
    painel &&
    painel.classList.contains("c21-busca--aberta") &&
    termoBusca
  ) {
    resEl.textContent =
      total +
      " produto" +
      (total !== 1 ? "s" : "") +
      " encontrado" +
      (total !== 1 ? "s" : "");
  } else if (resEl) {
    resEl.textContent = "";
  }
}

function atualizarBotaoLimpar() {
  var btnLimpar = document.getElementById("c21-filtro-limpar");
  var trigger = document.getElementById("c21-filtro-trigger");
  var temFiltro =
    filtroCategoria !== "todos" ||
    filtroPreco !== "todos" ||
    filtroTamanho !== "todos";
  if (btnLimpar) btnLimpar.style.display = temFiltro ? "" : "none";
  if (trigger) trigger.classList.toggle("c21-filtro-trigger--ativo", temFiltro);
}

function limparFiltros() {
  filtroCategoria = "todos";
  filtroPreco = "todos";
  filtroTamanho = "todos";

  document.querySelectorAll(".c21-filtro-btn").forEach(function (btn) {
    btn.classList.toggle(
      "c21-filtro-btn--ativo",
      btn.dataset.valor === "todos",
    );
  });

  filtrarProdutos();
  var btn = document.getElementById("c21-filtro-limpar");
  if (btn) btn.style.display = "none";
}

/* ================================================
   INICIALIZAÇÃO
   ================================================ */

/* ================================================
   FOOTER — Newsletter
   ================================================ */

function iniciarMenuMobile() {
  var toggle = document.getElementById("c21-menu-toggle");
  var menu = document.querySelector(".menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", function () {
    toggle.classList.toggle("ativo");
    menu.classList.toggle("menu--aberto");
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      toggle.classList.remove("ativo");
      menu.classList.remove("menu--aberto");
    });
  });
}

function iniciarCategoriasFooter() {
  document.querySelectorAll("a[data-filtro]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var termo = link.dataset.filtro;
      var href = link.getAttribute("href");

      termoBusca = termo;
      abrirBusca();
      var input = document.getElementById("c21-busca-input");
      if (input) input.value = termo;
      filtrarProdutos();

      setTimeout(function () {
        var secao = document.querySelector(href);
        if (secao) secao.scrollIntoView({ behavior: "smooth" });
      }, 120);
    });
  });
}

function iniciarFooter() {
  var btn = document.getElementById("c21-footer-nl-btn");
  var input = document.getElementById("c21-footer-nl-email");
  var ok = document.getElementById("c21-footer-nl-ok");
  var wrap = document.getElementById("c21-footer-nl-wrap");
  if (!btn || !input) return;

  function inscrever() {
    var email = input.value.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    localStorage.setItem("c21-newsletter", email);
    if (wrap) wrap.style.display = "none";
    if (ok) ok.textContent = "✓ Inscrito com sucesso!";
  }

  wrap.addEventListener("submit", function (e) {
    e.preventDefault();
    inscrever();
  });

  if (
    (localStorage.getItem("c21-newsletter") ||
      localStorage.getItem("c21-cadastro")) &&
    wrap &&
    ok
  ) {
    wrap.style.display = "none";
    ok.textContent = "✓ Já inscrito.";
  }
}

/* ================================================
   TEMA — Claro / Escuro
   ================================================ */

function iniciarTema() {
  var btn = document.getElementById("c21-tema-btn");
  if (!btn) return;

  function aplicarTema(dark) {
    document.body.classList.toggle("dark", dark);
    btn.setAttribute("aria-label", dark ? "Modo claro" : "Modo escuro");
    localStorage.setItem("c21-tema", dark ? "dark" : "light");
  }

  btn.addEventListener("click", function () {
    aplicarTema(!document.body.classList.contains("dark"));
  });
}

/* Impede que o browser restaure a posição de scroll ao recarregar */
if (history.scrollRestoration) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

exibirSecaoF();
exibirSecaoM();
criarCarrinhoUI();
criarProvadorUI();
criarCheckoutUI();
criarPopupDesconto();
criarSobreUI();
criarBuscaUI();
criarFiltrosUI();
iniciarFooter();
iniciarCategoriasFooter();
iniciarMenuMobile();
iniciarTema();
iniciarAnimacaoEntrada();

/* Inicializa EmailJS uma única vez após o carregamento da página */
if (typeof emailjs !== "undefined") {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

/* ================================================
   ESCAPE — fecha o painel/modal aberto no momento
   ================================================ */
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;

  var checkout = document.getElementById("c21-checkout");
  if (checkout && checkout.classList.contains("c21-checkout--aberto")) {
    fecharCheckout();
    return;
  }
  var provador = document.getElementById("c21-provador");
  if (provador && provador.classList.contains("c21-provador--aberto")) {
    fecharProvador();
    return;
  }
  var popup = document.getElementById("c21-popup");
  if (popup && popup.classList.contains("c21-popup--aberto")) {
    fecharPopup();
    return;
  }
  var sobre = document.getElementById("c21-sobre");
  if (sobre && sobre.classList.contains("c21-sobre--aberto")) {
    fecharSobre();
    return;
  }
  var drawer = document.getElementById("c21-drawer");
  if (drawer && drawer.classList.contains("c21-drawer--aberto")) {
    fecharDrawer();
    return;
  }
});
