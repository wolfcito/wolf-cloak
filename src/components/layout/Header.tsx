import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";

export function Header() {
	const { address, isConnected } = useAccount();
	const { open } = useAppKit();

	const formatAddress = (addr: string) => {
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
	};

	return (
		<header className="h-16 flex items-center justify-between px-8">
			{/* Left side - Logo */}
			{/* <div className="flex items-center space-x-3">
				<div className="w-10 h-10 bg-enigma-primary rounded-lg flex items-center justify-center">
					<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
				</div>
				<div className="flex flex-col">
					<span className="text-enigma-primary font-bold text-lg">Enigma Protocol</span>
					<span className="text-enigma-text-muted text-xs">by AvalPay</span>
				</div>
			</div> */}

			{/* Center - Navigation */}
			{/* <nav className="flex items-center space-x-8">
				<a href="#" className="text-enigma-text-muted hover:text-enigma-primary transition-colors font-medium">Pricing</a>
				<a href="#" className="text-enigma-text-muted hover:text-enigma-primary transition-colors font-medium">Docs</a>
				<a href="#" className="text-enigma-text-muted hover:text-enigma-primary transition-colors font-medium">Help/FAQ</a>
				<a href="#" className="text-enigma-text-muted hover:text-enigma-primary transition-colors font-medium">About</a>
			</nav> */}

			{/* Right side - Network, Language, and User */}
			<div className="flex items-center space-x-4">
				{/* Network Selector */}
				{/* <div className="flex items-center space-x-2 bg-enigma-white border border-enigma-border rounded-lg px-3 py-2">
					<div className="w-2 h-2 bg-enigma-green rounded-full"></div>
					<span className="text-enigma-text font-medium">Fuji Testnet</span>
					<svg className="w-4 h-4 text-enigma-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div> */}

				{/* Language Selector */}
				{/* <div className="flex items-center space-x-2 bg-enigma-white border border-enigma-border rounded-lg px-3 py-2">
					<span className="text-enigma-text font-medium">EN - English</span>
					<svg className="w-4 h-4 text-enigma-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div> */}

				{/* Sign In Button */}
				{isConnected && address ? (
					<div className="flex items-center space-x-3 bg-enigma-white border border-enigma-border rounded-lg px-4 py-2">
						<div className="w-8 h-8 bg-enigma-primary rounded-full flex items-center justify-center">
							<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<div className="flex flex-col">
							<span className="text-enigma-text text-sm font-medium">User</span>
							<span className="text-enigma-text-muted text-xs">{formatAddress(address)}</span>
						</div>
					</div>
				) : (
					<button
						onClick={() => open()}
						className="bg-gradient-to-r from-enigma-gradient-start to-enigma-gradient-end text-white px-6 py-2 rounded-lg font-medium hover:from-enigma-gradient-start/90 hover:to-enigma-gradient-end/90 transition-all duration-200 flex items-center space-x-2 shadow-md"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						<span>Sign In</span>
					</button>
				)}
			</div>
		</header>
	);
}
