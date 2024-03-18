# halo2-lib-wasm

This forked version of axiom's halo2-lib is meant to benchmark their performance in-browser when converted to wasm. It heavily uses the [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) package and the [WASM guide](https://zcash.github.io/halo2/user/wasm-port.html) from Nalin.

## ECDSA setup

To fully benchmark ECDSA, there are a number of different configs to be tried, which change the number of rows used in the circuit in powers of 2 from 2^11 to 2^19. As a result, there's some additional setup to be done to fully benchmark the entire suite.

### Generating params

To use the repo, you first need to download the KZG params from Hermez's trusted setup. I remember Axiom posting them somewhere at some point, but I actually can't find them anymore. Thankfully, I had the old ones saved, and have a script to convert them into a Typescript-readable format (accessible by placing the original params in `halo2-ecc/params` and running `cargo run` in the halo2-ecc repo). I've already added these .bin files to a personal S3 bucket for easier use, but please redeploy in your own setup! Don't depend on that bucket remaining up!

### Generating WASM

Edit the `halo2-ecc/src/wasm.rs` file to make available whatever Rust functions you want in-browser. After that, run `sh ./scripts/build-wasm.sh` in `halo2-ecc`, which will automatically generate WASM for each of the different settings of the ECDSA circuit.

### Benchmarking on metal

If you want to get performance of the ECDSA circuits on metal, then you'll need to follow the following steps. First, you'll need to uncomment the code in `halo2-ecc/src/secp256k1/ecdsa.rs` that reads `PARAMS` from `.config` files, and comment out the portion that reads them from `halo2-ecc/src/secp256k1/params.rs`. Then, you'll need to run `cargo test --release -- --nocapture bench_secp256k1_ecdsa`. If you go to the specific test in `halo2-ecc/src/secp256k1/tests/ecdsa.rs`, then you can also output serialized versions of verification keys and proving keys if you desire.

## Sizes of params and vkeys

One of the amazing parts of using PLONK based systems is not having to download a huge zkey (for full zkECDSA in circom, this was 1GB+ !!). You just need to download the KZG trusted setup params. However, the number of params you need to download increases based on the number of rows in your circuit. 

One key observation of this benchmarking work is that you can save a ton of time in raw proving by precomputing the verification keys and loading that directly into the Halo2 proving. The sizes of these vkeys are quite small, but this can save 6-13s on overall proving (on an M1 Macbook).

| k (log of row numbers) | Params Size (MB) | Vkeys Size (MB) |
| ---------------------- | ---------------- | --------------- |
| 11                     | 0.25             | 0.11            |
| 12                     | 0.50             | 0.09            |
| 13                     | 1.00             | 0.08            |
| 14                     | 2.00             | 0.07            |
| 15                     | 4.00             | 0.07            |
| 16                     | 8.00             | 0.06            |
| 17                     | 16.00            | 0.06            |
| 18                     | 32.00            | 0.06            |
| 19                     | 64.00            | 0.13            |

It doesn't make sense time / bandwidth wise to precompute the proving key, in my measurements. It's also worth noting that less rows => more columns => bigger proofs => larger on-chain verification cost. If you have a larger proof, you can then do proof aggregation to make it smaller again, which can happen on a server without sacrificing privacy, but just adds more latency to the UX.
