import { useState } from "react";
import { Bounce, toast } from "react-toastify";
import { formatAmount } from "../../pkg/helpers";

interface BurnProps {
	handlePrivateBurn: (amount: bigint) => Promise<void>;
	isDecryptionKeySet: boolean;
}

export function Burn({ handlePrivateBurn, isDecryptionKeySet }: BurnProps) {
	const [burnAmount, setBurnAmount] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	return (
		<>
			<div className="flex-1">
				<h3 className="text-red-500 font-bold mb-2">Private Burn</h3>
			</div>

			<div>
				<input
					type="text"
					value={burnAmount}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*\.?\d{0,2}$/.test(value)) {
							setBurnAmount(value);
						}
					}}
					placeholder={"..."}
					className="flex-1 bg-cloak-dark text-cloak-gray px-4 py-0.5 rounded-lg border border-red-500/20 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono w-full"
				/>

				<button
					type="button"
					className="bg-cloak-dark w-full text-red-500 px-2 py-1 rounded-md text-sm border border-red-500/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-red-500/60 transition-all duration-200 font-mono mt-2"
					onClick={async () => {
						setLoading(true);
						const formattedAmount = formatAmount(burnAmount);
						handlePrivateBurn(formattedAmount)
							.then(() => {
								setLoading(false);
								setBurnAmount("");
							})
							.catch((error) => {
								console.log(error);

								if (!error) {
									setLoading(false);
									toast.error("An unknown error occurred", {
										position: "top-right",
										autoClose: 5000,
									});
									return;
								}

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
					disabled={!burnAmount || loading || !isDecryptionKeySet}
				>
					{loading ? "Burning..." : "Burn"}
				</button>
			</div>
		</>
	);
}
