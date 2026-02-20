var mesesNomes = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

var diasPorMes = [31,28,31,30,31,30,31,31,30,31,30,31];

var primeiroDiaSemana = [4,0,0,3,5,1,3,6,2,4,0,2];

var feriados = {
    "2026-01-01": "Confraternização Universal",
    "2026-02-16": "Carnaval",
    "2026-02-17": "Carnaval",
    "2026-02-18": "Quarta de Cinzas",
    "2026-04-03": "Sexta-Feira Santa",
    "2026-04-05": "Páscoa",
    "2026-04-21": "Tiradentes",
    "2026-05-01": "Dia do Trabalho",
    "2026-06-04": "Corpus Christi",
    "2026-07-26": "Aniversário de Goiânia",
    "2026-09-07": "Independência do Brasil",
    "2026-10-12": "Nossa Sra. Aparecida",
    "2026-11-02": "Finados",
    "2026-11-15": "Proclamação da República",
    "2026-11-20": "Consciência Negra",
    "2026-12-25": "Natal"
};

var mesAtual = 0;
var diaSelecionadoMes = null;
var diaSelecionadoDia = null;
var celulaSelecionada = null;
var abaAtiva = "notas";

/* ================================================
   UTILITÁRIOS
   ================================================ */

function padZero(n) {
    return n < 10 ? "0" + n : "" + n;
}

function chaveNota(mes, dia) {
    return "nota-2026-" + padZero(mes + 1) + "-" + padZero(dia);
}

function chaveLixeira(mes, dia) {
    return "lixeira-2026-" + padZero(mes + 1) + "-" + padZero(dia);
}

function feriadoKey(mes, dia) {
    return "2026-" + padZero(mes + 1) + "-" + padZero(dia);
}

/* ================================================
   NAVEGAÇÃO PÁGINAS PRELIMINARES
   ================================================ */

function irParaPaginaCalendario() {
    document.getElementById("pagina-capa").style.display = "none";
    document.getElementById("pagina-subcapa").style.display = "flex";
}

function irParaCapa() {
    document.getElementById("pagina-subcapa").style.display = "none";
    document.getElementById("pagina-capa").style.display = "flex";
}

function irParaCalendario() {
    document.getElementById("pagina-subcapa").style.display = "none";
    var cal = document.getElementById("pagina-calendario");
    cal.style.display = "flex";

    var mesInicial = 0;
    var hoje = new Date();
    if (hoje.getFullYear() === 2026) {
        mesInicial = hoje.getMonth();
    }
    irParaMes(mesInicial);
    renderizarPainelLateral();
}

/* ================================================
   RENDERIZAÇÃO DO MÊS
   ================================================ */

function renderizarMes(m) {
    var grade = document.getElementById("grade-calendario");
    grade.innerHTML = "";

    var totalDias = diasPorMes[m];
    var inicio    = primeiroDiaSemana[m];
    var hoje      = new Date();
    var esteAno   = hoje.getFullYear() === 2026;
    var esteMes   = hoje.getMonth() === m;

    for (var i = 0; i < inicio; i++) {
        var vazio = document.createElement("div");
        vazio.className = "dia vazio";
        grade.appendChild(vazio);
    }

    for (var dia = 1; dia <= totalDias; dia++) {
        var key     = feriadoKey(m, dia);
        var chave   = chaveNota(m, dia);
        var nota    = localStorage.getItem(chave);
        var feriado = feriados[key];
        var diaSem  = (inicio + dia - 1) % 7;

        var cell    = document.createElement("div");
        var classes = ["dia"];

        if (diaSem === 0) classes.push("domingo");
        if (diaSem === 6) classes.push("sabado");
        if (feriado)      classes.push("feriado");
        if (nota)         classes.push("tem-nota");
        if (esteAno && esteMes && hoje.getDate() === dia) classes.push("hoje");

        cell.className   = classes.join(" ");
        cell.dataset.dia = dia;
        cell.dataset.mes = m;

        var numSpan = document.createElement("span");
        numSpan.className   = "num-dia";
        numSpan.textContent = dia;
        cell.appendChild(numSpan);

        if (feriado) {
            var ferNome = document.createElement("span");
            ferNome.className   = "feriado-nome";
            ferNome.textContent = feriado;
            cell.appendChild(ferNome);
        }

        (function(d, mn, c) {
            c.addEventListener("click", function() {
                abrirZoomEModal(d, mn, c);
            });
        })(dia, m, cell);

        grade.appendChild(cell);
    }
}

/* ================================================
   MODAL DE ANOTAÇÃO
   ================================================ */

