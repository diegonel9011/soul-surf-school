import SurfCard from "@/components/SurfCard";
import { useScrollReveal } from "@/components/useScrollReveal";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Mariana Solís",
    initials: "MS",
    text: "La mejor experiencia de surf que he tenido. Wilbert es un instructor increíble, me hizo sentir segura desde el primer momento. ¡Volveré sin duda!",
    rating: 5,
  },
  {
    name: "Jake Morrison",
    initials: "JM",
    text: "Incredible waves, incredible people. The full-day excursion was worth every peso. Puerto Escondido is magical and Soul Surf made it unforgettable.",
    rating: 5,
  },
  {
    name: "Camila Reyes",
    initials: "CR",
    text: "Fui sin saber nada de surf y terminé parándome en la tabla el primer día. El equipo es profesional y la vibra es increíble. 100% recomendado.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="testimonials" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-primary mb-3">Recomendaciones</p>
          <h2 className="font-brush text-3xl md:text-5xl text-foreground leading-[1.15]">
            Stoked Reviews
          </h2>
        </div>
        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          {testimonials.map((t, i) => (
            <SurfCard
              key={t.name}
              className={`transition-all duration-700 ${isVisible ? "animate-reveal-up" : ""}`}
              style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-card-foreground text-sm">{t.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={12} className="fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-card-foreground/70 text-sm leading-relaxed">"{t.text}"</p>
            </SurfCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
