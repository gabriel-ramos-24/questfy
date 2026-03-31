import { gerarToken, enviarEmail, validarToken } from '../utils/auth.js';
import { emailValido } from '../utils/user.js';
import { compararCriptografia } from '../utils/auth.js';
import { obterSenhaHash } from '../db/database.js';
import { dVerificadorValido, criarDVerificador } from '../db/keyvalue.js';

export async function emailVerification(env, email = null) {

    // 1° passo: Email no body é obrigatório
    if (!email) return { body: { mensagem: "Dados incompletos" }, status: 400 };

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

export async function loginAuth(env, userData) {

    // 1° passo: dados mínimos para procurar um usuário
    if (!userData.email || !userData.senha) return { body: { mensagem: "Dados inválidos" }, status: 400 };

    // 2° passo: É um email válido?
    if (!emailValido(userData.email)) return { body: { mensagem: "Email inválido" }, status: 400 };

    // 3° passo: A senha está correta?
    const senhaResult = await obterSenhaHash(userData.email, env);
    if (senhaResult.status === 500) return { body: { mensagem: "Erro interno" }, status: 500 };
    if (senhaResult.status !== 200 || !senhaResult.senha) {
        return { body: { mensagem: "Email ou senha incorretos" }, status: 401 };
    }
    const senhaValida = await compararCriptografia(
        userData.senha,
        senhaResult.senha
    );

    if (!senhaValida) {
        return { body: { mensagem: "Email ou senha incorretos" }, status: 401 };
    }

    // 4. Autenticação (token OU código)
    if (userData.token) {
        const payload = await validarToken(userData.token, env);
        if (!payload || payload.email !== userData.email) {
            return { body: { mensagem: "Token inválido" }, status: 401 };
        }
    }
    else if (userData.codigo) {
        const valido = await dVerificadorValido(env, userData.email, userData.codigo);
        if (!valido) {
            return { body: { mensagem: "Código inválido" }, status: 401 };
        }
    }
    else {
        await emailVerification(env, userData.email);
        return { body: { mensagem: "Código enviado" }, status: 401 };
    }

    // 5° passo: Refrash token
    const token = await gerarToken({ email: userData.email }, env, (60 * 60 * 24 * 7));

    // 6° passo: Login
    return { body: { mensagem: "Login efetuado com sucesso", token: token }, status: 200 };
}