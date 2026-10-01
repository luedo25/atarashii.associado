(function (root) {
    'use strict';

    const FAIXAS = ['Branca', 'Amarela', 'Vermelha', 'Laranja', 'Verde', 'Roxa', 'Marrom', 'Preta'];
    const NIVEIS = ['basico', 'intermediario', 'avancado', 'especialista'];

    function normalizarFaixa(valor) {
        const parteFinal = String(valor || 'Branca').trim().split('/').pop();
        const normalizada = parteFinal.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return FAIXAS.find(faixa => normalizada.includes(faixa.toLowerCase())) || 'Branca';
    }

    function niveisObrigatorios(faixa) {
        const indice = FAIXAS.indexOf(normalizarFaixa(faixa));
        const total = indice <= 2 ? 1 : indice <= 4 ? 2 : indice <= 5 ? 3 : 4;
        return NIVEIS.slice(0, total);
    }

    function proximaFaixa(faixa) {
        const indice = FAIXAS.indexOf(normalizarFaixa(faixa));
        return indice < FAIXAS.length - 1 ? FAIXAS[indice + 1] : 'Próximo Dan (faixa preta)';
    }

    function niveisPendentes(progresso, faixa) {
        return niveisObrigatorios(faixa).filter(nivel => !progresso?.assessments?.[`pilar-${nivel}`]?.passed);
    }

    const api = { FAIXAS, NIVEIS, normalizarFaixa, niveisObrigatorios, proximaFaixa, niveisPendentes };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.EstudosRequisitos = api;
})(typeof window !== 'undefined' ? window : globalThis);
