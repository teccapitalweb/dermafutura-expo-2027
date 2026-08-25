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

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="DermaFutura, inicio"><span className="brand-mark" aria-hidden="true">DF</span><span>DERMAFUTURA<small>EXPO 2027</small></span></a>
        <nav className="nav-links" aria-label="Navegación principal"><a href="#voces">Voces</a><a href="#programa">Programa</a><a href="#pases">Pases</a><a href="#sede">Sede</a></nav>
        <a className="nav-cta" href="#interes">Únete a la lista</a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grain" aria-hidden="true" /><div className="hero-rule hero-rule-left" aria-hidden="true" /><div className="hero-rule hero-rule-right" aria-hidden="true" />
        <div className="hero-editorial shell">
          <div className="hero-word hero-word-one" aria-hidden="true">DERMA</div><div className="hero-word hero-word-two" aria-hidden="true">FUTURA</div>
          <div className="hero-copy"><h1>El futuro<br />también tiene<br /><em>piel.</em></h1><div className="hero-actions"><a className="button button-primary" href="#voces">Explorar las voces</a><a className="button button-ghost" href="#interes">Recibir noticias</a></div></div>
          <div className="hero-cast" aria-label="Casting editorial conceptual de DermaFutura"><div className="cast-aura" aria-hidden="true" /><img className="hero-cast-image" src="/images/hero-cast-v3.png" alt="Seis mujeres adultas jóvenes en una composición editorial de moda médica" fetchPriority="high" /></div>
          <div className="hero-footnote"><p>Casting visual conceptual · No son ponentes confirmadas</p></div>
        </div>
      </section>

      <section className="opening paper-section" id="universo">
        <div className="shell opening-grid"><p className="section-tag">01 / El encuentro</p><div className="opening-title"><span>NO ES SOLO</span><h2>UNA EXPO.</h2><em>Es la nueva<br />superficie de<br />la dermatología.</em></div><div className="opening-copy"><p>Una plataforma donde medicina, tecnología, cultura y nuevas generaciones dejan de vivir en mundos separados.</p><a className="text-link" href="#programa">Descubrir la experiencia <span>↗</span></a></div></div>
        <div className="editorial-ribbon"><span>SCIENCE WITH STYLE · SKIN WITH A FUTURE ·</span><span>SCIENCE WITH STYLE · SKIN WITH A FUTURE ·</span></div>
      </section>

      <section className="voices ink-section" id="voces">
        <div className="shell voices-head"><p className="section-tag mint">02 / Protagonistas</p><h2>Quién va a<br /><em>tomar la palabra.</em></h2><p>La estructura está preparada para recibir fotografía, nombre, especialidad y tema de cada ponente confirmado. Por ahora presentamos el casting visual y las seis conversaciones que queremos abrir.</p></div>
        <div className="shell voices-spread"><figure className="voices-poster"><span className="poster-label">The future issue · 2027</span><div className="poster-word" aria-hidden="true">VOICES</div><img src="/images/hero-cast-v3.png" alt="Casting conceptual de seis futuras voces de DermaFutura" loading="lazy" /><figcaption>Casting conceptual · Identidades reales por confirmar</figcaption></figure><div className="voice-list">{areas.map((area,index)=><article key={area.id}><span>0{index+1}</span><div><small>Voz por anunciar</small><h3>{area.name}</h3><p>{area.kicker}</p></div><i>↗</i></article>)}</div></div>
      </section>

      <section className="runway paper-section" id="temas"><div className="shell runway-head"><p className="section-tag">03 / El universo</p><h2>SEIS MIRADAS.<br /><span>UNA MISMA PIEL.</span></h2></div><div className="runway-track">{areas.map((area,index)=><article className="runway-card" key={area.id}><div className={`runway-image real-person real-person-${index+1}`} role="img" aria-label={`Retrato editorial conceptual para ${area.name}`}><b>0{index+1}</b><small>Casting visual</small></div><h3>{area.name}</h3><p>{area.description}</p></article>)}</div><p className="runway-disclaimer shell">Retratos conceptuales generados para comunicar las áreas · No representan ponentes confirmados</p></section>

      <section className="pillars ink-section"><div className="shell pillars-grid"><div><p className="section-tag mint">04 / La promesa</p><h2>TRES FORMAS<br />DE HACERLO<br /><em>DIFERENTE.</em></h2></div><div className="pillar-list">{pillars.map(([number,title,text])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p><i>↗</i></article>)}</div></div></section>

      <section className="program paper-section" id="programa"><div className="program-watermark" aria-hidden="true">RUNWAY</div><div className="shell program-grid"><div className="program-intro"><p className="section-tag">05 / Programa</p><h2>Una jornada.<br /><em>Hora por hora.</em></h2><p>La agenda es conceptual. Los horarios, especialistas y formatos se sustituirán aquí cuando estén oficialmente confirmados.</p></div><div className="schedule">{programa.map((item,index)=><article key={item.id}><time>TBA — {String(index+1).padStart(2,'0')}</time><div><small>{item.type}</small><h3>{item.title}</h3><p>{item.status}</p></div><span>{index===2?'✦':'○'}</span></article>)}</div></div></section>

      <section className="audience ink-section" id="publicos"><div className="audience-word" aria-hidden="true">FOR YOU</div><div className="shell audience-grid"><div className="audience-intro"><p className="section-tag mint">06 / Para quién</p><h2>PARA QUIENES<br />VEN MÁS ALLÁ<br /><em>DE LA SUPERFICIE.</em></h2></div><div className="audience-list">{audiences.map(([number,title,text])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="passes" id="pases"><div className="pass-editorial"><p className="section-tag">07 / Pases</p><h2>YOUR<br />ACCESS<br /><em>ERA.</em></h2><p>La experiencia de acceso está diseñada. Precios, beneficios y enlaces de pago aparecerán únicamente cuando sean oficiales.</p></div><div className="pass-card"><div className="pass-top"><span>DERMAFUTURA / 2027</span><span>GENERAL ACCESS</span></div><div className="pass-price"><small>Desde</small><strong>POR<br />CONFIRMAR</strong><span>MXN</span></div><ul><li>Acceso al programa científico</li><li>Zona de innovación</li><li>Experiencias y networking</li><li>Beneficios por anunciar</li></ul><button type="button" disabled>Venta disponible próximamente</button><p>Sin cobros activos · Sin precios inventados</p></div></section>

      <section className="venue paper-section" id="sede"><div className="venue-city" aria-hidden="true">MÉXICO</div><div className="shell venue-grid"><div><p className="section-tag">08 / Dónde y cuándo</p><h2>La próxima<br /><em>capital de la piel.</em></h2></div><div className="venue-card"><small>Destino</small><strong>Ciudad por confirmar</strong><small>Fecha</small><strong>2027 · Por confirmar</strong><p>La sede, mapa, hospedaje y recomendaciones de viaje ocuparán este espacio cuando exista información oficial.</p></div></div></section>

      <section className="partners ink-section" id="aliados"><div className="shell partners-head"><p className="section-tag mint">09 / Aliados</p><h2>QUIENES HARÁN<br /><em>POSIBLE EL FUTURO.</em></h2><p>Logotipos y categorías aparecerán únicamente con confirmación y autorización de uso.</p></div><div className="partner-grid shell">{['Presenting partner','Skin science','Medical technology','Beauty innovation','Academic partner','Experience partner'].map((name,index)=><div key={name}><span>0{index+1}</span><strong>{name}</strong><small>Espacio disponible</small></div>)}</div></section>

      <section className="interest" id="interes"><div className="shell interest-grid"><div><p className="section-tag">10 / Sé parte del origen</p><h2>GET ON<br />THE <em>LIST.</em></h2><p>Recibe los primeros anuncios cuando el canal oficial esté listo.</p></div><form className="interest-form"><label>Nombre<input type="text" name="nombre" placeholder="Tu nombre" autoComplete="name" /></label><label>Correo<input type="email" name="email" placeholder="nombre@correo.com" autoComplete="email" /></label><label>Perfil<select name="perfil" defaultValue=""><option value="" disabled>Selecciona una opción</option>{audiences.map(([,title])=><option key={title}>{title}</option>)}</select></label><button type="button" disabled>Registro disponible próximamente</button><small>El envío permanecerá desactivado hasta confirmar el canal y el aviso de privacidad.</small></form></div></section>

      <section className="faq paper-section" id="faq"><div className="shell faq-grid"><div><p className="section-tag">11 / Preguntas</p><h2>TODO CLARO.<br /><em>NADA INVENTADO.</em></h2></div><div className="faq-list">{faq.map(item=><details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></div></section>

      <footer><div className="footer-word">DERMAFUTURA</div><div className="shell footer-bottom"><div className="brand"><span className="brand-mark">DF</span><span>DERMAFUTURA<small>EXPO 2027</small></span></div><p>Nombre, fecha, sede y contacto por confirmar.</p><a href="#inicio">Volver arriba ↑</a></div></footer>
    </main>
  );
}
