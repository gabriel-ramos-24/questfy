export async function dVerificadorValido(env, email, codigo) {
    const result = await env.KV.get(`codigo:${email}`, { type: "json" });
    if (!result) return false;
    if (codigo !== result.codigo) return false;

    await env.KV.delete(`codigo:${email}`);
    return true;

}

export async function criarDVerificador(env, email, codigo) {
    try {
        await env.KV.put(`codigo:${email}`, JSON.stringify({ codigo: codigo }));
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }

}