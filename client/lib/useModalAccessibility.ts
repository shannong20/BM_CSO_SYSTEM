'use client';

import { useEffect, RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseModalAccessibilityOptions {
  isOpen: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  canClose?: boolean;
}

export function useModalAccessibility({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef,
  canClose = true,
}: UseModalAccessibilityOptions) {
  useEffect(() => {
    if (!isOpen) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusInitial = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      const focusables = containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables && focusables.length > 0) {
        focusables[0].focus();
      }
    };

    const rafId = requestAnimationFrame(focusInitial);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canClose) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !containerRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last || !containerRef.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, [isOpen, onClose, containerRef, initialFocusRef, canClose]);
}
