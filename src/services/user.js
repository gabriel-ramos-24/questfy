import { emailValido, nomeValido, codigoValido, senhaValida } from '../utils/user.js';
import { validarToken, criptografarInfo, gerarToken } from '../utils/auth.js';
import { criarUsuario, existeUsuario } from '../db/database.js';

export async function createUser(userData, env) {

    // 1° passo: dados mínimos para criar um usuário
    if (!userData.nome ||
        !userData.email ||
        !userData.senha ||
        !userData.token ||
        !userData.codigo) return { body: { mensagem: "Dados inválidos" }, status: 400 };

    // 2° passo: É um email válido?
    if (!emailValido(userData.email)) return { body: { mensagem: "Email inválido" }, status: 400 };

    // 3° passo: É um nome válido?
    if (!nomeValido(userData.nome)) return { body: { mensagem: "Nome inválido" }, status: 400 };

    // 4° passo: É uma senha válida?
    if (!senhaValida(userData.senha)) return { body: { mensagem: "Senha inválida" }, status: 400 };

    // 5° passo: É um código válido?
    if (!codigoValido(userData.codigo)) return { body: { mensagem: "Código inválido" }, status: 400 };

    // 6° passo: É um token válido?
    const payloadToken = await validarToken(userData.token, env, userData.codigo);
    if (!payloadToken) return { body: { mensagem: "Token inválido" }, status: 400 };
    if (payloadToken.email !== userData.email) return { body: { mensagem: "Token inválido" }, status: 400 };

    // 7° passo: transformar senha usando bcryptjs
    const senhaCriptografada = await criptografarInfo(userData.senha);

    // 8° passo: verificar duplicidade de usuário
    const existeUsuarioResultado = await existeUsuario(userData.email, env);
    if (existeUsuarioResultado.status === 500) return { body: { mensagem: "Erro interno" }, status: 500 };
    if (existeUsuarioResultado.existe) return { body: { mensagem: "Não foi possível realizar o cadastro" }, status: 409 };

    // 9° passo: Criar usuário
    const criarUsuarioResultado = await criarUsuario(userData, senhaCriptografada, env);
    if (criarUsuarioResultado.status !== 201) return { body: { mensagem: "Erro interno" }, status: 500 };

    // 10° passo: Criar token de persistência longa para fazer login sem verificação de email
    const privateClaims = { nome: userData.nome, email: userData.email }
    const token = await gerarToken(privateClaims, env, 60 * 60 * 24);

    // 11° passo: Retornar para usuário
    return { body: { mensagem: "Usuário criado com sucesso!", token: token }, status: 201 };
}

export function pathUser(userData, env) {

}

export function deleteUser(userData, env) {

}