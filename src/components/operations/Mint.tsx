import { useState } from "react";
import { toast } from "react-toastify";
import { Bounce } from "react-toastify";
import { formatAmount } from "../../pkg/helpers";

interface MintProps {
	handlePrivateMint: (amount: bigint) => Promise<void>;
	isDecryptionKeySet: boolean;
}

export function Mint({ handlePrivateMint, isDecryptionKeySet }: MintProps) {
	const [mintAmount, setMintAmount] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	return (
		<>
			<div className="flex-1">
				<h3 className="text-discord-accent font-bold mb-2">Private Mint</h3>
			</div>

			<div>
				<input
					type="text"
					value={mintAmount}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*\.?\d{0,2}$/.test(value)) {
							setMintAmount(value);
						}
					}}
					placeholder={"..."}
					className="flex-1 bg-cloak-dark text-cloak-gray px-4 py-0.5 rounded-lg border border-red-500/20 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono w-full"
				/>
				<button
					type="button"
					className="bg-cloak-dark w-full text-discord-accent px-2 py-1 rounded-md text-sm border border-red-500/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-red-500/60 transition-all duration-200 font-mono mt-2"
					onClick={async () => {
						setLoading(true);
						const formattedAmount = formatAmount(mintAmount);
						handlePrivateMint(formattedAmount)
							.then(() => {
								setLoading(false);
								setMintAmount("");
							})
							.catch((error) => {
								console.log(error);

								toast.error(
									<div>
										<p>{error.reason}</p>
									</div>,
									{
										position: "top-right",
										autoClose: 5000,
										hideProgressBar: true,
										closeOnClick: true,
										pauseOnHover: false,
										draggable: true,
										progress: undefined,
										transition: Bounce,
									},
								);
								setLoading(false);
							});
					}}
					disabled={!mintAmount || loading || !isDecryptionKeySet}
				>
					{loading ? "Minting..." : "Mint"}
				</button>
			</div>
		</>
	);
}
