import { emailValido, nomeValido, senhaValida } from '../utils/user.js';
import { codigoValido, tokenValido, hashSenha, verificarSenha } from '../utils/auth.js';
import { criarUsuario, existeUsuario, obterSenhaHash } from '../db/database.js';


export async function getUser(userData, env) {

    // 1° passo: dados mínimos para procurar um usuário
    if (!userData.email ||
        !userData.senha ||
        !userData.token) return { body: { mensagem: "Dados inválidos." }, status: 400 };

    // 2° passo: É um email válido?
    if (!emailValido(userData.email)) return { body: { mensagem: "Email inválido" }, status: 400 };

    // 3° passo: Já existe cadastro?
    const { existe, status } = await existeUsuario(userData.email, env);
    if (status === 500) return { body: { mensagem: "Erro interno." }, status: 500 };
    if (!existe) return { body: { mensagem: "Email ou senha incorretos." }, status: 404 };

    // 4° passo: A senha está correta?
    const senhaHash = await obterSenhaHash(userData.email, env);
    const senhaValida = await verificarSenha(userData.senha, senhaHash);
    if (!senhaValida) return { body: { mensagem: "Email ou senha incorretos." }, status: 400 };

    // 5° passo: O token está válido?
    const boolToken = await tokenValido(userData.token, userData.codigo);
    if (!boolToken) return { body: { mensagem: "Token inválido" }, status: 400 };

    // 6° passo: Obter usuário

}

export async function createUser(userData, env) {

    // 1° passo: dados mínimos para criar um usuário
    if (!userData.nome ||
        !userData.email ||
        !userData.senha ||
        !userData.token ||
        !userData.codigo) return { body: { mensagem: "Dados inválidos." }, status: 400 };

    // 2° passo: É um email válido?
    if (!emailValido(userData.email)) return { body: { mensagem: "Email inválido" }, status: 400 };

    // 3° passo: É um nome válido?
    if (!nomeValido(userData.nome)) return { body: { mensagem: "Nome inválido" }, status: 400 };

    // 4° passo: É uma senha válida?
    if (!senhaValida(userData.senha)) return { body: { mensagem: "Senha inválida" }, status: 400 };

    // 5° passo: É um código válido?
    if (!codigoValido(userData.codigo)) return { body: { mensagem: "Código inválido" }, status: 400 };

    // 6° passo: É um token válido?
    const boolToken = await tokenValido(userData.token, userData.codigo);
    if (!boolToken) return { body: { mensagem: "Token inválido" }, status: 400 };

    // 7° passo: transformar senha usando bcryptjs
    const senhaCriptografada = await hashSenha(userData.senha);

    // 8° passo: verificar duplicidade de usuário
    const { existe, status } = await existeUsuario(userData.email, env);
    if (status === 500) return { body: { mensagem: "Erro interno." }, status: 500 };
    if (existe) return { body: { mensagem: "Não foi possível realizar o cadastro." }, status: 409 };

    // 9° passo: Criar usuário
    return criarUsuario(userData, senhaCriptografada, env);
}

export function pathUser(userData, env) {

}

export function deleteUser(userData, env) {

}