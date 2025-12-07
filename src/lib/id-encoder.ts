
// Originally used Base64url encoding for obfuscation.
// Switched to direct UUIDs as per user request to use standard IDs.
// Keeping functions as passthrough to avoid breaking import references.

export function encodeId(id: string): string {
    return id;
}

export function decodeId(encodedId: string): string {
    return encodedId;
}
