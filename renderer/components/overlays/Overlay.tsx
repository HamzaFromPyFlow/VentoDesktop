import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type OverlayProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  disableClick?: boolean;
  onClick?: () => void;
};

const Overlay = ({
  open,
  children,
  className,
  disableClick,
  onClick,
}: OverlayProps) => {
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onClick) return;

    function handleClickOutside(event: MouseEvent) {
      if (overlay.current && overlay.current.contains(event.target as Node)) {
        const clickedWithinChildren = Array.from(overlay.current.children).some(
          (child) => child.contains(event.target as Node)
        );
        if (!clickedWithinChildren) {
          onClick?.();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClick]);

  if (!open) return null;

  const overlayElement = (
    <div
      className={`overlay-container ${className || ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        pointerEvents: disableClick ? 'none' : 'auto',
      }}
      ref={overlay}
    >
      {children}
    </div>
  );

  // Use portal if available, otherwise render directly
  if (typeof document !== 'undefined') {
    const portalRoot = document.getElementById('overlay-root') || document.body;
    return createPortal(overlayElement, portalRoot);
  }

  return overlayElement;
};

export default Overlay;
