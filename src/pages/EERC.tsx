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
  const [auditorKey, setAuditorKey] = useState<string>("");

  // use eerc
  const {
    owner,
    name,
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
        decryptionKey: auditorKey || undefined,
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
        auditorDecrypt: auditorDecrypt
          ? (async () => {
              const arr = await auditorDecrypt();
              return arr.map((m) => ({
                transactionHash: m.transactionHash,
                amount: m.amount,
                sender: m.sender,
                // Ensure receiver is a string address for typing; hook only uses amount
                receiver: (m.receiver ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
                type: m.type,
              }));
            })
          : undefined,
      });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Contracts Card */}
        <div className="lg:col-span-3">
          <div className="bg-trading-panel border border-trading-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-trading-text font-bold text-lg">📜 Contracts - Avalanche Fuji Testnet</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-trading-dark border border-trading-border rounded-lg p-4">
                <div className="text-trading-accent font-semibold mb-2">eERC Native</div>
                <div className="text-trading-text-muted text-sm break-all mb-2">
                  {CONTRACTS.EERC_STANDALONE}
                </div>
                <a
                  href={`${EXPLORER_BASE_URL}${CONTRACTS.EERC_STANDALONE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-trading-accent underline hover:text-trading-accent/80"
                >
                  See on Explorer →
                </a>
              </div>

              <div className="bg-trading-dark border border-trading-border rounded-lg p-4">
                <div className="text-trading-accent font-semibold mb-2">eERC Wrapper</div>
                <div className="text-trading-text-muted text-sm break-all mb-2">
                  {CONTRACTS.EERC_CONVERTER}
                </div>
                <a
                  href={`${EXPLORER_BASE_URL}${CONTRACTS.EERC_CONVERTER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-trading-accent underline hover:text-trading-accent/80"
                >
                  See on Explorer →
                </a>
              </div>

              <div className="bg-trading-dark border border-trading-border rounded-lg p-4">
                <div className="text-trading-accent font-semibold mb-2">Test ERC-20</div>
                <div className="text-trading-text-muted text-sm break-all mb-2">
                  {CONTRACTS.ERC20}
                </div>
                <a
                  href={`${EXPLORER_BASE_URL}${CONTRACTS.ERC20}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-trading-accent underline hover:text-trading-accent/80"
                >
                  See on Explorer →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connection Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-trading-panel border border-trading-border rounded-lg p-6">
          <h3 className="text-trading-text font-bold text-lg mb-4">🔗 Wallet Connection</h3>
          <div className="space-y-3">
            <button
              type="button"
              className="w-full bg-trading-accent text-trading-darkest px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-trading-accent/90 transition-all duration-200"
              disabled={isConnected}
              onClick={() => {
                if (isConnected) {
                  console.log("Already connected");
                  return;
                }

                open().then(() => {
                  console.log("Connected");
                });
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
                className="w-full bg-trading-dark text-trading-text px-4 py-3 rounded-lg font-medium border border-trading-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-trading-hover transition-all duration-200"
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
          </div>
        </div>

        {/* Decryption Key Card */}
        <div className="bg-trading-panel border border-trading-border rounded-lg p-6">
          <h3 className="text-trading-text font-bold text-lg mb-4">🔑 Generate Decryption Key</h3>
          <button
            type="button"
            className="w-full bg-trading-accent text-trading-darkest px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-trading-accent/90 transition-all duration-200"
            disabled={isDecryptionKeySet}
            onClick={async () => {
              if (!isConnected) {
                console.log("Not connected");
                return;
              }

              generateDecryptionKey()
                .then((key) => {
                  setAuditorKey(key);
                  try {
                    (auditorHook as any)?.refresh?.();
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
        </div>
      </div>

      {/* Registration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-trading-panel border border-trading-border rounded-lg p-6">
          <h3 className="text-trading-text font-bold text-lg mb-4">🧾 Registration</h3>
          <button
            type="button"
            className="w-full bg-trading-accent text-trading-darkest px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-trading-accent/90 transition-all duration-200"
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
                  <span className="text-xs text-trading-text-muted">
                    Transaction: {txHash.slice(0, 6)}...{txHash.slice(-4)}
                  </span>
                )}
              </div>
            ) : (
              "Register Wallet"
            )}
          </button>
        </div>

        {/* Mode Selection Card */}
        <div className="bg-trading-panel border border-trading-border rounded-lg p-6">
          <h3 className="text-trading-text font-bold text-lg mb-4">📜 eERC Contract Mode</h3>
          <div className="flex space-x-2">
            <button
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                mode === "standalone"
                  ? "bg-trading-accent text-trading-darkest"
                  : "bg-trading-dark text-trading-text-muted hover:text-trading-text hover:bg-trading-hover"
              }`}
              onClick={() => setMode("standalone")}
            >
              Standalone Mode
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                mode === "converter"
                  ? "bg-trading-accent text-trading-darkest"
                  : "bg-trading-dark text-trading-text-muted hover:text-trading-text hover:bg-trading-hover"
              }`}
              onClick={() => setMode("converter")}
            >
              Converter Mode
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Pending Indicator */}
      {isTransactionPending && (
        <div className="bg-trading-panel border border-trading-border rounded-lg p-6 mb-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-trading-accent font-bold text-xl">
              {transactionType} in progress...
            </div>
            {txHash && (
              <div className="flex flex-col items-center p-4 bg-trading-dark rounded-lg w-full">
                <span className="text-trading-accent font-semibold mb-2">
                  Transaction Hash:
                </span>
                <span className="text-sm text-trading-text-muted font-mono p-3 rounded w-full text-center break-all bg-trading-darker">
                  {txHash}
                </span>
                <a
                  href={`${EXPLORER_BASE_URL_TX}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-trading-accent underline hover:text-trading-accent/80 mt-3 bg-trading-accent/10 px-4 py-2 rounded-lg"
                >
                  View on Explorer →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      

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
          name={name}
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

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-trading-text-muted">
          Want to learn more? See the full documentation on our{" "}
          <a
            href="https://docs.avacloud.io/encrypted-erc"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-trading-accent transition-colors"
          >
            GitBook →
          </a>
        </p>
      </div>
    </div>
  );
}
