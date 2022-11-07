import React, { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "antd";
import { utils } from "near-api-js";
import { ShoppingCartOutlined, SendOutlined, DollarCircleOutlined  } from "@ant-design/icons";
import { async } from "regenerator-runtime";
import ModalTransferNFT from "../components/ModalTransfer";
import ModalMintNFT from "../components/ModalMintNFT";
import ModalSale from "../components/ModalSale";
const { Meta } = Card;

export default function MyNFT({isSignedIn, nftMarketplace, wallet}) {
    const [nfts, setNfts] = useState([]);
    const [transferVisible, setTransferVisible] = useState(false);
    const [mintVisible, setMintVisible] = useState(false);
    const [saleVisible, setSaleVisible] = useState(false);
    const [currentToken, setCurrentToken] = useState(null);

    async function fetchNFTs() {
        if (isSignedIn) {
            let nfts = await nftMarketplace.nftTokenForOwner(wallet.accountId);
            console.log("NFTs: ", nfts)
            setNfts(nfts);
        } else {
            wallet.signIn();
        }
    }

    async function handleTransferToken(item) {
        setCurrentToken(item);
        setTransferVisible(true);
    }

    async function handleSaleToken(item) {
        setCurrentToken(item);
        setSaleVisible(true);
    }

    async function submitTransfer(accountId) {
        await nftMarketplace.nftTransfer(accountId, currentToken.token_id);
    }

    function handleClickMint(params) {
        setMintVisible(true);
    }

    async function submitOnMint({tokenId, tokenTitle, description, media}) {
        await nftMarketplace.mintNft(
            tokenId,
            {
                title: tokenTitle,
                description,
                media
            },
            wallet.accountId
        )
    }

    async function submitOnSale(token, price) {
        await nftMarketplace.addSale(
            currentToken.token_id,
            price
        )
    }

    useEffect(() => {
        fetchNFTs()
    }, []);

    return (
        <div className="site-layout-content">
            <PageHeader
                className="site-page-header"
                title="My NFTs"
                extra={[
                    <Button onClick={handleClickMint} key="3">Mint NFT</Button>
                ]}
            />

            <div style={{padding: 30, display: "flex", flexWrap: "wrap"}}>
                {
                    nfts.map(item => {
                        return (
                            <Card
                                key={item.token_id}
                                hoverable
                                style={{ width: 240, marginRight: 15, marginBottom: 15 }}
                                cover={<img style={{height: 300, width: "100%", objectFit: "contain"}} alt="nft-cover" src={item.metadata.media} />}
                                actions={[
                                    <SendOutlined onClick={() => handleTransferToken(item)} key={"send"}/>,
                                    <DollarCircleOutlined onClick={() => handleSaleToken(item)} key={"sell"} />,
                                ]}
                            >
                                <Meta title={item.metadata.title} description={item.owner_id} />
                            </Card>
                        )
                    })
                }
            </div>
            <ModalTransferNFT visible={transferVisible} handleOk={submitTransfer} handleCancel={() => setTransferVisible(false)} />
            <ModalMintNFT visible={mintVisible} handleOk={submitOnMint} handleCancel={() => setMintVisible(false)} />
            <ModalSale visible={saleVisible} handleOk={submitOnSale} handleCancel={() => setSaleVisible(false)} />
        </div>
    )
}