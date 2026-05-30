import {
    criarPost,
    listarPosts,
    listarMeusPosts,
    obterPost,
    atualizarPost,
    excluirPost
} from "../db/database.js";

export async function getPosts(env) {
    try {

        const resultado = await listarPosts(env);

        return {
            body: resultado.posts,
            status: 200
        };

    } catch (error) {
        console.log(error);

        return {
            body: { mensagem: "Erro interno" },
            status: 500
        };
    }
}

export async function getMyPosts(email, env) {
    try {

        const resultado = await listarMeusPosts(email, env);

        return {
            body: resultado.posts,
            status: 200
        };

    } catch (error) {
        console.log(error);

        return {
            body: { mensagem: "Erro interno" },
            status: 500
        };
    }
}

export async function getPost(id, env) {
    try {

        const resultado = await obterPost(id, env);

        if (!resultado.ok)
            return {
                body: { mensagem: "Post não encontrado" },
                status: 404
            };

        return {
            body: resultado.post,
            status: 200
        };

    } catch (error) {
        console.log(error);

        return {
            body: { mensagem: "Erro interno" },
            status: 500
        };
    }
}

export async function createPost(email, dados, env) {

    try {

        if (!dados.titulo || !dados.texto)
            return {
                body: { mensagem: "Dados inválidos" },
                status: 400
            };

        const usuario = await env.DB
            .prepare("SELECT nome FROM usuarios WHERE email = ?")
            .bind(email)
            .first();

        if (!usuario)
            return {
                body: { mensagem: "Usuário não encontrado" },
                status: 404
            };

        const resultado = await criarPost(
            {
                titulo: dados.titulo,
                texto: dados.texto,
                email_autor: email,
                nome_autor: usuario.nome
            },
            env
        );

        if (resultado.status !== 201)
            return {
                body: { mensagem: "Erro ao criar post" },
                status: 500
            };

        return {
            body: { mensagem: "Post criado com sucesso" },
            status: 201
        };

    } catch (error) {

        console.log(error);

        return {
            body: { mensagem: "Erro interno" },
            status: 500
        };
    }
}

export async function updatePost(id, email, dados, env) {

    try {

        const post = await obterPost(id, env);

        if (!post.ok)
            return {
                body: { mensagem: "Post não encontrado" },
                status: 404
            };

        if (post.post.email_autor !== email)
            return {
                body: { mensagem: "Sem permissão" },
                status: 403
            };

        await atualizarPost(
            id,
            dados.titulo,
            dados.texto,
            env
        );

        return {
            body: { mensagem: "Post atualizado" },
            status: 200
        };

    } catch (error) {

        console.log(error);

        return {
            body: { mensagem: "Erro interno" },
            status: 500
        };
    }
}

export async function deletePost(id, email, env) {

    try {

        const post = await obterPost(id, env);

        if (!post.ok)
            return {
                body: { mensagem: "Post não encontrado" },
                status: 404
            };

        if (post.post.email_autor !== email)
            return {
                body: { mensagem: "Sem permissão" },
                status: 403
            };

        await excluirPost(id, env);

        return {
            body: { mensagem: "Post removido" },
            status: 200
        };

    } catch (error) {

        console.log(error);

        return {
            body: { mensagem: "Erro interno" },
            status: 500
        };
    }
}
