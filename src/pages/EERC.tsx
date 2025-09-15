import {
  type CompatiblePublicClient,
  type CompatibleWalletClient,
  useEERC,
} from "@avalabs/eerc-sdk";
import { useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";
import { parseUnits } from "viem";
import {
  useAccount,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { Divider } from "../components";
import { ConverterMode } from "../components/eerc/ConverterMode";
import { StandaloneMode } from "../components/eerc/StandaloneMode";
import { useWebComponents } from "../components/web-components";
import {
  CIRCUIT_CONFIG,
  CONTRACTS,
  type EERCMode,
  EXPLORER_BASE_URL,
  EXPLORER_BASE_URL_TX,
} from "../config/contracts";
import { DEMO_TOKEN_ABI as erc20Abi } from "../pkg/constants";
import { useAppKit } from "@reown/appkit/react";
import { useMyTransactions } from "../hooks/useMyTransactions";
import { Transactions } from "../components/Transactions";
import { useAuditorPanel } from "../hooks/useAuditorPanel";
import { AuditorPanel } from "../components/AuditorPanel";
import { useSubgraphTransactions } from "../hooks/useSubgraphTransactions";
import { useSubgraphAuditor } from "../hooks/useSubgraphAuditor";

export function EERC() {
  useWebComponents();
  const [txHash, setTxHash] = useState<`0x${string}`>("" as `0x${string}`);
  const [mode, setMode] = useState<EERCMode>("standalone");
  const [showEncryptedDetails, setShowEncryptedDetails] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionType, setTransactionType] = useState<string>("");
  const { data: transactionReceipt, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) },
    confirmations: 1,
  });
  const { disconnectAsync } = useDisconnect();
  const { open } = useAppKit();

  // Add URL parameter handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    if (modeParam === "standalone" || modeParam === "converter")
      setMode(modeParam as EERCMode);
  }, []);

  // Update URL when mode changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("mode", mode);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, [mode]);

  useEffect(() => {
    if (txHash && isSuccess && transactionReceipt) {
      toast.success(
        <div>
          <p>Transaction successful</p>
          <a
            href={`${EXPLORER_BASE_URL_TX}${transactionReceipt?.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-chess-accent underline hover:text-chess-accent/80"
          >
            See on Explorer →
          </a>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          transition: Bounce,
        }
      );

      setTxHash("" as `0x${string}`);
      setIsRegistering(false);
      setIsTransactionPending(false);
      setTransactionType("");
    }
  }, [txHash, isSuccess, transactionReceipt]);

  const { address, isConnected, isConnecting } = useAccount();

  const publicClient = usePublicClient({ chainId: avalancheFuji.id });
  const { data: walletClient } = useWalletClient();
  const [txBound, setTxBound] = useState<number>(5000);

  // use eerc
  const {
    owner,
    symbol,
    isAuditorKeySet,
    auditorPublicKey,
    isRegistered,
    isDecryptionKeySet,
    generateDecryptionKey,
    register,
    useEncryptedBalance,
    isAddressRegistered,
    publicKey,
    areYouAuditor,
    auditorDecrypt,
    setContractAuditorPublicKey,
    refetchAuditor,
  } = useEERC(
    publicClient as CompatiblePublicClient,
    walletClient as CompatibleWalletClient,
    mode === "converter" ? CONTRACTS.EERC_CONVERTER : CONTRACTS.EERC_STANDALONE,
    CIRCUIT_CONFIG
  );

  // use encrypted balance
  const {
    privateMint,
    privateBurn,
    privateTransfer,
    deposit,
    withdraw,
    decimals,
    encryptedBalance,
    decryptedBalance,
    refetchBalance,
  } = useEncryptedBalance(mode === "converter" ? CONTRACTS.ERC20 : undefined);

  // Subgraph toggle and active contract
  const contractAddr = (mode === "converter"
    ? CONTRACTS.EERC_CONVERTER
    : CONTRACTS.EERC_STANDALONE) as `0x${string}`;
  const useSubgraph = Boolean(import.meta.env.VITE_SUBGRAPH_URL);

  // Auditor panel hook (prefer subgraph if configured)
  const auditorHook = useSubgraph
    ? useSubgraphAuditor({
        address: address as `0x${string}` | undefined,
        contract: contractAddr,
        areYouAuditor,
      })
    : useAuditorPanel({
        areYouAuditor,
        isDecryptionKeySet,
        generateDecryptionKey,
        auditorDecrypt: auditorDecrypt as any,
        client: publicClient as any,
        contract: contractAddr,
        address: address as `0x${string}` | undefined,
      });

  // set auditor from owner wallet
  const handleSetAuditor = async (auditorAddress: string) => {
    try {
      const txHash = await setContractAuditorPublicKey(
        auditorAddress as `0x${string}`,
      );
      await refetchAuditor();
      toast.success(
        <div>
          <p>Auditor set successfully</p>
          {txHash && (
            <a
              href={`${EXPLORER_BASE_URL_TX}${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-chess-accent underline hover:text-chess-accent/80"
            >
              See transaction →
            </a>
          )}
        </div>,
      );
    } catch (e) {
      console.error(e);
      toast.error(
        "Failed to set auditor. Ensure caller is owner and user is registered.",
      );
    }
  };

  // handle private mint
  const handlePrivateMint = async (amount: bigint) => {
    if (!isConnected || !address) {
      return;
    }

    setIsTransactionPending(true);
    setTransactionType("Private Minting");
    try {
      const { transactionHash } = await privateMint(address, amount);
      setTxHash(transactionHash as `0x${string}`);
      refetchBalance();
    } catch (error) {
      console.error(error);
      toast.error("Minting failed");
      setIsTransactionPending(false);
      setTransactionType("");
    }
  };

  // handle private burn
  const handlePrivateBurn = async (amount: bigint) => {
    if (!isConnected) {
      console.log("Not connected");
      return;
    }

    setIsTransactionPending(true);
    setTransactionType("Private Burning");
    try {
      const { transactionHash } = await privateBurn(amount);
      setTxHash(transactionHash as `0x${string}`);
      refetchBalance();
    } catch (error) {
      console.error(error);
      toast.error("Burning failed");
      setIsTransactionPending(false);
      setTransactionType("");
    }
  };

  // handle private transfer
  const handlePrivateTransfer = async (to: string, amount: string) => {
    if (!isConnected) {
      console.log("Not connected");
      return;
    }

    setIsTransactionPending(true);
    setTransactionType("Private Transferring");
    try {
      const { isRegistered: isToRegistered } = await isAddressRegistered(
        to as `0x${string}`
      );
      if (!isToRegistered) {
        toast.error("Recipient is not registered");
        setIsTransactionPending(false);
        setTransactionType("");
        return;
      }

      const parsedAmount = parseUnits(amount, Number(decimals));

      const { transactionHash } = await privateTransfer(to, parsedAmount);
      setTxHash(transactionHash as `0x${string}`);
      refetchBalance();
    } catch (error) {
      console.error(error);
      toast.error("Transfer failed");
      setIsTransactionPending(false);
      setTransactionType("");
    }
  };

  // handle private deposit
  const handlePrivateDeposit = async (amount: string) => {
    if (!isConnected) {
      console.log("Not connected");
      return;
    }

    setIsTransactionPending(true);
    setTransactionType("Private Depositing");
    try {
      if (!erc20Decimals) {
        console.log("No decimals");
        setIsTransactionPending(false);
        setTransactionType("");
        return;
      }

      const parsedAmount = parseUnits(amount, erc20Decimals);

      const { transactionHash } = await deposit(parsedAmount);
      setTxHash(transactionHash as `0x${string}`);
      refetchBalance();
      refetchErc20Balance();
    } catch (error) {
      console.error(error);
      toast.error("Deposit failed");
      setIsTransactionPending(false);
      setTransactionType("");
    }
  };

  // handle private withdraw
  const handlePrivateWithdraw = async (amount: string) => {
    if (!isConnected) {
      console.log("Not connected");
      return;
    }

    setIsTransactionPending(true);
    setTransactionType("Private Withdrawing");
    try {
      if (!decimals) {
        console.log("No decimals");
        setIsTransactionPending(false);
        setTransactionType("");
        return;
      }

      const parsedAmount = parseUnits(amount, Number(decimals));

      const { transactionHash } = await withdraw(parsedAmount);
      setTxHash(transactionHash as `0x${string}`);
      refetchBalance();
      refetchErc20Balance();
    } catch (error) {
      console.error(error);
      toast.error("Withdrawal failed");
      setIsTransactionPending(false);
      setTransactionType("");
    }
  };

  const { data: erc20Decimals } = useReadContract({
    abi: erc20Abi,
    functionName: "decimals",
    args: [],
    query: { enabled: !!address },
    address: CONTRACTS.ERC20,
  }) as { data: number };

  const { refetch: refetchErc20Balance } = useReadContract({
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address },
    address: CONTRACTS.ERC20,
  }) as { data: bigint; refetch: () => void };

  // Transactions hook (prefer subgraph if configured)
  const txHook = useSubgraph
    ? useSubgraphTransactions({
        address: address as `0x${string}` | undefined,
        contract: contractAddr,
      })
    : useMyTransactions({
        client: publicClient as any,
        contract: contractAddr,
        address: address as `0x${string}` | undefined,
        mode,
        areYouAuditor,
        auditorDecrypt,
      });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-chess-text font-mono text-sm leading-relaxed mt-4">
        <h2 className="text-chess-accent font-bold text-lg mb-2 text-center flex items-center justify-center gap-2">
          wolf-cloak
        </h2>
      </div>
  

      {/* Contracts */}
      <div className="border border-chess-border rounded-md p-4 font-mono text-sm bg-chess-darker">
        <div className="text-chess-accent font-bold mb-2">📜 Contracts - Avalanche Fuji Testnet</div>
        <div className="grid grid-cols-[160px_1fr] gap-y-3 gap-x-4 items-center">
          <div className="text-chess-accent">eERC Native</div>
          <div className="text-chess-text-muted break-all">
            <div>{CONTRACTS.EERC_STANDALONE}</div>
            <a
              href={`${EXPLORER_BASE_URL}${CONTRACTS.EERC_STANDALONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-chess-text-muted underline hover:text-chess-accent"
            >
              See on Explorer →
            </a>
          </div>

          <div className="text-chess-accent">eERC Wrapper</div>
          <div className="text-chess-text-muted break-all">
            <div>{CONTRACTS.EERC_CONVERTER}</div>
            <a
              href={`${EXPLORER_BASE_URL}${CONTRACTS.EERC_CONVERTER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-chess-text-muted underline hover:text-chess-accent"
            >
              See on Explorer →
            </a>
          </div>

          <div className="text-chess-accent">Test ERC-20</div>
          <div className="text-chess-text-muted break-all">
            <div>{CONTRACTS.ERC20}</div>
            <a
              href={`${EXPLORER_BASE_URL}${CONTRACTS.ERC20}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-chess-text-muted underline hover:text-chess-accent"
            >
              See on Explorer →
            </a>
          </div>
        </div>
      </div>

      <Divider title="🔗 Connect Wallet" />
      <button
        type="button"
        className="bg-chess-darker w-full text-chess-accent px-2 py-1 rounded-md text-sm border border-chess-border disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-chess-hover transition-all duration-200 font-mono"
        disabled={isConnected}
        onClick={() => {
          if (isConnected) {
            console.log("Already connected");
            return;
          }

          open().then(() => {
            console.log("Connected");
          });

          //   connectAsync({ connector: injected });
        }}
      >
        {isConnected
          ? `Connected as (${address})`
          : isConnecting
          ? "Connecting..."
          : "Connect Wallet"}
      </button>

      {isConnected && (
        <button
          type="button"
          className="bg-chess-darker w-full text-chess-accent px-2 py-1 rounded-md text-sm border border-chess-border disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-chess-hover transition-all duration-200 font-mono"
          disabled={!isConnected}
          onClick={async () => {
            if (!isConnected) {
              console.log("Not connected");
              return;
            }
            disconnectAsync();
          }}
        >
          Disconnect
        </button>
      )}

      <Divider title="🔑 Generate Decryption Key" />
      <button
        type="button"
        className="bg-chess-darker w-full text-chess-accent px-2 py-1 rounded-md text-sm border border-chess-border disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-chess-hover transition-all duration-200 font-mono"
        disabled={isDecryptionKeySet}
        onClick={async () => {
          if (!isConnected) {
            console.log("Not connected");
            return;
          }

          generateDecryptionKey()
            .then((key) => {
              // Persist key so subgraph-based auditor hook can decrypt amounts
              try {
                if (address) {
                  // Store for current contract
                  if (contractAddr) {
                    localStorage.setItem(
                      `eerc:dk:${contractAddr}:${address}`,
                      key,
                    );
                  }
                  // Also store for both known EERC contracts to keep modes in sync
                  localStorage.setItem(
                    `eerc:dk:${CONTRACTS.EERC_STANDALONE}:${address}`,
                    key,
                  );
                  localStorage.setItem(
                    `eerc:dk:${CONTRACTS.EERC_CONVERTER}:${address}`,
                    key,
                  );
                }
              } catch {}

              // Try triggering auditor refresh if available
              try {
                // @ts-expect-error union hook may not expose refresh in all cases
                auditorHook?.refresh?.();
              } catch {}

              toast.success("🔑 Decryption key generated!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                transition: Bounce,
              });
            })
            .catch((error) => {
              toast.error("Error generating decryption key");
              console.error(error);
            });
        }}
      >
        Generate Decryption Key
      </button>

      <Divider title="🧾 Registration" />

      <div>
        <button
          type="button"
          className="mt-2 bg-cloak-dark w-full text-chess-accent px-2 py-1 rounded-md text-sm border border-chess-border/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-chess-border/60 transition-all duration-200 font-mono"
          disabled={isRegistered || isRegistering || !isDecryptionKeySet}
          onClick={async () => {
            setIsRegistering(true);
            try {
              const { transactionHash } = await register();
              setTxHash(transactionHash as `0x${string}`);
            } catch (error) {
              console.error(error);
              toast.error("Registration failed");
              setIsRegistering(false);
            }
          }}
        >
          {isRegistered ? (
            "✓ Registered"
          ) : isRegistering ? (
            <div className="flex flex-col items-center gap-1">
              <span>Registering your wallet...</span>
              {txHash && (
                <span className="text-xs text-chess-text-muted">
                  Transaction: {txHash.slice(0, 6)}...{txHash.slice(-4)}
                </span>
              )}
            </div>
          ) : (
            "Register Wallet"
          )}
        </button>
      </div>

      <Divider title="📜 eERC Contract" my={2} />

      {/* Transaction Pending Indicator - Enhanced Version */}
      {isTransactionPending && (
        <div className="border border-chess-border rounded-md p-4 font-mono text-sm mb-4 bg-chess-darker">
          <div className="flex flex-col items-center gap-2">
            <div className="text-chess-accent font-bold text-lg">
              {transactionType} in progress...
            </div>
            {txHash && (
              <div className="flex flex-col items-center p-3 rounded-md w-full">
                <span className="text-chess-accent font-semibold mb-1">
                  Transaction Hash:
                </span>
                <span className="text-xs text-chess-text-muted font-mono p-2 rounded w-full text-center break-all">
                  {txHash}
                </span>
                <a
                  href={`${EXPLORER_BASE_URL_TX}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-chess-accent underline hover:text-chess-accent/80 mt-2 bg-chess-accent/10 px-3 py-1 rounded"
                >
                  View on Explorer →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4 font-mono text-sm text-chess-text justify-center my-3">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <span
          className={`cursor-pointer ${
            mode === "standalone" ? "text-chess-accent font-bold" : "opacity-50"
          }`}
          onClick={() => setMode("standalone")}
        >
          Standalone Mode
        </span>
        <span className="text-chess-text-muted">|</span>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <span
          className={`cursor-pointer ${
            mode === "converter" ? "text-chess-accent font-bold" : "opacity-50"
          }`}
          onClick={() => setMode("converter")}
        >
          Converter Mode
        </span>
      </div>
      

      {mode === "standalone" ? (
        <StandaloneMode
          showEncryptedDetails={showEncryptedDetails}
          setShowEncryptedDetails={setShowEncryptedDetails}
          handlePrivateMint={handlePrivateMint}
          handlePrivateBurn={handlePrivateBurn}
          handlePrivateTransfer={handlePrivateTransfer}
          publicKey={publicKey}
          owner={owner}
          decimals={Number(decimals)}
          symbol={symbol}
          isAuditorKeySet={isAuditorKeySet}
          auditorPublicKey={auditorPublicKey}
          encryptedBalance={encryptedBalance}
          decryptedBalance={decryptedBalance}
          isDecryptionKeySet={isDecryptionKeySet}
          refetchBalance={refetchBalance}
          onSetAuditor={handleSetAuditor}
          canSetAuditor={
            !!address && !!owner && address.toLowerCase() === owner.toLowerCase()
          }
        />
      ) : (
        <ConverterMode
          showEncryptedDetails={showEncryptedDetails}
          setShowEncryptedDetails={setShowEncryptedDetails}
          handlePrivateDeposit={handlePrivateDeposit}
          handlePrivateWithdraw={handlePrivateWithdraw}
          isDecryptionKeySet={isDecryptionKeySet}
          publicKey={publicKey}
          owner={owner}
          isAuditorKeySet={isAuditorKeySet}
          auditorPublicKey={auditorPublicKey}
          encryptedBalance={encryptedBalance}
          decryptedBalance={decryptedBalance}
          refetchBalance={refetchBalance}
          handlePrivateTransfer={handlePrivateTransfer}
          onSetAuditor={handleSetAuditor}
          canSetAuditor={
            !!address && !!owner && address.toLowerCase() === owner.toLowerCase()
          }
        />
      )}

      {/* Transactions */}
      <Transactions
        items={txHook.items}
        onRefresh={txHook.refetch}
        pending={txHook.loading}
      />

      {/* Auditor Panel */}
      <AuditorPanel
        areYouAuditor={areYouAuditor}
        isAuditorKeySet={isAuditorKeySet}
        hasKey={auditorHook.hasKey}
        loading={auditorHook.loading}
        error={auditorHook.error}
        items={auditorHook.items}
        onRefresh={auditorHook.refresh}
        explorerBaseTx={EXPLORER_BASE_URL_TX}
      />

        <p className="text-xs text-chess-text-muted mt-0">
          Want to learn more? See the full documentation on our{" "}
          <a
            href="https://docs.avacloud.io/encrypted-erc"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-chess-accent"
          >
            GitBook →
          </a>
        </p>
    </main>
  );
}
