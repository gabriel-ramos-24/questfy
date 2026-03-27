import * as userService from "../services/user.js";

export default async function routeUser(request, env) {

    try {
        const userData = await request.json();

        if (request.method === "POST") {
            const result = await userService.createUser(userData, env);
            return Response.json(result.body, { status: result.status });

        }

        if (request.method === "PATH") { }
        if (request.method === "DELETE") { }
        return Response.json({ mensagem: "Rota inexistente." }, { status: 404 });
    } catch (error) {
        console.log(error);
        return Response.json({ mensagem: "Rota inexistente." }, { status: 404 });
    }
}