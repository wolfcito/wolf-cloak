import { Suspense, lazy } from "react";
// ApolloProvider not required; using lightweight fetch-based GraphQL hooks
import { Logo } from "./components/layout/Logo";

const EERC = lazy(() =>
	import("./pages/EERC").then((module) => ({ default: module.EERC })),
);

// Loading component
const LoadingFallback = () => (
	<div className="flex items-center justify-center h-full">
		<div className="text-red-500 font-mono">Loading...</div>
	</div>
);

export function App() {
  return (
    <div className="min-h-screen bg-cloak-black">
      <header className="sticky top-0 w-full bg-cloak-dark text-white p-4 flex items-center justify-between border-b border-red-500/30">
        <Logo />
      </header>
      <main className="p-6">
        <Suspense fallback={<LoadingFallback />}>
          <EERC />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
