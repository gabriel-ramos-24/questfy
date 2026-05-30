export async function existeUsuario(email, env) {
    try {

        const user = await env.DB
            .prepare("SELECT 1 FROM usuarios WHERE email = ?")
            .bind(email)
            .first();

        return { existe: !!user, status: 200 };

    } catch (error) {
        console.error("Erro ao verificar existência de usuário: ", error);
        return { existe: false, status: 500 };
    }
}


export async function obterSenhaHash(email, env) {
    try {
        const result = await env.DB
            .prepare("SELECT senha FROM usuarios WHERE email = ?")
            .bind(email)
            .first();

        if (!result) {
            return { senha: null, status: 404 };
        }

        return { senha: result.senha, status: 200 };

    } catch (error) {
        console.error("Erro ao obter senha do usuário: ", error);
        return { senha: null, status: 500 };
    }
}

export async function criarUsuario(dados, senhaCriptografada, env) {
    try {
        await env.DB.prepare("INSERT INTO usuarios (email, nome, senha) VALUES (?, ?, ?)").bind(dados.email, dados.nome, senhaCriptografada).run();
        return { status: 201 };

    } catch (error) {
        console.error("Erro ao criar usuário: ", error);
        return { status: 500 };
    }
}

export async function trocarSenha(email, senhaCriptografada, env) {
    try {
        const result = await env.DB.prepare("UPDATE usuarios SET senha = ? WHERE email = ?").bind(senhaCriptografada, email).run();
        if (result.meta.changes === 0) {
            return { ok: false, status: 404 };
        }
        return { ok: true, status: 200 };

    } catch (error) {
        console.error("Erro ao criar usuário: ", error);
        return { ok: false, status: 500 };
    }
}

export async function obterDadosUsuario(email, env) {
    try {
        const result = await env.DB
            .prepare("SELECT email, nome, foto FROM usuarios WHERE email = ?")
            .bind(email)
            .first();

        if (!result) return { ok: false, status: 404 };
        return { ok: true, dados: result, status: 200 };

    } catch (error) {
        console.error("Erro ao obter dados do usuário: ", error);
        return { ok: false, status: 500 };
    }
}

export async function atualizarDadosUsuario(email, dadosNovos, env) {
    try {
        const result = await env.DB
            .prepare("UPDATE usuarios SET nome = ?, foto = ? WHERE email = ?")
            .bind(dadosNovos.nome, dadosNovos.foto, email)
            .run();

        if (result.meta.changes === 0) return { ok: false, status: 404 };
        return { ok: true, status: 200 };

    } catch (error) {
        console.error("Erro ao atualizar usuário: ", error);
        return { ok: false, status: 500 };
    }
}

export async function criarPost(dados, env) {
    try {

        await env.DB
            .prepare(`
                INSERT INTO comunidade
                (
                    titulo,
                    texto,
                    email_autor,
                    nome_autor
                )
                VALUES (?, ?, ?, ?)
            `)
            .bind(
                dados.titulo,
                dados.texto,
                dados.email_autor,
                dados.nome_autor
            )
            .run();

        return { status: 201 };

    } catch (error) {

        console.error(error);

        return { status: 500 };
    }
}

export async function listarPosts(env) {
    try {

        const posts = await env.DB
            .prepare(`
                SELECT *
                FROM comunidade
                ORDER BY id DESC
            `)
            .all();

        return {
            posts: posts.results,
            status: 200
        };

    } catch (error) {

        console.error(error);

        return {
            posts: [],
            status: 500
        };
    }
}

export async function listarMeusPosts(email, env) {
    try {

        const posts = await env.DB
            .prepare(`
                SELECT *
                FROM comunidade
                WHERE email_autor = ?
                ORDER BY id DESC
            `)
            .bind(email)
            .all();

        return {
            posts: posts.results,
            status: 200
        };

    } catch (error) {

        console.error(error);

        return {
            posts: [],
            status: 500
        };
    }
}

export async function obterPost(id, env) {
    try {

        const post = await env.DB
            .prepare(`
                SELECT *
                FROM comunidade
                WHERE id = ?
            `)
            .bind(id)
            .first();

        if (!post)
            return {
                ok: false,
                status: 404
            };

        return {
            ok: true,
            post,
            status: 200
        };

    } catch (error) {

        console.error(error);

        return {
            ok: false,
            status: 500
        };
    }
}

export async function atualizarPost(
    id,
    titulo,
    texto,
    env
) {
    try {

        await env.DB
            .prepare(`
                UPDATE comunidade
                SET titulo = ?, texto = ?
                WHERE id = ?
            `)
            .bind(
                titulo,
                texto,
                id
            )
            .run();

        return {
            ok: true,
            status: 200
        };

    } catch (error) {

        console.error(error);

        return {
            ok: false,
            status: 500
        };
    }
}

export async function excluirPost(id, env) {
    try {

        await env.DB
            .prepare(`
                DELETE FROM comunidade
                WHERE id = ?
            `)
            .bind(id)
            .run();

        return {
            ok: true,
            status: 200
        };

    } catch (error) {

        console.error(error);

        return {
            ok: false,
            status: 500
        };
    }
}