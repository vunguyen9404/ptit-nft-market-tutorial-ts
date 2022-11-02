import { NFTContract } from "./contract";
import { restoreOwners } from "./internal";
import { JsonToken, Token, TokenMetadata } from "./metadata";

export function internalNFTTotalSupply({contract}: {contract: NFTContract}): number {
    return contract.tokenMetadataById.length;
}

//Query for nft tokens on the contract regardless of the owner using pagination
export function internalNftTokens({
    contract,
    fromIndex,
    limit
}:{ 
    contract: NFTContract, 
    fromIndex?: string, 
    limit?: number
}): JsonToken[] {
    let tokens = [];

    //where to start pagination - if we have a fromIndex, we'll use that - otherwise start from 0 index
    let start = fromIndex ? parseInt(fromIndex) : 0;
    //take the first "limit" elements in the array. If we didn't specify a limit, use 50
    let max = limit ? limit : 50;

    let keys = contract.tokenMetadataById.toArray();
    // Paginate through the keys using the fromIndex and limit
    for (let i = start; i < keys.length && i < start + max; i++) {
        // get the token object from the keys
        let jsonToken = internalNftToken({contract, tokenId: keys[i][0]});
        tokens.push(jsonToken);
    }
    return tokens;
}

export function add({a, b}: {a: number, b: number}): number {
    return a+b;
}

/**
 * get token by id
 */
export function internalNftToken({
    contract,
    tokenId
}:{ 
    contract: NFTContract, 
    tokenId: string 
}): JsonToken {
    let token = contract.tokensById.get(tokenId) as Token;
    //if there wasn't a token ID in the tokens_by_id collection, we return None
    if (token == null) {
        return null;
    }

    //if there is some token ID in the tokens_by_id collection
    //we'll get the metadata for that token
    let metadata = contract.tokenMetadataById.get(tokenId) as TokenMetadata;
    
    //we return the JsonToken
    let jsonToken = new JsonToken({
        tokenId: tokenId,
        ownerId: token.owner_id,
        metadata
    });
    return jsonToken;
}

//get the total supply of NFTs for a given owner
export function internalSupplyForOwner({
    contract,
    accountId
}:{
    contract: NFTContract, 
    accountId: string
}): number {
    //get the set of tokens for the passed in owner
    let tokens = restoreOwners(contract.tokensPerOwner.get(accountId));
    //if there isn't a set of tokens for the passed in account ID, we'll return 0
    if (tokens == null) {
        return 0
    }

    //if there is some set of tokens, we'll return the length 
    return tokens.length;
}

//Query for all the tokens for an owner
export function internalTokensForOwner({
    contract,
    accountId,
    fromIndex,
    limit
}:{
    contract: NFTContract, 
    accountId: string, 
    fromIndex?: string, 
    limit?: number
}): JsonToken[] {
    //get the set of tokens for the passed in owner
    let tokenSet = restoreOwners(contract.tokensPerOwner.get(accountId));

    //if there isn't a set of tokens for the passed in account ID, we'll return 0
    if (tokenSet == null) {
        return [];
    }
    
    //where to start pagination - if we have a fromIndex, we'll use that - otherwise start from 0 index
    let start = fromIndex ? parseInt(fromIndex) : 0;
    //take the first "limit" elements in the array. If we didn't specify a limit, use 50
    let max = limit ? limit : 50;

    let keys = tokenSet.toArray();
    let tokens: JsonToken[] = []
    for(let i = start; i < max; i++) {
        if(i >= keys.length) {
            break;
        }
        let token = internalNftToken({contract, tokenId: keys[i]});
        tokens.push(token);
    }
    return tokens;
}