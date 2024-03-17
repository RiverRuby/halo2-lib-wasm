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
