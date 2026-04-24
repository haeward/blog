export function escapeHtml(value: unknown): string {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function escapeAttribute(value: unknown): string {
    return escapeHtml(value).replaceAll("`", "&#96;");
}
