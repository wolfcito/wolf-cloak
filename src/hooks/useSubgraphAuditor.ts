import { useGql } from "../lib/gql";
import { useMemo, useState, useEffect } from "react";
import { Poseidon } from "@avalabs/eerc-sdk";

const AUDITOR_QUERY = `
  query AuditorTx($aud: Bytes!, $contract: Bytes!, $first: Int = 100) {
    t1: privateTransfers(
      where: { auditor: $aud, contract: $contract }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      txHash
      timestamp
      from
      to
      auditorPCT
    }
    t2: privateMints(
      where: { auditor: $aud, contract: $contract }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      txHash
      timestamp
      user
      auditorPCT
    }
    t3: privateBurns(
      where: { auditor: $aud, contract: $contract }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      txHash
      timestamp
      user
      auditorPCT
    }
    t4: withdraws(
      where: { auditor: $aud, contract: $contract }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      txHash
      timestamp
      user
      auditorPCT
    }
  }
`;

export function useSubgraphAuditor(params: {
  address?: `0x${string}`;
  contract: `0x${string}`;
  areYouAuditor?: boolean;
}) {
  const { address, contract, areYouAuditor } = params;
  const [hasKey, setHasKey] = useState(false);
  const [keyString, setKeyString] = useState("");
  useEffect(() => {
    if (!address || !contract) return;
    try {
      const stored = localStorage.getItem(`eerc:dk:${contract}:${address}`);
      if (stored) {
        setHasKey(true);
        setKeyString(stored);
      } else {
        setHasKey(false);
        setKeyString("");
      }
    } catch {
      setHasKey(false);
      setKeyString("");
    }
  }, [address, contract]);
  const { data, loading, error, refetch } = useGql<any>({
    query: AUDITOR_QUERY,
    variables: { aud: address, contract },
    skip: !address || !contract || !areYouAuditor || !hasKey,
  });

  const items = useMemo(() => {
    if (!data) return [] as Array<any>;
    const out: Array<{
      transactionHash: `0x${string}`;
      type: string;
      sender?: `0x${string}`;
      receiver?: `0x${string}`;
      amount?: string;
      timestamp?: number;
    }> = [];

    const decrypt = (pct: string[] | bigint[]) => {
      if (!hasKey || !keyString || !pct || pct.length !== 7) return undefined;
      try {
        const amt = Poseidon.decryptAmountPCT(
          keyString,
          (pct as any[]).map((x) => x.toString()),
        );
        return amt.toString();
      } catch {
        return undefined;
      }
    };

    for (const t of data.t1 ?? []) {
      out.push({
        transactionHash: t.txHash,
        type: "Transfer",
        sender: t.from,
        receiver: t.to,
        amount: decrypt(t.auditorPCT),
        timestamp: Number(t.timestamp),
      });
    }
    for (const t of data.t2 ?? []) {
      out.push({
        transactionHash: t.txHash,
        type: "Mint",
        sender: t.user,
        amount: decrypt(t.auditorPCT),
        timestamp: Number(t.timestamp),
      });
    }
    for (const t of data.t3 ?? []) {
      out.push({
        transactionHash: t.txHash,
        type: "Burn",
        sender: t.user,
        amount: decrypt(t.auditorPCT),
        timestamp: Number(t.timestamp),
      });
    }
    for (const t of data.t4 ?? []) {
      out.push({
        transactionHash: t.txHash,
        type: "Withdraw",
        sender: t.user,
        amount: decrypt(t.auditorPCT),
        timestamp: Number(t.timestamp),
      });
    }

    out.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    return out;
  }, [data, hasKey, keyString]);

  return { items, loading, error, refetch, hasKey };
}
