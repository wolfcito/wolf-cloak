import { useCallback, useMemo, useState } from "react";
import type { PublicClient } from "viem";
import { Poseidon } from "@avalabs/eerc-sdk";

export type AuditorTx = {
  transactionHash: `0x${string}`;
  amount?: string;
  sender?: `0x${string}`;
  receiver?: `0x${string}`;
  type?: string;
};

export function useAuditorPanel(params: {
  areYouAuditor: boolean;
  isDecryptionKeySet: boolean;
  generateDecryptionKey: () => Promise<string>;
  auditorDecrypt: () => Promise<AuditorTx[]>;
  client: PublicClient | undefined;
  contract: `0x${string}`;
  address?: `0x${string}`;
}) {
  const { areYouAuditor, isDecryptionKeySet, generateDecryptionKey, auditorDecrypt, client, contract, address } = params;

  const [items, setItems] = useState<AuditorTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [keyString, setKeyString] = useState<string>("");

  const onGenerateKey = useCallback(async () => {
    setError(null);
    try {
      const key = await generateDecryptionKey();
      setHasKey(true);
      setKeyString(key);
      if (address && contract) {
        try {
          localStorage.setItem(`eerc:dk:${contract}:${address}`, key);
        } catch {}
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }, [generateDecryptionKey]);

  const refresh = useCallback(async () => {
    if (!areYouAuditor) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Primary attempt via SDK
      const data = await auditorDecrypt();
      if (data && data.length > 0) {
        setItems(data);
      } else {
        // Fallback if empty: try manual scan
        await manualScan();
      }
    } catch (e: any) {
      // If SDK complains user is not an auditor but contract says otherwise, try fallback
      const msg = e?.message || String(e);
      if (msg?.toLowerCase?.().includes("not an auditor")) {
        await manualScan();
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [auditorDecrypt, areYouAuditor]);

  // Try load saved key from localStorage
  const tryLoadKey = useCallback(() => {
    if (!address || !contract) return false;
    try {
      const stored = localStorage.getItem(`eerc:dk:${contract}:${address}`);
      if (stored && stored.length > 0) {
        setKeyString(stored);
        setHasKey(true);
        return true;
      }
    } catch {}
    return false;
  }, [address, contract]);

  // Load key on mount/when contract or address changes
  useMemo(() => {
    tryLoadKey();
  }, [tryLoadKey]);

  const manualScan = useCallback(async () => {
    if (!client || !contract || !address || !hasKey || !keyString) {
      setItems([]);
      return;
    }
    try {
      const current = await client.getBlockNumber();
      const fromBlock = current > 10000n ? current - 10000n : 0n;
      // Local event ABIs (match contract definitions)
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
      const events = [PRIVATE_BURN_EVENT, PRIVATE_MINT_EVENT, PRIVATE_TRANSFER_EVENT] as const;
      const logs: any[] = [];
      for (const ev of events) {
        const fetched = await client.getLogs({
          address: contract,
          fromBlock,
          toBlock: current,
          // @ts-expect-error viem accepts event objects shaped like this
          event: ev,
          args: { auditorAddress: address },
        } as any);
        logs.push(...fetched);
      }

      const out: AuditorTx[] = [];
      for (const l of logs) {
        const pct = (l?.args?.auditorPCT || []) as bigint[];
        if (!pct || pct.length !== 7) continue;
        const amount = Poseidon.decryptAmountPCT(keyString, pct.map((x) => x.toString()));
        out.push({
          transactionHash: l.transactionHash!,
          amount: amount.toString(),
          sender: (l.args?.from || l.args?.user) as `0x${string}`,
          receiver: (l.args?.to || undefined) as `0x${string}` | undefined,
          type: (l.eventName as string)?.replace("Private", "") || "Tx",
        });
      }
      setItems(out);
    } catch (e: any) {
      setError(e?.message || String(e));
      setItems([]);
    }
  }, [client, contract, address, hasKey, keyString]);

  return useMemo(
    () => ({ items, loading, error, hasKey, onGenerateKey, refresh }),
    [items, loading, error, hasKey, onGenerateKey, refresh],
  );
}
