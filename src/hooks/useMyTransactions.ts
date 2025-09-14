import { useCallback, useEffect, useMemo, useState } from "react";
import type { PublicClient } from "viem";

type Mode = "standalone" | "converter";

type TxItem = {
  hash: `0x${string}`;
  type: string;
  amount?: string; // undefined if private and viewer isn't auditor
  from?: `0x${string}`;
  to?: `0x${string}`;
  tokenId?: bigint;
  dust?: bigint;
  blockNumber: bigint;
  timestamp?: number;
};

const PRIVATE_TRANSFER_EVENT = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: "address", name: "from", type: "address" },
    { indexed: true, internalType: "address", name: "to", type: "address" },
    { indexed: false, internalType: "uint256[7]", name: "auditorPCT", type: "uint256[7]" },
    { indexed: true, internalType: "address", name: "auditorAddress", type: "address" },
  ],
  name: "PrivateTransfer",
  type: "event" as const,
};

const PRIVATE_MINT_EVENT = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: "address", name: "user", type: "address" },
    { indexed: false, internalType: "uint256[7]", name: "auditorPCT", type: "uint256[7]" },
    { indexed: true, internalType: "address", name: "auditorAddress", type: "address" },
  ],
  name: "PrivateMint",
  type: "event" as const,
};

const PRIVATE_BURN_EVENT = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: "address", name: "user", type: "address" },
    { indexed: false, internalType: "uint256[7]", name: "auditorPCT", type: "uint256[7]" },
    { indexed: true, internalType: "address", name: "auditorAddress", type: "address" },
  ],
  name: "PrivateBurn",
  type: "event" as const,
};

const DEPOSIT_EVENT = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: "address", name: "user", type: "address" },
    { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    { indexed: false, internalType: "uint256", name: "dust", type: "uint256" },
    { indexed: false, internalType: "uint256", name: "tokenId", type: "uint256" },
  ],
  name: "Deposit",
  type: "event" as const,
};

const WITHDRAW_EVENT = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: "address", name: "user", type: "address" },
    { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    { indexed: false, internalType: "uint256", name: "tokenId", type: "uint256" },
    { indexed: false, internalType: "uint256[7]", name: "auditorPCT", type: "uint256[7]" },
    { indexed: true, internalType: "address", name: "auditorAddress", type: "address" },
  ],
  name: "Withdraw",
  type: "event" as const,
};

export function useMyTransactions(params: {
  client: PublicClient | undefined;
  contract: `0x${string}`;
  address: `0x${string}` | undefined;
  mode: Mode;
  areYouAuditor: boolean;
  auditorDecrypt?: () => Promise<{
    transactionHash: `0x${string}`;
    amount: string;
    sender: `0x${string}`;
    receiver: `0x${string}`;
    type: string;
  }[]>;
}) {
  const { client, contract, address, mode, areYouAuditor, auditorDecrypt } =
    params;
  const [items, setItems] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bound = 2000n; // scan recent blocks window

  const load = useCallback(async () => {
    if (!client || !address || !contract) return;
    setLoading(true);
    setError(null);

    try {
      const current = await client.getBlockNumber();
      const fromBlock = current > bound ? current - bound : 0n;

      const entries: TxItem[] = [];

      if (mode === "converter") {
        // Deposit logs
        const depLogs = await client.getLogs({
          address: contract,
          event: DEPOSIT_EVENT,
          fromBlock,
          toBlock: current,
          args: { user: address },
        });
        for (const l of depLogs) {
          entries.push({
            hash: l.transactionHash!,
            type: "Deposit",
            amount: (l.args as any).amount?.toString?.(),
            tokenId: (l.args as any).tokenId as bigint,
            dust: (l.args as any).dust as bigint,
            from: address,
            blockNumber: l.blockNumber!,
          });
        }

        // Withdraw logs
        const wdLogs = await client.getLogs({
          address: contract,
          event: WITHDRAW_EVENT,
          fromBlock,
          toBlock: current,
          args: { user: address },
        });
        for (const l of wdLogs) {
          entries.push({
            hash: l.transactionHash!,
            type: "Withdraw",
            amount: (l.args as any).amount?.toString?.(),
            tokenId: (l.args as any).tokenId as bigint,
            from: address,
            blockNumber: l.blockNumber!,
          });
        }
      }

      // Common (private) events — amounts hidden unless auditor
      const mintLogs = await client.getLogs({
        address: contract,
        event: PRIVATE_MINT_EVENT,
        fromBlock,
        toBlock: current,
        args: { user: address },
      });
      for (const l of mintLogs) {
        entries.push({
          hash: l.transactionHash!,
          type: "Mint",
          from: address,
          blockNumber: l.blockNumber!,
        });
      }

      const burnLogs = await client.getLogs({
        address: contract,
        event: PRIVATE_BURN_EVENT,
        fromBlock,
        toBlock: current,
        args: { user: address },
      });
      for (const l of burnLogs) {
        entries.push({
          hash: l.transactionHash!,
          type: "Burn",
          from: address,
          blockNumber: l.blockNumber!,
        });
      }

      const sentLogs = await client.getLogs({
        address: contract,
        event: PRIVATE_TRANSFER_EVENT,
        fromBlock,
        toBlock: current,
        args: { from: address },
      });
      for (const l of sentLogs) {
        const to = (l.args as any).to as `0x${string}`;
        entries.push({
          hash: l.transactionHash!,
          type: "Transfer Out",
          from: address,
          to,
          blockNumber: l.blockNumber!,
        });
      }

      const recvLogs = await client.getLogs({
        address: contract,
        event: PRIVATE_TRANSFER_EVENT,
        fromBlock,
        toBlock: current,
        args: { to: address },
      });
      for (const l of recvLogs) {
        const from = (l.args as any).from as `0x${string}`;
        entries.push({
          hash: l.transactionHash!,
          type: "Transfer In",
          from,
          to: address,
          blockNumber: l.blockNumber!,
        });
      }

      // If auditor, try to decrypt amounts for matching tx hashes
      if (areYouAuditor && auditorDecrypt) {
        try {
          const dec = await auditorDecrypt();
          const byHash = new Map(dec.map((d) => [d.transactionHash, d]));
          for (const it of entries) {
            const m = byHash.get(it.hash);
            if (m) it.amount = m.amount;
          }
        } catch {}
      }

      // Attach timestamps
      const uniqBlocks = Array.from(new Set(entries.map((e) => e.blockNumber)));
      const blocks = await Promise.all(
        uniqBlocks.map((bn) => client.getBlock({ blockNumber: bn })),
      );
      const tmap = new Map(blocks.map((b) => [b.number!, Number(b.timestamp)]));
      for (const it of entries) it.timestamp = tmap.get(it.blockNumber);

      // sort desc
      entries.sort((a, b) => Number(b.blockNumber - a.blockNumber));

      setItems(entries);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [client, address, contract, mode, areYouAuditor, auditorDecrypt]);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({ items, loading, error, refetch: load }),
    [items, loading, error, load],
  );
}

