// VideoPromoSection.tsx
// Sección de video promocional para DermaFutura Expo 2027
// Sigue la misma estética del resto del sitio: fondo #081613, acento teal-500 (#14B8A6),
// label numerado tipo "0X / SECCIÓN" y encabezado serif con palabra en itálica teal.
//
// CÓMO CONECTAR EL VIDEO DE BUNNY (cuando ya lo tengan subido):
// 1. En Bunny Stream, copia el "Library ID" y el "Video ID" del video.
// 2. Reemplaza BUNNY_LIBRARY_ID y BUNNY_VIDEO_ID abajo (o pásalos como props).
// 3. Borra el bloque {isPlaceholder && (...)} y descomenta el <iframe>.
// Mientras no tengan esos IDs, el componente muestra el placeholder automáticamente.

const BUNNY_LIBRARY_ID = ""; // ej. "123456"
const BUNNY_VIDEO_ID = "";   // ej. "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

export default function VideoPromoSection() {
  const isPlaceholder = !BUNNY_LIBRARY_ID || !BUNNY_VIDEO_ID;

  return (
    <section className="relative bg-[#081613] py-24 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Label numerado, igual patrón que "01 / EL MANIFIESTO" */}
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-teal-500 uppercase">
          03 / EL VIDEO
        </p>

        <h2 className="mb-10 font-serif text-4xl leading-tight text-white md:text-5xl">
          Míralo,{" "}
          <span className="italic text-teal-500">no lo imagines.</span>
        </h2>

        {/* Contenedor del video — 16:9, mismo radio y borde que el resto del sitio */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
          {isPlaceholder ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/50">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M10 8.5v7l6-3.5-6-3.5z" fill="currentColor" stroke="none" />
              </svg>
              <span className="text-sm tracking-wide">Video próximamente</span>
            </div>
          ) : (
            // Descomenta este bloque y borra el de arriba cuando ya tengas el video en Bunny:
            /*
            <iframe
              src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${BUNNY_VIDEO_ID}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
              loading="lazy"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
            />
            */
            <div />
          )}
        </div>
      </div>
    </section>
  );
}
