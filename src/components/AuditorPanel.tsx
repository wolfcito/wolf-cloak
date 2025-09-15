import { useMemo } from "react";

export function AuditorPanel({
  areYouAuditor,
  isAuditorKeySet,
  hasKey,
  loading,
  error,
  items,
  onRefresh,
  explorerBaseTx,
}: {
  areYouAuditor: boolean;
  isAuditorKeySet: boolean;
  hasKey: boolean;
  loading: boolean;
  error: string | null;
  items: Array<{
    transactionHash: `0x${string}`;
    amount?: string;
    sender?: `0x${string}`;
    receiver?: `0x${string}`;
    type?: string;
  }>;
  onRefresh: () => void;
  explorerBaseTx: string;
}) {
  const status = useMemo(() => {
    if (!areYouAuditor) return "Viewer (not auditor)";
    if (!isAuditorKeySet) return "Auditor set: No";
    if (!hasKey) return "Auditor set: Yes • Key missing";
    return "Auditor set: Yes • Key ready";
  }, [areYouAuditor, isAuditorKeySet, hasKey]);

  return (
    <div className="border border-red-500/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-discord-accent font-bold">Auditor Panel</div>
        <div className="text-discord-accent/70">{status}</div>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          className="bg-cloak-dark text-discord-accent px-2 py-1 rounded border border-red-500/60 hover:bg-red-500/60 transition-all duration-200"
          onClick={onRefresh}
          disabled={!areYouAuditor || !hasKey || loading}
          title={!areYouAuditor ? "Not an auditor" : !hasKey ? "Generate key first" : "Refresh"}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!hasKey && (
        <div className="text-cloak-gray mb-2">
          Generate your decryption key using the "🔑 Generate Decryption Key" section above, then refresh.
        </div>
      )}

      {error && (
        <div className="text-cloak-red mb-2">{String(error)}</div>
      )}

      {items.length === 0 ? (
        <div className="text-cloak-gray">No auditor-visible transactions found.</div>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 50).map((tx) => (
            <div
              key={tx.transactionHash}
              className="grid grid-cols-[140px_1fr] gap-x-3 items-center border-b border-red-500/10 pb-2"
            >
              <div className="text-discord-accent/80">
                {tx.type || "Tx"}
              </div>
              <div className="text-cloak-gray break-all">
                {tx.sender && (
                  <>
                    from <span className="text-discord-accent/80">{tx.sender}</span>
                  </>
                )}
                {tx.receiver && (
                  <>
                    {" "}to <span className="text-discord-accent/80">{tx.receiver}</span>
                  </>
                )}
                {tx.amount && (
                  <>
                    {" "}amount <span className="text-discord-accent/80">{tx.amount}</span>
                  </>
                )}
                <div className="text-xs text-discord-accent/60">
                  <a
                    href={`${explorerBaseTx}${tx.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-discord-accent"
                  >
                    {tx.transactionHash}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
