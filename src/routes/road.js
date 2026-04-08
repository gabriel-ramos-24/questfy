import * as roadService from "../services/road.js";
import requireAuth from '../utils/authMiddleware.js';

export default async function routeRoad(request, env, subPath) {

    try {
        const auth = await requireAuth(request);

        if (!auth.ok) return Response.json({ mensagem: auth.mensagem }, { status: auth.status });

        if (request.method === "GET") {
            const result = await roadService.getRoadData(env, auth.user.email);
            return Response.json(result.body, { status: result.status });

        }

        return Response.json({ mensagem: "Rota inexistente" }, { status: 404 });
    } catch (error) {
        console.log(error);
        return Response.json({ mensagem: "Erro interno" }, { status: 500 });
    }
}