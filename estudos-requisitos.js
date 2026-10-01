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

    function mesesDesdePeriodo(periodo, hoje = new Date()) {
        const valor = String(periodo || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const meses = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        let ano;
        let mes;

        const textual = valor.match(/\b(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s*\/?\s*(\d{4})\b/);
        const numerico = valor.match(/\b(\d{1,2})\s*[-/]\s*(\d{4})\b|\b(\d{4})\s*[-/]\s*(\d{1,2})\b/);
        if (textual) {
            mes = meses.indexOf(textual[1]);
            ano = Number(textual[2]);
        } else if (numerico) {
            if (numerico[1]) {
                mes = Number(numerico[1]) - 1;
                ano = Number(numerico[2]);
            } else {
                ano = Number(numerico[3]);
                mes = Number(numerico[4]) - 1;
            }
        } else {
            return null;
        }

        if (!Number.isInteger(mes) || mes < 0 || mes > 11 || !Number.isInteger(ano)) return null;
        const diferenca = (hoje.getFullYear() - ano) * 12 + (hoje.getMonth() - mes);
        return Math.max(0, diferenca);
    }

    const api = { FAIXAS, NIVEIS, normalizarFaixa, niveisObrigatorios, proximaFaixa, niveisPendentes, mesesDesdePeriodo };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.EstudosRequisitos = api;
})(typeof window !== 'undefined' ? window : globalThis);
