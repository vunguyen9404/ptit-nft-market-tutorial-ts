import { NFTContract } from "./contract";
import { assert, near, UnorderedSet } from "near-sdk-js";
import { JsonToken, Token } from "./metadata";
import { JsonSale, Sale } from "./sale";
import { restoreOwners } from "./internal";
import { internalNftTransfer, internalOfferNftTransfer } from "./nft_core";

export function internalAddSale({contract, token_id, price}: { contract: NFTContract, token_id: string, price: string }) {
    let senderId = near.predecessorAccountId();
    let token = contract.tokensById.get(token_id) as Token;

    assert(senderId == token.owner_id, "Unauthorized");
    let sale = new Sale({
        ownerId: senderId,
        tokenId: token_id,
        price
    });

    contract.nextSaleId++;
    let saleId = contract.nextSaleId;
    contract.sales.set(saleId.toString(), sale);

    addSaleByOwner({contract, accountId: senderId, saleId: saleId.toString()});
}

export function addSaleByOwner({contract, accountId, saleId}: { contract: NFTContract, accountId: string, saleId: string}) {
    let saleSet = restoreOwners(contract.saleByOwnerId.get(accountId));
    if (saleSet == null) {
        saleSet = new UnorderedSet("saleByOwner" + accountId);
    }
    saleSet.set(saleId);

    contract.saleByOwnerId.set(accountId, saleSet);
}

export function internalGetSales({contract}: {contract: NFTContract}): JsonSale[] {
    let sales = [];
    for (let i = 0; i < contract.sales.keys.length; i++) {
        let saleId = contract.sales.keys[i];
        let sale = contract.sales.get(saleId) as Sale;
        let tokenMetadata = contract.tokenMetadataById.get(sale.token_id);

        let token = new JsonToken({
            tokenId: sale.token_id,
            ownerId: sale.owner_id,
            metadata: tokenMetadata
        });

        let jsonSale = new JsonSale({
            saleId,
            ownerId: sale.owner_id,
            price: sale.price,
            token
        });

        sales.push(jsonSale);
    }

    return sales;
}

export function internalGetSale({contract, sale_id}: {contract: NFTContract, sale_id: string}): JsonSale {
    let sale = contract.sales.get(sale_id) as Sale;
    let tokenMetadata = contract.tokenMetadataById.get(sale.token_id);

    let token = new JsonToken({
        tokenId: sale.token_id,
        ownerId: sale.owner_id,
        metadata: tokenMetadata
    });

    let jsonSale = new JsonSale({
        saleId: sale_id,
        ownerId: sale.owner_id,
        price: sale.price,
        token
    });

    return jsonSale;
}

export function internalOffer({contract, sale_id}: {contract: NFTContract, sale_id: string}) {
    let sale = contract.sales.get(sale_id) as Sale;
    if(sale == null) {
        near.panicUtf8("Sale not found");
    }
    let deposit = near.attachedDeposit().valueOf();
    assert(deposit > 0, "deposit must be greater than 0");
    let price = BigInt(sale.price);
    assert(deposit >= price, "deposit must ne greater than or equal to price");

    let buyerId = near.predecessorAccountId();
    assert(buyerId !== sale.owner_id, "you can't offer on your sale");

    // Transfer NFT to buyer
    internalOfferNftTransfer({contract, receiverId: buyerId, senderId: sale.owner_id, tokenId: sale.token_id, memo: "Buy from marketplace"});

    // Transfer NEAR to owner
    const promise = near.promiseBatchCreate(sale.owner_id);
    near.promiseBatchActionTransfer(promise, price);

    // Remove sale
}