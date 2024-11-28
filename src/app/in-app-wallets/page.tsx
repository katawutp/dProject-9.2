'use client';
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { ConnectButton, MediaRenderer, useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "../client";
import { inAppWallet } from "thirdweb/wallets";
import { chain } from "../chain";
import { getContractMetadata } from "thirdweb/extensions/common";
import { contract } from "../../../utils/contracts";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { headers } from "next/headers";

const InAppWalletsPage: React.FC = () => {
    return (
        <div className="py-20">
            <Header 
                title="dProject Login / Register"
                subtitle="Web3 Decentralized Application using Blockchain Wallet Credential"
            />
            <InAppWalletOptions />
            <Footer />
        </div>
    )
};

function InAppWalletOptions() {
    return (
      <div className="grid gap-4 lg:grid-cols-1 justify-center">
        <PhonePassKey />
      </div>
    );
}

// Default In-App Wallet options (all options)
function AllOptions () {
    return (
        <div className="flex flex-col items-center mb-20 md:mb-20">
            <p  className="text-zinc-300 text-base mb-4 md:mb-4">All Options</p>
            <ConnectButton  
                client={client}
                wallets={[ inAppWallet() ]}
            />
        </div>
    )
}

// In-App Wallet options with email only
function EmailOnly () {
    return (
        <div className="flex flex-col items-center mb-20 md:mb-20">
            <p  className="text-zinc-300 text-base mb-4 md:mb-4">Email Only</p>
            <ConnectButton  
                client={client}
                wallets={[ 
                    inAppWallet({
                        auth: {
                            options: [
                                "email"
                            ]
                        }
                    }) 
                ]}
            />
        </div>
    )
}

// In-App Wallet options with social only
function SocialOnly () {
    return (
        <div className="flex flex-col items-center mb-20 md:mb-20">
            <p  className="text-zinc-300 text-base mb-4 md:mb-4">Social Only</p>
            <ConnectButton  
                client={client}
                wallets={[ 
                    inAppWallet({
                        auth: {
                            // Select social login options
                            options: [
                                "google",
                                // "facebook",
                                // "apple"
                            ]
                        }
                    }) 
                ]}
            />
        </div>
    )
}

// In-App Wallet options with phone and pass key
function PhonePassKey () {
    const account = useActiveAccount();

    const [clientSecret, setClientSecret] = useState<string>("");

    const { data: contractMetadata } = useReadContract(
        getContractMetadata,
        {
            contract: contract,
        }
    );

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw 'Did you forget to add a ".env.local" file?';
    }
    const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

    const onClick = async () => {
        const res = await fetch("/api/stripe-intent", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ buyerWalletAddress: account?.address })
        });
        if(res.ok){
            const json = await res.json();
            setClientSecret(json.clientSecret);
        }
    };

    return (
        <div className="flex flex-col items-center mb-20 md:mb-20">
            <p  className="text-zinc-300 text-base mb-4 md:mb-4">ใช้เบอร์โทรศัทพ์มือถือเพื่อรับ OTP</p>
            <ConnectButton  
                client={client}
                chain={chain}
                wallets={[ 
                    inAppWallet({
                        auth: {
                            options: [
                                "phone",
                                "passkey",
                            ]
                        }
                    }) 
                ]}
            />
            {contractMetadata && (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    marginTop: "20px",
                    border: "1px solid #333",
                    borderRadius: "8px",
                }}>
                    <MediaRenderer
                        client={client}
                        src={contractMetadata.image}
                        style={{
                            borderRadius: "8px",
                        }}
                    />
                </div>
            )}
            {!clientSecret ? (
                <button
                    onClick={onClick}
                    disabled={!account}
                    style={{
                        marginTop: "20px",
                        padding: "1rem 2rem",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "darkcyan",
                        width: "25%",
                        cursor: "pointer",
                    }}
                >Buy with Credit Card</button>

            ) : (
                <Elements
                    options={{
                        clientSecret: clientSecret,
                        appearance: { theme: "night" }
                    }}
                    stripe={stripe}
                >
                    <CreditCardForm />

                </Elements>
            )}
        </div>
    )
}

const CreditCardForm = () => {
    const elements = useElements();
    const stripe = useStripe();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);

    return (
        <>
            <PaymentElement />
            <button
                disabled={isLoading || isComplete || !stripe || !elements}
                style={{
                    marginTop: "20px",
                    padding: "1rem 2rem",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "darkcyan",
                    width: "25%",
                    cursor: "pointer",
                }}
            >
                {
                    isComplete
                    ? "Payment Complete"
                    :isLoading
                    ? "Payment processing..."
                    : "Pay Now"
                }
            </button>
        </>
    )
}

export default InAppWalletsPage;
