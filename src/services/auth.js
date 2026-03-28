import { gerarToken, enviarEmail, validarToken } from '../utils/auth.js';
import { emailValido } from '../utils/user.js';
import { existeUsuario } from '../db/database.js';

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
    


    return { body: { mensagem: "Email enviado com sucesso" }, status: 200 };

}

export async function loginAuth(env, userData) {

    // 1° passo: dados mínimos para procurar um usuário
    if (!userData.email ||
        !userData.senha ||
        !userData.token) return { body: { mensagem: "Dados inválidos" }, status: 400 };

    // 2° passo: É um email válido?
    if (!emailValido(userData.email)) return { body: { mensagem: "Email inválido" }, status: 400 };

    // 3° passo: Já existe cadastro?
    const { existe, status } = await existeUsuario(userData.email, env);
    if (status === 500) return { body: { mensagem: "Erro interno" }, status: 500 };
    if (!existe) return { body: { mensagem: "Email ou senha incorretos" }, status: 404 };

    // 4° passo: A senha está correta?
    const senhaHash = await obterSenhaHash(userData.email, env);
    if (senhaHash.status === 500) return { body: { mensagem: "Erro interno" }, status: 500 };
    const senhaValida = await compararCriptografia(userData.senha, senhaHash.senha);
    if (!senhaValida) return { body: { mensagem: "Email ou senha incorretos" }, status: 400 };

    // 5° passo: O token está válido?
    const boolToken = await validarToken(userData.token, env);
    if (!boolToken) return { body: { mensagem: "Token inválido" }, status: 400 };

    // 6° passo: Obter usuário
}