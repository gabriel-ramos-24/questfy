import * as userService from "../services/user.js";
import requireAuth from '../utils/authMiddleware.js';

export default async function routeUser(request, env, subPath) {

    try {
        // rota protegida: GET /user/me -> retorna dados do usuário logado
        if (subPath === "/me" && request.method === "GET") {
            const auth = await requireAuth(request, env);
            if (!auth.ok) return Response.json({ mensagem: auth.mensagem }, { status: auth.status });

            const result = await userService.getCurrentUser(auth.user.email, env);
            return Response.json(result.body, { status: result.status });
        }

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