function abrirZoomEModal(dia, mes, celula) {
    if (celulaSelecionada && celulaSelecionada !== celula) {
        celulaSelecionada.classList.remove("zoom-ativo");
    }

    celulaSelecionada  = celula;
    celula.classList.add("zoom-ativo");

    diaSelecionadoDia = dia;
    diaSelecionadoMes = mes;

    var chave      = chaveNota(mes, dia);
    var nota       = localStorage.getItem(chave);
    var nomeMes    = mesesNomes[mes];
    var ferKey     = feriadoKey(mes, dia);
    var nomeFeriado = feriados[ferKey] ? " — " + feriados[ferKey] : "";

    document.getElementById("modal-anotacao-titulo").textContent = "Dia " + dia + " de " + nomeMes + nomeFeriado;
    document.getElementById("texto-anotacao").value = nota || "";

    var btnExcluir = document.getElementById("btnExcluir");
    btnExcluir.style.display = nota ? "inline-flex" : "none";

    document.getElementById("modal-anotacao").style.display = "flex";
}

function fecharModalAnotacao() {
    document.getElementById("modal-anotacao").style.display = "none";
    if (celulaSelecionada) {
        celulaSelecionada.classList.remove("zoom-ativo");
        celulaSelecionada = null;
    }
}

function salvarNota() {
    var texto = document.getElementById("texto-anotacao").value;
    var chave = chaveNota(diaSelecionadoMes, diaSelecionadoDia);

    if (texto.trim() === "") {
        localStorage.removeItem(chave);
    } else {
        localStorage.setItem(chave, texto);
    }

    fecharModalAnotacao();
    renderizarMes(mesAtual);
    renderizarPainelLateral();
}

function excluirNota() {
    var chave       = chaveNota(diaSelecionadoMes, diaSelecionadoDia);
    var chaveLix    = chaveLixeira(diaSelecionadoMes, diaSelecionadoDia);
    var textoAtual  = localStorage.getItem(chave);

    if (textoAtual && textoAtual.trim() !== "") {
        localStorage.setItem(chaveLix, textoAtual);
    }
    localStorage.removeItem(chave);

    fecharModalAnotacao();
    renderizarMes(mesAtual);
    renderizarPainelLateral();
}

/* ================================================
   PAINEL LATERAL — ABAS
   ================================================ */

function trocarAba(aba) {
    abaAtiva = aba;

    var abaNotas    = document.getElementById("abaNotas");
    var abaLixeira  = document.getElementById("abaLixeira");
    var listaNotas  = document.getElementById("painelLista");
    var listaLixo   = document.getElementById("painelLixeira");

    if (aba === "notas") {
        abaNotas.className    = "painel-aba ativa";
        abaLixeira.className  = "painel-aba";
        listaNotas.style.display  = "flex";
        listaLixo.style.display   = "none";
        renderizarPainelLateral();
    } else {
        abaLixeira.className  = "painel-aba ativa lixeira-aba";
        abaNotas.className    = "painel-aba";
        listaLixo.style.display   = "flex";
        listaNotas.style.display  = "none";
        renderizarLixeira();
    }
}

/* ================================================
   PAINEL LATERAL — ANOTAÇÕES
   ================================================ */

function renderizarPainelLateral() {
    var lista = document.getElementById("painelLista");
    lista.innerHTML = "";

    var grupos = {};

    for (var m = 0; m < 12; m++) {
        for (var d = 1; d <= diasPorMes[m]; d++) {
            var chave = chaveNota(m, d);
            var nota  = localStorage.getItem(chave);
            if (nota && nota.trim() !== "") {
                if (!grupos[m]) grupos[m] = [];
                grupos[m].push({ dia: d, nota: nota });
            }
        }
    }

    var keys = Object.keys(grupos).map(Number).sort(function(a, b) { return a - b; });

    if (keys.length === 0) {
        var p = document.createElement("p");
        p.className   = "painel-vazio";
        p.textContent = "Nenhuma anotação ainda.";
        lista.appendChild(p);
        return;
    }

    keys.forEach(function(m) {
        var grupo = document.createElement("div");
        grupo.className   = "painel-grupo-mes";
        grupo.textContent = mesesNomes[m];
        lista.appendChild(grupo);

        grupos[m].forEach(function(item) {
            var itemEl = document.createElement("div");
            itemEl.className = "painel-item";

            var diaEl = document.createElement("div");
            diaEl.className   = "painel-item-dia";
            diaEl.textContent = "Dia " + item.dia + " — " + mesesNomes[m];

            var textoEl = document.createElement("div");
            textoEl.className   = "painel-item-texto";
            textoEl.textContent = item.nota;

            itemEl.appendChild(diaEl);
            itemEl.appendChild(textoEl);

            (function(mes, dia) {
                itemEl.addEventListener("click", function() {
                    if (mes !== mesAtual) {
                        irParaMes(mes);
                        setTimeout(function() { zoomDiaNoCalendario(mes, dia); }, 80);
                    } else {
                        zoomDiaNoCalendario(mes, dia);
                    }
                });
            })(m, item.dia);

            lista.appendChild(itemEl);
        });
    });
}

