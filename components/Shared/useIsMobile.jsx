/*
File: src/components/Shared/useIsMobile.js
Hook to detect mobile viewport (≤768px) and provide reusable utilities:
- default export useIsMobile: detect mobile
- ClickOutsideOverlay: overlay catching outside clicks
- useToggleWithClickOutside: manage toggle + outside click
- TapOutsideWrapper: wrapper that requires first tap to show content, second tap to invoke child onClick
Usage:
  import useIsMobile, { ClickOutsideOverlay, TapOutsideWrapper } from '../Shared/useIsMobile';
*/
import React, {
  useState,
  useEffect,
  cloneElement,
  isValidElement,
} from "react";
import styles from "./Responsive.module.css";

// Hook to detect mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}

// Full-screen transparent overlay catching outside clicks
function ClickOutsideOverlay({ onClick }) {
  return <div className={styles["click-outside-overlay"]} onClick={onClick} />;
}

// Hook to toggle a boolean and reset via outside click
function useToggleWithClickOutside(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);
  return { isOpen, toggle, close };
}

// Wrapper: first tap shows overlay, second tap triggers child's onClick
function TapOutsideWrapper({ children, onToggle }) {
  const isMobile = useIsMobile();
  const { isOpen, toggle, close } = useToggleWithClickOutside(false);

  if (!isMobile || !isValidElement(children)) {
    // On desktop or invalid child, render as-is
    return children;
  }

  const childProps = children.props || {};
  const originalOnClick = childProps.onClick;

  const handleClick = (e) => {
    if (!isOpen) {
      e.stopPropagation();
      toggle();
      onToggle?.(true);
    } else {
      close();
      onToggle?.(false);
      if (originalOnClick) originalOnClick(e);
    }
  };

  const cloned = cloneElement(children, { onClick: handleClick });

  return (
    <>
      {cloned}
      {isOpen && <ClickOutsideOverlay onClick={close} />}
    </>
  );
}

// Exports
export default useIsMobile;
export { ClickOutsideOverlay, useToggleWithClickOutside, TapOutsideWrapper };
