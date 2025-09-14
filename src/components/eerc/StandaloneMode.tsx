import { packPoint } from "@zk-kit/baby-jubjub";
import { useState } from "react";
import { CONTRACTS } from "../../config/contracts";
import { formatDisplayAmount } from "../../pkg/helpers";
import { CurvePoint } from "../ecc/CurvePoint";
import { Operations } from "../operations/Operations";

interface StandaloneModeProps {
	showEncryptedDetails: boolean;
	setShowEncryptedDetails: (show: boolean) => void;
	handlePrivateMint: (amount: bigint) => Promise<void>;
	handlePrivateBurn: (amount: bigint) => Promise<void>;
	handlePrivateTransfer: (to: string, amount: string) => Promise<void>;
	publicKey: bigint[];
	owner: string;
	decimals: number;
	symbol: string;
	isAuditorKeySet: boolean;
	auditorPublicKey: bigint[];
	encryptedBalance: bigint[];
	decryptedBalance: bigint;
	isDecryptionKeySet: boolean;
	refetchBalance: () => void;
	onSetAuditor: (address: string) => Promise<void>;
	canSetAuditor: boolean;
}

export function StandaloneMode({
	showEncryptedDetails,
	setShowEncryptedDetails,
	handlePrivateMint,
	handlePrivateBurn,
	handlePrivateTransfer,
	publicKey,
	owner,
	decimals,
	symbol,
	isAuditorKeySet,
	auditorPublicKey,
	encryptedBalance,
	decryptedBalance,
	isDecryptionKeySet,
	refetchBalance,
	onSetAuditor,
	canSetAuditor,
}: StandaloneModeProps) {
	const [auditorAddress, setAuditorAddress] = useState<string>("");
	return (
		<>
			<div className="border border-red-500/30 rounded-md p-4 font-mono text-sm bg-black/10">
				<div className="grid grid-cols-[220px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-red-500">Contract Address</div>
					<div className="text-red-500/80 break-all">
						{CONTRACTS.EERC_STANDALONE}
					</div>

					<div className="text-red-500">Owner</div>
					<div className="text-red-500/80 break-all">{owner ?? "N/A"}</div>

					<div className="text-red-500">Mode</div>
					<div className="text-red-500/80 break-all">Standalone</div>

					<div className="text-red-500">Decimals</div>
					<div className="text-red-500/80 break-all">
						{decimals?.toString()}
					</div>

					<div className="text-red-500">Token Name</div>
					<div className="text-red-500/80 break-all">{name ?? "N/A"}</div>

					<div className="text-red-500">Token Symbol</div>
					<div className="text-red-500/80 break-all">{symbol ?? "N/A"}</div>

					<div className="text-red-500">Is Auditor Key Set</div>
					<div className="text-red-500/80 break-all">
						{isAuditorKeySet ? "Yes" : "No"}
					</div>

					<div className="text-red-500">Auditor Public Key (hex)</div>
					<div className="text-red-500/80 break-all">
						{isAuditorKeySet
							? `0x${packPoint(auditorPublicKey as [bigint, bigint]).toString(16)}`
							: "N/A"}
					</div>

					<div className="text-red-500">User Public Key (hex)</div>
					<div className="text-red-500/80 break-all">
						{!!publicKey.length && publicKey[0] !== 0n && publicKey[1] !== 0n
							? `0x${packPoint(publicKey as [bigint, bigint]).toString(16)}`
							: "N/A"}
					</div>
				</div>
			</div>

			{/* Owner-only: Set Auditor section */}
			{canSetAuditor && !isAuditorKeySet && (
				<div className="border border-red-500/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-2">
					<div className="text-red-500 font-bold mb-2">Set Auditor</div>
					<div className="flex gap-2 items-center">
						<input
							type="text"
							value={auditorAddress}
							onChange={(e) => setAuditorAddress(e.target.value)}
							placeholder="0x... auditor address (must be registered)"
							className="flex-1 bg-black/20 border border-red-500/40 rounded px-2 py-1 text-red-500 placeholder:text-cloak-gray"
						/>
						<button
							onClick={() => onSetAuditor(auditorAddress)}
							className="bg-cloak-dark text-red-500 px-2 py-1 rounded border border-red-500/60 hover:bg-red-500/60 transition-all duration-200"
						>
							Set Auditor
						</button>
					</div>
					<p className="text-xs text-cloak-gray mt-2">Only contract owner can set the auditor. The selected address must be registered.</p>
				</div>
			)}

		

			<div className="border border-red-500/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-1 mb-4">
				<div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-cloak-gray">Decrypted Balance</div>
					<div className="text-red-500/80 break-all">
						<span className="text-red-500">
							{formatDisplayAmount(decryptedBalance)}
							{` ${symbol}`}
						</span>
					</div>
				</div>
			</div>

			<Operations
				handlePrivateMint={handlePrivateMint}
				handlePrivateBurn={handlePrivateBurn}
				handlePrivateTransfer={handlePrivateTransfer}
				handlePrivateDeposit={() => Promise.resolve()}
				handlePrivateWithdraw={() => Promise.resolve()}
				mode="standalone"
				isDecryptionKeySet={isDecryptionKeySet}
				refetchBalance={refetchBalance}
			/>
		</>
	);
}
