import { Suspense, lazy } from "react";
import { Header } from "./components/layout/Header";

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

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<div className="flex flex-1">
				<main className="flex-1 p-8">
					<Suspense fallback={<LoadingFallback />}>
						<EERC />
					</Suspense>
				</main>
			</div>
		</div>
	);
}

export default App;
