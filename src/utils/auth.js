import bcrypt from "bcryptjs";
import jwt from "@tsndr/cloudflare-worker-jwt";

export async function hashSenha(senha) {
  return await bcrypt.hash(senha, 10);
}

export async function verificarSenha(senha, hash) {
  return await bcrypt.compare(senha, hash);
}

export async function enviarEmail(email, codigo) {

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

export async function tokenValido(token, codigo) {
  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxAp0jI1Do_3jMjC2soiV9STQXTbdouipUDZna-lcdTA-M4e8eCLLfBCacwETCQSWje/exec',
      {
        method: 'POST',
        body: JSON.stringify({
          acao: 'verificar_email',
          token: token,
          code: codigo,
        }),
      }
    );

    const texto = await response.text();
    const responseJSON = JSON.parse(texto);

    return responseJSON.ok;

  } catch (error) {
    console.log('erro:', error);
    return false;
  }
}