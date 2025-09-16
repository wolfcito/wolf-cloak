import { Suspense, lazy, useState } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";

const EERC = lazy(() =>
	import("./pages/EERC").then((module) => ({ default: module.EERC })),
);

// Loading component
const LoadingFallback = () => (
	<div className="flex items-center justify-center h-full">
		<div className="text-trading-accent font-mono">Loading...</div>
	</div>
);

export function App() {
	const [activeSection, setActiveSection] = useState("dashboard");

	return (
		<div className="min-h-screen bg-trading-darkest flex flex-col">
			<Header />
			<div className="flex flex-1">
				<Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
				<main className="flex-1 bg-trading-darkest p-6">
					<Suspense fallback={<LoadingFallback />}>
						<EERC />
					</Suspense>
				</main>
			</div>
		</div>
	);
}

export default App;
