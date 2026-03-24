import { useState } from "react";
import { useScrollReveal } from "@/components/useScrollReveal";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const BASE = "https://pub-1768725b197a40db9d510937d3fef56b.r2.dev/galeria";

const photos = [
  { src: `${BASE}/unnamed.webp`,   alt: "Clases en la Playa",      span: "col-span-2 row-span-2" },
  { src: `${BASE}/unnamed-1.webp`, alt: "En el Agua",              span: "col-span-1 row-span-1" },
  { src: `${BASE}/unnamed-2.webp`, alt: "Nuestras Tablas",         span: "col-span-1 row-span-1" },
  { src: `${BASE}/unnamed-3.webp`, alt: "Playa Carrizalillo",      span: "col-span-1 row-span-1" },
  { src: `${BASE}/unnamed-4.webp`, alt: "Aprendiendo a Surfear",   span: "col-span-1 row-span-1" },
  { src: `${BASE}/unnamed-5.webp`, alt: "Primera Ola",             span: "col-span-2 row-span-1" },
];

const GallerySection = () => {
  const { ref, isVisible } = useScrollReveal();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () => setLightbox((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  const next = () => setLightbox((i) => (i === null ? null : (i + 1) % photos.length));

  return (
    <section id="gallery" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-primary mb-3">Galería de Olas</p>
          <h2 className="font-brush text-3xl md:text-5xl text-foreground leading-[1.15]">
            Catch the Moment
          </h2>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[220px] gap-3 md:gap-4 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          {photos.map((photo, i) => (
            <div
              key={i}
              onClick={() => setLightbox(i)}
              className={`${photo.span} relative overflow-hidden rounded-2xl cursor-zoom-in group transition-all duration-700 ${isVisible ? "animate-reveal-scale" : ""}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              <p className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-semibold translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                {photo.alt}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/92 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={24} />
          </button>
          <button
            className="absolute left-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="relative w-full max-w-4xl aspect-[4/3] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightbox].src}
              alt={photos[lightbox].alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <p className="text-white font-semibold">{photos[lightbox].alt}</p>
              <p className="text-white/60 text-sm">{lightbox + 1} / {photos.length}</p>
            </div>
          </div>

          <button
            className="absolute right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
