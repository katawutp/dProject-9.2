import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY as string,
    {
        apiVersion: "2024-11-20.acacia"
    }
);

// const {
//     WEBHOOK_SECRET_KEY="acct_1QPFqPGDs5XhGXLl",
//     ENGINE_URL="http://https://engine-playground.thirdweb.com",
//     ENGINE_ACCESS_TOKEN="0x3EcDBF3B911d0e9052b64850693888b008e18373",
//     NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="0x243E7536f72B9699bB6F535d758De96Eae0CBaBE",
//     BACKEND_WALLET_ADDRESS="0x4Ff9aa707AE1eAeb40E581DF2cf4e14AffcC553d",
//     CHAIN_ID="80002",
// } = process.env;

const {
    WEBHOOK_SECRET_KEY,
    ENGINE_URL,
    ENGINE_ACCESS_TOKEN,
    NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    BACKEND_WALLET_ADDRESS,
    CHAIN_ID,
} = process.env;

export async function POST(req: NextRequest){
    if(!WEBHOOK_SECRET_KEY) {
        throw 'Did you forget to add a ".env.local" file?';
    }

    const body = await req.text();
    const headersData = await headers();
    const sig = headersData.get("stripe-signature");
    if (!sig) {
        throw new Error("No signature provided");
    }


    const event = stripe.webhooks.constructEvent(
        body,
        sig,
        WEBHOOK_SECRET_KEY
    );
    switch(event.type){
        case "charge.succeeded":
            await handleChargeSucceeded(event.data.object as Stripe.Charge);
            break;
    }

    return NextResponse.json({ message: "success" });
}

const handleChargeSucceeded = async (charge: Stripe.Charge) => {
    if (
        !ENGINE_URL ||
        !ENGINE_ACCESS_TOKEN ||
        !NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
        !BACKEND_WALLET_ADDRESS
    ) {
        throw 'Server misconfigured. Did you forget to add a ".evn.local" file?';
    }

    const { buyerWalletAddress } = charge.metadata;
    if (!buyerWalletAddress) {
        throw 'No buyer wallet address provided';
    }

    try {
        const tx = await fetch(
            `${ENGINE_URL}/contract/${CHAIN_ID}/${NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}/erc1155/mint-to`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: 'Bearer ${ENGINE_ACCESS_TOKEN}',
                    "x-backend-wallet-adress": BACKEND_WALLET_ADDRESS,
                },
                body: JSON.stringify({
                    "receiver": buyerWalletAddress,
                    "metadataWithSupply": {
                        "metadata": {
                        "name": "dProject 2K NFT",
                        "description": "NFT Digital Coupon for Access to Web3 Decentralized Application Member Area",
                        "image": "ipfs://QmXwVrrFmwby54nnxZhdmJDLSnTMQctXMCbZRp4UbFmrzk/0.png"
                        },
                        "supply": "100"
                    }
                }),
            }

        )
        if (!tx.ok) {
            throw 'Failed to mint NFT';
        }
    } catch (error) {
        console.error(error);
    }
};