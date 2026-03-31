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