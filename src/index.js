import routeUser from './routes/user.js';
import routeAuth from './routes/auth.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CRUD - Usuário
    if (url.pathname.startsWith("/user"))
      return routeUser(request, env);

    // Autenticação - Envio de email e login
    if (url.pathname.startsWith("/auth"))
      return routeAuth(request, env);

    return Response.json({ mensagem: "Rota inexistente" }, { status: 404 });

  }
};