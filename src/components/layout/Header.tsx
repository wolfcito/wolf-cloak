import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";

export function Header() {
	const { address, isConnected } = useAccount();
	const { open } = useAppKit();

	const formatAddress = (addr: string) => {
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
	};

	return (
		<header className="bg-trading-darker border-b border-trading-border h-16 flex items-center justify-between px-6">
			{/* Left side - Logo */}
			<div className="flex items-center space-x-3">
				<div className="w-8 h-8 bg-trading-accent rounded-full flex items-center justify-center">
					<span className="text-trading-darkest font-bold text-sm">E</span>
				</div>
				<span className="text-trading-text font-bold text-xl">ENIGMA STABLE</span>
			</div>

			{/* Center - Search Bar */}
			<div className="flex-1 max-w-md mx-8">
				<div className="relative">
					<input
						type="text"
						placeholder="Search"
						className="w-full bg-trading-dark border border-trading-border rounded-lg px-4 py-2 pl-10 text-trading-text placeholder-trading-text-muted focus:outline-none focus:border-trading-accent"
					/>
					<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
						<svg className="w-4 h-4 text-trading-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
				</div>
			</div>

			{/* Right side - User info and actions */}
			<div className="flex items-center space-x-4">
				{/* Notifications */}
				<button className="p-2 text-trading-text-muted hover:text-trading-text transition-colors">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5L9 15H4l5-5V4l-5 5H9l-4.5 4.5z" />
					</svg>
				</button>

				{/* Wallet Balance */}
				<div className="flex items-center space-x-2 text-trading-text">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
					</svg>
					<span className="font-semibold">$0.00</span>
				</div>

				{/* Currency Selector */}
				<div className="flex items-center space-x-1 bg-trading-dark border border-trading-border rounded-lg px-3 py-1">
					<span className="text-trading-text-muted">$</span>
					<span className="text-trading-text font-medium">USD</span>
					<svg className="w-4 h-4 text-trading-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div>

				{/* User Profile */}
				{isConnected && address ? (
					<div className="flex items-center space-x-3 bg-trading-dark border border-trading-border rounded-lg px-3 py-2">
						<div className="w-8 h-8 bg-trading-accent rounded-full flex items-center justify-center">
							<span className="text-trading-darkest font-bold text-sm">U</span>
						</div>
						<div className="flex flex-col">
							<span className="text-trading-text text-sm font-medium">User</span>
							<span className="text-trading-text-muted text-xs">{formatAddress(address)}</span>
						</div>
					</div>
				) : (
					<button
						onClick={() => open()}
						className="bg-trading-accent text-trading-darkest px-4 py-2 rounded-lg font-medium hover:bg-trading-accent/90 transition-colors"
					>
						Connect Wallet
					</button>
				)}
			</div>
		</header>
	);
}
