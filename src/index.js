var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/utils/user.js
function emailValido(email) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}
__name(emailValido, "emailValido");
function nomeValido(nome) {
  const regexNome = /^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)+$/;
  return regexNome.test(nome);
}
__name(nomeValido, "nomeValido");
function senhaValida(senha) {
  const regexLetra = /[A-Za-z]/;
  const regexNumero = /[0-9]/;
  if (!regexLetra.test(senha)) return false;
  if (!regexNumero.test(senha)) return false;
  if (senha < 8 || senha > 16) return false;
  return true;
}
__name(senhaValida, "senhaValida");

// src/utils/auth.js
async function hashSenha(senha) {
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
      iterations: 1e5,
      hash: "SHA-256"
    },
    key,
    256
  );
  return {
    hash: bufferToHex(derivedBits),
    salt: bufferToHex(salt)
  };
}
__name(hashSenha, "hashSenha");
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(bufferToHex, "bufferToHex");
async function verificarSenha(senha, saltHex, hashOriginal) {
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
      iterations: 1e5,
      hash: "SHA-256"
    },
    key,
    256
  );
  const novoHash = bufferToHex(derivedBits);
  return novoHash === hashOriginal;
}
__name(verificarSenha, "verificarSenha");
function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
__name(hexToBuffer, "hexToBuffer");
function codigoValido(codigo) {
  const regexCodigo = /^\d{6}$/;
  return regexCodigo.test(codigo);
}
__name(codigoValido, "codigoValido");
async function tokenValido(token, codigo) {
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxAp0jI1Do_3jMjC2soiV9STQXTbdouipUDZna-lcdTA-M4e8eCLLfBCacwETCQSWje/exec",
      {
        method: "POST",
        body: JSON.stringify({
          acao: "verificar_email",
          token,
          code: codigo
        })
      }
    );
    const texto = await response.text();
    const responseJSON = JSON.parse(texto);
    return responseJSON.ok;
  } catch (error) {
    console.log("erro:", error);
    return false;
  }
}
__name(tokenValido, "tokenValido");

// src/db/database.js
async function existeUsuario(email, env) {
  try {
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    if (user) return { existe: true, status: 200 };
    return { existe: false, status: 200 };
  } catch (error) {
    console.error("Erro ao verificar exist\xEAncia de usu\xE1rio: ", error);
    return { existe: false, status: 500 };
  }
}
__name(existeUsuario, "existeUsuario");
async function criarUsuario(dados, hash, salt, env) {
  try {
    await env.DB.prepare("INSERT INTO users (email, nome, hash, salt) VALUES (?, ?, ?, ?)").bind(dados.email, dados.nome, hash, salt).run();
    return { body: { mensagem: "Cadastro efetuado com sucesso!" }, status: 201 };
  } catch (error) {
    console.error("Erro ao criar usu\xE1rio: ", error);
    return { body: { mensagem: "N\xE3o foi poss\xEDvel criar usu\xE1rio devido a erro interno." }, status: 500 };
  }
}
__name(criarUsuario, "criarUsuario");
async function obterSaltHash(email, env) {
  try {
    return env.DB.prepare("SELECT salt, hash FROM users WHERE email = ?").bind(email).first();
  } catch (error) {
    console.error("Erro ao obter dados do salt e hash do usu\xE1rio: ", error);
    return Response.json({ mensagem: "N\xE3o foi poss\xEDvel criar usu\xE1rio devido a erro interno.", criado: false }, { status: 500 });
  }
}
__name(obterSaltHash, "obterSaltHash");

// src/services/user.js
async function getUser(userData, env) {
  if (!userData.email || !userData.senha || !userData.token) return { body: { mensagem: "Dados inv\xE1lidos." }, status: 400 };
  if (!emailValido(userData.email)) return { body: { mensagem: "Email inv\xE1lido" }, status: 400 };
  const { existe, status } = await existeUsuario(userData.email, env);
  if (status === 500) return { body: { mensagem: "Erro interno." }, status: 500 };
  if (!existe) return { body: { mensagem: "Email ou senha incorretos." }, status: 404 };
  const { salt, hash } = await obterSaltHash(userData.email, env);
  const senhaValida2 = await verificarSenha(userData.senha, salt, hash);
  if (!senhaValida2) return { body: { mensagem: "Email ou senha incorretos." }, status: 400 };
  const boolToken = await tokenValido(userData.token, userData.codigo);
  if (!boolToken) return { body: { mensagem: "Token inv\xE1lido" }, status: 400 };
}
__name(getUser, "getUser");
async function createUser(userData, env) {
  if (!userData.nome || !userData.email || !userData.senha || !userData.token || !userData.codigo) return { body: { mensagem: "Dados inv\xE1lidos." }, status: 400 };
  if (!emailValido(userData.email)) return { body: { mensagem: "Email inv\xE1lido" }, status: 400 };
  if (!nomeValido(userData.nome)) return { body: { mensagem: "Nome inv\xE1lido" }, status: 400 };
  if (!senhaValida(userData.senha)) return { body: { mensagem: "Senha inv\xE1lida" }, status: 400 };
  if (!codigoValido(userData.codigo)) return { body: { mensagem: "C\xF3digo inv\xE1lido" }, status: 400 };
  const boolToken = await tokenValido(userData.token, userData.codigo);
  if (!boolToken) return { body: { mensagem: "Token inv\xE1lido" }, status: 400 };
  const { hash, salt } = await hashSenha(userData.senha);
  const { existe, status } = await existeUsuario(userData.email, env);
  if (status === 500) return { body: { mensagem: "Erro interno." }, status: 500 };
  if (existe) return { body: { mensagem: "N\xE3o foi poss\xEDvel realizar o cadastro." }, status: 409 };
  return criarUsuario(userData, hash, salt, env);
}
__name(createUser, "createUser");

// src/routes/user.js
async function routeUser(request, env) {
  try {
    const userData = await request.json();
    if (request.method === "GET") {
      return getUser(userData, env);
    }
    if (request.method === "POST") {
      const result = await createUser(userData, env);
      return Response.json(result.body, { status: result.status });
    }
    if (request.method === "PATH") {
    }
    if (request.method === "DELETE") {
    }
    return Response.json({ mensagem: "Rota inexistente." }, { status: 404 });
  } catch (error) {
    return Response.json({ mensagem: "Dados inv\xE1lidos." }, { status: 400 });
  }
}
__name(routeUser, "routeUser");

// src/index.js
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/user"))
      return routeUser(request, env);
    return Response.json({ mensagem: "Rota inexistente" }, { status: 404 });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
