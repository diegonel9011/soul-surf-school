import SurfCard from "@/components/SurfCard";
import { useScrollReveal } from "@/components/useScrollReveal";
import { MapPin, Phone, Mail } from "lucide-react";

const LocationSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="location" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-primary mb-3">Ubicación</p>
          <h2 className="font-brush text-3xl md:text-5xl text-foreground leading-[1.15]">
            Find Us
          </h2>
        </div>
        <div
          ref={ref}
          className={`relative rounded-3xl overflow-hidden shadow-2xl shadow-black/30 transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
        >
          <iframe
            title="Soul Surf Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3818.8454978!2d-97.0802848!3d15.8622719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85b8f70c78384567%3A0xf3592adc235d1b1b!2sSoul%20surf%20school%20Mx!5e0!3m2!1ses!2smx!4v1711000000000!5m2!1ses!2smx"
            className="w-full h-[300px] md:h-[450px] border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Overlay card */}
          <SurfCard className="absolute bottom-4 left-4 right-4 md:right-auto md:left-6 md:bottom-6 md:w-80">
            <h3 className="font-bold text-card-foreground mb-3">Soul Surf Puerto Escondido</h3>
            <div className="space-y-2.5 text-sm text-card-foreground/70">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <span>Playa Carrizalillo & La Punta, Puerto Escondido, Oaxaca, México</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-primary flex-shrink-0" />
                <span>+52 954 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-primary flex-shrink-0" />
                <span>hola@soulsurf.mx</span>
              </div>
            </div>
          </SurfCard>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
