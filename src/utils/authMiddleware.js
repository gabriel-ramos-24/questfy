import { validarToken } from "./auth";

export default async function requireAuth(request, env) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return {
      ok: false,
      status: 401,
      mensagem: "Token não enviado",
    };
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return {
      ok: false,
      status: 401,
      mensagem: "Formato inválido",
    };
  }

  try {
    const payload = await validarToken(token, env);

    return {
      ok: true,
      user: payload,
    };
  } catch (err) {
    return {
      ok: false,
      status: 401,
      mensagem: err,
    };
  }
}