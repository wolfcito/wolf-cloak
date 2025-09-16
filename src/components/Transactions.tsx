
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
        <div className="w-10 h-10 bg-enigma-primary rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">M</span>
        </div>
      );
    case "burn":
      return (
        <div className="w-10 h-10 bg-enigma-red rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">B</span>
        </div>
      );
    case "transfer":
      return (
        <div className="w-10 h-10 bg-enigma-orange rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">T</span>
        </div>
      );
    case "deposit":
      return (
        <div className="w-10 h-10 bg-enigma-green rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">D</span>
        </div>
      );
    case "withdraw":
      return (
        <div className="w-10 h-10 bg-enigma-purple rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">W</span>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 bg-enigma-text-muted rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">?</span>
        </div>
      );
  }
};

// Format amount with proper styling
const formatAmount = (amount?: string, type?: string) => {
  if (!amount) return null;
  
  const isPositive = type?.toLowerCase() === "mint" || type?.toLowerCase() === "deposit";
  const sign = isPositive ? "+" : "-";
  const color = isPositive ? "text-enigma-green" : "text-enigma-red";
  
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
    <div className="bg-enigma-white border border-enigma-border rounded-xl p-8 mt-8 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-enigma-text font-bold text-2xl">Transaction history</h3>
        <button
          className="bg-enigma-white text-enigma-text px-6 py-3 rounded-lg border border-enigma-border hover:bg-enigma-hover transition-all duration-200 font-medium shadow-sm"
          onClick={onRefresh}
          disabled={pending}
        >
          {pending ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Time Filters */}
      <div className="flex gap-3 mb-8">
        {timeFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedTimeFilter(filter)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              selectedTimeFilter === filter
                ? "bg-gradient-to-r from-enigma-gradient-start to-enigma-gradient-end text-white shadow-md"
                : "bg-enigma-bg text-enigma-text-muted border border-enigma-border hover:bg-enigma-hover hover:text-enigma-text"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-enigma-text-muted text-xl">No recent transactions found.</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-enigma-border">
                <th className="text-left py-4 px-6 text-enigma-text-muted font-semibold">Crypto trade</th>
                <th className="text-left py-4 px-6 text-enigma-text-muted font-semibold">ID</th>
                <th className="text-left py-4 px-6 text-enigma-text-muted font-semibold">Type</th>
                <th className="text-left py-4 px-6 text-enigma-text-muted font-semibold">Date</th>
                <th className="text-left py-4 px-6 text-enigma-text-muted font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 50).map((tx) => (
                <tr key={tx.hash} className="border-b border-enigma-border/50 hover:bg-enigma-hover/30 transition-colors">
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      {getCryptoIcon(tx.type)}
                      <span className="text-enigma-text font-medium capitalize text-lg">{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <a
                      href={`https://testnet.snowtrace.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-enigma-text underline hover:text-enigma-primary transition-colors font-mono text-sm"
                    >
                      {tx.hash.slice(0, 20)}...
                    </a>
                  </td>
                  <td className="py-6 px-6">
                    <span className="text-enigma-text capitalize font-medium">{tx.type}</span>
                  </td>
                  <td className="py-6 px-6">
                    <span className="text-enigma-text-muted">
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
                  <td className="py-6 px-6">
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
