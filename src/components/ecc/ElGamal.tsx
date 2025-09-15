import {
	Base8,
	type Point,
	addPoint,
	mulPointEscalar,
	packPoint,
} from "@zk-kit/baby-jubjub";
import { useEffect, useMemo, useState } from "react";
import { FaKey, FaLock, FaUnlock } from "react-icons/fa";
import { IDENTITY_POINT } from "../../pkg/constants";
import { fieldE, genKeyPair, genRandomScalar } from "../../pkg/jub";
import type { IJubPoint } from "../../types";
import { Divider } from "../Divider";
import { Decryption } from "../elgamal/Decryption";
import { Encryption } from "../elgamal/Encryption";
import { GenerateKey } from "../elgamal/GenerateKey";

export const ElGamal = () => {
	const [message, setMessage] = useState<string>("");
	const [encryptionRandom, setEncryptionRandom] = useState<bigint>(0n);
	const [keyPair, setKeyPair] = useState({
		privateKey: 0n,
		publicKey: IDENTITY_POINT,
	});

	const [ciphertext, setCiphertext] = useState<{
		C1: IJubPoint;
		C2: IJubPoint;
	}>({
		C1: IDENTITY_POINT,
		C2: IDENTITY_POINT,
	});

	const [decrypted, setDecrypted] = useState<IJubPoint>(IDENTITY_POINT);
	const [packedOriginal, setPackedOriginal] = useState<string>("");
	const [packedDecrypted, setPackedDecrypted] = useState<string>("");

	// biome-ignore lint/correctness/useExhaustiveDependencies:  every time key pair changes, update message, ciphertext, encryption random, and decrypted
	useEffect(() => {
		setMessage("");
		setCiphertext({
			C1: IDENTITY_POINT,
			C2: IDENTITY_POINT,
		});
		setEncryptionRandom(0n);
		setDecrypted(IDENTITY_POINT);
		setPackedOriginal("");
		setPackedDecrypted("");
	}, [keyPair]);

	const canDecrypt = useMemo(() => {
		return !!keyPair.privateKey && !!ciphertext.C1.x && !!ciphertext.C2.x;
	}, [keyPair.privateKey, ciphertext.C1, ciphertext.C2]);

	// generates key pair
	const handleGenerateKeyPair = () => {
		const { privateKey, publicKey } = genKeyPair();
		setKeyPair({
			privateKey,
			publicKey: { x: publicKey[0], y: publicKey[1] },
		});
	};

	// handles el gamal encryption
	const handleEncrypt = () => {
		if (!message) return;
		const msgInBigInt = BigInt(message);
		const msgInPoint = mulPointEscalar(Base8, msgInBigInt);
		const packed = packPoint(msgInPoint);
		setPackedOriginal(packed.toString());
		const random = genRandomScalar();
		setEncryptionRandom(random);

		const c1 = mulPointEscalar(Base8, random);
		const pky = mulPointEscalar(
			[keyPair.publicKey.x, keyPair.publicKey.y],
			random,
		);
		const c2 = addPoint(pky, msgInPoint);

		setCiphertext({
			C1: { x: c1[0], y: c1[1] },
			C2: { x: c2[0], y: c2[1] },
		});
	};

	// handles el gamal decryption
	const handleDecrypt = () => {
		if (!ciphertext || !keyPair.privateKey) return;
		const c1 = ciphertext.C1;
		const c2 = ciphertext.C2;

		const c1x = mulPointEscalar([c1.x, c1.y], keyPair.privateKey);
		const c1xInverse = [fieldE(c1x[0] * -1n), c1x[1]];
		const decryptedPoint = addPoint([c2.x, c2.y], c1xInverse as Point<bigint>);
		const packed = packPoint(decryptedPoint);
		setPackedDecrypted(packed.toString());

		setDecrypted({ x: decryptedPoint[0], y: decryptedPoint[1] });
	};

	return (
		<>
			<div className="text-cloak-gray font-mono text-sm leading-relaxed mt-10 mb-2">
				<h2 className="text-discord-accent font-bold text-lg mb-4 text-center flex items-center justify-center gap-2">
					<FaLock className="text-discord-accent" />
					ElGamal Encryption on BabyJubjub
				</h2>
				<div className="space-y-4">
					<p className="text-justify indent-6">
						ElGamal encryption is a trusted and widely used public-key
						encryption method. In the context of EERC, it is adapted to run on
						the BabyJubjub elliptic curve. This allows us to encrypt values with
						a public key and only the owner of the private key can decrypt it.
						While keeping things private, in El Gamal we can add two cipher
						texts together, and the decrypted result will be the sum of the
						original messages thanks to the homomorphic properties of the curve.
					</p>
					<div className="bg-cloak-dark/30 p-4 rounded-lg border border-red-500/20">
						<h3 className="text-discord-accent font-semibold mb-2">
							How it works:
						</h3>
						<ol className="list-decimal pl-6 space-y-2 text-sm">
							<li>Generate a key pair (private and public keys)</li>
							<li>Encrypt a message using the public key</li>
							<li>Decrypt the ciphertext using the private key</li>
						</ol>
					</div>
				</div>
			</div>

			<Divider title="🔐 Key Generation" />
			<div className="bg-cloak-dark/30 p-4 rounded-lg border border-red-500/20 mb-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-discord-accent font-semibold flex items-center gap-2">
						<FaKey className="text-discord-accent" />
						Key Pair
					</h3>
				</div>
				<GenerateKey
					handleGenerateKeyPair={handleGenerateKeyPair}
					keyPair={keyPair}
				/>
			</div>

			<Divider title="📦 Encryption" />
			<div className="bg-cloak-dark/30 p-4 rounded-lg border border-red-500/20 mb-4">
				<h3 className="text-discord-accent font-semibold mb-4 flex items-center gap-2">
					<FaLock className="text-discord-accent" />
					Encrypt Message
				</h3>
				<Encryption
					message={message}
					setMessage={setMessage}
					handleEncrypt={handleEncrypt}
					ciphertext={ciphertext}
					setCiphertext={setCiphertext}
					encryptionRandom={encryptionRandom}
					setDecrypted={setDecrypted}
				/>
			</div>

			<Divider title="🔑 Decryption" />
			<div className="bg-cloak-dark/30 p-4 rounded-lg border border-red-500/20">
				<h3 className="text-discord-accent font-semibold mb-4 flex items-center gap-2">
					<FaUnlock className="text-discord-accent" />
					Decrypt Message
				</h3>
				<Decryption
					decrypted={decrypted}
					handleDecrypt={handleDecrypt}
					canDecrypt={canDecrypt}
					packedOriginal={packedOriginal}
					packedDecrypted={packedDecrypted}
				/>
			</div>
		</>
	);
};
