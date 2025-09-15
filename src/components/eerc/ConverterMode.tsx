import { packPoint } from "@zk-kit/baby-jubjub";
import { toast } from "react-toastify";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useState } from "react";
import { CONTRACTS } from "../../config/contracts";
import { MAX_UINT256, DEMO_TOKEN_ABI as erc20Abi } from "../../pkg/constants";
import { formatDisplayAmount } from "../../pkg/helpers";
import { RightTooltip } from "../Tooltip";
import { CurvePoint } from "../ecc/CurvePoint";
import { Operations } from "../operations/Operations";

const eERC_CONVERTER_ADDRESS = CONTRACTS.EERC_CONVERTER;
const ERC20_ADDRESS = CONTRACTS.ERC20;

interface ConverterModeProps {
	showEncryptedDetails: boolean;
	setShowEncryptedDetails: (show: boolean) => void;
	handlePrivateDeposit: (amount: string) => Promise<void>;
	handlePrivateWithdraw: (amount: string) => Promise<void>;
	isDecryptionKeySet: boolean;
	publicKey: bigint[];
	owner: string;
	isAuditorKeySet: boolean;
	auditorPublicKey: bigint[];
	encryptedBalance: bigint[];
	decryptedBalance: bigint;
	refetchBalance: () => void;
	handlePrivateTransfer: (to: string, amount: string) => Promise<void>;
	onSetAuditor: (address: string) => Promise<void>;
	canSetAuditor: boolean;
}

