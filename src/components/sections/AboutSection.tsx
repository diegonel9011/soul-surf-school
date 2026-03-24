import { useScrollReveal } from "@/components/useScrollReveal";
import { Shield, Heart, Sun } from "lucide-react";

const aboutImg = "https://pub-1768725b197a40db9d510937d3fef56b.r2.dev/galeria/imgsurf.avif";

const features = [
  { icon: Shield, title: "Seguridad Primero", desc: "Equipamiento certificado y protocolos de seguridad estrictos en cada sesión." },
  { icon: Heart, title: "Cultura Local", desc: "Instructores locales como Wilbert que comparten la pasión y tradición del surf oaxaqueño." },
  { icon: Sun, title: "Enfoque Premium", desc: "Grupos reducidos y atención personalizada para que cada ola cuente." },
];

const AboutSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="about" className="py-20 md:py-32">
      <div
        ref={ref}
        className={`container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
      >
        {/* Text */}
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary mb-3">Nosotros</p>
          <h2 className="font-brush text-3xl md:text-5xl text-foreground leading-[1.15] mb-6">
            Born from the Ocean
          </h2>
          <p className="text-foreground/60 text-base md:text-lg mb-8 max-w-lg">
            Soul Surf nació en las playas de Puerto Escondido, donde las olas más poderosas de México
            rompen cada día. Nuestro equipo de instructores locales lleva el surf en la sangre — no es
            solo un deporte, es un estilo de vida que queremos compartir contigo.
          </p>
          <div className="space-y-5">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <f.icon size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-foreground/50 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          <img
            src={aboutImg}
            alt="Instructor de surf en la playa"
            className="rounded-3xl w-full object-cover aspect-[4/5] shadow-2xl shadow-black/30"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
