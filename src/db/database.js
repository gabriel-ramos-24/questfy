export async function existeUsuario(email, env) {
    try {
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();

        if (user) return { existe: true, status: 200 };

        return { existe: false, status: 200 };

    } catch (error) {
        console.error("Erro ao verificar existência de usuário: ", error);
        return { existe: false, status: 500 };
    }
}

export async function criarUsuario(dados, senhaCriptografada, env) {
    try {
        await env.DB.prepare("INSERT INTO users (email, nome, senha) VALUES (?, ?, ?)").bind(dados.email, dados.nome, senhaCriptografada).run();
        return { status: 201 };

    } catch (error) {
        console.error("Erro ao criar usuário: ", error);
        return { status: 500 };
    }
}

export async function obterSenhaHash(email, env) {
    try {
        const senha = await env.DB.prepare("SELECT senha FROM users WHERE email = ?").bind(email).first();
        return { senha: senha, status: 400 };
    } catch (error) {
        console.error("Erro ao obter senha do usuário: ", error);
        return { status: 500 };
    }
}

export async function inserirCodigo(email, codigo, env) {
    
}

export async function obterCodigo(email) {
    
}