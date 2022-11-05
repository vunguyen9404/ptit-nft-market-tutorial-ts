import { JsonToken } from "./metadata";

export class Sale {
    owner_id: string;
    token_id: string;
    price: string;

    constructor({ownerId, tokenId, price}: {ownerId: string, tokenId: string, price: string}) {
        this.owner_id = ownerId;
        this.token_id = tokenId;
        this.price = price;
    }
}

export class JsonSale {
    sale_id: string;
    owner_id: string;
    price: string;
    token: JsonToken;

    constructor({saleId, ownerId, price, token}: { saleId: string, ownerId: string, price: string, token: JsonToken }) {
        this.sale_id = saleId;
        this.owner_id = ownerId;
        this.price = price;
        this.token = token;
    }
}