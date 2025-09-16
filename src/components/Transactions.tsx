
import { useState } from "react";

export type TxItem = {
  hash: `0x${string}`;
  type: string;
  amount?: string;
  from?: `0x${string}`;
  to?: `0x${string}`;
  tokenId?: bigint;
  dust?: bigint;
  blockNumber: bigint;
  timestamp?: number;
};

// Time filter options
const timeFilters = ["1D", "7D", "1M", "3M", "1Y", "All"];

// Get crypto icon based on transaction type
const getCryptoIcon = (type: string) => {
  switch (type.toLowerCase()) {
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
          <span className="text-trading-darkest font-bold text-sm">?</span>
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

export function Transactions({
  items,
  onRefresh,
  pending,
}: {
  items: TxItem[];
  onRefresh: () => void;
  pending?: boolean;
}) {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("All");

  return (
    <div className="bg-trading-panel border border-trading-border rounded-lg p-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-trading-text font-bold text-xl">Transaction history</h3>
        <button
          className="bg-trading-dark text-trading-text px-4 py-2 rounded-lg border border-trading-border hover:bg-trading-hover transition-all duration-200 font-medium"
          onClick={onRefresh}
          disabled={pending}
        >
          {pending ? "Refreshing..." : "Refresh"}
        </button>
      </div>

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
          <div className="text-trading-text-muted text-lg">No recent transactions found.</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-trading-border">
                <th className="text-left py-3 px-4 text-trading-text-muted font-medium">Crypto trade</th>
                <th className="text-left py-3 px-4 text-trading-text-muted font-medium">ID</th>
                <th className="text-left py-3 px-4 text-trading-text-muted font-medium">Type</th>
                <th className="text-left py-3 px-4 text-trading-text-muted font-medium">Date</th>
                <th className="text-left py-3 px-4 text-trading-text-muted font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 50).map((tx) => (
                <tr key={tx.hash} className="border-b border-trading-border/50 hover:bg-trading-hover/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {getCryptoIcon(tx.type)}
                      <span className="text-trading-text font-medium capitalize">{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <a
                      href={`https://testnet.snowtrace.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-trading-text underline hover:text-trading-accent transition-colors font-mono text-sm"
                    >
                      {tx.hash.slice(0, 20)}...
                    </a>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-trading-text capitalize">{tx.type}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-trading-text-muted">
                      {tx.timestamp
                        ? new Date(tx.timestamp * 1000).toLocaleString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : `Block #${tx.blockNumber.toString()}`}
                    </span>
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
