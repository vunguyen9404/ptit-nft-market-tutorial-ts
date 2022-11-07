import { NearBindgen, near, call, view, LookupMap, UnorderedMap, initialize } from 'near-sdk-js';
import { internalNftTokens, internalNFTTotalSupply, internalSupplyForOwner, internalTokensForOwner } from './enummeration';
import { internalAddSale, internalGetSale, internalGetSales, internalOffer, internalRemoveSale, intrenalUpdatePrice } from './marketplace';
import { internalNFTMetadata, JsonToken, NFTContractMetadata } from './metadata';
import { internalMint } from './mint';
import { assertOneYocto, internalNftTransfer } from './nft_core';
import { JsonSale } from './sale';

/// This spec can be treated like a version of the standard.
export const NFT_METADATA_SPEC = "nft-1.0.0";

/// This is the name of the NFT standard we're using
export const NFT_STANDARD_NAME = "nep171";

@NearBindgen({})
export class NFTContract {
    owner_id: string;
    tokensPerOwner: LookupMap = new LookupMap("tokensPerOwner"); // {accountId, Set<TokenId>}
    tokensById: LookupMap = new LookupMap("tokensById"); // {tokenId, Token}
    tokenMetadataById: UnorderedMap = new UnorderedMap("tokenMetadataById"); // {tokenId, TokenMetadata}
    metadata: NFTContractMetadata = new NFTContractMetadata(
        {
            spec: "nft-1.0.0",
            name: "PTIT Tutorial Contract",
            symbol: "PTIT-NFT"
        });

    // market place
    nextSaleId: number = 0;
    sales: UnorderedMap = new UnorderedMap("sales"); // {saleId: Sale}
    saleByOwnerId: LookupMap = new LookupMap("byOwnerId"); // {accountId, Set<saleId>}


    @initialize({privateFunction: true})
    init({owner_id}: {owner_id: string}) {
        this.owner_id = owner_id;
    }

    // mint nft
    @call({payableFunction: true})
    nft_mint({token_id, metadata, receiver_id}): void {
        internalMint({contract: this, tokenId: token_id, metadata, receiverId: receiver_id});
    }

    // Get token data
    @view({})
    nft_token({token_id}: {token_id: string}): JsonToken {
        return null;
    }

    @call({payableFunction: true})
    nft_transfer({receiver_id, token_id, approval_id, memo}: {
        receiver_id: string,
        token_id: string,
        approval_id: number|null,
        memo: string|null}) {

            // Require 1 yoctoNEAR 1 NEAR = 10^24 yoctoNEAR
            assertOneYocto();
            internalNftTransfer({contract: this, receiverId: receiver_id, tokenId: token_id, memo});
    }

    @call({payableFunction: true})
    nft_transfer_call({receiver_id, token_id, approval_id, memo, msg}: {
        receiver_id: string,
        token_id: string,
        approval_id: number|null,
        memo: string|null,
        msg: string,
    }): void {

    }

    @call({privateFunction: true})
    nft_resolve_transfer({owner_id, receiver_id, token_id, approved_account_ids}: {
        owner_id: string,
        receiver_id: string,
        token_id: string,
        approved_account_ids: null|Record<string, number>
    }): void {}

    // Enummeration
    @view({})
    nft_total_supply(): number {
        return internalNFTTotalSupply({contract: this});
    }

    @view({})
    nft_tokens({from_index, limit}: { from_index: string | null, limit: number }): JsonToken[] {
        return internalNftTokens({contract: this, fromIndex: from_index, limit});
    }

    @view({})
    nft_supply_for_owner({account_id}: {account_id: string}): number {
        return internalSupplyForOwner({contract: this, accountId: account_id});
    }

    @view({})
    nft_tokens_for_owner({account_id, from_index, limit}: { account_id: string, from_index: string, limit: number }): JsonToken[] {
        return internalTokensForOwner({contract: this, accountId: account_id, fromIndex: from_index, limit});
    }

    @view({})
    nft_metadata(): NFTContractMetadata {
        return internalNFTMetadata({contract: this});
    }

    // Add sales
    @call({ payableFunction: true })
    add_sale({ token_id, price }: { token_id: string, price: string }): void {
        assertOneYocto();
        internalAddSale({contract: this, token_id, price});
    }

    @call({payableFunction: true})
    remove_sale({sale_id}: {sale_id: string}):void {
        assertOneYocto();
        internalRemoveSale({contract: this, sale_id});
    }

    @call({payableFunction: true})
    update_price({sale_id, price}: { sale_id: string, price: string}): void {
        assertOneYocto();
        intrenalUpdatePrice({contract: this, sale_id, price});
    }

    @call({payableFunction: true})
    offer({sale_id}: {sale_id: string}): void {
        internalOffer({contract: this, sale_id});
    }

    @view({})
    get_sales(): JsonSale[] {
        return internalGetSales({contract: this});
    }

    @view({})
    get_sale({sale_id}: {sale_id: string}): JsonSale {
        return internalGetSale({contract: this, sale_id});
    }
}