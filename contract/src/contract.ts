import { NearBindgen, near, call, view, LookupMap, UnorderedMap, initialize } from 'near-sdk-js';
import { internalNftTokens, internalNFTTotalSupply, internalSupplyForOwner, internalTokensForOwner } from './enummeration';
import { internalNFTMetadata, JsonToken, NFTContractMetadata } from './metadata';
import { internalMint } from './mint';

/// This spec can be treated like a version of the standard.
export const NFT_METADATA_SPEC = "nft-1.0.0";

/// This is the name of the NFT standard we're using
export const NFT_STANDARD_NAME = "nep171";

@NearBindgen({})
export class NFTContract {
    owner_id: string;
    tokensPerOwner: LookupMap = new LookupMap("tokensPerOwner");;
    tokensById: LookupMap = new LookupMap("tokensById");;
    tokenMetadataById: UnorderedMap = new UnorderedMap("tokenMetadataById");;
    metadata: NFTContractMetadata = new NFTContractMetadata(
        {
            spec: "nft-1.0.0",
            name: "PTIT Tutorial Contract",
            symbol: "PTIT-NFT"
        });

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
        memo: string|null,}) {

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
}