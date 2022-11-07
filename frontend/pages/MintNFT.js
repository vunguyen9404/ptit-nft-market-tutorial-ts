import React, { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "antd";
import { utils } from "near-api-js";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { async } from "regenerator-runtime";
const { Meta } = Card;

export default function MintNFT({isSignedIn, nftMarketplace, wallet}) {

    const [nfts, setNfts] = useState([]);

    async function fetchNFTs() {
        if (isSignedIn) {
            let nfts = await nftMarketplace.nftTokenForOwner(wallet.accountId);
            console.log("NFTs: ", nfts)
            setNfts(nfts);
        } else {
            wallet.signIn();
        }
    }

    useEffect(() => {
        fetchNFTs()
    }, []);

    return (
        <div className="site-layout-content">
            <PageHeader
                className="site-page-header"
                title="My NFTs"
                // extra={[
                //     <Button onClick={handleClickMint} key="3">Mint NFT</Button>
                // ]}
            />

            <div style={{padding: 30, display: "flex", flexWrap: "wrap"}}>
                
            </div>
        </div>
    )
}