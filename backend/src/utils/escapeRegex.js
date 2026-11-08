/**
 * Escapes characters that have a special meaning in regular expressions, so
 * user-typed search text is matched literally ("a.b" must not match "axb")
 * and cannot be used for ReDoS-style attacks.
 */
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
