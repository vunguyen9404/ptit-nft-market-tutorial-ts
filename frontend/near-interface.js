import { utils } from "near-api-js";
export class NFTMarketplace {
    constructor({contractId, wallet}) {
        this.contractId = contractId;
        this.wallet = wallet;
    }

    async mintNft(tokenId, metadata, receiverId) {
        return await this.wallet.callMethod({
            contractId: this.contractId,
            method: "nft_mint",
            args: {
                token_id: tokenId,
                metadata,
                receiver_id: receiverId
            },
            deposit: utils.format.parseNearAmount("0.01")
        })
    }
    async nftToken(tokenId) {
        return await this.wallet.viewMethod({
            contractId: this.contractId,
            method: "nft_token",
            args: {
                token_id: tokenId
            }
        })
    }
    async nftTransfer(receiverId, tokenId, approvalId = 0, memo = "") {
        return await this.wallet.callMethod({
            contractId: this.contractId,
            method: "nft_transfer",
            args: {
                receiver_id: receiverId,
                token_id: tokenId,
                approval_id: approvalId,
                memo
            },
            deposit: 1
        })
    }
    async nftTokenForOwner(accountId, fromIndex = "0", limit = 100) {
        return await this.wallet.viewMethod({
            contractId: this.contractId,
            method: "nft_tokens_for_owner",
            args: {
                account_id: accountId,
                from_index: fromIndex,
                limit
            }
        })
    }

    async addSale(tokenId, price) {
        return await this.wallet.callMethod({
            contractId: this.contractId,
            method: "add_sale",
            args: {
                token_id: tokenId,
                price: utils.format.parseNearAmount(price)
            },
            deposit: 1
        })
    }

    async removeSale(saleId) {
        return await this.wallet.callMethod({
            contractId: this.contractId,
            method: "remove_sale",
            args: {
                sale_id: saleId
            },
            deposit: 1
        })
    }

    async getSales() {
        return await this.wallet.viewMethod({
            contractId: this.contractId,
            method: "get_sales",
            args: {}
        })
    }
    async offer(saleId, amount){
        return await this.wallet.callMethod({
            contractId: this.contractId,
            method: "offer",
            args: {
                sale_id: saleId
            },
            deposit: amount
        })
    }
}