import type { ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="neo-card w-full max-w-lg p-6 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl uppercase leading-none">{title}</h2>
          <button onClick={onClose} className="neo-btn bg-[#FF5C5C] text-white px-3 py-1 text-sm">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
