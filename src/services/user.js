import { emailValido, nomeValido, senhaValida } from '../utils/user.js';
import { criptografarInfo, gerarToken } from '../utils/auth.js';
import { criarUsuario, existeUsuario, obterDadosUsuario, atualizarDadosUsuario } from '../db/database.js';
import { dVerificadorValido } from '../db/keyvalue.js';

export async function getUser(email, env) {
    try {

        email = email.toLowerCase();
        const existeUsuarioResultado = await existeUsuario(email, env);
        if (existeUsuarioResultado.status === 500) return { body: { mensagem: "Erro interno" }, status: 500 };
        if (existeUsuarioResultado.existe) return { body: { mensagem: "Email já cadastrado" }, status: 409 };
        return { body: { mensagem: "Email liberado" }, status: 200 };

    } catch (error) {

        console.log('Algum erro aconteceu ao buscar usuário: ', error);
        return { body: { mensagem: "Erro interno" }, status: 500 };

    }
}

export async function createUser(userData, env) {

    try {
        // 1° passo: dados mínimos para criar um usuário
        if (!userData.nome ||
            !userData.email ||
            !userData.senha ||
            !userData.codigo) return { body: { mensagem: "Dados inválidos" }, status: 400 };

        // 2° passo: É um email válido?
        if (!emailValido(userData.email)) return { body: { mensagem: "Email inválido" }, status: 400 };

        // 2.1° passo: Padronizar email
        userData.email = (userData.email).toLowerCase();

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

    } catch (error) {

        console.log('Algum erro aconteceu ao criar usuário: ', error);
        return { body: { mensagem: "Erro interno" }, status: 500 };

    }
}

export function pathUser(userData, env) {

}

export function deleteUser(userData, env) {

}

// retorna os dados do usuário logado (usado pelo endpoint /user/me)
export async function getCurrentUser(email, env) {
    try {
        const resultado = await obterDadosUsuario(email, env);
        if (!resultado.ok) {
            return { body: { mensagem: "Usuário não encontrado" }, status: resultado.status };
        }
        return { body: resultado.dados, status: 200 };
    } catch (error) {
        console.log('Erro ao buscar dados do usuário: ', error);
        return { body: { mensagem: "Erro interno" }, status: 500 };
    }
}

// atualiza nome e foto do usuário logado
export async function updateUser(email, dadosNovos, env) {
    try {
        if (!dadosNovos.nome) return { body: { mensagem: "Nome obrigatório" }, status: 400 };
        if (!nomeValido(dadosNovos.nome)) return { body: { mensagem: "Nome inválido" }, status: 400 };

        const resultado = await atualizarDadosUsuario(email, {
            nome: dadosNovos.nome,
            foto: dadosNovos.foto || null,
        }, env);

        if (!resultado.ok) return { body: { mensagem: "Erro ao atualizar" }, status: resultado.status };
        return { body: { mensagem: "Usuário atualizado" }, status: 200 };

    } catch (error) {
        console.log('Erro ao atualizar usuário: ', error);
        return { body: { mensagem: "Erro interno" }, status: 500 };
    }
}
