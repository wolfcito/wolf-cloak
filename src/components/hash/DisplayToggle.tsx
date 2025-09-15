import type { DisplayMode } from "../../types";

interface DisplayToggleProps {
	mode: DisplayMode;
	onToggle: () => void;
}

export function DisplayToggle({ mode, onToggle }: DisplayToggleProps) {
	return (
		<button
			onClick={onToggle}
			className="px-4  bg-cloak-dark text-cloak-gray hover:text-chess-accent border border-chess-border/20 rounded-lg font-mono transition-colors duration-200"
			type="button"
		>
			{mode === "decimal" ? "Hex" : "Decimal"}
		</button>
	);
}