export function ConverterMode({
	showEncryptedDetails,
	setShowEncryptedDetails,
	handlePrivateDeposit,
	handlePrivateWithdraw,
	isDecryptionKeySet,
	publicKey,
	owner,
	isAuditorKeySet,
	auditorPublicKey,
	encryptedBalance,
	decryptedBalance,
	refetchBalance,
	handlePrivateTransfer,
	onSetAuditor,
	canSetAuditor,
}: ConverterModeProps) {
	const { address } = useAccount();
	const { writeContractAsync } = useWriteContract({});
	const [auditorAddress, setAuditorAddress] = useState<string>("");
  const debugEnabled = import.meta.env.VITE_DEBUG_UI === "true";

	const { data: timeUntilNextRequest, refetch: refetchTimeUntilNextRequest } =
		useReadContract({
			abi: erc20Abi,
			functionName: "timeUntilNextRequest",
			args: [address as `0x${string}`],
			query: { enabled: !!address },
			address: ERC20_ADDRESS,
		}) as { data: bigint; refetch: () => void };

	const { data: erc20Balance, refetch: refetchErc20Balance } = useReadContract({
		abi: erc20Abi,
		functionName: "balanceOf",
		args: [address as `0x${string}`],
		query: { enabled: !!address },
		address: ERC20_ADDRESS,
	}) as { data: bigint; refetch: () => void };

	const { data: approveAmount, refetch: refetchApproveAmount } =
		useReadContract({
			abi: erc20Abi,
			functionName: "allowance",
			args: [address as `0x${string}`, eERC_CONVERTER_ADDRESS],
			query: { enabled: !!address },
			address: ERC20_ADDRESS,
		}) as { data: bigint; refetch: () => void };

	const { data: erc20Symbol } = useReadContract({
		abi: erc20Abi,
		functionName: "symbol",
		args: [],
		query: { enabled: !!address },
		address: ERC20_ADDRESS,
	}) as { data: string };

	const { data: erc20Decimals } = useReadContract({
		abi: erc20Abi,
		functionName: "decimals",
		args: [],
		query: { enabled: !!address },
		address: ERC20_ADDRESS,
	}) as { data: number };

	return (
		<>
			<div className="border border-chess-border/30 rounded-md p-4 font-mono text-sm bg-black/10">
				<div className="grid grid-cols-[220px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-chess-accent">Contract Address</div>
					<div className="text-chess-accent/80 break-all">
						{eERC_CONVERTER_ADDRESS}
					</div>

					<div className="text-chess-accent">Owner</div>
					<div className="text-chess-accent/80 break-all">{owner ?? "N/A"}</div>

					<div className="text-chess-accent">Mode</div>
					<div className="text-chess-accent/80 break-all">Converter</div>

					<div className="text-chess-accent">Is Auditor Key Set</div>
					<div className="text-chess-accent/80 break-all">
						{isAuditorKeySet ? "Yes" : "No"}
					</div>

					<div className="text-chess-accent">Auditor Public Key (hex)</div>
					<div className="text-chess-accent/80 break-all">
						{isAuditorKeySet
							? `0x${packPoint(auditorPublicKey as [bigint, bigint]).toString(16)}`
							: "N/A"}
					</div>

					<div className="text-chess-accent">User Public Key (hex)</div>
					<div className="text-chess-accent/80 break-all">
						{!!publicKey.length && publicKey[0] !== 0n && publicKey[1] !== 0n
							? `0x${packPoint(publicKey as [bigint, bigint]).toString(16)}`
							: "N/A"}
					</div>
				</div>
			</div>

			<div className="border border-chess-border/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-2">
				<div className="text-chess-accent font-bold mb-2">
					ERC-20 for Conversion
				</div>
				<div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-chess-accent">Decimals</div>
					<div className="text-chess-accent/80 break-all">{erc20Decimals}</div>

					<div className="text-chess-accent">Balance</div>
					<div className="text-chess-accent/80 break-all flex flex-row">
						{formatDisplayAmount(erc20Balance ?? 0n, erc20Decimals)}{" "}
						{erc20Symbol}
						<RightTooltip
							content="You can only request test tokens once every hour."
							id="request-erc20-tooltip"
						>
							<button
								className={`relative group inline-block text-cloak-gray/50 ml-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none inline-flex items-center transition-colors ${timeUntilNextRequest !== 0n ? "opacity-50 cursor-not-allowed hover:text-cloak-red" : "hover:text-cloak-gray"}`}
								title={`Request ERC-20 in ${timeUntilNextRequest} seconds`}
								onClick={async () => {
									const transactionHash = await writeContractAsync({
										abi: erc20Abi,
										functionName: "requestTokens",
										args: [],
										address: ERC20_ADDRESS,
										account: address as `0x${string}`,
									});
									await refetchErc20Balance();
									await refetchTimeUntilNextRequest();
									console.log("[TRANSACTION HASH]", transactionHash);

									toast.success("ERC-20 requested successfully");
								}}
								disabled={timeUntilNextRequest !== 0n}
								type="button"
							>
								Request ERC-20
							</button>
						</RightTooltip>
					</div>

					<div className="text-chess-accent">Allowance</div>
					<div className="text-chess-accent/80 break-all flex flex-row">
						{approveAmount === MAX_UINT256
							? "MAX"
							: `${formatDisplayAmount(approveAmount ?? 0n)} ${erc20Symbol}`}

						<RightTooltip
							content="The maximum amount of ERC-20 tokens that can be approved."
							id="approve-tooltip"
						>
							<button
								className={
									"relative group inline-block text-cloak-gray/50 ml-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none inline-flex items-center transition-colors hover:text-cloak-gray"
								}
								onClick={async () => {
									await writeContractAsync({
										abi: erc20Abi,
										functionName: "approve",
										args: [eERC_CONVERTER_ADDRESS, MAX_UINT256],
										address: ERC20_ADDRESS,
										account: address as `0x${string}`,
									});
									await refetchApproveAmount();
								}}
								type="button"
							>
								Approve All
							</button>
						</RightTooltip>
					</div>
				</div>
			</div>

			{/* Owner-only: Set Auditor section */}
			{canSetAuditor && !isAuditorKeySet && (
				<div className="border border-chess-border/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-2">
					<div className="text-chess-accent font-bold mb-2">Set Auditor</div>
					<div className="flex gap-2 items-center">
						<input
							type="text"
							value={auditorAddress}
							onChange={(e) => setAuditorAddress(e.target.value)}
							placeholder="0x... auditor address (must be registered)"
							className="flex-1 bg-black/20 border border-chess-border/40 rounded px-2 py-1 text-chess-accent placeholder:text-cloak-gray"
						/>
						<button
							onClick={() => onSetAuditor(auditorAddress)}
							className="bg-cloak-dark text-chess-accent px-2 py-1 rounded border border-chess-border/60 hover:bg-chess-border/60 transition-all duration-200"
						>
							Set Auditor
						</button>
					</div>
					<p className="text-xs text-cloak-gray mt-2">Only contract owner can set the auditor. The selected address must be registered.</p>
				</div>
			)}

			<div className="border border-chess-border/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-1 mb-4">
				<div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-cloak-gray">Decrypted Balance</div>
					<div className="text-chess-accent/80 break-all">
						<span className="text-chess-accent">
							{formatDisplayAmount(decryptedBalance)}
							{` e.${erc20Symbol}`}
						</span>
					</div>
				</div>
			</div>

			{/* Details / Debug section to surface unused props */}
			{debugEnabled && (
				<div className="border border-chess-border/30 rounded-md p-4 font-mono text-xs bg-black/10 mt-2">
					<div className="flex items-center justify-between">
						<div className="text-chess-accent">Details</div>
						<button
							className="bg-cloak-dark text-chess-accent px-2 py-1 rounded border border-chess-border/60 hover:bg-chess-border/60 transition-all duration-200"
							onClick={() => setShowEncryptedDetails(!showEncryptedDetails)}
							type="button"
						>
							{showEncryptedDetails ? "Hide" : "Show"}
						</button>
					</div>
					{showEncryptedDetails && (
						<div className="mt-2 space-y-2 text-chess-accent/80 break-all">
							<div>Encrypted Balance (len): {encryptedBalance?.length ?? 0}</div>
							<div>Encrypted Balance (raw): {JSON.stringify(encryptedBalance)}</div>
							<div className="flex gap-4 items-start">
								<div>
									<div className="text-chess-accent">Auditor Key (point)</div>
									<CurvePoint
										x={(auditorPublicKey?.[0] ?? 0n) as bigint}
										y={(auditorPublicKey?.[1] ?? 0n) as bigint}
										onChange={() => {}}
										shouldCollapse
										isCentered
									/>
								</div>
								<div>
									<div className="text-chess-accent">User Key (point)</div>
									<CurvePoint
										x={(publicKey?.[0] ?? 0n) as bigint}
										y={(publicKey?.[1] ?? 0n) as bigint}
										onChange={() => {}}
										shouldCollapse
										isCentered
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			<Operations
				handlePrivateMint={() => Promise.resolve()}
				handlePrivateBurn={() => Promise.resolve()}
				handlePrivateTransfer={handlePrivateTransfer}
				handlePrivateDeposit={handlePrivateDeposit}
				handlePrivateWithdraw={handlePrivateWithdraw}
				refetchBalance={refetchBalance}
				mode="converter"
				isDecryptionKeySet={isDecryptionKeySet}
			/>
		</>
	);
}
