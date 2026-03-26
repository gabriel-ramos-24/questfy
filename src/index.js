import routeUser from './routes/user.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CRUD - Usuário
    if (url.pathname.startsWith("/user"))
      return routeUser(request, env);

    return Response.json({ mensagem: "Rota inexistente." }, { status: 404 });

  }
};