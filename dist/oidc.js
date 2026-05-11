const DEFAULT_VERIFIER_KEY = "px-oidc-verifier";
const DEFAULT_STATE_KEY = "px-oidc-state";
async function generatePkce() {
  const rand = (n) => crypto.getRandomValues(new Uint8Array(n));
  const verifier = base64UrlEncode(rand(32));
  const state = base64UrlEncode(rand(16));
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return {
    verifier,
    state,
    challenge: base64UrlEncode(new Uint8Array(digest))
  };
}
function storePkce({ verifier, state }, { verifierKey = DEFAULT_VERIFIER_KEY, stateKey = DEFAULT_STATE_KEY } = {}) {
  sessionStorage.setItem(verifierKey, verifier);
  sessionStorage.setItem(stateKey, state);
}
function readPkce({
  verifierKey = DEFAULT_VERIFIER_KEY,
  stateKey = DEFAULT_STATE_KEY,
  consume = true
} = {}) {
  const verifier = sessionStorage.getItem(verifierKey);
  const state = sessionStorage.getItem(stateKey);
  if (consume) {
    sessionStorage.removeItem(verifierKey);
    sessionStorage.removeItem(stateKey);
  }
  return { verifier, state };
}
function base64UrlEncode(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export {
  DEFAULT_STATE_KEY,
  DEFAULT_VERIFIER_KEY,
  base64UrlEncode,
  generatePkce,
  readPkce,
  storePkce
};
