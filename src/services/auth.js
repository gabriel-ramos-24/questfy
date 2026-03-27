import { gerarToken, enviarEmail } from '../utils/auth.js';

export async function sendEmailAuth(env, email = null) {

    // 1° passo: Email na query é obrigatório
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

    // 3° passo: Criar token
    const privateClaims = { email: email, codigo: enviarEmailResultado.codigo }
    const token = await gerarToken(privateClaims, env, 60 * 2);

    return { body: { mensagem: "Email enviado com sucesso", token: token }, status: 200 };

}

export async function loginAuth(env, userData) {

}