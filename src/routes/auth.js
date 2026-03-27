import * as authService from "../services/auth.js";

export default async function routeAuth(request, env) {

    try {

        if (request.method === "GET") {
            const url = new URL(request.url);
            const email = url.searchParams.get("email");
            const result = await authService.sendEmailAuth(env, email);
            return Response.json(result.body, { status: result.status });

        }

        if (request.method === "POST") {
            const userData = await request.json();
            const result = await authService.loginAuth(env, userData);
            return Response.json(result.body, { status: result.status });

        }

        return Response.json({ mensagem: "Rota inexistente" }, { status: 404 });
    } catch (error) {
        console.log(error);
        return Response.json({ mensagem: "Rota inexistente" }, { status: 404 });
    }
}