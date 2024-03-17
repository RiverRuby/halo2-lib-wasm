# halo2-lib-wasm

This forked version of axiom's halo2-lib is meant to benchmark their performance in-browser when converted to wasm. It heavily uses the [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) package and the [WASM guide](https://zcash.github.io/halo2/user/wasm-port.html) from Nalin.

## ECDSA setup

To fully benchmark ECDSA, there are a number of different configs to be tried, which change the number of rows used in the circuit in powers of 2 from 2^11 to 2^19. As a result, there's some additional setup to be done to fully benchmark the entire suite.

### Generating params

You'll need first need to download the KZG params from Hermez's trusted setup. I remember Axiom posting them somewhere at some point, but I actually can't find them anymore; message me and I can send you a copy. Then, place them into the `halo2-ecc/params` directory. You'll then need to convert them into a form that's easily readible on the TypeScript side of things. To do that, run `cargo run` in the halo2-ecc repo. Finally, you'll need to move the generated `.bin` files to the `browser/public` directory so they can be accessed by the web page.

### Generating WASM

Edit the `halo2-ecc/src/wasm.rs` file to make available whatever Rust functions you want in-browser. After that, run `sh ./scripts/build-wasm.sh` in `halo2-ecc`, which will automatically generate WASM for each of the different settings of the ECDSA circuit.

### Benchmarking on metal

If you want to get performance of the ECDSA circuits on metal, then you'll need to follow the following steps. First, you'll need to uncomment the code in `halo2-ecc/src/secp256k1/ecdsa.rs` that reads `PARAMS` from `.config` files, and comment out the portion that reads them from `halo2-ecc/src/secp256k1/params.rs`. Then, you'll need to run `cargo test --release -- --nocapture bench_secp256k1_ecdsa`. If you go to the specific test in `halo2-ecc/src/secp256k1/tests/ecdsa.rs`, then you can also output serialized versions of verification keys and proving keys if you desire.

## Sizes of params

One of the amazing parts of using PLONK based systems is not having to download a huge zkey (for full zkECDSA in circom, this was 1GB+ !!). However, the number of params you need to download increases based on the number of rows in your circuit. Here's the breakdown.

params_11.bin: 262404 / 1024 / 1024 = 0.25 MB

params_12.bin: 524548 / 1024 / 1024 = 0.50 MB

params_13.bin: 1048836 / 1024 / 1024 = 1.00 MB

params_14.bin: 2097412 / 1024 / 1024 = 2.00 MB

params_15.bin: 4194564 / 1024 / 1024 = 4.00 MB

params_16.bin: 8388868 / 1024 / 1024 = 8.00 MB

params_17.bin: 16777476 / 1024 / 1024 = 16.00 MB

params_18.bin: 33554692 / 1024 / 1024 = 32.00 MB

params_19.bin: 67109124 / 1024 / 1024 = 64.00 MB

## Sizes of vkeys

One main observation of this work is that you can save a ton of time in raw proving by precomputing the verification keys and loading that into the Halo2 proving. The sizes of these vkeys are quite small, but saves 6-13s on overall proving! Here are the different vkey sizes:

ecdsa_11.vk: 115528 / 1024 / 1024 = 0.11 MB

ecdsa_12.vk: 90696 / 1024 / 1024 = 0.09 MB

ecdsa_13.vk: 79240 / 1024 / 1024 = 0.08 MB

ecdsa_14.vk: 74568 / 1024 / 1024 = 0.07 MB

ecdsa_15.vk: 72200 / 1024 / 1024 = 0.07 MB

ecdsa_16.vk: 66888 / 1024 / 1024 = 0.06 MB

ecdsa_17.vk: 66312 / 1024 / 1024 = 0.06 MB

ecdsa_18.vk: 66056 / 1024 / 1024 = 0.06 MB

ecdsa_19.vk: 131464 / 1024 / 1024 = 0.13 MB
