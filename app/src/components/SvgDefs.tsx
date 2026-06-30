import React from "react";

export const SvgDefs = React.memo(() => (
  <defs>
    <marker id="arrow-unlocked" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#86efac" />
    </marker>
    <marker id="arrow-locked" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#444" />
    </marker>
    <marker id="arrow-unlockable" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#fef08a" />
    </marker>
  </defs>
))
