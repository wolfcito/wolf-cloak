import { Suspense, lazy, useState } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";

const EERC = lazy(() =>
	import("./pages/EERC").then((module) => ({ default: module.EERC })),
);

// Loading component
const LoadingFallback = () => (
	<div className="flex items-center justify-center h-full">
		<div className="text-enigma-primary font-mono">Loading...</div>
	</div>
);

export function App() {
	const [activeSection, setActiveSection] = useState("dashboard");

	return (
		<div className="min-h-screen bg-enigma-bg flex flex-col">
			<Header />
			<div className="flex flex-1">
				<Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
				<main className="flex-1 bg-enigma-bg p-8">
					<Suspense fallback={<LoadingFallback />}>
						<EERC />
					</Suspense>
				</main>
			</div>
		</div>
	);
}

export default App;
