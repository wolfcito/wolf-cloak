import { type Point, inCurve } from "@zk-kit/baby-jubjub";
import { useEffect, useMemo, useState } from "react";
import { FaMapPin } from "react-icons/fa";
import type { IJubPoint } from "../../types";

interface CurvePointProps {
	x: bigint;
	y: bigint;
	label?: string;
	onChange: (point: Partial<IJubPoint>) => void;
	shouldCollapse?: boolean;
	isCentered?: boolean;
}

export function CurvePoint({
	x,
	y,
	label,
	onChange,
	shouldCollapse = true,
	isCentered = false,
}: CurvePointProps) {
	const [isHovering, setIsHovering] = useState(false);
	const [isOnCurve, setIsOnCurve] = useState(false);

	const truncateValue = (value: bigint) => {
		if (value.toString().length > 10) {
			return `${value.toString().slice(0, 5)}...${value.toString().slice(-5)}`;
		}
		return value.toString();
	};

	useEffect(() => {
		try {
			if (x.toString() && y.toString()) {
				const issOnCurve = inCurve([x, y] as Point<bigint>);
				setIsOnCurve(issOnCurve);
			}
		} catch (error) {
			console.error(error);
			setIsOnCurve(false);
		}
	}, [x, y]);

	const styles = useMemo(() => {
		if (isOnCurve)
			return {
				boxStyle: "border-red-500/30 hover:border-red-500/30",
				pinColor: "text-red-500/60",
				textStyle: "text-red-500/60",
			};
		return {
			boxStyle: "border-cloak-red/30 hover:border-cloak-red/30",
			pinColor: "text-cloak-red/60",
			textStyle: "text-cloak-red/60",
		};
	}, [isOnCurve]);

	return (
		<div
			className={`group relative ${isCentered ? "flex justify-center" : "flex-1"}`}
		>
			<div
				className={`flex items-center space-x-4 bg-cloak-dark/50 px-4 py-3 rounded-lg border ${
					styles.boxStyle
				} transition-all ${isCentered ? "w-fit" : "w-full"}`}
				onMouseEnter={() => {
					if (!isCentered) setIsHovering(true);
				}}
				onMouseLeave={() => {
					if (!isCentered) setIsHovering(false);
				}}
			>
				<div className="flex-shrink-0 w-12 h-12 flex items-center justify-center flex-col">
					<FaMapPin className={`w-6 h-6 self-center ${styles.pinColor}`} />
					{label && (
						<div className="text-xs text-center mt-1 text-cloak-gray font-mono">
							{label}
						</div>
					)}
				</div>

				{isHovering ? (
					<div className="font-mono w-full">
						<div className="text-sm text-cloak-gray/80">
							<input
								className={`${styles.textStyle} text-sm bg-transparent w-full focus:outline-none font-mono`}
								value={x.toString()}
								onChange={(e) => onChange({ x: BigInt(e.target.value) })}
							/>
						</div>
						<div className="text-sm text-cloak-gray/80">
							<input
								className={`${styles.textStyle} text-sm bg-transparent w-full focus:outline-none font-mono`}
								value={y.toString()}
								onChange={(e) => onChange({ y: BigInt(e.target.value) })}
							/>
						</div>
					</div>
				) : (
					<div className="font-mono">
						<div className="text-sm">
							<span className={`${styles.textStyle}`}>
								{shouldCollapse ? truncateValue(x) : x.toString()}
							</span>
						</div>
						<div className="text-sm">
							<span className={`${styles.textStyle}`}>
								{shouldCollapse ? truncateValue(y) : y.toString()}
							</span>
						</div>
					</div>
				)}

				{!isOnCurve && (
					<div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-cloak-dark text-cloak-red px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity font-mono">
						Point is not on the curve
					</div>
				)}
			</div>
		</div>
	);
}
