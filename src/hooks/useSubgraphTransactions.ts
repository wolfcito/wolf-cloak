import { useGql } from "../lib/gql";
import { useMemo } from "react";

const TX_QUERY = `
  query Tx($addr: Bytes!, $contract: Bytes!, $first: Int = 100) {
    deposits: deposits(
      where: { user: $addr, contract: $contract }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      txHash
      timestamp
      amount
      dust
      tokenId
    }
    withdraws: withdraws(
      where: { user: $addr, contract: $contract }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      txHash
      timestamp
      amount
      tokenId
    }
    mints: privateMints(
      where: { user: $addr, contract: $contract }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      txHash
      timestamp
    }
    burns: privateBurns(
      where: { user: $addr, contract: $contract }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      txHash
      timestamp
    }
    sent: privateTransfers(
      where: { from: $addr, contract: $contract }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      txHash
      timestamp
      to
    }
    received: privateTransfers(
      where: { to: $addr, contract: $contract }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      txHash
      timestamp
      from
    }
  }
`;

export function useSubgraphTransactions(params: {
  address?: `0x${string}`;
  contract: `0x${string}`;
}) {
  const { address, contract } = params;
  const skip = !address || !contract;
  const { data, loading, error, refetch } = useGql<any>({
    query: TX_QUERY,
    variables: { addr: address, contract },
    skip,
  });

  const items = useMemo(() => {
    if (!data) return [] as Array<any>;
    const out: Array<{
      hash: `0x${string}`;
      type: string;
      from?: `0x${string}`;
      to?: `0x${string}`;
      amount?: string;
      blockNumber?: bigint;
      timestamp?: number;
    }> = [];

    for (const d of data.deposits ?? []) {
      out.push({
        hash: d.txHash,
        type: "Deposit",
        from: address,
        amount: d.amount?.toString?.(),
        timestamp: Number(d.timestamp),
      });
    }
    for (const w of data.withdraws ?? []) {
      out.push({
        hash: w.txHash,
        type: "Withdraw",
        from: address,
        amount: w.amount?.toString?.(),
        timestamp: Number(w.timestamp),
      });
    }
    for (const m of data.mints ?? []) {
      out.push({ hash: m.txHash, type: "Mint", from: address, timestamp: Number(m.timestamp) });
    }
    for (const b of data.burns ?? []) {
      out.push({ hash: b.txHash, type: "Burn", from: address, timestamp: Number(b.timestamp) });
    }
    for (const s of data.sent ?? []) {
      out.push({ hash: s.txHash, type: "Transfer Out", from: address, to: s.to, timestamp: Number(s.timestamp) });
    }
    for (const r of data.received ?? []) {
      out.push({ hash: r.txHash, type: "Transfer In", from: r.from, to: address, timestamp: Number(r.timestamp) });
    }

    out.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    return out;
  }, [data, address]);

  return { items, loading, error, refetch };
}
