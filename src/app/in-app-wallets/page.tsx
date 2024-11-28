'use client';
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { ConnectButton, MediaRenderer, useReadContract } from "thirdweb/react";
import { client } from "../client";
import { inAppWallet } from "thirdweb/wallets";
import { chain } from "../chain";
import { getContractMetadata } from "thirdweb/extensions/common";
import { contract } from "../../../utils/contracts";

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
    const { data: contractMetadata } = useReadContract(
        getContractMetadata,
        {
            contract: contract,
        }
    );

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
        </div>
    )
}

export default InAppWalletsPage;
