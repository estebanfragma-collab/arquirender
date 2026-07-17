const ITEMS = [
  "Render fotorrealista en segundos",
  "Sin instalar nada",
  "Fotografía real de tu proyecto",
  "Nocturno, lluvia, dron",
  "Láminas de presentación",
  "Moodboards",
  "Hecho para LATAM",
  "3 renders gratis sin tarjeta",
  "Compatible con SketchUp",
  "Axonométrico",
  "Close-ups",
  "Transforma espacios abandonados",
];

export default function TickerBar() {
  return (
    <div className="bg-[#EA580C] py-3.5 overflow-hidden">
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="flex w-max whitespace-nowrap"
        style={{ animation: "ticker-scroll 30s linear infinite" }}
      >
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <div key={i} className="flex items-center text-white text-[15px] font-medium">
            <span>{item}</span>
            <span className="px-6">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
