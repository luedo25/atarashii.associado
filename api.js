(function () {
    'use strict';

    const API_URL = 'https://api-associacao-mp.onrender.com';
    const CHAVE_TOKEN = 'atarashii_token';
    const CHAVE_USUARIO = 'atarashii_usuario';

    function obterToken() {
        return sessionStorage.getItem(CHAVE_TOKEN);
    }

    function obterUsuario() {
        try {
            return JSON.parse(sessionStorage.getItem(CHAVE_USUARIO) || 'null');
        } catch (error) {
            return null;
        }
    }

    function salvarSessao(dados) {
        if (!dados?.token || !dados?.usuario) throw new Error('Resposta de login inválida.');
        sessionStorage.setItem(CHAVE_TOKEN, dados.token);
        sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(dados.usuario));
    }

    function limparSessao() {
        sessionStorage.removeItem(CHAVE_TOKEN);
        sessionStorage.removeItem(CHAVE_USUARIO);
        localStorage.removeItem('associadoAutenticado');
        localStorage.removeItem('nomeAlunoLogado');
        localStorage.removeItem('usuarioAtivo');
        localStorage.removeItem('tipoUsuario');
    }

    function atualizarUsuario(dados) {
        const atual = obterUsuario() || {};
        const atualizado = { ...atual, ...dados };
        sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(atualizado));
        return atualizado;
    }

    function voltarAoLogin() {
        limparSessao();
        if (!location.pathname.endsWith('/index.html') && !location.pathname.endsWith('/')) {
            location.replace('index.html');
        }
    }

    async function apiFetch(caminho, opcoes = {}) {
        const headers = new Headers(opcoes.headers || {});
        const token = obterToken();

        headers.set('Accept', 'application/json');
        if (token) headers.set('Authorization', `Bearer ${token}`);
        if (opcoes.body && !(opcoes.body instanceof FormData) && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), opcoes.timeoutMs || 90000);

        try {
            const resposta = await fetch(`${API_URL}${caminho}`, {
                ...opcoes,
                headers,
                signal: opcoes.signal || controller.signal
            });

            const texto = await resposta.text();
            let dados = null;
            if (texto) {
                try {
                    dados = JSON.parse(texto);
                } catch (error) {
                    dados = { erro: texto };
                }
            }

            if (resposta.status === 401) {
                voltarAoLogin();
                throw new Error(dados?.erro || 'Sua sessão expirou. Entre novamente.');
            }

            if (!resposta.ok) {
                throw new Error(dados?.erro || `Erro ${resposta.status} ao comunicar com o servidor.`);
            }

            return dados;
        } catch (error) {
            if (error.name === 'AbortError') throw new Error('O servidor demorou para responder. Tente novamente.');
            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }

    async function exigirSessao(tipoObrigatorio) {
        if (!obterToken()) {
            voltarAoLogin();
            return null;
        }

        try {
            const dados = await apiFetch('/api/auth/me');
            const usuario = dados?.usuario;
            if (!usuario) throw new Error('Sessão inválida.');

            sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));

            if (tipoObrigatorio && String(usuario.tipo).toLowerCase() !== tipoObrigatorio) {
                location.replace(usuario.tipo === 'professor' ? 'professor.html' : 'area-associado.html');
                return null;
            }

            return usuario;
        } catch (error) {
            voltarAoLogin();
            return null;
        }
    }

    window.API_URL = API_URL;
    window.apiFetch = apiFetch;
    window.Usuarios = {
        criar(dados) {
            return apiFetch('/api/usuarios', {
                method: 'POST',
                body: JSON.stringify(dados),
                timeoutMs: 90000
            });
        },
        obterPerfil(usuario) {
            return apiFetch(`/api/usuarios/${encodeURIComponent(usuario)}/perfil`);
        }
    };
    window.Perfil = {
        obter() {
            return apiFetch('/api/perfil/me');
        },
        salvar(dados) {
            return apiFetch('/api/perfil/me', {
                method: 'PATCH',
                body: JSON.stringify(dados),
                timeoutMs: 90000
            });
        }
    };
    window.Auth = {
        obterToken,
        obterUsuario,
        salvarSessao,
        limparSessao,
        atualizarUsuario,
        exigirSessao,
        solicitarRedefinicaoSenha(usuario, email) {
            return apiFetch('/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ usuario, email }),
                timeoutMs: 90000
            });
        },
        redefinirSenha(token, novaSenha) {
            return apiFetch('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, novaSenha }),
                timeoutMs: 90000
            });
        },
        sair() {
            limparSessao();
            location.replace('index.html');
        }
    };
})();
