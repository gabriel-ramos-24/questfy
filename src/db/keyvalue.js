import { criptografarInfo, compararCriptografia } from '../utils/auth.js';

export async function dVerificadorValido(env, email, codigo) {
    const result = await env.KV.get(`codigo:${email}`, { type: "json" });
    if (!result) return false;
    const isValid = await compararCriptografia(codigo, result.codigo);
    if (!isValid) return false;

    await env.KV.delete(`codigo:${email}`);
    return true;

}

export async function criarDVerificador(env, email, codigo) {
    try {
        const codigoCrypt = await criptografarInfo(codigo);
        await env.KV.put(
            `codigo:${email}`,
            JSON.stringify({ codigo: codigoCrypt }),
            { expirationTtl: 300 }
        );
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }

}

export async function getRoad(env, email) {
    const result = await env.KV.get(`road:${email}`, { type: "json" });
    if (!result) return {
        body: {
            ok: false,
        },
        status: 500
    };

    return {
        body: {
            ok: true,
            data: result
        },
        status: 200
    }
}

export async function createRoad(env, email, roadPadrao) {
    try {
        await env.KV.put(
            `road:${email}`,
            JSON.stringify(roadPadrao)
        );
        return {
            body: {
                ok: true,
                data: roadPadrao
            },
            status: 200
        }
    } catch (error) {
        console.log(error);
        return {
            body: {
                ok: false,
            },
            status: 500
        }
    }
}