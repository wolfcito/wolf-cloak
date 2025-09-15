import { useState } from "react";
import { Bounce, toast } from "react-toastify";
import { useAccount } from "wagmi";

interface TransferProps {
	handlePrivateTransfer: (to: string, amount: string) => Promise<void>;
	isDecryptionKeySet: boolean;
}

export function Transfer({
	handlePrivateTransfer,
	isDecryptionKeySet,
}: TransferProps) {
	const { address } = useAccount();
	const [transferAmount, setTransferAmount] = useState<string>("");
	const [to, setTo] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	return (
		<>
			<div className="flex-1">
				<h3 className="text-discord-accent font-bold mb-2">Private Transfer</h3>
				
			</div>

			<div>
				<input
					type="text"
					value={to}
					onChange={(e) => setTo(e.target.value.trim())}
					placeholder={"Recipient address"}
					className="flex-1 bg-cloak-dark text-cloak-gray px-4 py-0.5 rounded-lg border border-red-500/20 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono w-full mb-2"
				/>
				<input
					type="text"
					value={transferAmount}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*\.?\d{0,2}$/.test(value)) {
							setTransferAmount(value);
						}
					}}
					placeholder={"Amount"}
					className="flex-1 bg-cloak-dark text-cloak-gray px-4 py-0.5 rounded-lg border border-red-500/20 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono w-full"
				/>
				<button
					type="button"
					className="bg-cloak-dark w-full text-discord-accent px-2 py-1 rounded-md text-sm border border-red-500/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-red-500/60 transition-all duration-200 font-mono mt-2"
					onClick={async () => {
						if (to.toLowerCase() === address?.toLowerCase()) {
							toast.error(
								<div>
									<p>You cannot transfer tokens to yourself</p>
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
							return;
						}

						setLoading(true);
						handlePrivateTransfer(to, transferAmount)
							.then(() => {
								setLoading(false);
								setTransferAmount("");
								setTo("");
							})
							.catch((error) => {
								const isUserRejected = error?.details.includes("User rejected");
								toast.error(
									<div>
										<p>
											{isUserRejected ? "Transaction rejected" : error?.message}
										</p>
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
					disabled={!transferAmount || loading || !to || !isDecryptionKeySet}
				>
					{loading ? "Transferring..." : "Transfer"}
				</button>
			</div>
		</>
	);
}
