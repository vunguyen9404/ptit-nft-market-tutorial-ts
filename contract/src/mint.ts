import { assert, near } from "near-sdk-js";
import { NFTContract, NFT_METADATA_SPEC, NFT_STANDARD_NAME } from "./contract";
import { internalAddTokenToOwner } from "./internal";
import { Token, TokenMetadata } from "./metadata";

export function internalMint({
    contract,
    tokenId,
    metadata,
    receiverId
}: {
    contract: NFTContract,
    tokenId: string,
    metadata: TokenMetadata,
    receiverId: string
}): void {
    let token = new Token({
        ownerId: receiverId
    });
    assert(!contract.tokensById.containsKey(tokenId), "Token already exists");
    // Insert token
    contract.tokensById.set(tokenId, token);

    // Add token to owner
    internalAddTokenToOwner(contract, receiverId, tokenId);

    // insert token id and metadata
    contract.tokenMetadataById.set(tokenId, metadata);

    // Construct the mint log as per the events standard.
    let nftMintLog = {
        // Standard name ("nep171").
        standard: NFT_STANDARD_NAME,
        // Version of the standard ("nft-1.0.0").
        version: NFT_METADATA_SPEC,
        // The data related with the event stored in a vector.
        event: "nft_mint",
        data: [
            {
                // Owner of the token.
                owner_id: token.owner_id,
                // Vector of token IDs that were minted.
                token_ids: [tokenId],
            }
        ]
    }
    near.log(`EVENT_JSON:${JSON.stringify(nftMintLog)}`);
}