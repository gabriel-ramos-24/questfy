export async function hashSenha(senha) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(senha),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256
  );

  return {
    hash: bufferToHex(derivedBits),
    salt: bufferToHex(salt),
  };
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verificarSenha(senha, saltHex, hashOriginal) {
  const encoder = new TextEncoder();

  const salt = hexToBuffer(saltHex);

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(senha),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256
  );

  const novoHash = bufferToHex(derivedBits);

  return novoHash === hashOriginal;
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
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