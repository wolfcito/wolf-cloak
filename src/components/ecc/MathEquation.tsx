import type { ReactNode } from "react";

interface MathEquationProps {
	children: ReactNode;
}

export function MathEquation({ children }: MathEquationProps) {
	return (
		<div className="font-mono text-red-500/70 bg-cloak-black py-2 px-3 rounded">
			{children}
		</div>
	);
}
