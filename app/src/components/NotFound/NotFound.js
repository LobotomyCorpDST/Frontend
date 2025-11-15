import React from "react";
import "./NotFound.css";

const STATIC_404 = "/not-found";

export default function NotFound() {
  React.useEffect(() => {
    window.location.replace(STATIC_404);
  }, []);

  return (
    <div className="not-found">
      <p className="not-found__loading">Loading custom 404 page...</p>
    </div>
  );
}
