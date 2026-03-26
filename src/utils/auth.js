import bcrypt from "bcryptjs";

export async function hashSenha(senha) {
  return await bcrypt.hash(senha, 10);
}

export async function verificarSenha(senha, hash) {
  return await bcrypt.compare(senha, hash);
}

export function codigoValido(codigo) {
  const regexCodigo = /^\d{6}$/;

  return regexCodigo.test(codigo);
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