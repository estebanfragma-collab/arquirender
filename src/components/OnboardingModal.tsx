import { useEffect } from "react";

const VIDEO_URL = "https://tjhpsraoolhfalrenrdb.supabase.co/storage/v1/object/public/videos/onboarding.mp4";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const OnboardingModal = ({ open, onClose }: OnboardingModalProps) => {
  useEffect(() => {
    if (!open) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onClose();
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Cómo aprovechar tus 4 generaciones gratis"
    >
      <div
        className="relative w-[95vw] max-w-[860px] overflow-hidden rounded-lg border border-brand-border bg-[#0a0a0a] text-white shadow-2xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-md bg-black/60 text-xl font-bold leading-none text-white transition hover:bg-[#EA580C]"
        >
          ×
        </button>

        <div className="px-5 pb-4 pt-5 pr-16">
          <h2 className="text-base font-extrabold sm:text-lg">Cómo aprovechar tus 4 generaciones gratis</h2>
        </div>

        <video
          controls
          playsInline
          preload="metadata"
          src={VIDEO_URL}
          className="block w-full bg-black"
        />

        <div className="px-5 py-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md bg-[#EA580C] px-4 py-3 text-sm font-extrabold text-white transition hover:brightness-110"
          >
            Empezar ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
