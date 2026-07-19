import Nav from "./Nav";
import Hero from "./Hero";
import VSL from "./VSL";
import TickerBar from "./TickerBar";
import Dolores from "./Dolores";
import MagneticBanner from "./MagneticBanner";
// import Solucion from "./Solucion";
import Resultados from "./Resultados";
import Proyecto from "./Proyecto";
import Industrias from "./Industrias";
import Objeciones from "./Objeciones";
import Precios from "./Precios";
import FAQ from "./FAQ";
import CTAFinal from "./CTAFinal";
import Footer from "./Footer";
import StickyBanner from "./StickyBanner";

export default function Landing() {
  return (
    <div>
      <Nav />
      <Hero />
      <VSL />
      <TickerBar />
      <Dolores />
      <MagneticBanner
        bgColor="#EA580C"
        text="Genera tu primer render gratis — sin tarjeta, sin instalaciones, en segundos."
        ctaText="Empieza ahora →"
        ctaHref="/app"
      />
      {/* <Solucion /> */}
      <Resultados />
      <Proyecto />
      <Industrias />
      <MagneticBanner
        bgColor="#111111"
        text="Cientos de arquitectos en LATAM ya generan renders profesionales con ArquiRender."
        ctaText="Únete gratis →"
        ctaHref="/app"
      />
      <Objeciones />
      <Precios />
      <FAQ />
      <CTAFinal />
      <Footer />
      <StickyBanner />
    </div>
  );
}
