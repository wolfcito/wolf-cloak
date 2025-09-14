import { Logo } from "./Logo";

export function Header() {
	return (
		<header className="bg-cloak-black border-b border-red-500/20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-center items-center h-16">
					<Logo />
				</div>
			</div>
		</header>
	);
}
