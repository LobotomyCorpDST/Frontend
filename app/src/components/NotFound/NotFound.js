import React from "react";
import "./NotFound.css";

const STATIC_404 = "/not-found";
const STORAGE_KEY = "not-found-status";

export default function NotFound({ statusCode = 404 }) {
  React.useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(statusCode));
    } catch (err) {
      // ignore storage errors (e.g. private mode)
    }
    window.location.replace(STATIC_404);
  }, [statusCode]);

  return (
    <div className="not-found">
      <p className="not-found__loading">Loading custom 404 page...</p>
    </div>
  );
}
