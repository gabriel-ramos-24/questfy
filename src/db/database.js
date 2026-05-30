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
            .prepare("SELECT email, nome FROM usuarios WHERE email = ?")
            .bind(email)
            .first();

        if (!result) return { ok: false, status: 404 };
        return { ok: true, dados: result, status: 200 };

    } catch (error) {
        console.error("Erro ao obter dados do usuário: ", error);
        return { ok: false, status: 500 };
    }
}
