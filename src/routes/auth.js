import * as authService from "../services/auth.js";

export default async function routeAuth(request, env, subPath) {

    try {
        const userData = await request.json();

        if (subPath === "/email/verification" && request.method === "POST") {
            const result = await authService.emailVerification(env, userData.email);
            return Response.json(result.body, { status: result.status });

        }

        if (subPath === "/login" && request.method === "POST") {
            const result = await authService.loginAuth(env, userData);
            return Response.json(result.body, { status: result.status });

        }

        return Response.json({ mensagem: "Rota inexistente" }, { status: 404 });
    } catch (error) {
        console.log(error);
        return Response.json({ mensagem: "Erro interno" }, { status: 500 });
    }
}