import CongresoTickets from './components/CongresoTickets';
import CongresoPurchaseStatus from './components/CongresoPurchaseStatus';
import ScheduleList from './components/ScheduleList';
import areas from '../data/hero-figuras.json';
import faq from '../data/faq.json';
import programa from '../data/programa.json';

const pillars = [
  ['01', 'Ciencia que se siente', 'Conocimiento clínico convertido en decisiones claras, actuales y útiles.'],
  ['02', 'Tecnología con pulso', 'Innovación aplicada sin perder la mirada humana del cuidado de la piel.'],
  ['03', 'Conexiones que quedan', 'Práctica, investigación, industria y nuevas generaciones en una misma conversación.'],
];

const audiences = [
  ['01', 'Dermatólogos', 'Criterio clínico, innovación y conversación entre pares.'],
  ['02', 'Médicos y residentes', 'Nuevas miradas para una práctica que evoluciona.'],
  ['03', 'Investigación', 'El puente entre evidencia, preguntas y aplicación.'],
  ['04', 'Estudiantes', 'Una entrada contemporánea al futuro de la especialidad.'],
  ['05', 'Clínicas', 'Experiencia, tecnología y cuidado con visión integral.'],
  ['06', 'Industria', 'Laboratorios, dispositivos y aliados de innovación.'],
];

const speakers = [
  {
    id: 'alejandro-yoshua-juarez-victoria',
    name: 'Dr. Alejandro Yoshua Juárez Victoria',
    role: 'Ponente confirmado',
    image: '/images/ponentes/alejandro-yoshua-juarez-victoria.png?v=20260901-2',
  },
  {
    id: 'diana-lopez-montiel',
    name: 'Diana López Montiel',
    role: 'Fisioterapéutica para el cuidado de la piel',
    image: '/images/ponentes/diana-lopez-montiel.png?v=20260901-2',
  },
  {
    id: 'edgar-ivan-chavez-monterrosa',
    name: 'Dr. Edgar Iván Chávez Monterrosa',
    role: 'Médico estético',
    image: '/images/ponentes/edgar-ivan-chavez-monterrosa.png?v=20260901-2',
  },
];

