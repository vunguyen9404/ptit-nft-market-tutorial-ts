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

    let keys = contract.sales.toArray();
    // Paginate through the keys using the fromIndex and limit
    for (let i = 0; i < keys.length; i++) {
        // get the token object from the keys
        let jsonToken = internalGetSale({contract, sale_id: keys[i][0]});
        sales.push(jsonToken);
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
    internalRemoveSale({contract, sale_id});
}

export function internalRemoveSale({contract, sale_id}: {contract: NFTContract, sale_id: string}): Sale {
    let sale = contract.sales.remove(sale_id) as Sale;
    if (sale == null) {
        near.panicUtf8("No sale");
    }

    let byOwnerId = restoreOwners(contract.saleByOwnerId.get(sale.owner_id));
    if (byOwnerId == null) {
        near.panicUtf8("No sale by owner");
    }
    byOwnerId.remove(sale_id);
    if (byOwnerId.isEmpty()) {
        contract.saleByOwnerId.remove(sale.owner_id);
    } else {
        contract.saleByOwnerId.set(sale.owner_id, byOwnerId);
    }

    return sale;
}

export function intrenalUpdatePrice({contract, sale_id, price}: {contract: NFTContract, sale_id: string, price: string}): Sale {
    let sale = contract.sales.get(sale_id) as Sale;
    if(sale == null) near.panicUtf8("Not found sale");
    if (sale.owner_id !== near.predecessorAccountId()) near.panicUtf8("Unauthorized");
    let newPrice = BigInt(price);
    if (newPrice.valueOf() <= 0) near.panicUtf8("New price must be greater than 0");
    sale.price = newPrice.toString();

    contract.sales.set(sale_id, sale);

    return sale;
}