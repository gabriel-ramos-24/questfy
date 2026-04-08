import routeUser from './routes/user.js';
import routeAuth from './routes/auth.js';
import routeRoad from './routes/road.js';

const routes = [
  { prefix: "/user", handler: routeUser },
  { prefix: "/auth", handler: routeAuth },
  { prefix: "/road", handler: routeRoad },
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    for (const route of routes) {
      if (url.pathname === route.prefix || url.pathname.startsWith(route.prefix + "/")) {
        const subPath = url.pathname.slice(route.prefix.length) || "/";
        return route.handler(request, env, subPath);
      }
    }

    return Response.json({ mensagem: "Rota inexistente" }, { status: 404 });

  }
};