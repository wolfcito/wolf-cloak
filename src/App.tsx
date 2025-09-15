import { Suspense, lazy } from "react";
// ApolloProvider not required; using lightweight fetch-based GraphQL hooks
import { Logo } from "./components/layout/Logo";

const EERC = lazy(() =>
	import("./pages/EERC").then((module) => ({ default: module.EERC })),
);

// Loading component
const LoadingFallback = () => (
	<div className="flex items-center justify-center h-full">
		<div className="text-chess-accent font-mono">Loading...</div>
	</div>
);

export function App() {
  return (
    <div className="min-h-screen bg-chess-darkest">
      <header className="sticky top-0 w-full bg-chess-darker text-chess-text p-4 flex items-center justify-between border-b border-chess-border">
        <Logo />
      </header>
      <main className="p-6 bg-chess-dark">
        <Suspense fallback={<LoadingFallback />}>
          <EERC />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
