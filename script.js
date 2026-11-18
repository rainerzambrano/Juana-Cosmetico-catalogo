// ─── JUANA COSMÉTICOS — LOJA (catálogo demonstrativo) ─────────────────────────
// Fonte de dados híbrida:
//  • com firebase-config.js preenchido → carrega o SDK do Firebase e lê o Firestore;
//  • sem configuração, ou se uma coleção estiver vazia/indisponível → usa data/catalogo-demo.js.
// O carrinho é apenas demonstrativo: não há checkout, pagamento nem envio de pedido.
// ─────────────────────────────────────────────────────────────────────────────
const FIREBASE_SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const FIREBASE_CONFIGURADO =
    typeof firebaseConfig !== "undefined" && Boolean(firebaseConfig.projectId);
const DEMO =
    typeof CATALOGO_DEMO !== "undefined"
        ? CATALOGO_DEMO
        : { loja: {}, categorias: [], produtos: [], servicos: [], cupons: [] };
const CHAVE_CARRINHO = "juana:carrinho";
const CHAVE_FAVORITOS = "juana:favoritos";
const IMAGEM_PADRAO = "./assets/juana-monograma.svg";

// --- FIREBASE (opcional) ---
const carregarScript = (src) =>
    new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
        document.head.appendChild(s);
    });

const conectarFirestore = async () => {
    if (!FIREBASE_CONFIGURADO) return null;
    try {
        await carregarScript(`${FIREBASE_SDK}firebase-app-compat.js`);
        await carregarScript(`${FIREBASE_SDK}firebase-firestore-compat.js`);
        firebase.initializeApp(firebaseConfig);
        return firebase.firestore();
    } catch (e) {
        console.warn("Firebase indisponível; usando os dados demonstrativos.", e);
        return null;
    }
};

// Lê uma coleção do Firestore; em caso de erro ou coleção vazia, devolve os dados locais.
const lerColecao = async (db, nome, padrao, ajustarConsulta) => {
    if (!db) return padrao;
    try {
        let ref = db.collection(nome);
        if (ajustarConsulta) ref = ajustarConsulta(ref);
        const snap = await ref.get();
        const docs = snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
        return docs.length ? docs : padrao;
    } catch (e) {
        console.error(`Erro ao carregar "${nome}" do Firebase:`, e);
        return padrao;
    }
};

const lerConfiguracoes = async (db) => {
    if (!db) return {};
    try {
        const doc = await db.collection("configuracoes").doc("geral").get();
        return doc.exists ? doc.data() : {};
    } catch (e) {
        console.error("Erro ao carregar configurações da loja:", e);
        return {};
    }
};

// --- UTILITÁRIOS ---
// localStorage pode estar bloqueado (aba anônima, cookies desativados): tudo em try/catch.
const armazenamento = {
    ler(chave, padrao) {
        try {
            const valor = localStorage.getItem(chave);
            const dados = valor ? JSON.parse(valor) : padrao;
            // JSON válido também pode ter um formato inesperado (null, objeto ou texto).
            // Carrinho e favoritos sempre precisam de listas para não interromper a página.
            if (Array.isArray(padrao) && !Array.isArray(dados)) return padrao;
            return dados ?? padrao;
        } catch {
            return padrao;
        }
    },
    salvar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
        } catch {
            /* sem persistência: a página continua funcionando */
        }
    },
};

const esc = (valor) =>
    String(valor ?? "").replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

