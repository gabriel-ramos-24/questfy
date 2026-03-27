import bcrypt from "bcryptjs";
import jwt from "@tsndr/cloudflare-worker-jwt";

export async function hashSenha(senha) {
  return await bcrypt.hash(senha, 10);
}

export async function verificarSenha(senha, hash) {
  return await bcrypt.compare(senha, hash);
}

export async function enviarEmail(email, env) {

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbx5naNWZKS1sgu16iCiy3SUONYAAsaJBa3z1bUoqBxiSyZ5r04yuFlAxwcI1712Y7WKQQ/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          codigo: codigo,
          apiKey: env.API_SENDEMAIL_KEY
        }),
      }
    );

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.log(error);
      return {
        success: false,
        status: 502,
        message: "Resposta inválida do serviço de email"
      };
    }

    if (!data.success) {
      return {
        success: false,
        status: data.status || 500,
        message: data.message || "Erro no serviço de email",
        response: data
      };
    }

    return {
      success: true,
      status: 200,
      codigo,
      response: data
    };

  } catch (error) {
    console.log(error.toString());

    return {
      success: false,
      status: 500,
      message: error.name === "AbortError"
        ? "Timeout ao enviar email"
        : "Erro na requisição",
      error: error.toString()
    };
  }
}

export async function gerarToken(privateClaims, env, expiracao) {

  const agoraUTC = Math.floor(Date.now() / 1000);

  const payload = {
    ...privateClaims,
    "iat": agoraUTC,
    "exp": agoraUTC + expiracao
  }

  return jwt.sign(payload, env.JWT_SECRET);

}

export async function validarToken(token, env, codigo = null) {

  const isValid = await jwt.verify(token, env.JWT_SECRET);

  if (!isValid) return null;

  const decoded = jwt.decode(token);

  if (!decoded || !decoded.payload) return null;

  const payload = decoded.payload;

  if (codigo !== null && payload.codigo !== codigo) {
    return null;
  }

  return payload;
}