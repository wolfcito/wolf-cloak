import { useState } from "react";
import { Bounce, toast } from "react-toastify";

interface WithdrawProps {
	handlePrivateWithdraw: (amount: string) => Promise<void>;
	isDecryptionKeySet: boolean;
}

export function Withdraw({
	handlePrivateWithdraw,
	isDecryptionKeySet,
}: WithdrawProps) {
	const [withdrawAmount, setWithdrawAmount] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	return (
		<>
			<div className="flex-1">
				<h3 className="text-discord-accent font-bold mb-2">Withdraw</h3>
			</div>

			<div>
				<input
					type="text"
					value={withdrawAmount}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*\.?\d{0,2}$/.test(value)) {
							setWithdrawAmount(value);
						}
					}}
					placeholder={"Amount in ether (eg. 1.5, 0.01)"}
					className="flex-1 bg-cloak-dark text-cloak-gray px-4 py-0.5 rounded-lg border border-red-500/20 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono w-full"
				/>
				<button
					type="button"
					className="bg-cloak-dark w-full text-discord-accent px-2 py-1 rounded-md text-sm border border-red-500/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-red-500/60 transition-all duration-200 font-mono mt-2"
					onClick={async () => {
						setLoading(true);
						handlePrivateWithdraw(withdrawAmount)
							.then(() => {
								setLoading(false);
								setWithdrawAmount("");
							})
							.catch((error) => {
								const isUserRejected = error?.message.includes("User rejected");

								toast.error(
									<div>
										<p>
											{isUserRejected
												? "Transaction rejected"
												: "An error occurred while withdrawing tokens. Please try again."}
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
					disabled={!withdrawAmount || loading || !isDecryptionKeySet}
				>
					{loading ? "Withdrawing..." : "Withdraw"}
				</button>
			</div>
		</>
	);
}