// Busca sem acento e sem diferenciar maiúsculas: "serum" encontra "Sérum".
const normalizar = (texto) =>
    String(texto ?? "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim();

const formatarMoeda = (v) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// WhatsApp só é ativado com número completo: 55 + DDD + celular (9 dígitos) ou fixo (8 dígitos).
const whatsappValido = (numero) => /^55[1-9]{2}(9\d{8}|[2-5]\d{7})$/.test(numero);

const porOrdem = (a, b) => (a.ordem ?? 999) - (b.ordem ?? 999);
const porId = (a, b) => (Number(a.id) || 0) - (Number(b.id) || 0);

document.addEventListener("DOMContentLoaded", async () => {
    // --- SELETORES GLOBAIS ---
    const cartIcon = document.querySelector(".cart-icon"),
        cartSidebar = document.querySelector(".cart-sidebar"),
        cartOverlay = document.querySelector(".cart-overlay"),
        closeCartBtn = document.querySelector(".close-cart-btn"),
        cartBody = document.querySelector(".cart-body"),
        cartBadge = document.querySelector(".cart-badge");
    const favHeaderBtn = document.querySelector(".fav-header-btn"),
        favBadge = document.querySelector(".fav-badge");
    const couponInput = document.getElementById("coupon-input"),
        applyCouponBtn = document.getElementById("apply-coupon-btn"),
        couponFeedback = document.getElementById("coupon-feedback"),
        couponHint = document.querySelector(".coupon-hint"),
        couponHintBtn = document.querySelector(".coupon-hint-btn");
    const subtotalElem = document.getElementById("cart-subtotal"),
        cartDiscountElem = document.getElementById("cart-discount"),
        discountLineElem = document.querySelector(".discount-line"),
        totalElem = document.getElementById("cart-total");
    const finishOrderBtn = document.getElementById("finish-order-btn");
    // Barra inferior (celular)
    const viewCartBanner = document.querySelector(".view-cart-banner"),
        bannerTotalElem = document.getElementById("banner-total"),
        viewCartBannerBtn = document.querySelector(".view-cart-banner-btn");
    // Catálogo e filtros
    const categoriesBar = document.getElementById("categories-bar"),
        searchInput = document.querySelector(".search-input"),
        sortSelect = document.getElementById("ordenacao"),
        favFilterBtn = document.querySelector(".fav-filter-btn"),
        resultsInfo = document.getElementById("results-info"),
        clearFiltersBtn = document.querySelector(".clear-filters-btn"),
        productsContainer = document.querySelector(".products-container"),
        catalogSection = document.getElementById("catalogo");
    // Serviços
    const servicesSection = document.getElementById("servicos"),
        servicesGrid = document.querySelector(".services-grid");
    // Modais
    const produtoModal = document.getElementById("produto-modal"),
        modalImg = document.getElementById("produto-modal-img"),
        modalCategoria = document.getElementById("produto-modal-categoria"),
        modalNome = document.getElementById("produto-modal-nome"),
        modalPreco = document.getElementById("produto-modal-preco"),
        modalDescricao = document.getElementById("produto-modal-descricao"),
        modalUsoBloco = document.getElementById("produto-modal-uso-bloco"),
        modalUso = document.getElementById("produto-modal-uso"),
        modalQtd = document.getElementById("produto-modal-qtd"),
        modalAddBtn = produtoModal.querySelector(".modal-add-btn"),
        modalFavBtn = produtoModal.querySelector(".modal-fav-btn");
    const pedidoModal = document.getElementById("pedido-modal"),
        pedidoItens = document.getElementById("pedido-itens"),
        pedidoResumo = document.getElementById("pedido-resumo"),
        orderResetBtn = pedidoModal.querySelector(".order-reset-btn");
    // Toast
    const toastEl = document.querySelector(".toast"),
        toastMsg = toastEl.querySelector(".toast-msg"),
        toastAction = toastEl.querySelector(".toast-action");

    // --- CARREGAR DADOS (Firestore ou demonstração local) ---
    const db = await conectarFirestore();
    const [produtosBrutos, categoriasBrutas, cuponsBrutos, servicosBrutos, configRemota] =
        await Promise.all([
            lerColecao(db, "produtos", DEMO.produtos, (ref) => ref.where("ativo", "!=", false)),
            lerColecao(db, "categorias", DEMO.categorias),
            lerColecao(db, "cupons", DEMO.cupons),
            lerColecao(db, "servicos", DEMO.servicos),
            lerConfiguracoes(db),
        ]);
    console.info(db ? "Fonte de dados: Firebase Firestore" : "Fonte de dados: demonstração local");

    const produtos = produtosBrutos
        .filter((p) => p.ativo !== false)
        .map((p) => ({ ...p, id: String(p.id ?? p.docId), preco: Number(p.preco) || 0 }));
    const categorias = categoriasBrutas.filter((c) => c.id && c.id !== "all").sort(porOrdem);
    const coupons = cuponsBrutos;
    const servicos = servicosBrutos.filter((s) => s.ativo !== false).sort(porOrdem);
    const configLoja = { ...DEMO.loja, ...configRemota };

    const produtoPorId = (id) => produtos.find((p) => p.id === String(id));
    const nomeCategoria = (id) => categorias.find((c) => c.id === id)?.nome || "";

    // --- CONFIGURAÇÕES DA LOJA (nome, cores, banner, contato) ---
    const aplicarConfiguracoesDaLoja = () => {
        const nomeLoja = configLoja.nomeLoja || "Juana Cosméticos";
        document.title = `${nomeLoja} | ${configLoja.slogan || "Catálogo"}`;

        const root = document.documentElement;
        if (configLoja.corPrimaria) root.style.setProperty("--primary-color", configLoja.corPrimaria);
        if (configLoja.corSecundaria) root.style.setProperty("--secondary-color", configLoja.corSecundaria);
        if (configLoja.corDestaque) root.style.setProperty("--accent-color", configLoja.corDestaque);

        document.querySelectorAll("[data-loja]").forEach((el) => {
            const valor = configLoja[el.dataset.loja];
            if (valor) el.textContent = valor;
        });

        const [primeiraPalavra, ...resto] = nomeLoja.split(" ");
        document.querySelector(".logo-name").textContent = primeiraPalavra;
        document.querySelector(".logo-sub").textContent = resto.join(" ");
        document.querySelector(".logo").setAttribute("aria-label", `${nomeLoja}, voltar ao início`);

        const hero = document.querySelector(".hero-section");
        if (hero && configLoja.bannerUrl) {
            hero.style.backgroundImage = `url("${String(configLoja.bannerUrl).replace(/"/g, "%22")}")`;
            hero.classList.add("hero--banner");
        }

        document.querySelector(".footer-year").textContent = new Date().getFullYear();

        // Link de WhatsApp só aparece com número completo e válido (o telefone demonstrativo não é).
        const numeroWhatsApp = String(configLoja.whatsapp || "").replace(/\D/g, "");
        const itemWhatsApp = document.querySelector(".footer-whatsapp");
        if (itemWhatsApp && whatsappValido(numeroWhatsApp)) {
            itemWhatsApp.innerHTML = `<i class="fa-brands fa-whatsapp" aria-hidden="true"></i> <a href="https://wa.me/${numeroWhatsApp}" target="_blank" rel="noopener">Fale pelo WhatsApp</a>`;
            itemWhatsApp.hidden = false;
        }
    };
    aplicarConfiguracoesDaLoja();

    // --- ESTADO DA APLICAÇÃO ---
    let carrinho = armazenamento
        .ler(CHAVE_CARRINHO, [])
        .filter((item) => item && produtoPorId(item.id))
        .map((item) => ({ id: String(item.id), quantidade: Math.max(1, Number.parseInt(item.quantidade, 10) || 1) }));
    const favoritos = new Set(armazenamento.ler(CHAVE_FAVORITOS, []).map(String));
    let appliedCoupon = null;

    // Variáveis de estado para filtros
    let categoriaAtiva = "all";
    let termoBusca = "";
    let ordenacao = "destaque";
    let somenteFavoritos = false;

    // --- ROLAGEM, FOCO E ANIMAÇÕES ---
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    const atualizarBloqueioScroll = () => {
        const bloquear =
            cartSidebar.classList.contains("show") || Boolean(document.querySelector("dialog[open]"));
        if (bloquear && !document.body.classList.contains("no-scroll")) {
            document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
            document.body.classList.add("no-scroll");
        } else if (!bloquear) {
            document.body.style.paddingRight = "";
            document.body.classList.remove("no-scroll");
        }
    };

    let focoAntesDoCarrinho = null;
    const abrirCarrinho = () => {
        focoAntesDoCarrinho = document.activeElement;
        cartSidebar.inert = false;
        cartSidebar.classList.add("show");
        cartOverlay.classList.add("show");
        cartIcon.setAttribute("aria-expanded", "true");
        atualizarBloqueioScroll();
        closeCartBtn.focus({ preventScroll: true });
    };
    const fecharCarrinho = () => {
        if (!cartSidebar.classList.contains("show")) return;
        cartSidebar.classList.remove("show");
        cartOverlay.classList.remove("show");
        cartSidebar.inert = true;
        cartIcon.setAttribute("aria-expanded", "false");
        atualizarBloqueioScroll();
        if (focoAntesDoCarrinho && document.contains(focoAntesDoCarrinho)) {
            focoAntesDoCarrinho.focus({ preventScroll: true });
        }
    };

    const animacaoVoarParaCarrinho = (productCard) => {
        if (reduzirMovimento.matches) return;
        const productImg = productCard.querySelector(".product-img");
        if (!productImg) return;
        const imgRect = productImg.getBoundingClientRect(),
            cartRect = cartIcon.getBoundingClientRect(),
            flyingImg = document.createElement("img");
        flyingImg.src = productImg.src;
        flyingImg.alt = "";
        flyingImg.classList.add("product-image-fly");
        flyingImg.style.left = `${imgRect.left}px`;
        flyingImg.style.top = `${imgRect.top}px`;
        flyingImg.style.width = `${imgRect.width}px`;
        flyingImg.style.height = `${imgRect.height}px`;
        document.body.appendChild(flyingImg);
        requestAnimationFrame(() => {
            flyingImg.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingImg.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingImg.style.width = "0px";
            flyingImg.style.height = "0px";
            flyingImg.style.opacity = "0";
        });
        flyingImg.addEventListener("transitionend", () => flyingImg.remove(), { once: true });
    };

    let toastTimer;
    const mostrarToast = (mensagem, comAcaoCarrinho = false) => {
        toastMsg.textContent = mensagem;
        toastAction.hidden = !comAcaoCarrinho;
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
    };

    // --- CATEGORIAS ---
    const renderizarCategoriasBar = () => {
        const botoesExtra = categorias
            .map(
                (c) => `
                    <button class="category-btn" type="button" data-category="${esc(c.id)}" aria-pressed="false">
                        <i class="fa-solid ${esc(c.icone || "fa-tag")}" aria-hidden="true"></i> ${esc(c.nome)}
                    </button>
                `,
            )
            .join("");
        categoriesBar.innerHTML = `
            <button class="category-btn active" type="button" data-category="all" aria-pressed="true">
                <i class="fa-solid fa-border-all" aria-hidden="true"></i> Todos
            </button>
            ${botoesExtra}
        `;
    };

    // --- FILTROS, ORDENAÇÃO E LISTAGEM ---
    const filtrosAtivos = () => categoriaAtiva !== "all" || termoBusca.trim() !== "" || somenteFavoritos;
    const favoritosValidos = () => produtos.filter((p) => favoritos.has(p.id));

    const ordenarProdutos = (lista) => {
        const copia = [...lista];
        switch (ordenacao) {
            case "menor-preco":
                return copia.sort((a, b) => a.preco - b.preco || porId(a, b));
            case "maior-preco":
                return copia.sort((a, b) => b.preco - a.preco || porId(a, b));
            case "nome":
                return copia.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
            default:
                return copia.sort((a, b) => Number(Boolean(b.destaque)) - Number(Boolean(a.destaque)) || porId(a, b));
        }
    };

    const cardProduto = (p) => {
        const fav = favoritos.has(p.id);
        const nome = esc(p.nome);
        return `
            <article class="product-card" data-id="${esc(p.id)}">
                <div class="product-media" data-action="detalhes" aria-hidden="true">
                    <img class="product-img" src="${esc(p.imagem || IMAGEM_PADRAO)}" alt="" loading="lazy" width="600" height="600">
                </div>
                ${p.destaque ? '<span class="product-flag">Destaque</span>' : ""}
                <button type="button" class="fav-btn" data-action="favoritar" aria-pressed="${fav}"
                    aria-label="${fav ? "Remover" : "Adicionar"} ${nome} ${fav ? "dos" : "aos"} favoritos">
                    <i class="fa-${fav ? "solid" : "regular"} fa-heart" aria-hidden="true"></i>
                </button>
                <div class="product-info">
                    <span class="product-category">${esc(nomeCategoria(p.categoria))}</span>
                    <h3 class="product-name"><button type="button" data-action="detalhes">${nome}</button></h3>
                    <p class="product-description">${esc(p.descricao)}</p>
                    <div class="product-footer">
                        <p class="product-price">${formatarMoeda(p.preco)}</p>
                        <button type="button" class="product-button" data-action="adicionar" aria-label="Adicionar ${nome} ao carrinho">
                            <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i> Adicionar
                        </button>
                    </div>
                </div>
            </article>
        `;
    };

    const estadoVazio = () => {
        if (somenteFavoritos && favoritosValidos().length === 0) {
            return `
                <div class="empty-state">
                    <i class="fa-regular fa-heart" aria-hidden="true"></i>
                    <strong>Você ainda não salvou favoritos</strong>
                    <p>Toque no coração de um produto para guardá-lo aqui.</p>
                    <button type="button" class="btn btn-ghost" data-action="limpar-filtros">Ver todos os produtos</button>
                </div>`;
        }
        return `
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <strong>Nenhum produto encontrado</strong>
                <p>Tente outro termo ou limpe os filtros.</p>
                <button type="button" class="btn btn-ghost" data-action="limpar-filtros">Limpar filtros</button>
            </div>`;
    };

    // Função para filtrar e mostrar produtos
    const filtrarEMostrarProdutos = () => {
        let produtosFiltrados = produtos;

        // Filtro por categoria
        if (categoriaAtiva !== "all") {
            produtosFiltrados = produtosFiltrados.filter((p) => p.categoria === categoriaAtiva);
        }

        // Filtro de favoritos
        if (somenteFavoritos) {
            produtosFiltrados = produtosFiltrados.filter((p) => favoritos.has(p.id));
        }

        // Filtro por busca (todas as palavras precisam aparecer em nome, descrição ou categoria)
        const palavras = normalizar(termoBusca).split(/\s+/).filter(Boolean);
        if (palavras.length) {
            produtosFiltrados = produtosFiltrados.filter((p) => {
                const texto = normalizar(`${p.nome} ${p.descricao} ${nomeCategoria(p.categoria)}`);
                return palavras.every((palavra) => texto.includes(palavra));
            });
        }

        produtosFiltrados = ordenarProdutos(produtosFiltrados);
        productsContainer.innerHTML = produtosFiltrados.length
            ? produtosFiltrados.map(cardProduto).join("")
            : estadoVazio();

        const plural = (q) => `${q} ${q === 1 ? "produto" : "produtos"}`;
        let info = filtrosAtivos()
            ? `${produtosFiltrados.length} de ${plural(produtos.length)}`
            : plural(produtos.length);
        if (termoBusca.trim()) info += ` para “${termoBusca.trim()}”`;
        resultsInfo.textContent = info;
        clearFiltersBtn.hidden = !filtrosAtivos();
    };

    const sincronizarControles = () => {
        categoriesBar.querySelectorAll(".category-btn").forEach((b) => {
            const ativo = b.dataset.category === categoriaAtiva;
            b.classList.toggle("active", ativo);
            b.setAttribute("aria-pressed", String(ativo));
        });
        favFilterBtn.setAttribute("aria-pressed", String(somenteFavoritos));
        favFilterBtn.querySelector("i").className = `fa-${somenteFavoritos ? "solid" : "regular"} fa-heart`;
        if (searchInput.value !== termoBusca) searchInput.value = termoBusca;
        sortSelect.value = ordenacao;
    };

    const limparFiltros = () => {
        categoriaAtiva = "all";
        termoBusca = "";
        somenteFavoritos = false;
        sincronizarControles();
        filtrarEMostrarProdutos();
    };

    // --- FAVORITOS ---
    const atualizarFavoritosUI = () => {
        const total = favoritosValidos().length;
        favBadge.textContent = total;
        favBadge.classList.toggle("is-empty", total === 0);
        favHeaderBtn.classList.toggle("has-favs", total > 0);
        favHeaderBtn.querySelector("i").className = `fa-${total ? "solid" : "regular"} fa-heart`;
        favHeaderBtn.setAttribute("aria-label", `Ver favoritos (${total})`);
    };

    const atualizarBotaoFavorito = (botao, produto) => {
        if (!botao || !produto) return;
        const fav = favoritos.has(produto.id);
        botao.setAttribute("aria-pressed", String(fav));
        botao.setAttribute("aria-label", `${fav ? "Remover" : "Adicionar"} ${produto.nome} ${fav ? "dos" : "aos"} favoritos`);
        botao.querySelector("i").className = `fa-${fav ? "solid" : "regular"} fa-heart`;
    };

    const alternarFavorito = (id) => {
        const produto = produtoPorId(id);
        if (!produto) return;
        if (favoritos.has(produto.id)) favoritos.delete(produto.id);
        else favoritos.add(produto.id);
        armazenamento.salvar(CHAVE_FAVORITOS, [...favoritos]);
        atualizarFavoritosUI();

        if (somenteFavoritos) {
            filtrarEMostrarProdutos();
        } else {
            const card = productsContainer.querySelector(`.product-card[data-id="${CSS.escape(produto.id)}"]`);
            atualizarBotaoFavorito(card?.querySelector(".fav-btn"), produto);
        }
        if (produtoEmDetalhe?.id === produto.id) atualizarBotaoFavorito(modalFavBtn, produto);
        if (!produtoModal.open) {
            mostrarToast(favoritos.has(produto.id) ? "Salvo nos favoritos." : "Removido dos favoritos.");
        }
    };

    // --- DETALHES DO PRODUTO ---
    let produtoEmDetalhe = null;
    let qtdDetalhe = 1;

    const abrirDetalhes = (id) => {
        const p = produtoPorId(id);
        if (!p) return;
        produtoEmDetalhe = p;
        qtdDetalhe = 1;
        modalImg.src = p.imagem || IMAGEM_PADRAO;
        modalImg.alt = `Ilustração do produto ${p.nome}`;
        modalCategoria.textContent = nomeCategoria(p.categoria);
        modalNome.textContent = p.nome;
        modalPreco.textContent = formatarMoeda(p.preco);
        modalDescricao.textContent = [p.descricao, p.detalhes].filter(Boolean).join(" ");
        modalUso.textContent = p.modoDeUso || "";
        modalUsoBloco.hidden = !p.modoDeUso;
        modalQtd.textContent = "1";
        atualizarBotaoFavorito(modalFavBtn, p);
        produtoModal.showModal();
        atualizarBloqueioScroll();
    };

    // --- CARRINHO ---
    const itensDoCarrinho = () =>
        carrinho
            .map((item) => ({ ...item, produto: produtoPorId(item.id) }))
            .filter((item) => item.produto);

    const calcularSubtotal = () =>
        itensDoCarrinho().reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0);

    const adicionarAoCarrinho = (produtoId, productCard, quantidade = 1) => {
        const produto = produtoPorId(produtoId);
        if (!produto) return;
        if (productCard) animacaoVoarParaCarrinho(productCard);

        const itemNoCarrinho = carrinho.find((item) => item.id === produto.id);
        if (itemNoCarrinho) itemNoCarrinho.quantidade += quantidade;
        else carrinho.push({ id: produto.id, quantidade });
        atualizarCarrinho();
        mostrarToast(`${produto.nome} adicionado ao carrinho.`, true);
    };

    const alterarQuantidade = (produtoId, acao) => {
        const item = carrinho.find((i) => i.id === produtoId);
        if (!item) return;
        if (acao === "aumentar") item.quantidade++;
        else if (acao === "diminuir") {
            item.quantidade--;
            if (item.quantidade <= 0) carrinho = carrinho.filter((i) => i.id !== produtoId);
        }
        atualizarCarrinho();
    };

    const calcularDesconto = (subtotal) => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.tipo === "fixo") return Math.min(Number(appliedCoupon.valor) || 0, subtotal);
        return subtotal * ((Number(appliedCoupon.valor) || 0) / 100);
    };

    const mqCelular = window.matchMedia("(max-width: 768px)");
    const atualizarBannerCarrinho = () => {
        const mostrar = carrinho.length > 0 && mqCelular.matches;
        viewCartBanner.classList.toggle("show", mostrar);
        viewCartBanner.inert = !mostrar;
        document.body.classList.toggle("has-cart-banner", mostrar);
    };

    const atualizarCarrinho = () => {
        const itens = itensDoCarrinho();
        if (itens.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-empty">
                    <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
                    <p>Seu carrinho está vazio.</p>
                    <button type="button" class="btn btn-ghost" data-action="ver-produtos">Ver produtos</button>
                </div>`;
        } else {
            cartBody.innerHTML = `<ul class="cart-list">${itens
                .map(
                    ({ produto: p, quantidade }) => `
                    <li class="cart-item" data-id="${esc(p.id)}">
                        <img src="${esc(p.imagem || IMAGEM_PADRAO)}" alt="" class="cart-item-img" width="68" height="68">
                        <div class="cart-item-info">
                            <h3 class="cart-item-name">${esc(p.nome)}</h3>
                            <p class="cart-item-price">${formatarMoeda(p.preco)} cada</p>
                            <div class="cart-item-controls">
                                <div class="qty-control" role="group" aria-label="Quantidade de ${esc(p.nome)}">
                                    <button type="button" class="quantity-btn" data-action="diminuir" aria-label="Diminuir quantidade">
                                        <i class="fa-solid fa-minus" aria-hidden="true"></i>
                                    </button>
                                    <span class="quantity">${quantidade}</span>
                                    <button type="button" class="quantity-btn" data-action="aumentar" aria-label="Aumentar quantidade">
                                        <i class="fa-solid fa-plus" aria-hidden="true"></i>
                                    </button>
                                </div>
                                <span class="cart-item-total">${formatarMoeda(p.preco * quantidade)}</span>
                            </div>
                        </div>
                        <button type="button" class="remove-item-btn" data-action="remover" aria-label="Remover ${esc(p.nome)} do carrinho">
                            <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
                        </button>
                    </li>`,
                )
                .join("")}</ul>`;
        }

        const subtotal = calcularSubtotal();
        if (appliedCoupon && appliedCoupon.valorMinimo && subtotal < appliedCoupon.valorMinimo) {
            appliedCoupon = null;
            couponFeedback.textContent = "Cupom removido: o pedido não atinge mais o valor mínimo exigido.";
            couponFeedback.classList.remove("success");
            couponFeedback.classList.add("error");
        }

        const discountAmount = calcularDesconto(subtotal);
        const total = subtotal - discountAmount;
        subtotalElem.textContent = formatarMoeda(subtotal);
        cartDiscountElem.textContent = `- ${formatarMoeda(discountAmount)}`;
        discountLineElem.hidden = discountAmount <= 0;
        totalElem.textContent = formatarMoeda(total);
        bannerTotalElem.textContent = formatarMoeda(total);

        const quantidadeTotal = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
        cartBadge.textContent = quantidadeTotal;
        cartBadge.classList.toggle("is-empty", quantidadeTotal === 0);
        cartIcon.setAttribute(
            "aria-label",
            `Abrir carrinho (${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"})`,
        );
        finishOrderBtn.disabled = carrinho.length === 0;

        atualizarBannerCarrinho();
        armazenamento.salvar(CHAVE_CARRINHO, carrinho);
    };

    // --- CUPOM (recurso demonstrativo) ---
    const cupomValido = (c) =>
        c.ativo !== false && !(c.validade && new Date(`${c.validade}T23:59:59`) < new Date());

    const applyCoupon = () => {
        const code = couponInput.value.trim().toUpperCase();
        const subtotal = calcularSubtotal();
        const foundCoupon = coupons.find((c) => String(c.codigo).toUpperCase() === code);
        couponFeedback.classList.remove("success", "error");

        if (!code) {
            couponFeedback.textContent = "Digite um código de cupom.";
            couponFeedback.classList.add("error");
            return;
        }
        if (carrinho.length === 0) {
            couponFeedback.textContent = "Adicione produtos antes de aplicar o cupom.";
            couponFeedback.classList.add("error");
            return;
        }

        if (!foundCoupon) {
            appliedCoupon = null;
            couponFeedback.textContent = "Cupom inválido.";
            couponFeedback.classList.add("error");
        } else if (foundCoupon.ativo === false) {
            appliedCoupon = null;
            couponFeedback.textContent = "Este cupom não está mais disponível.";
            couponFeedback.classList.add("error");
        } else if (!cupomValido(foundCoupon)) {
            appliedCoupon = null;
            couponFeedback.textContent = "Este cupom expirou.";
            couponFeedback.classList.add("error");
        } else if (foundCoupon.valorMinimo && subtotal < foundCoupon.valorMinimo) {
            appliedCoupon = null;
            couponFeedback.textContent = `Pedido mínimo de ${formatarMoeda(foundCoupon.valorMinimo)} para usar este cupom.`;
            couponFeedback.classList.add("error");
        } else {
            appliedCoupon = foundCoupon;
            couponFeedback.textContent = `Cupom ${foundCoupon.codigo} aplicado!`;
            couponFeedback.classList.add("success");
        }
        atualizarCarrinho();
    };

    const cupomDemo = coupons.find(cupomValido);
    if (cupomDemo) {
        couponHintBtn.textContent = cupomDemo.codigo;
        couponHint.hidden = false;
    }

    // --- PEDIDO DEMONSTRATIVO (sem envio, sem pagamento) ---
    const simularPedido = () => {
        const itens = itensDoCarrinho();
        if (!itens.length) return;
        const subtotal = calcularSubtotal();
        const desconto = calcularDesconto(subtotal);

        pedidoItens.innerHTML = itens
            .map(
                ({ produto: p, quantidade }) =>
                    `<li><span>${quantidade}× ${esc(p.nome)}</span><span>${formatarMoeda(p.preco * quantidade)}</span></li>`,
            )
            .join("");
        pedidoResumo.innerHTML = `
            <div class="summary-line"><span>Subtotal</span><span>${formatarMoeda(subtotal)}</span></div>
            ${desconto > 0 ? `<div class="summary-line discount-line"><span>Desconto (${esc(appliedCoupon.codigo)})</span><span>- ${formatarMoeda(desconto)}</span></div>` : ""}
            <div class="summary-line total"><span>Total</span><span>${formatarMoeda(subtotal - desconto)}</span></div>`;

        fecharCarrinho();
        pedidoModal.showModal();
        atualizarBloqueioScroll();
    };

    const esvaziarCarrinho = () => {
        carrinho = [];
        appliedCoupon = null;
        couponInput.value = "";
        couponFeedback.textContent = "";
        couponFeedback.classList.remove("success", "error");
        atualizarCarrinho();
    };

    // --- SERVIÇOS ---
    const precoServico = (s) => {
        const preco = Number(s.preco) || 0;
        if (preco <= 0) return esc(s.rotuloPreco || "Gratuito");
        return s.aPartirDe ? `<small>a partir de</small>${formatarMoeda(preco)}` : formatarMoeda(preco);
    };

    const renderizarServicos = () => {
        if (!servicos.length) {
            servicesSection.hidden = true;
            return;
        }
        servicesGrid.innerHTML = servicos
            .map(
                (s) => `
                <article class="service-card">
                    <span class="service-icon" aria-hidden="true"><i class="fa-solid ${esc(s.icone || "fa-star")}"></i></span>
                    <h3>${esc(s.nome)}</h3>
                    <p>${esc(s.descricao)}</p>
                    <p class="service-price">${precoServico(s)}</p>
                </article>`,
            )
            .join("");
    };

    // --- EVENT LISTENERS ---
    cartIcon.addEventListener("click", abrirCarrinho);
    closeCartBtn.addEventListener("click", fecharCarrinho);
    cartOverlay.addEventListener("click", fecharCarrinho);
    viewCartBannerBtn.addEventListener("click", abrirCarrinho);
    applyCouponBtn.addEventListener("click", applyCoupon);
    couponInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") applyCoupon();
    });
    couponHintBtn.addEventListener("click", () => {
        couponInput.value = couponHintBtn.textContent;
        applyCoupon();
    });
    finishOrderBtn.addEventListener("click", simularPedido);
    mqCelular.addEventListener("change", atualizarBannerCarrinho);
    toastAction.addEventListener("click", () => {
        toastEl.classList.remove("show");
        abrirCarrinho();
    });

    // Esc fecha o carrinho; Tab fica preso dentro dele enquanto estiver aberto
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && cartSidebar.classList.contains("show") && !document.querySelector("dialog[open]")) {
            fecharCarrinho();
        }
    });
    cartSidebar.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;
        const focaveis = [...cartSidebar.querySelectorAll("button:not([disabled]), input, [href]")].filter(
            (el) => el.offsetParent !== null,
        );
        if (!focaveis.length) return;
        const primeiro = focaveis[0],
            ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
            e.preventDefault();
            ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
            e.preventDefault();
            primeiro.focus();
        }
    });

    // Botões de categoria (delegação, pois são renderizados dinamicamente)
    categoriesBar.addEventListener("click", (e) => {
        const btn = e.target.closest(".category-btn");
        if (!btn) return;
        categoriaAtiva = btn.dataset.category;
        sincronizarControles();
        filtrarEMostrarProdutos();
    });

    // Campo de busca
    searchInput.addEventListener("input", (e) => {
        termoBusca = e.target.value;
        filtrarEMostrarProdutos();
    });

    sortSelect.addEventListener("change", () => {
        ordenacao = sortSelect.value;
        filtrarEMostrarProdutos();
    });

    favFilterBtn.addEventListener("click", () => {
        somenteFavoritos = !somenteFavoritos;
        sincronizarControles();
        filtrarEMostrarProdutos();
    });

    favHeaderBtn.addEventListener("click", () => {
        categoriaAtiva = "all";
        termoBusca = "";
        somenteFavoritos = true;
        sincronizarControles();
        filtrarEMostrarProdutos();
        catalogSection.scrollIntoView({ behavior: reduzirMovimento.matches ? "auto" : "smooth" });
    });

    clearFiltersBtn.addEventListener("click", limparFiltros);

    productsContainer.addEventListener("click", (e) => {
        const alvo = e.target.closest("[data-action]");
        if (!alvo) return;
        const acao = alvo.dataset.action;
        if (acao === "limpar-filtros") {
            limparFiltros();
            return;
        }
        const productCard = alvo.closest(".product-card");
        if (!productCard) return;
        const id = productCard.dataset.id;
        if (acao === "adicionar") adicionarAoCarrinho(id, productCard);
        else if (acao === "favoritar") alternarFavorito(id);
        else if (acao === "detalhes") abrirDetalhes(id);
    });

    cartBody.addEventListener("click", (e) => {
        const alvo = e.target.closest("[data-action]");
        if (!alvo) return;
        if (alvo.dataset.action === "ver-produtos") {
            fecharCarrinho();
            catalogSection.scrollIntoView({ behavior: reduzirMovimento.matches ? "auto" : "smooth" });
            return;
        }
        const cartItem = alvo.closest(".cart-item");
        if (!cartItem) return;
        const produtoId = cartItem.dataset.id;
        const acao = alvo.dataset.action;
        if (acao === "remover") {
            carrinho = carrinho.filter((i) => i.id !== produtoId);
            atualizarCarrinho();
            closeCartBtn.focus();
            return;
        }
        alterarQuantidade(produtoId, acao);
        // O carrinho é redesenhado: devolve o foco ao mesmo botão (ou ao de fechar, se o item saiu)
        const mesmoBotao = cartBody.querySelector(
            `.cart-item[data-id="${CSS.escape(produtoId)}"] [data-action="${acao}"]`,
        );
        (mesmoBotao || closeCartBtn).focus();
    });

    // Modais: botão fechar, clique no fundo e liberação da rolagem ao fechar
    [produtoModal, pedidoModal].forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal || e.target.closest("[data-fechar]")) modal.close();
        });
        modal.addEventListener("close", atualizarBloqueioScroll);
    });

    produtoModal.querySelectorAll("[data-qtd]").forEach((btn) =>
        btn.addEventListener("click", () => {
            qtdDetalhe = Math.min(99, Math.max(1, qtdDetalhe + Number(btn.dataset.qtd)));
            modalQtd.textContent = qtdDetalhe;
        }),
    );
    modalAddBtn.addEventListener("click", () => {
        if (!produtoEmDetalhe) return;
        produtoModal.close();
        adicionarAoCarrinho(produtoEmDetalhe.id, null, qtdDetalhe);
    });
    modalFavBtn.addEventListener("click", () => {
        if (produtoEmDetalhe) alternarFavorito(produtoEmDetalhe.id);
    });

    orderResetBtn.addEventListener("click", () => {
        esvaziarCarrinho();
        pedidoModal.close();
        mostrarToast("Carrinho esvaziado.");
    });

    // --- INICIALIZAÇÃO ---
    renderizarCategoriasBar();
    renderizarServicos();
    filtrarEMostrarProdutos();
    atualizarFavoritosUI();
    atualizarCarrinho();
});
