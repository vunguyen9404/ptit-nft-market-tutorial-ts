import React, { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "antd";
import { utils } from "near-api-js";
import { ShoppingCartOutlined } from "@ant-design/icons";
const { Meta } = Card;

// HTTP Client: axios, fetch, request...

export default function Market({isSignedIn, nftMarketplace, wallet}) {
    const [sales, setSales] = useState([]);

    async function fetchSales() {
        let sales = await nftMarketplace.getSales();
        setSales(sales);
    }

    async function handleBuy(sale) {
        if (isSignedIn) {
            await nftMarketplace.offer(sale.sale_id, sale.price);
        } else {
            wallet.signIn();
        }
    }

    useEffect(() => {
        fetchSales();
    }, []);

    return (
        <div className="site-layout-content">
            <PageHeader
                className="site-page-header"
                title="Market"
                // extra={[
                //     <Button onClick={handleClickMint} key="3">Mint NFT</Button>
                // ]}
            />

            <div style={{padding: 30, display: "flex", flexWrap: "wrap"}}>
                {
                    sales.map( item => {
                        return (
                            <Card
                                key={item.sale_id}
                                hoverable
                                style={{ width: 240, marginRight: 15, marginBottom: 15 }}
                                cover={<img style={{height: 300, width: "100%", objectFit: "contain"}} alt="Media NFT" src={item.token.metadata.media} />}
                                actions={[
                                    <Button onClick={() => handleBuy(item)} icon={<ShoppingCartOutlined />}> Buy </Button>
                                ]}
                            >
                                <h1>{utils.format.formatNearAmount(item.price) + " NEAR"}</h1>
                                <Meta title={item.token.metadata.title} description={item.owner_id} />
                            </Card>
                        )
                    })
                }
            </div>
        </div>
    )
}