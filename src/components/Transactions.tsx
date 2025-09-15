
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

export function Transactions({
  items,
  onRefresh,
  pending,
}: {
  items: TxItem[];
  onRefresh: () => void;
  pending?: boolean;
}) {
  return (
    <div className="border border-chess-border/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-chess-accent font-bold">Transactions</div>
        <button
          className="bg-cloak-dark text-chess-accent px-2 py-1 rounded border border-chess-border/60 hover:bg-chess-border/60 transition-all duration-200"
          onClick={onRefresh}
          disabled={pending}
        >
          {pending ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="text-cloak-gray">No recent transactions found.</div>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 50).map((tx) => (
            <div
              key={tx.hash}
              className="grid grid-cols-[140px_1fr] gap-x-3 items-center border-b border-chess-border/10 pb-2"
            >
              <div className="text-chess-accent/80">
                {tx.timestamp
                  ? new Date(tx.timestamp * 1000).toLocaleString()
                  : `#${tx.blockNumber.toString()}`}
              </div>
              <div className="text-cloak-gray break-all">
                <span className="text-chess-accent">{tx.type}</span>
                {tx.from && (
                  <>
                    {" "}from <span className="text-chess-accent/80">{tx.from}</span>
                  </>
                )}
                {tx.to && (
                  <>
                    {" "}to <span className="text-chess-accent/80">{tx.to}</span>
                  </>
                )}
                {tx.amount && (
                  <>
                    {" "}amount <span className="text-chess-accent/80">{tx.amount}</span>
                  </>
                )}
                {tx.tokenId !== undefined && (
                  <>
                    {" "}(token {tx.tokenId.toString()}
                    {tx.dust && tx.dust !== 0n ? `, dust ${tx.dust.toString()}` : ""})
                  </>
                )}
                <div className="text-xs text-chess-accent/60">{tx.hash}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
