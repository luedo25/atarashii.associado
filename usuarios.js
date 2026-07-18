// usuarios.js

// Sua lista oficial e fixa de alunos e senhas
const listaAlunos = [
    { usuario: "adriano.miguel", 
	senha: "Atarashii@26", 
	nome: "Adriano Miguel", 
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Janeiro / 2022", kihon: 7.9, kata: 7.9, kumite: 8.1, perguntas: 0.5, total: 24.4, media: 8.1 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Junho / 2022", kihon: 7.7, kata: 7.7, kumite: 8.5, perguntas: 0.3, total: 24.2, media: 8.1 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Dezembro / 2022", kihon: 7.2, kata: 7.3, kumite: 7.4, perguntas: 0.5, total: 22.4, media: 7.5 },
            { faixa: "Laranja/Verde", corFaixa: "#4caf50", corTexto: "#fff", ano: "Junho / 2023", kihon: 7.6, kata: 7.4, kumite: 7.6, perguntas: 0.5, total: 23.1, media: 7.7 },
            { faixa: "Verde/Roxa", corFaixa: "#673ab7", corTexto: "#fff", ano: "Junho / 2024", kihon: 7.8, kata: 7.8, kumite: 8.0, perguntas: 0.5, total: 24.1, media: 8.0 }
        ]	
	},
    { usuario: "luiz.costa", 
	senha: "123456", 
	nome: "Luiz Costa" 
	},
    { usuario: "luiz.guilherme", 
	senha: "123456", 
	nome: "Luiz Guilherme" 
	},
    { usuario: "arthur.penna", senha: "Kumite963", nome: "Arthur Penna" },
    { usuario: "benicio.barbosa", senha: "Oss296", nome: "Benicio Barbosa" },
    { usuario: "cleber.oliveira", senha: "Treino300", nome: "Cleber Oliveira" },
    { usuario: "davi.pereira", senha: "Treino994", nome: "Davi Pereira" },
    { usuario: "ederson.santos", senha: "Foco667", nome: "Ederson Santos" },
    { usuario: "edson.fernandes", senha: "Oss897", nome: "Edson Fernandes" },
    { usuario: "kiara.dominique", senha: "Treino298", nome: "Kiara Dominique" },
    { usuario: "klara.pereira", senha: "Oss230", nome: "Klara Pereira" },
    { usuario: "lucia.costa", senha: "Garra084", nome: "Lucia Costa" },
    { usuario: "mauricio.pires", senha: "Kata968", nome: "Mauricio Pires" },
    { usuario: "sofia.ferreira", senha: "Dojo496", nome: "Sofia Ferreira" },
    { usuario: "tamires.noa", senha: "Foco231", nome: "Tamires Noa" },
    { usuario: "watson.moura", senha: "Foco849", nome: "Watson Moura" }
];

/**
 * Função que o index.html vai chamar para validar direto nesta lista
 */
function autenticarUsuarioDireto(usuarioInformado, senhaInformada) {
    // Procura o usuário diretamente na constante acima
    return listaAlunos.find(u => u.usuario === usuarioInformado && u.senha === senhaInformada);
}
