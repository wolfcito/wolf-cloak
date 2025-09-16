import { useState } from "react";

interface SidebarProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

// SVG Icons Components
const GridIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
	</svg>
);

const BarChartIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
	</svg>
);

const WalletIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
	</svg>
);

const DocumentIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
	</svg>
);

const EnvelopeIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
	</svg>
);

const UsersIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
	</svg>
);

const LightningIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
	</svg>
);

const BriefcaseIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
	</svg>
);

const ShoppingCartIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
	</svg>
);

const HeadphonesIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
	</svg>
);

const SettingsIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
	</svg>
);

const QuestionMarkIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

export function Sidebar({ activeSection = "dashboard", onSectionChange }: SidebarProps) {
	const [active, setActive] = useState(activeSection);

	const handleSectionClick = (section: string) => {
		setActive(section);
		onSectionChange?.(section);
	};

	const sections = [
		{ id: "dashboard", icon: GridIcon, label: "Dashboard" },
		{ id: "analytics", icon: BarChartIcon, label: "Analytics" },
		{ id: "wallet", icon: WalletIcon, label: "Wallet" },
		{ id: "documents", icon: DocumentIcon, label: "Documents" },
		{ id: "messages", icon: EnvelopeIcon, label: "Messages" },
		{ id: "users", icon: UsersIcon, label: "Users" },
		{ id: "operations", icon: LightningIcon, label: "Operations" },
		{ id: "business", icon: BriefcaseIcon, label: "Business" },
		{ id: "marketplace", icon: ShoppingCartIcon, label: "Marketplace" },
		{ id: "support", icon: HeadphonesIcon, label: "Support" },
		{ id: "settings", icon: SettingsIcon, label: "Settings" },
		{ id: "help", icon: QuestionMarkIcon, label: "Help" },
	];

	return (
		<aside className="w-16 bg-trading-sidebar border-r border-trading-border h-full flex flex-col items-center py-4">
			{/* Main sections */}
			{sections.slice(0, 6).map((section) => {
				const IconComponent = section.icon;
				return (
					<button
						key={section.id}
						onClick={() => handleSectionClick(section.id)}
						className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-200 ${
							active === section.id
								? "bg-trading-accent text-trading-darkest"
								: "text-trading-text-muted hover:text-trading-text hover:bg-trading-hover"
						}`}
						title={section.label}
					>
						<IconComponent />
					</button>
				);
			})}
			
			{/* Separator */}
			<div className="w-8 h-px bg-trading-border my-2"></div>
			
			{/* Secondary sections */}
			{sections.slice(6, 9).map((section) => {
				const IconComponent = section.icon;
				return (
					<button
						key={section.id}
						onClick={() => handleSectionClick(section.id)}
						className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-200 ${
							active === section.id
								? "bg-trading-accent text-trading-darkest"
								: "text-trading-text-muted hover:text-trading-text hover:bg-trading-hover"
						}`}
						title={section.label}
					>
						<IconComponent />
					</button>
				);
			})}
			
			{/* Bottom sections */}
			<div className="flex-1"></div>
			{sections.slice(9).map((section) => {
				const IconComponent = section.icon;
				return (
					<button
						key={section.id}
						onClick={() => handleSectionClick(section.id)}
						className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-200 ${
							active === section.id
								? "bg-trading-accent text-trading-darkest"
								: "text-trading-text-muted hover:text-trading-text hover:bg-trading-hover"
						}`}
						title={section.label}
					>
						<IconComponent />
					</button>
				);
			})}
		</aside>
	);
}
