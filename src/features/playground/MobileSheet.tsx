import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

type MobileSheetProps = {
  open: boolean;
  onClose: () => void;
  subtitle: string;
  children: React.ReactNode;
};

/**
 * Bottom sheet for the phone layout, built on the native <dialog>: focus is contained while it
 * is open, Escape closes it, and focus returns to the Controls button afterwards.
 */
export function MobileSheet({ open, onClose, subtitle, children }: MobileSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="sheet-title"
      className="lab-sheet"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sticky top-0 z-2 flex items-center gap-2.5 bg-paper px-0.5 pt-5 pb-2">
        <span
          aria-hidden="true"
          className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-sm bg-[#C3C8D3]"
        />
        <div className="flex-1">
          <h2 id="sheet-title" className="m-0 text-[17px] font-extrabold">
            Lab controls
          </h2>
          <p className="mt-0.5 mb-0 text-xs font-medium text-ink-3">{subtitle}</p>
        </div>
        <Button icon onClick={onClose} aria-label="Close controls" className="size-11">
          <X size={18} aria-hidden="true" />
        </Button>
      </div>
      {open && <div className="flex flex-col gap-3">{children}</div>}
    </dialog>
  );
}
