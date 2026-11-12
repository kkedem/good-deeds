"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./modal.css";

export default function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus the sheet once on open; Escape closes it.
  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} className="modal-panel" role="dialog" aria-modal="true" tabIndex={-1}>
        <span className="modal-handle" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
