import { gerarToken, enviarEmail, validarToken } from '../utils/auth.js';
import { emailValido } from '../utils/user.js';
import { compararCriptografia } from '../utils/auth.js';
import { obterSenhaHash } from '../db/database.js';
import { dVerificadorValido, criarDVerificador } from '../db/keyvalue.js';

async function senhaCorreta(env, email, senha) {
    const senhaResult = await obterSenhaHash(email, env);

    if (senhaResult.status === 500) {
        return { ok: false, status: 500, mensagem: "Erro interno" };
    }

    if (senhaResult.status !== 200 || !senhaResult.senha) {
        return { ok: false, status: 401 };
    }

    const senhaValida = await compararCriptografia(
        senha,
        senhaResult.senha
    );

    if (!senhaValida) {
        return { ok: false, status: 401 };
    }

    return { ok: true, status: 200 };
}

export async function emailAuth(env, email = null) {

    // 1° passo: Email no body é obrigatório
    if (!email) return { body: { mensagem: "Dados incompletos" }, status: 400 };
    email = email.toLowerCase();

    // 2° passo: Enviar email
    const enviarEmailResultado = await enviarEmail(email, env);

    if (!enviarEmailResultado.success) {
        return {
            body: {
                mensagem: enviarEmailResultado.message || "Erro ao enviar email"
            },
            status: enviarEmailResultado.status || 500
        };
    }

    // 3° passo: Salvar código em KV
    const result = await criarDVerificador(env, email, enviarEmailResultado.codigo);
    if (!result) return { body: { mensagem: "Erro interno" }, status: 500 }


    return { body: { mensagem: "Email enviado com sucesso" }, status: 200 };

}

export async function tokenAuth(env, token = null) {

    if (!token) return { body: { mensagem: "Dados incompletos" }, status: 400 };

    const isValidToken = await validarToken(token, env);

    if (!isValidToken) return { body: { mensagem: "Token inválido" }, status: 400 };

    const token = await gerarToken({ email: isValidToken.email }, env, (60 * 60 * 24 * 7));

    return { body: { mensagem: "Token válido", token: token }, status: 200 };

}

export async function loginAuth(env, userData) {

    try {
        // 1° passo: dados mínimos para procurar um usuário
        if (!userData?.email || !userData?.senha) return { body: { mensagem: "Dados inválidos" }, status: 400 };

        // 2° passo: É um email válido?
        if (!emailValido(userData.email)) return { body: { mensagem: "Email inválido" }, status: 400 };
        const email = userData.email.toLowerCase();

        // 3° passo: Email e senha estão corretos?
        const senhaResult = await senhaCorreta(env, email, userData.senha);
        if (!senhaResult.ok) return { body: { mensagem: "Email ou senha incorretos" }, status: 401 };

        // 5° passo: Refrash token
        const token = await gerarToken({ email: email }, env, (60 * 60 * 24 * 7));

        // 6° passo: Login
        return { body: { mensagem: "Login efetuado com sucesso", token: token }, status: 200 };
    } catch (error) {
        console.log('Erro ao logar: ', error);
        return { body: { mensagem: "Erro interno" }, status: 500 }

    }
}