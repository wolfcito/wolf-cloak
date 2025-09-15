import { FaTrash } from "react-icons/fa";
import type { DisplayMode } from "../../types";

interface HashInputFieldProps {
	value: string;
	onChange: (value: string) => void;
	onRemove: () => void;
	canRemove: boolean;
	displayMode: DisplayMode;
}

export function HashInputField({
	value,
	onChange,
	onRemove,
	canRemove,
}: HashInputFieldProps) {
	const handleChange = (newValue: string) => onChange(newValue);

	return (
		<div className="flex space-x-2">
			<input
				type="text"
				value={value}
				onChange={(e) => {
					const value = e.target.value.trim();
					if (/^\d*$/.test(value)) {
						handleChange(value);
					}
				}}
				placeholder={"..."}
				className="flex-1 bg-cloak-dark text-cloak-gray px-4 py-1 rounded-lg border border-chess-border/20 focus:border-chess-border focus:ring-1 focus:ring-chess-border outline-none font-mono"
			/>
			{canRemove && (
				<button
					onClick={onRemove}
					type="button"
					className="px-4 bg-cloak-dark text-cloak-gray hover:text-chess-accent rounded-lg border border-chess-border/20"
					title="Remove input"
				>
					<FaTrash />
				</button>
			)}
		</div>
	);
}
