import * as communityService from "../services/community.js";
import requireAuth from "../utils/authMiddleware.js";

export default async function routeCommunity(request, env, subPath) {
    try {

        if (request.method === "GET" && subPath === "/") {
            const result = await communityService.getPosts(env);
            return Response.json(result.body, { status: result.status });
        }

        if (request.method === "GET" && subPath === "/mine") {
            const auth = await requireAuth(request, env);

            if (!auth.ok)
                return Response.json(
                    { mensagem: auth.mensagem },
                    { status: auth.status }
                );

            const result = await communityService.getMyPosts(
                auth.user.email,
                env
            );

            return Response.json(result.body, { status: result.status });
        }

        if (request.method === "GET") {
            const id = Number(subPath.replace("/", ""));

            if (!id)
                return Response.json(
                    { mensagem: "Post inválido" },
                    { status: 400 }
                );

            const result = await communityService.getPost(id, env);

            return Response.json(result.body, { status: result.status });
        }

        if (request.method === "POST") {
            const auth = await requireAuth(request, env);

            if (!auth.ok)
                return Response.json(
                    { mensagem: auth.mensagem },
                    { status: auth.status }
                );

            const dados = await request.json();

            const result = await communityService.createPost(
                auth.user.email,
                dados,
                env
            );

            return Response.json(result.body, { status: result.status });
        }

        if (request.method === "PATCH") {
            const auth = await requireAuth(request, env);

            if (!auth.ok)
                return Response.json(
                    { mensagem: auth.mensagem },
                    { status: auth.status }
                );

            const id = Number(subPath.replace("/", ""));
            const dados = await request.json();

            const result = await communityService.updatePost(
                id,
                auth.user.email,
                dados,
                env
            );

            return Response.json(result.body, { status: result.status });
        }

        if (request.method === "DELETE") {
            const auth = await requireAuth(request, env);

            if (!auth.ok)
                return Response.json(
                    { mensagem: auth.mensagem },
                    { status: auth.status }
                );

            const id = Number(subPath.replace("/", ""));

            const result = await communityService.deletePost(
                id,
                auth.user.email,
                env
            );

            return Response.json(result.body, { status: result.status });
        }

        return Response.json(
            { mensagem: "Rota inexistente" },
            { status: 404 }
        );

    } catch (error) {
        console.log(error);

        return Response.json(
            { mensagem: "Erro interno" },
            { status: 500 }
        );
    }
}