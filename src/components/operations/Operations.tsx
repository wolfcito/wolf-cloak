import { Burn } from "./Burn";
import { Deposit } from "./Deposit";
import { Mint } from "./Mint";
import { Transfer } from "./Transfer";
import { Withdraw } from "./Withdraw";

interface OperationsProps {
	handlePrivateMint: (amount: bigint) => Promise<void>;
	handlePrivateBurn: (amount: bigint) => Promise<void>;
	handlePrivateTransfer: (to: string, amount: string) => Promise<void>;
	handlePrivateDeposit: (amount: string) => Promise<void>;
	handlePrivateWithdraw: (amount: string) => Promise<void>;
	mode: "standalone" | "converter";
	isDecryptionKeySet: boolean;
	refetchBalance: () => void;
}

export function Operations({
	handlePrivateMint,
	handlePrivateBurn,
	handlePrivateTransfer,
	handlePrivateDeposit,
	handlePrivateWithdraw,
	isDecryptionKeySet,
	mode,
	refetchBalance,
}: OperationsProps) {
	const handlePrivateMint_ = async (amount: bigint) => {
		await handlePrivateMint(amount);
		refetchBalance();
	};

	const handlePrivateBurn_ = async (amount: bigint) => {
		await handlePrivateBurn(amount);
		refetchBalance();
	};

	const handlePrivateTransfer_ = async (to: string, amount: string) => {
		await handlePrivateTransfer(to, amount);
		refetchBalance();
	};

	const handlePrivateDeposit_ = async (amount: string) => {
		await handlePrivateDeposit(amount);
		refetchBalance();
	};

	const handlePrivateWithdraw_ = async (amount: string) => {
		await handlePrivateWithdraw(amount);
		refetchBalance();
	};

	return (
		<div className="flex flex-col font-mono space-y-2">
		

			{mode === "standalone" && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="border border-chess-border bg-chess-darker rounded-lg p-4 flex flex-col min-h-[200px]">
						<Mint
							handlePrivateMint={handlePrivateMint_}
							isDecryptionKeySet={isDecryptionKeySet}
						/>
					</div>

					<div className="border border-chess-border bg-chess-darker rounded-lg p-4 flex flex-col min-h-[200px] ">
						<Burn
							handlePrivateBurn={handlePrivateBurn_}
							isDecryptionKeySet={isDecryptionKeySet}
						/>
					</div>
				</div>
			)}

			{mode === "converter" && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="border border-chess-border bg-chess-darker rounded-lg p-4 flex flex-col min-h-[200px]">
						<Deposit
							handlePrivateDeposit={handlePrivateDeposit_}
							isDecryptionKeySet={isDecryptionKeySet}
						/>
					</div>

					<div className="border border-chess-border bg-chess-darker rounded-lg p-4 flex flex-col min-h-[200px] ">
						<Withdraw
							handlePrivateWithdraw={handlePrivateWithdraw_}
							isDecryptionKeySet={isDecryptionKeySet}
						/>
					</div>
				</div>
			)}

			<div className="border border-chess-border bg-chess-darker rounded-lg p-4 flex flex-col min-h-[200px]">
				<Transfer
					handlePrivateTransfer={handlePrivateTransfer_}
					isDecryptionKeySet={isDecryptionKeySet}
				/>
			</div>
		</div>
	);
}
