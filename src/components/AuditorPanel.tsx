import { useMemo, useState } from "react";

// Time filter options
const timeFilters = ["1D", "7D", "1M", "3M", "1Y", "All"];

// Get crypto icon based on transaction type
const getCryptoIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "mint":
      return (
        <div className="w-8 h-8 bg-trading-accent rounded-full flex items-center justify-center">
          <span className="text-trading-darkest font-bold text-sm">M</span>
        </div>
      );
    case "burn":
      return (
        <div className="w-8 h-8 bg-trading-red rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">B</span>
        </div>
      );
    case "transfer":
      return (
        <div className="w-8 h-8 bg-trading-orange rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
      );
    case "deposit":
      return (
        <div className="w-8 h-8 bg-trading-green rounded-full flex items-center justify-center">
          <span className="text-trading-darkest font-bold text-sm">D</span>
        </div>
      );
    case "withdraw":
      return (
        <div className="w-8 h-8 bg-trading-purple rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">W</span>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 bg-trading-text-muted rounded-full flex items-center justify-center">
          <span className="text-trading-darkest font-bold text-sm">A</span>
        </div>
      );
  }
};

// Format amount with proper styling
const formatAmount = (amount?: string, type?: string) => {
  if (!amount) return null;
  
  const isPositive = type?.toLowerCase() === "mint" || type?.toLowerCase() === "deposit";
  const sign = isPositive ? "+" : "-";
  const color = isPositive ? "text-trading-green" : "text-trading-red";
  
  return (
    <span className={`${color} font-medium`}>
      {sign}{amount}
    </span>
  );
};

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
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("All");

  const status = useMemo(() => {
    if (!areYouAuditor) return "Viewer (not auditor)";
    if (!isAuditorKeySet) return "Auditor set: No";
    if (!hasKey) return "Auditor set: Yes • Key missing";
    return "Auditor set: Yes • Key ready";
  }, [areYouAuditor, isAuditorKeySet, hasKey]);

  return (
    <div className="bg-trading-panel border border-trading-border rounded-lg p-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-trading-text font-bold text-xl">Auditor Panel</h3>
        <div className="flex items-center gap-4">
          <div className="text-trading-text-muted text-sm">{status}</div>
          <button
            className="bg-trading-dark text-trading-text px-4 py-2 rounded-lg border border-trading-border hover:bg-trading-hover transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onRefresh}
            disabled={!areYouAuditor || !hasKey || loading}
            title={!areYouAuditor ? "Not an auditor" : !hasKey ? "Generate key first" : "Refresh"}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {!hasKey && (
        <div className="bg-trading-dark border border-trading-border rounded-lg p-4 mb-6">
          <div className="text-trading-text-muted">
            Generate your decryption key using the "🔑 Generate Decryption Key" section above, then refresh.
          </div>
        </div>
      )}

      {error && (
        <div className="bg-trading-red/10 border border-trading-red/30 rounded-lg p-4 mb-6">
          <div className="text-trading-red">{String(error)}</div>
        </div>
      )}

      {/* Time Filters */}
      <div className="flex gap-2 mb-6">
        {timeFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedTimeFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedTimeFilter === filter
                ? "bg-trading-accent text-trading-darkest"
                : "bg-trading-dark text-trading-text border border-trading-border hover:bg-trading-hover"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-trading-text-muted text-lg">No auditor-visible transactions found.</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-trading-border">
                <th className="text-left py-3 px-4 text-trading-text-muted font-medium">Crypto trade</th>
                <th className="text-left py-3 px-4 text-trading-text-muted font-medium">ID</th>
                <th className="text-left py-3 px-4 text-trading-text-muted font-medium">Type</th>
                <th className="text-left py-3 px-4 text-trading-text-muted font-medium">From/To</th>
                <th className="text-left py-3 px-4 text-trading-text-muted font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 50).map((tx) => (
                <tr key={tx.transactionHash} className="border-b border-trading-border/50 hover:bg-trading-hover/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {getCryptoIcon(tx.type)}
                      <span className="text-trading-text font-medium capitalize">{tx.type || "Audit"}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <a
                      href={`${explorerBaseTx}${tx.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-trading-text underline hover:text-trading-accent transition-colors font-mono text-sm"
                    >
                      {tx.transactionHash.slice(0, 20)}...
                    </a>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-trading-text capitalize">{tx.type || "Audit"}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-trading-text-muted text-sm">
                      {tx.sender && (
                        <div>From: <span className="text-trading-text font-mono">{tx.sender.slice(0, 10)}...</span></div>
                      )}
                      {tx.receiver && (
                        <div>To: <span className="text-trading-text font-mono">{tx.receiver.slice(0, 10)}...</span></div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {formatAmount(tx.amount, tx.type)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
