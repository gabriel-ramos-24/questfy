export function emailValido(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
}

export function nomeValido(nome) {
    const regexNome = /^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)+$/;
    return regexNome.test(nome);
}

export function senhaValida(senha) {
    const regexLetra = /[A-Za-z]/;
    const regexNumero = /[0-9]/;

    if (!regexLetra.test(senha)) return false;
    if (!regexNumero.test(senha)) return false;
    if (senha < 8 || senha > 16) return false;

    return true;
}
