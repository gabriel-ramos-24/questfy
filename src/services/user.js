import { emailValido, nomeValido, senhaValida } from '../utils/user.js';
import { criptografarInfo, gerarToken } from '../utils/auth.js';
import { criarUsuario, existeUsuario } from '../db/database.js';
import { dVerificadorValido } from '../db/keyvalue.js';

export async function getUser(email, env) {
    const existeUsuarioResultado = await existeUsuario(email, env);
    if (existeUsuarioResultado.status === 500) return { body: { mensagem: "Erro interno" }, status: 500 };
    if (existeUsuarioResultado.existe) return { body: { mensagem: "Email já cadastrado" }, status: 409 };
}

export async function createUser(userData, env) {

    // 1° passo: dados mínimos para criar um usuário
    if (!userData.nome ||
        !userData.email ||
        !userData.senha ||
        !userData.codigo) return { body: { mensagem: "Dados inválidos" }, status: 400 };

    // 2° passo: É um email válido?
    if (!emailValido(userData.email)) return { body: { mensagem: "Email inválido" }, status: 400 };

    // 3° passo: É um nome válido?
    if (!nomeValido(userData.nome)) return { body: { mensagem: "Nome inválido" }, status: 400 };

    // 4° passo: É uma senha válida?
    if (!senhaValida(userData.senha)) return { body: { mensagem: "Senha inválida" }, status: 400 };

    // 5° passo: É um código válido?
    const dVerificador = await dVerificadorValido(env, userData.email, userData.codigo);
    if (!dVerificador) return { body: { mensagem: "Código inválido" }, status: 400 };

    // 6° passo: transformar senha usando bcryptjs
    const senhaCriptografada = await criptografarInfo(userData.senha);

    // 7° passo: verificar duplicidade de usuário
    const existeUsuarioResultado = await existeUsuario(userData.email, env);
    if (existeUsuarioResultado.status === 500) return { body: { mensagem: "Erro interno" }, status: 500 };
    if (existeUsuarioResultado.existe) return { body: { mensagem: "Não foi possível realizar o cadastro" }, status: 409 };

    // 8° passo: Criar usuário
    const criarUsuarioResultado = await criarUsuario(userData, senhaCriptografada, env);
    if (criarUsuarioResultado.status !== 201) return { body: { mensagem: "Erro interno" }, status: 500 };

    // 9° passo: Criar token de persistência longa para fazer login sem verificação de email
    const privateClaims = { email: userData.email }
    const token = await gerarToken(privateClaims, env, (60 * 60 * 24 * 7));

    // 10° passo: Retornar para usuário
    return { body: { mensagem: "Usuário criado com sucesso!", token: token }, status: 201 };
}

export function pathUser(userData, env) {

}

export function deleteUser(userData, env) {

}