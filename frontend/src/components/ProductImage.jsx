import { useState } from "react";

// Built-in placeholder (an inline SVG), so we never depend on an external image
// service that might go offline.
const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f3f4f6"/><g fill="none" stroke="#9ca3af" stroke-width="8" stroke-linejoin="round"><path d="M150 120l50-25 50 25v60l-50 25-50-25z"/><path d="M150 120l50 25 50-25M200 145v60"/></g></svg>`
)}`;

/** An <img> that shows a placeholder when there is no URL or the URL is broken. */
export default function ProductImage({ src, alt, ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const useFallback = !src || failedSrc === src;

  return (
    <img
      src={useFallback ? PLACEHOLDER : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      {...rest}
    />
  );
}