/* ================================================
   PAINEL LATERAL — LIXEIRA
   ================================================ */

function renderizarLixeira() {
    var lista = document.getElementById("painelLixeira");
    lista.innerHTML = "";

    var itens = [];

    for (var m = 0; m < 12; m++) {
        for (var d = 1; d <= diasPorMes[m]; d++) {
            var chave = chaveLixeira(m, d);
            var nota  = localStorage.getItem(chave);
            if (nota && nota.trim() !== "") {
                itens.push({ mes: m, dia: d, nota: nota, chave: chave });
            }
        }
    }

    if (itens.length === 0) {
        var p = document.createElement("p");
        p.className   = "painel-vazio";
        p.textContent = "Lixeira vazia.";
        lista.appendChild(p);
        return;
    }

    itens.forEach(function(item) {
        var itemEl = document.createElement("div");
        itemEl.className = "lixeira-item";

        var diaEl = document.createElement("div");
        diaEl.className   = "lixeira-item-dia";
        diaEl.textContent = "Dia " + item.dia + " — " + mesesNomes[item.mes];

        var textoEl = document.createElement("div");
        textoEl.className   = "lixeira-item-texto";
        textoEl.textContent = item.nota;

        var acoesEl = document.createElement("div");
        acoesEl.className = "lixeira-item-acoes";

        var btnRest = document.createElement("button");
        btnRest.className   = "btn-restaurar";
        btnRest.textContent = "Restaurar";

        var btnPerm = document.createElement("button");
        btnPerm.className   = "btn-excluir-permanente";
        btnPerm.textContent = "Excluir";

        acoesEl.appendChild(btnRest);
        acoesEl.appendChild(btnPerm);

        itemEl.appendChild(diaEl);
        itemEl.appendChild(textoEl);
        itemEl.appendChild(acoesEl);

        (function(it) {
            btnRest.addEventListener("click", function() {
                var chaveNormal = chaveNota(it.mes, it.dia);
                localStorage.setItem(chaveNormal, it.nota);
                localStorage.removeItem(it.chave);
                renderizarLixeira();
                renderizarMes(mesAtual);
                renderizarPainelLateral();
            });

            btnPerm.addEventListener("click", function() {
                localStorage.removeItem(it.chave);
                renderizarLixeira();
            });
        })(item);

        lista.appendChild(itemEl);
    });
}

/* ================================================
   ZOOM NO DIA (via painel)
   ================================================ */

function zoomDiaNoCalendario(mes, dia) {
    var celulas = document.querySelectorAll("#grade-calendario .dia:not(.vazio)");
    celulas.forEach(function(c) {
        if (parseInt(c.dataset.dia) === dia && parseInt(c.dataset.mes) === mes) {
            if (celulaSelecionada && celulaSelecionada !== c) {
                celulaSelecionada.classList.remove("zoom-ativo");
            }
            celulaSelecionada = c;
            c.classList.add("zoom-ativo");
            c.scrollIntoView({ behavior: "smooth", block: "center" });

            var chave      = chaveNota(mes, dia);
            var nota       = localStorage.getItem(chave);
            var nomeMes    = mesesNomes[mes];
            var ferKey     = feriadoKey(mes, dia);
            var nomeFeriado = feriados[ferKey] ? " — " + feriados[ferKey] : "";

            document.getElementById("modal-anotacao-titulo").textContent = "Dia " + dia + " de " + nomeMes + nomeFeriado;
            document.getElementById("texto-anotacao").value = nota || "";

            var btnExcluir = document.getElementById("btnExcluir");
            btnExcluir.style.display = nota ? "inline-flex" : "none";

            document.getElementById("modal-anotacao").style.display = "flex";

            diaSelecionadoDia = dia;
            diaSelecionadoMes = mes;
        }
    });
}

/* ================================================
   NAVEGAÇÃO DE MESES
   ================================================ */

