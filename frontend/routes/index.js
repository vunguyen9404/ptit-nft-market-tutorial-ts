import React from "react";
import { Route, Routes } from "react-router-dom";
import Market from "../pages/Market";
import MyNFT from "../pages/myNFT";
import MintNFT from "../pages/MintNFT";

export default function Router({isSignedIn, nftMarketplace, wallet}) {
    return (
        <Routes>
            <Route path="/" element={<Market isSignedIn={isSignedIn} nftMarketplace={nftMarketplace} wallet={wallet} />} />
            <Route path="/mintNft" element={<MintNFT isSignedIn={isSignedIn} nftMarketplace={nftMarketplace} wallet={wallet} />} />
            <Route path="/myNft" element={<MyNFT isSignedIn={isSignedIn} nftMarketplace={nftMarketplace} wallet={wallet} />} />
        </Routes>
    )
}