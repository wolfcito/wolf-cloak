// Contract addresses
export const CONTRACTS = {
  EERC_STANDALONE: "0x9318120Fa2bc597DCd05ed1e0e867AD1d1116576",
  EERC_CONVERTER: "0x41a3D92F5502fCd97e171810e81bCeD64E0EE873",
  ERC20: "0xDAD0B3390BEb1Fa6Ab4Cd5c0eE834f201a58DaA8",
} as const

// Circuit configuration
export const CIRCUIT_CONFIG = {
	register: {
		wasm: "/RegistrationCircuit.wasm",
		zkey: "/RegistrationCircuit.groth16.zkey",
	},
	mint: {
		wasm: "/MintCircuit.wasm",
		zkey: "/MintCircuit.groth16.zkey",
	},
	burn: {
		wasm: "/BurnCircuit.wasm",
		zkey: "/BurnCircuit.groth16.zkey",
	},
	transfer: {
		wasm: "/TransferCircuit.wasm",
		zkey: "/TransferCircuit.groth16.zkey",
	},
	withdraw: {
		wasm: "/WithdrawCircuit.wasm",
		zkey: "/WithdrawCircuit.groth16.zkey",
	},
} as const;

// Explorer URL
export const EXPLORER_BASE_URL = "https://testnet.snowtrace.io/address/";
export const EXPLORER_BASE_URL_TX = "https://testnet.snowtrace.io/tx/";

// Mode types
export type EERCMode = "standalone" | "converter";