function irParaMes(m) {
    mesAtual = m;
    document.getElementById("calMesNome").textContent  = mesesNomes[m];
    document.getElementById("calAno").textContent      = "2026";
    document.getElementById("mesAtualNum").textContent = m + 1;

    document.getElementById("btnAnterior").disabled = (m === 0);
    document.getElementById("btnProximo").disabled  = (m === 11);

    var botoes = document.querySelectorAll(".mes");
    botoes.forEach(function(b) { b.classList.remove("ativo"); });
    botoes[m].classList.add("ativo");

    var container  = document.getElementById("mesesContainer");
    var botaoAtivo = botoes[m];
    container.scrollTo({
        left: botaoAtivo.offsetLeft - (container.offsetWidth / 2) + (botaoAtivo.offsetWidth / 2),
        behavior: "smooth"
    });

    if (celulaSelecionada) {
        celulaSelecionada.classList.remove("zoom-ativo");
        celulaSelecionada = null;
    }

    renderizarMes(m);
}

function proximoMes() {
    if (mesAtual < 11) irParaMes(mesAtual + 1);
}

function mesAnterior() {
    if (mesAtual > 0) irParaMes(mesAtual - 1);
}

/* ================================================
   MODAL DE AVISO (mobile)
   ================================================ */

function fecharModalAviso() {
    document.getElementById("modal-aviso").setAttribute("aria-hidden", "true");
    document.getElementById("cal-wrapper").classList.remove("bloqueado");
    document.getElementById("overlay-preload").classList.remove("ativo");
}

/* ================================================
   UTILITÁRIOS DE DISPOSITIVO
   ================================================ */

function isTouch() {
    return window.matchMedia("(pointer: coarse)").matches;
}

function isMobileTablet() {
    return Math.max(window.innerWidth, window.innerHeight) <= 1023;
}

function isPortrait() {
    return window.innerHeight > window.innerWidth;
}

/* ================================================
   ORIENTAÇÃO
   — Todos os dispositivos usam o layout desktop.
   — Em touch/mobile portrait: rotaciona o wrapper
     90° para forçar o visual landscape (desktop).
   — Em touch/mobile landscape físico: layout normal,
     overlay de aviso permanente até voltar ao portrait.
   — Hard-refresh em qualquer mudança de orientação
     para garantir renderização limpa.
   ================================================ */

function ajustarOrientacao() {
    var w = document.getElementById("cal-wrapper");

    if (!isTouch() || !isMobileTablet()) {
        w.style.cssText = "";
        document.body.classList.remove("rotacionado");
        document.getElementById("overlay-orientacao").classList.remove("ativo");
        return;
    }

    if (isPortrait()) {
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        w.style.position        = "fixed";
        w.style.width           = vh + "px";
        w.style.height          = vw + "px";
        w.style.top             = ((vh - vw) / 2) + "px";
        w.style.left            = ((vw - vh) / 2) + "px";
        w.style.transform       = "rotate(90deg)";
        w.style.transformOrigin = "center center";
        w.style.translate       = "";
        document.body.classList.add("rotacionado");
        document.getElementById("overlay-orientacao").classList.remove("ativo");
    } else {
        w.style.position        = "fixed";
        w.style.width           = "100vw";
        w.style.height          = "100vh";
        w.style.top             = "0";
        w.style.left            = "0";
        w.style.transform       = "none";
        w.style.transformOrigin = "";
        w.style.translate       = "";
        document.body.classList.remove("rotacionado");
        document.getElementById("overlay-orientacao").classList.add("ativo");
    }
}

/* ================================================
   INIT
   ================================================ */

document.addEventListener("DOMContentLoaded", function() {
    ajustarOrientacao();

    window.addEventListener("resize", ajustarOrientacao);
    window.addEventListener("orientationchange", function() {
        window.location.reload(true);
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") proximoMes();
        if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   mesAnterior();
        if (e.key === "Escape") fecharModalAnotacao();
    });

    document.getElementById("modal-anotacao").addEventListener("click", function(e) {
        if (e.target === this) fecharModalAnotacao();
    });

    document.querySelectorAll(".mes").forEach(function(el) {
        function mover(x, y) {
            var rect = el.getBoundingClientRect();
            el.style.setProperty("--x", ((x - rect.left) / rect.width  * 100) + "%");
            el.style.setProperty("--y", ((y - rect.top)  / rect.height * 100) + "%");
        }
        el.addEventListener("mousemove",  function(e) { mover(e.clientX, e.clientY); });
        el.addEventListener("touchmove",  function(e) { if (e.touches[0]) mover(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
        el.addEventListener("touchstart", function(e) { if (e.touches[0]) mover(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    });
});
