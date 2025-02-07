import { expose } from "comlink";

const fetch_kzg_params = async (k: number) => {
  const response = await fetch(
    `https://halo2-ecdsa-params.s3.us-east-2.amazonaws.com/params_${k}.bin`
  );
  const bytes = await response.arrayBuffer();

  const params = new Uint8Array(bytes);
  return params;
};

const fetch_circuit_vkey = async (k: number) => {
  const response = await fetch(`/ecdsa_${k}.vk`);
  const bytes = await response.arrayBuffer();
  const vk = new Uint8Array(bytes);
  return vk;
};

export const generateProof = async (k: number) => {
  console.log("ECDSA signature verification, rows = 2^" + k);
  const params = await fetch_kzg_params(k);

  const {
    default: init,
    initThreadPool,
    prove,
    init_panic_hook,
  } = await import(`./wasm${k}/halo2_ecc.js`);

  console.log("number of threads", navigator.hardwareConcurrency);

  await init();
  await init_panic_hook();
  await initThreadPool(navigator.hardwareConcurrency);
  console.time("Full proving time");
  const proof = await prove(params);
  console.timeEnd("Full proving time");
  console.log("proof", proof);
};

export const generateProofPreloadedVK = async (k: number) => {
  console.log("ECDSA signature verification with loaded VK, rows = 2^" + k);
  const params = await fetch_kzg_params(k);
  const vk = await fetch_circuit_vkey(k);

  const {
    default: init,
    initThreadPool,
    prove_vk,
    init_panic_hook,
  } = await import(`./wasm${k}/halo2_ecc.js`);

  console.log("number of threads", navigator.hardwareConcurrency);

  await init();
  await init_panic_hook();
  await initThreadPool(navigator.hardwareConcurrency);
  console.time("Full proving time");
  await prove_vk(params, vk);
  console.timeEnd("Full proving time");
};

const exports = {
  generateProof,
  generateProofPreloadedVK,
};
export type Halo2Prover = typeof exports;

expose(exports);
