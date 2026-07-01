// usuarios.js

// Sua lista oficial e fixa de alunos e senhas
const listaAlunos = [
    { usuario: "adriano.miguel", senha: "123456", nome: "Adriano Miguel" },
    { usuario: "edson.fernandez", senha: "123456", nome: "Edson Fernandez" },
    { usuario: "luiz.guilherme", senha: "123456", nome: "Luiz Guilherme" }
];

/**
 * Função que o index.html vai chamar para validar direto nesta lista
 */
function autenticarUsuarioDireto(usuarioInformado, senhaInformada) {
    // Procura o usuário diretamente na constante acima
    return listaAlunos.find(u => u.usuario === usuarioInformado && u.senha === senhaInformada);
}