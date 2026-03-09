/**
 * Validate and normalize an HTTP(S) URL.
 */
export function assertSafeHttpUrl(value, label) {
    let parsed;
    try {
        parsed = new URL(value);
    }
    catch {
        throw new Error(`${label} must be a valid URL`);
    }
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== "https:" && protocol !== "http:") {
        throw new Error(`${label} must use http:// or https://`);
    }
    return parsed;
}
//# sourceMappingURL=url.js.map