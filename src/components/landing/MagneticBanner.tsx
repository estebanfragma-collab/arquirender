import { Link } from "react-router-dom";

interface MagneticBannerProps {
  bgColor: string;
  text: string;
  ctaText: string;
  ctaHref: string;
}

export default function MagneticBanner({
  bgColor,
  text,
  ctaText,
  ctaHref,
}: MagneticBannerProps) {
  return (
    <section className="w-full py-10" style={{ backgroundColor: bgColor }}>
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <p className="text-lg md:text-[22px] font-bold text-white mb-6">
          {text}
        </p>
        <Link
          to={ctaHref}
          className="inline-block bg-white rounded-[10px] px-8 py-3.5 text-base font-bold"
          style={{ color: bgColor }}
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
