import areas from '../data/hero-figuras.json';
import faq from '../data/faq.json';
import programa from '../data/programa.json';
import site from '../data/site.json';

const pillars = [
  {
    number: '01',
    title: 'Ciencia que se siente',
    text: 'Conocimiento clínico traducido en conversaciones claras, actuales y útiles.',
  },
  {
    number: '02',
    title: 'Tecnología con pulso',
    text: 'Innovación aplicada sin perder la mirada humana que exige el cuidado de la piel.',
  },
  {
    number: '03',
    title: 'Conexiones que permanecen',
    text: 'Un espacio para acercar práctica, investigación, industria y nuevas generaciones.',
  },
];

const audiences = [
  'Dermatólogos',
  'Médicos generales',
  'Residentes',
  'Enfermería dermatológica',
  'Investigadores',
  'Estudiantes',
  'Clínicas y consultorios',
  'Laboratorios y tecnología',
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="DermaFutura, inicio">
          <span className="brand-mark" aria-hidden="true">DF</span>
          <span>DERMAFUTURA<small>EXPO 2027</small></span>
        </a>
        <nav className="nav-links" aria-label="Navegación principal">
          <a href="#universo">Universo</a>
          <a href="#temas">Temas</a>
          <a href="#experiencia">Experiencia</a>
          <a href="#estado">Estado</a>
        </nav>
        <a className="nav-cta" href="#interes">Únete a la lista</a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-grid shell">
          <div className="hero-copy">
            <p className="eyebrow">Nueva plataforma dermatológica · México</p>
            <h1>La piel es<br />nuestro <em>futuro.</em></h1>
            <p className="hero-text">{site.tagline}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#interes">Quiero recibir noticias</a>
              <a className="button button-ghost" href="#temas">Explorar el universo</a>
            </div>
            <p className="status"><span /> {site.dateLabel} · {site.locationLabel}</p>
          </div>

          <div className="derma-stage" aria-label="Representación 3D conceptual de DermaFutura">
            <div className="orbit orbit-one" aria-hidden="true" />
            <div className="orbit orbit-two" aria-hidden="true" />
            <div className="halo" aria-hidden="true" />
            <img
              className="hero-art"
              src="/images/hero-dermafutura.png"
              alt="Escultura conceptual 3D que representa piel, ciencia y tecnología"
              fetchPriority="high"
            />
            {areas.slice(0, 4).map((area, index) => (
              <div className={`hero-chip chip-${index + 1}`} key={area.id}>
                <span>0{index + 1}</span>{area.name}
              </div>
            ))}
            <p className="concept-note">Visual conceptual 3D · No representa a una ponente real</p>
          </div>
        </div>

        <div className="hero-marquee" aria-hidden="true">
          <span>CIENCIA · PIEL · TECNOLOGÍA · FUTURO ·</span>
          <span>CIENCIA · PIEL · TECNOLOGÍA · FUTURO ·</span>
        </div>
        <a className="scroll-cue" href="#universo" aria-label="Continuar al universo DermaFutura">Desliza <i /></a>
      </section>

      <section className="universe light-section" id="universo">
        <div className="shell">
          <div className="section-intro split-intro">
            <p className="kicker">01 · El universo</p>
            <h2>Donde la medicina<br />se vuelve <em>cultura.</em></h2>
            <p>DermaFutura nace como una plataforma viva: rigurosa en su contenido, radical en su estética y profundamente humana en su propósito.</p>
          </div>

          <div className="concept-grid">
            <article className="concept-panel panel-rose">
              <span className="panel-index">01</span>
              <div className="cell-form cell-skin" aria-hidden="true" />
              <h3>Piel</h3><p>La superficie más visible de nuestra historia.</p>
            </article>
            <article className="concept-panel panel-mint">
              <span className="panel-index">02</span>
              <div className="cell-form cell-lens" aria-hidden="true" />
              <h3>Ciencia</h3><p>Rigor que transforma preguntas en posibilidades.</p>
            </article>
            <article className="concept-panel panel-plum">
              <span className="panel-index">03</span>
              <div className="cell-form cell-wave" aria-hidden="true" />
              <h3>Tecnología</h3><p>Herramientas para mirar más profundo y actuar mejor.</p>
            </article>
            <article className="concept-panel panel-coral">
              <span className="panel-index">04</span>
              <div className="cell-form cell-pearl" aria-hidden="true" />
              <h3>Cuidado</h3><p>Precisión clínica con una experiencia más humana.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="themes dark-section" id="temas">
        <div className="shell">
          <div className="section-intro themes-intro">
            <p className="kicker">02 · Áreas vivas</p>
            <h2>Seis formas de<br /><em>imaginar lo que sigue.</em></h2>
            <p>Mientras se confirman los especialistas, cada figura representa una disciplina real. Después, la misma tarjeta recibirá fotografía, nombre, credenciales y tema sin rehacer la página.</p>
          </div>

          <div className="theme-grid">
            {areas.map((area, index) => (
              <article className={`theme-card theme-${index + 1}`} key={area.id}>
                <div className="theme-visual">
                  <img src={area.image} alt={`Escultura 3D conceptual de ${area.name}`} loading="lazy" />
                  <span className="theme-orbit" aria-hidden="true" />
                  <span className="mode-label">Concepto · Área</span>
                </div>
                <div className="theme-copy">
                  <span>0{index + 1} / 06</span>
                  <h3>{area.name}</h3>
                  <p>{area.description}</p>
                  <small>{area.kicker}</small>
                </div>
              </article>
            ))}
          </div>

          <div className="speaker-switch">
            <p>Modo actual</p>
            <strong>ÁREAS</strong><span aria-hidden="true" /><strong className="muted">PONENTES</strong>
            <small>El cambio futuro será de contenido, no de diseño.</small>
          </div>
        </div>
      </section>

      <section className="manifesto" id="manifiesto">
        <div className="manifesto-line"><span>NO ES SOLO</span><em>UNA EXPO.</em></div>
        <div className="manifesto-line reverse"><span>ES UNA NUEVA</span><em>SUPERFICIE.</em></div>
        <p>Un encuentro pensado para que conocimiento, industria, tecnología y cuidado integral puedan mirarse de otra manera.</p>
      </section>

      <section className="experience light-section" id="experiencia">
        <div className="shell">
          <div className="section-intro split-intro">
            <p className="kicker">03 · La experiencia</p>
            <h2>Contenido serio.<br /><em>Energía inolvidable.</em></h2>
            <p>La estructura está lista para crecer desde una convocatoria temprana hasta una experiencia completa de programa, networking y zona de innovación.</p>
          </div>

          <div className="pillar-list">
            {pillars.map((pillar) => (
              <article key={pillar.number}>
                <span>{pillar.number}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
                <i aria-hidden="true">↗</i>
              </article>
            ))}
          </div>

          <div className="program-wrap">
            <div className="program-heading">
              <p className="kicker">Programa conceptual</p>
              <h3>Una jornada que<br />respira y evoluciona.</h3>
              <p>Los horarios y responsables aparecerán únicamente cuando estén confirmados.</p>
            </div>
            <div className="program-list">
              {programa.map((item, index) => (
                <article key={item.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div><small>{item.type}</small><h4>{item.title}</h4></div>
                  <p>{item.status}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="audience dark-section">
        <div className="shell audience-grid">
          <div className="audience-title">
            <p className="kicker">04 · Para quién</p>
            <h2>Para quienes<br />ven en la piel<br /><em>una frontera.</em></h2>
          </div>
          <div className="audience-list">
            {audiences.map((item, index) => (
              <div key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="build-state light-section" id="estado">
        <div className="shell">
          <div className="section-intro split-intro">
            <p className="kicker">05 · Estado del proyecto</p>
            <h2>Honesto hoy.<br /><em>Listo para mañana.</em></h2>
            <p>Nada inventado se publicará como dato real. La plataforma ya contempla el lugar exacto donde llegará cada pieza confirmada.</p>
          </div>
          <div className="phase-track">
            {[
              ['01', 'Ahora', 'Identidad, áreas, narrativa y captación'],
              ['02', 'Después', 'Fecha, sede, programa y especialistas'],
              ['03', 'Cuando corresponda', 'Boletos, pagos y operación privada'],
            ].map(([number, phase, text], index) => (
              <article className={index === 0 ? 'active' : ''} key={number}>
                <span>{number}</span><small>{phase}</small><h3>{text}</h3>
              </article>
            ))}
          </div>
          <div className="pending-strip">
            <p>Listo para sustituir</p>
            <span>Nombre final</span><span>Fecha</span><span>Sede</span><span>Ponentes</span><span>Programa</span><span>Patrocinadores</span><span>Boletos</span>
          </div>
        </div>
      </section>

      <section className="interest" id="interes">
        <div className="interest-glow" aria-hidden="true" />
        <div className="shell interest-grid">
          <div>
            <p className="kicker">Sé parte del origen</p>
            <h2>El futuro de la piel<br /><em>empieza antes.</em></h2>
            <p>Déjanos saber que quieres recibir los primeros anuncios cuando el canal oficial esté listo.</p>
          </div>
          <form className="interest-form">
            <label>Nombre<input type="text" name="nombre" placeholder="Tu nombre" autoComplete="name" /></label>
            <label>Correo<input type="email" name="email" placeholder="nombre@correo.com" autoComplete="email" /></label>
            <label>Perfil<select name="perfil" defaultValue=""><option value="" disabled>Selecciona una opción</option>{audiences.slice(0, 6).map((item) => <option key={item}>{item}</option>)}</select></label>
            <button type="button" disabled>Registro disponible próximamente</button>
            <small>El envío permanece desactivado hasta confirmar el canal y el aviso de privacidad.</small>
          </form>
        </div>
      </section>

      <section className="faq light-section" id="faq">
        <div className="shell faq-grid">
          <div><p className="kicker">06 · Preguntas frecuentes</p><h2>Lo que sabemos.<br /><em>Sin inventar.</em></h2></div>
          <div className="faq-list">
            {faq.map((item) => (
              <details key={item.question}>
                <summary>{item.question}<span aria-hidden="true">+</span></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-word">DERMAFUTURA</div>
        <div className="shell footer-bottom">
          <div className="brand"><span className="brand-mark" aria-hidden="true">DF</span><span>DERMAFUTURA<small>EXPO 2027</small></span></div>
          <p>Nombre, fecha, sede y datos de contacto por confirmar.</p>
          <a href="#inicio">Volver arriba ↑</a>
        </div>
      </footer>
    </main>
  );
}
