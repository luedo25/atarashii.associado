// usuarios.js

// Sua lista oficial e fixa de alunos e senhas
const listaAlunos = [
	{
        usuario: "luiz.costa",
        senha: "Atarashii@17",
        nome: "Sensei Luiz Costa",
        tipo: "professor", // Propriedade importante para identificar o perfil
        historico: []
    },
    { usuario: "adriano.miguel", senha: "Atarashii@26", nome: "Adriano Miguel", 
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Janeiro / 2022", kihon: 7.9, kata: 7.9, kumite: 8.1, perguntas: 0.5, total: 24.4, media: 8.1 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Junho / 2022", kihon: 7.7, kata: 7.7, kumite: 8.5, perguntas: 0.3, total: 24.2, media: 8.1 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Dezembro / 2022", kihon: 7.2, kata: 7.3, kumite: 7.4, perguntas: 0.5, total: 22.4, media: 7.5 },
            { faixa: "Laranja/Verde", corFaixa: "#4caf50", corTexto: "#fff", ano: "Junho / 2023", kihon: 7.6, kata: 7.4, kumite: 7.6, perguntas: 0.5, total: 23.1, media: 7.7 },
            { faixa: "Verde/Roxa", corFaixa: "#673ab7", corTexto: "#fff", ano: "Junho / 2024", kihon: 7.8, kata: 7.8, kumite: 8.0, perguntas: 0.5, total: 24.1, media: 8.0 }
        ]	
	},
	  { usuario: "maria.clara", senha: "Atarashii@26", nome: "Maria Clara", 
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Janeiro / 2022", kihon: 7.7, kata: 7.6, kumite: 8.0, perguntas: 0.5, total: 23.8, media: 7.9 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Junho / 2022", kihon: 7.5, kata: 7.5, kumite: 8.0, perguntas: 0.3, total: 23.2, media: 7.7 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Dezembro / 2022", kihon: 7.0, kata: 7.0, kumite: 7.5, perguntas: 0.5, total: 22.0, media: 7.3 },
            { faixa: "Laranja/Verde", corFaixa: "#4caf50", corTexto: "#fff", ano: "Dezembro / 2024", kihon: 7.5, kata: 7.5, kumite: 7.8, perguntas: 0.3, total: 23.1, media: 7.7 },
        ]
	{ usuario: "joaquim.gadelha", senha: "Treino301", nome: "Joaquim Gadelha" 
	},
	{ usuario: "davi.dantas", senha: "Treino309", nome: "Davi Dantas",
	 historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Julho / 2023", kihon: 7.3, kata: 7.4, kumite: 7.6, perguntas: 0.5, total: 22.8, media: 7.6 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Dezembro / 2023", kihon: 7.2, kata: 7.3, kumite: 7.3, perguntas: 0.5, total: 22.3, media: 7.4 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Dezembro / 2024", kihon: 7.5, kata: 7.6, kumite: 7.7, perguntas: 0.3, total: 23.1, media: 7.7 },
        ]	
	},
    { usuario: "luiz.guilherme", senha: "Kumite964", nome: "Luiz Guilherme", 
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Junho / 2018", kihon: 7.5, kata: 7.0, kumite: 7.5, perguntas: 0, total: 22, media: 7.3 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Dezembro / 2018", kihon: 7.8, kata: 7.8, kumite: 7.7, perguntas: 0.5, total: 23.8, media: 7.9 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Dezembro / 2019", kihon: 7.0, kata: 7.0, kumite: 8.0, perguntas: 0.3, total: 22.3, media: 7.4 },
            { faixa: "Laranja/Verde", corFaixa: "#4caf50", corTexto: "#fff", ano: "Dezembro / 2022", kihon: 6.9, kata: 7.0, kumite: 7.2, perguntas: 0.5, total: 21.6, media: 7.2 },
            { faixa: "Verde/Roxa", corFaixa: "#673ab7", corTexto: "#fff", ano: "Junho / 2024", kihon: 7.8, kata: 7.9, kumite: 8.0, perguntas: 0.5, total: 24.2, media: 8.1 }
        ]	
	},
    { usuario: "arthur.penna", senha: "Kumite963", nome: "Arthur Penna",
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Dezembro / 2024", kihon: 8.0, kata: 7.5, kumite: 8.0, perguntas: 0.3, total: 23.8, media: 7.9 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Junho / 2025", kihon: 7.9, kata: 8.0, kumite: 8.0, perguntas: 0.5, total: 24.4, media: 8.1 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Junho / 2026", kihon: 7.3, kata: 7.3, kumite: 7.0, perguntas: 0.6, total: 22.2, media: 7.4 },
	]
	},
    { usuario: "benicio.barbosa", senha: "Oss296", nome: "Benicio Barbosa",
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Dezembro / 2024", kihon: 7.3, kata: 7.5, kumite: 7.8, perguntas: 0.5, total: 23.1, media: 7.7 },
	]	
	},
    { usuario: "cleber.oliveira", senha: "Treino300", nome: "Cleber Oliveira",
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Dezembro / 2023", kihon: 9.0, kata: 8.5, kumite: 8.5, perguntas: 0.5, total: 26.5, media: 8.8 },
		    { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Dezembro / 2025", kihon: 7.5, kata: 7.2, kumite: 7.4, perguntas: 0.5, total: 22.6, media: 7.5 },
	]	
	},
    { usuario: "davi.pereira", senha: "Treino994", nome: "Davi Pereira",
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Dezembro / 2024", kihon: 7.0, kata: 7.5, kumite: 7.5, perguntas: 0.3, total: 22.3, media: 7.4 },
		    { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Junho / 2025", kihon: 7.5, kata: 7.0, kumite: 7.7, perguntas: 0.5, total: 22.7, media: 7.6 },
		    { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Dezembro / 2025", kihon: 7.2, kata: 7.2, kumite: 7.3, perguntas: 0.3, total: 22.0, media: 7.3 },
	]	
	},
    { usuario: "ederson.santos", senha: "Foco667", nome: "Ederson Santos",
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Julho / 2023", kihon: 7.0, kata: 7.5, kumite: 7.5, perguntas: 0.5, total: 22.5, media: 7.5 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Dezembro / 2023", kihon: 7.5, kata: 7.5, kumite: 7.5, perguntas: 0.5, total: 23.0, media: 7.7 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Dezembro / 2024", kihon: 8.0, kata: 7.0, kumite: 7.5, perguntas: 0.3, total: 22.8, media: 7.6 },
            { faixa: "Laranja/Verde", corFaixa: "#4caf50", corTexto: "#fff", ano: "Dezembro / 2025", kihon: 7.6, kata: 7.5, kumite: 7.6, perguntas: 0.3, total: 23.0, media: 7.7 },
		 ]	
	},
    { usuario: "edson.fernandes", senha: "Oss897", nome: "Edson Fernandes",
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Junho / 2022", kihon: 7.6, kata: 7.8, kumite: 7.9, perguntas: 0.5, total: 23.8, media: 7.9 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Dezembro / 2022", kihon: 7.2, kata: 7.2, kumite: 7.2, perguntas: 0.5, total: 22.1, media: 7.4 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Julho / 2023", kihon: 8.2, kata: 8.0, kumite: 7.8, perguntas: 0.5, total: 24.5, media: 8.1 },
            { faixa: "Laranja/Verde", corFaixa: "#4caf50", corTexto: "#fff", ano: "Dezembro / 2023", kihon: 8.5, kata: 8.0, kumite: 8.5, perguntas: 0.5, total: 25.5, media: 8.5 },
            { faixa: "Verde/Roxa", corFaixa: "#673ab7", corTexto: "#fff", ano: "Dezembro / 2025", kihon: 8.0, kata: 7.9, kumite: 8.0, perguntas: 0.5, total: 24.4, media: 8.1 }
        ]	
	},
    { usuario: "kiara.dominique", senha: "Treino298", nome: "Kiara Dominique",
		historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Julho / 2023", kihon: 7.2, kata: 7.2, kumite: 7.2, perguntas: 0.5, total: 22.1, media: 7.3 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Dezembro / 2023", kihon: 7.5, kata: 7.5, kumite: 8.0, perguntas: 0.5, total: 23.5, media: 7.8 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Dezembro / 2024", kihon: 7.5, kata: 7.5, kumite: 8.0, perguntas: 0.2, total: 23.2, media: 7.7},
			 ]	
	},
    { usuario: "klara.pereira", senha: "Oss230", nome: "Klara Pereira",
		historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Dezembro / 2024", kihon: 7.0, kata: 7.5, kumite: 7.0, perguntas: 0.2, total: 21.7, media: 7.2 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Junho / 2025", kihon: 8.5, kata: 9.2, kumite: 8.7, perguntas: 0.5, total: 26.9, media: 9.0 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Dezembro / 2025", kihon: 7.4, kata: 7.6, kumite: 7.4, perguntas: 0.5, total: 22.9, media: 7.6},
			{ faixa: "Laranja/Verde", corFaixa: "#4caf50", corTexto: "#fff", ano: "Junho / 2026", kihon: 7.4, kata: 7.4, kumite: 7.0, perguntas: 0.5, total: 25.5, media: 7.5 },
			 ]	
	},	
    { usuario: "lucia.costa", senha: "Garra084", nome: "Lucia Costa",
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Junho / 2026", kihon: 7.1, kata: 7.0, kumite: 7.1, perguntas: 0.4, total: 21.7, media: 7.1 },
		]	
	},
    { usuario: "mauricio.pires", senha: "Kata968", nome: "Mauricio Pires",
		historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Dezembro / 2023", kihon: 7.4, kata: 7.5, kumite: 7.4, perguntas: 0.5, total: 22.8, media: 7.6 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Dezembro / 2025", kihon: 7.2, kata: 7.3, kumite: 7.3, perguntas: 0.3, total: 22.1, media: 7.4 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Junho / 2026", kihon: 7.4, kata: 7.4, kumite: 7.5, perguntas: 0.4, total: 23.2, media: 7.4},
			 ]	
	},	
    { usuario: "sofia.ferreira", senha: "Dojo496", nome: "Sofia Ferreira",
		historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Junho / 2026", kihon: 7.3, kata: 7.3, kumite: 7.5, perguntas: 0.6, total: 22.8, media: 7.5 },
	 ]	
	},
    { usuario: "tamires.noa", senha: "Foco231", nome: "Tamires Noa",
	historico: [
            { faixa: "Preta", corFaixa: "#000000", corTexto: "#ffffff", ano: "Dezembro / 2023", kihon: 7.4, kata: 7.3, kumite: 7.5, perguntas: 0.0, total: 22.2, media: 7.4 },
	 ]	
	},
	{ usuario: "sarah.vargas", senha: "Foco238", nome: "Sarah Vargas",
	historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Dezembro / 2023", kihon: 7.0, kata: 7.0, kumite: 7.0, perguntas: 0.5, total: 21.5, media: 7.2 },
	 ]	
	},	
    { usuario: "watson.moura", senha: "Foco849", nome: "Watson Moura",
		historico: [
            { faixa: "Branca/Amarela", corFaixa: "#ffeb3b", corTexto: "#000", ano: "Dezembro / 2023", kihon: 7.7, kata: 7.6, kumite: 7.5, perguntas: 0.5, total: 23.3, media: 7.8 },
            { faixa: "Amarela/Vermelha", corFaixa: "#ff0000", corTexto: "#fff", ano: "Junho / 2024", kihon: 7.9, kata: 8.3, kumite: 8.1, perguntas: 0.5, total: 24.8, media: 8.3 },
            { faixa: "Vermelha/Laranja", corFaixa: "#e65100", corTexto: "#fff", ano: "Dezembro / 2024", kihon: 7.4, kata: 7.8, kumite: 7.8, perguntas: 0.3, total: 23.3, media: 7.8},
			{ faixa: "Laranja/Verde", corFaixa: "#4caf50", corTexto: "#fff", ano: "Junho / 2025", kihon: 7.8, kata: 8.0, kumite: 8.3, perguntas: 0.5, total: 24.6, media: 8.2 },
			 ]	
	}	
];

/**
 * Função que o index.html vai chamar para validar direto nesta lista
 */
function autenticarUsuarioDireto(usuarioInformado, senhaInformada) {
    // Procura o usuário diretamente na constante acima
    return listaAlunos.find(u => u.usuario === usuarioInformado && u.senha === senhaInformada);
}