function PromoVideo() {
  return (
    <section className="promo-film" id="video" aria-labelledby="promo-film-title">
      <style>{`
        .promo-film{position:relative;overflow:hidden;background:#f4f7f5;color:#071b17;padding:clamp(5rem,9vw,9rem) 0}
        .promo-film::before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(7,55,47,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(7,55,47,.055) 1px,transparent 1px);background-size:72px 72px;mask-image:linear-gradient(to bottom,transparent,black 22%,black 78%,transparent);pointer-events:none}
        .promo-film-shell{position:relative;width:min(1180px,calc(100% - 48px));margin:0 auto}
        .promo-film-head{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(250px,.65fr);align-items:end;gap:clamp(2rem,6vw,6rem);margin-bottom:clamp(2.25rem,4vw,4rem)}
        .promo-film-eyebrow{display:flex;align-items:center;gap:.8rem;margin:0 0 1.2rem;font-size:.7rem;font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:#078c7b}
        .promo-film-eyebrow::before{content:"";width:34px;height:1px;background:#078c7b}
        .promo-film h2{margin:0;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3.2rem,7.2vw,7.4rem);font-weight:400;line-height:.86;letter-spacing:-.06em}
        .promo-film h2 em{display:block;color:#079c88;font-weight:400}
        .promo-film-copy{border-left:1px solid rgba(7,55,47,.25);padding-left:clamp(1.3rem,3vw,2.3rem)}
        .promo-film-copy p{margin:0;font-size:clamp(1rem,1.4vw,1.18rem);line-height:1.7;color:#365e56}
        .promo-film-copy span{display:block;margin-top:1.4rem;font-size:.68rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#071b17}
        .promo-film-frame{position:relative;padding:clamp(8px,1.2vw,14px);background:#061713;border-radius:clamp(18px,2.4vw,30px);box-shadow:0 35px 85px rgba(3,38,32,.22);isolation:isolate}
        .promo-film-frame::before{content:"";position:absolute;inset:-1px;border:1px solid rgba(7,156,136,.35);border-radius:inherit;pointer-events:none}
        .promo-film-player{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:clamp(12px,1.8vw,21px);background:#03110e}
        .promo-film-player iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
        .promo-film-index{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding:1.05rem .45rem .15rem;color:#c8d9d5;font-size:.66rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase}
        .promo-film-index strong{color:#50dcc5;font-weight:800}
        @media(max-width:760px){.promo-film{padding:4.5rem 0}.promo-film-shell{width:min(100% - 28px,1180px)}.promo-film-head{grid-template-columns:1fr;gap:1.7rem;margin-bottom:2rem}.promo-film h2{font-size:clamp(3rem,17vw,5rem);line-height:.9}.promo-film-copy{padding-left:1.1rem}.promo-film-index{align-items:flex-start;flex-direction:column;gap:.45rem;padding:.9rem .35rem .1rem;letter-spacing:.13em}}
      `}</style>
      <div className="promo-film-shell">
        <div className="promo-film-head">
          <div>
            <p className="promo-film-eyebrow">BIO SKIN / En primera persona</p>
            <h2 id="promo-film-title">MÍRALO.<em>SIÉNTELO.</em></h2>
          </div>
          <div className="promo-film-copy">
            <p>Una mirada al universo que estamos construyendo: ciencia, conversación y una nueva forma de vivir el futuro de la piel.</p>
            <span>Presentación oficial · Congress 2026</span>
          </div>
        </div>

        <div className="promo-film-frame">
          <div className="promo-film-player">
            <iframe
              src="https://player.mediadelivery.net/embed/739112/9c425f37-da0a-485a-8990-ebb57c4fae7e?autoplay=false&loop=false&muted=false&preload=true&responsive=true"
              loading="lazy"
              title="Video promocional de BIO SKIN Congress 2026"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
          <div className="promo-film-index" aria-hidden="true">
            <strong>Film 01</strong>
            <span>Ciencia / Piel / Futuro</span>
            <span>25 segundos</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <CongresoPurchaseStatus />
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="BIO SKIN Congress, inicio"><img className="brand-logo" src="/images/logo-bioskin.jpeg" alt="BIO SKIN Congress 2026" /></a>
        <nav className="nav-links" aria-label="Navegación principal"><a href="#voces">Voces</a><a href="#programa">Programa</a><a href="#pases">Pases</a><a href="#sede">Sede</a></nav>
        <a className="nav-cta" href="#interes">Únete a la lista</a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grain" aria-hidden="true" /><div className="hero-rule hero-rule-left" aria-hidden="true" /><div className="hero-rule hero-rule-right" aria-hidden="true" />
        <div className="hero-editorial shell">
          <div className="hero-word hero-word-one" aria-hidden="true">BIO</div><div className="hero-word hero-word-two" aria-hidden="true">SKIN</div><div className="hero-word hero-word-three" aria-label="BIO SKIN Congress 2026">CONGRESS <span>2026</span></div>
          <div className="hero-cta"><div className="hero-actions"><a className="button button-primary" href="#voces">Explorar las voces</a><a className="button button-ghost" href="#interes">Recibir noticias</a></div></div>
          <div className="hero-cast" aria-label="Ponentes confirmados de BIO SKIN Congress">
            <div className="cast-aura" aria-hidden="true" />
            {speakers.map((speaker, index) => (
              <article className={`hero-speaker hero-speaker-${index + 1}`} key={speaker.id} tabIndex={0}>
                <img src={speaker.image} alt={`Retrato de ${speaker.name}`} fetchPriority={index === 1 ? 'high' : 'auto'} />
                <div className="hero-speaker-label"><span>0{index + 1} · Ponente</span><strong>{speaker.name}</strong><small>{speaker.role}</small></div>
              </article>
            ))}
          </div>
          <div className="hero-footnote"><p>Ponentes confirmados · BIO SKIN Congress 2026</p></div>
        </div>
      </section>

      <PromoVideo />

      <section className="opening paper-section" id="universo">
        <div className="shell opening-grid"><p className="section-tag">01 / El manifiesto</p><div className="opening-title"><span>EL FUTURO</span><h2>TAMBIÉN</h2><em>TIENE PIEL.</em></div><div className="opening-copy"><p>Una plataforma donde medicina, tecnología, cultura y nuevas generaciones dejan de vivir en mundos separados.</p><a className="text-link" href="#programa">Descubrir la experiencia <span>↗</span></a></div></div>
        <div className="editorial-ribbon"><span>SCIENCE WITH STYLE · SKIN WITH A FUTURE ·</span><span>SCIENCE WITH STYLE · SKIN WITH A FUTURE ·</span></div>
      </section>

      <section className="voices ink-section" id="voces">
        <div className="shell voices-head"><p className="section-tag mint">02 / Protagonistas</p><h2>Quién va a<br /><em>tomar la palabra.</em></h2><p>Conoce a los primeros especialistas confirmados para una conversación contemporánea sobre ciencia, innovación y cuidado de la piel.</p></div>
        <div className="shell confirmed-speakers" aria-label="Ponentes confirmados">
          {speakers.map((speaker, index) => (
            <article className="confirmed-speaker" key={speaker.id} tabIndex={0}>
              <span className="confirmed-speaker-number" aria-hidden="true">0{index + 1}</span>
              <img src={speaker.image} alt={`Retrato de ${speaker.name}`} loading="lazy" />
              <div className="confirmed-speaker-copy"><small>Ponente confirmado</small><h3>{speaker.name}</h3><p>{speaker.role}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="runway paper-section" id="temas"><div className="shell runway-head"><p className="section-tag">03 / El universo</p><h2>SEIS MIRADAS.<br /><span>UNA MISMA PIEL.</span></h2></div><div className="runway-track">{areas.map((area,index)=><article className="runway-card" key={area.id}><div className={`runway-image real-person real-person-${index+1}`} role="img" aria-label={`Retrato editorial conceptual para ${area.name}`}><b>0{index+1}</b><small>Casting visual</small></div><h3>{area.name}</h3><p>{area.description}</p></article>)}</div><p className="runway-disclaimer shell">Retratos conceptuales generados para comunicar las áreas · No representan ponentes confirmados</p></section>

      <section className="pillars ink-section"><div className="shell pillars-grid"><div><p className="section-tag mint">04 / La promesa</p><h2>TRES FORMAS<br />DE HACERLO<br /><em>DIFERENTE.</em></h2></div><div className="pillar-list">{pillars.map(([number,title,text])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p><i>↗</i></article>)}</div></div></section>

      <section className="program paper-section" id="programa"><div className="program-watermark" aria-hidden="true">RUNWAY</div><div className="shell program-grid"><div className="program-intro"><p className="section-tag">05 / Programa</p><h2>Una jornada.<br /><em>Hora por hora.</em></h2><p>Un día completo de 9:00 a 16:00 h: conferencias, recorrido por stands, comida con show de medio tiempo y networking entre especialistas.</p></div><ScheduleList /></div></section>

      <section className="audience ink-section" id="publicos"><div className="audience-word" aria-hidden="true">FOR YOU</div><div className="shell audience-grid"><div className="audience-intro"><p className="section-tag mint">06 / Para quién</p><h2>PARA QUIENES<br />VEN MÁS ALLÁ<br /><em>DE LA SUPERFICIE.</em></h2></div><div className="audience-list">{audiences.map(([number,title,text])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="passes" id="pases"><div className="pass-editorial"><p className="section-tag">07 / Pases</p><h2>YOUR<br />ACCESS<br /><em>ERA.</em></h2><p>Elige tu ficha y asegura tu lugar en BIO SKIN Congress 2026.</p></div><CongresoTickets /></section>

      <section className="venue paper-section" id="sede"><div className="venue-city" aria-hidden="true">MÉXICO</div><div className="shell venue-grid"><div><p className="section-tag">08 / Dónde y cuándo</p><h2>La próxima<br /><em>capital de la piel.</em></h2></div><div className="venue-card"><small>Destino</small><strong>Ciudad por confirmar</strong><small>Fecha</small><strong>2026 · Por confirmar</strong><p>La sede, mapa, hospedaje y recomendaciones de viaje ocuparán este espacio cuando exista información oficial.</p></div></div></section>

      <section className="partners ink-section" id="aliados"><div className="shell partners-head"><p className="section-tag mint">09 / Aliados</p><h2>QUIENES HARÁN<br /><em>POSIBLE EL FUTURO.</em></h2><p>Logotipos y categorías aparecerán únicamente con confirmación y autorización de uso.</p></div><div className="partner-grid shell">{['Presenting partner','Skin science','Medical technology','Beauty innovation','Academic partner','Experience partner'].map((name,index)=><div key={name}><span>0{index+1}</span><strong>{name}</strong><small>Espacio disponible</small></div>)}</div></section>

      <section className="interest" id="interes"><div className="shell interest-grid"><div><p className="section-tag">10 / Sé parte del origen</p><h2>GET ON<br />THE <em>LIST.</em></h2><p>Recibe los primeros anuncios cuando el canal oficial esté listo.</p></div><form className="interest-form"><label>Nombre<input type="text" name="nombre" placeholder="Tu nombre" autoComplete="name" /></label><label>Correo<input type="email" name="email" placeholder="nombre@correo.com" autoComplete="email" /></label><label>Perfil<select name="perfil" defaultValue=""><option value="" disabled>Selecciona una opción</option>{audiences.map(([,title])=><option key={title}>{title}</option>)}</select></label><button type="button" disabled>Registro disponible próximamente</button><small>El envío permanecerá desactivado hasta confirmar el canal y el aviso de privacidad.</small></form></div></section>

      <section className="faq paper-section" id="faq"><div className="shell faq-grid"><div><p className="section-tag">11 / Preguntas</p><h2>TODO CLARO.<br /><em>NADA INVENTADO.</em></h2></div><div className="faq-list">{faq.map(item=><details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></div></section>

      <footer><div className="footer-word">BIO SKIN</div><div className="shell footer-bottom"><div className="brand"><img className="brand-logo brand-logo-footer" src="/images/logo-bioskin.jpeg" alt="BIO SKIN Congress 2026" /></div><p>Nombre, fecha, sede y contacto por confirmar.</p><a href="#inicio">Volver arriba ↑</a></div></footer>
    </main>
  );
}
