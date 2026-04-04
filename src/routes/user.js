import * as userService from "../services/user.js";

export default async function routeUser(request, env, subPath) {

    try {

        if (request.method === "GET") {
            const url = new URL(request.url);
            const email = url.searchParams.get("email");
            const result = await userService.getUser(email, env);
            return Response.json(result.body, { status: result.status });

        }

        if (request.method === "POST") {
            const userData = await request.json();
            const result = await userService.createUser(userData, env);
            return Response.json(result.body, { status: result.status });

        }

        if (request.method === "PATCH") { }
        if (request.method === "DELETE") { }
        return Response.json({ mensagem: "Rota inexistente" }, { status: 404 });
    } catch (error) {
        console.log(error);
        return Response.json({ mensagem: "Erro interno" }, { status: 500 });
    }
}