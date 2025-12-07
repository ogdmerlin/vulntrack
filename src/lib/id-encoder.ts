
export function encodeId(id: string): string {
    if (!id) return "";
    try {
        return btoa(id).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
        return id;
    }
}

export function decodeId(encodedId: string): string {
    if (!encodedId) return "";
    try {
        const base64 = encodedId.replace(/-/g, '+').replace(/_/g, '/');
        return atob(base64);
    } catch (e) {
        return encodedId;
    }
}
