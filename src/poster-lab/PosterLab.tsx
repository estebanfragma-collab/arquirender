import {type LayerTemplate} from "./layers";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { CATALOG, type CatalogPoster } from "./catalog";
import {
  defaults,
  type Draft,
  loadDrafts,
  recipe,
  type Review,
  REVIEW_LABELS,
} from "./local-model";
import "./poster-lab.css";
import ReferencePoster from "./ReferencePoster";
import LayerEditor from "./LayerEditor";

const categories = ["Todos", ...new Set(CATALOG.map((p) => p.category))];
export default function PosterLab() {
  const [layerMode,setLayerMode] = useState<false | LayerTemplate>(false);
  const [drafts, setDrafts] = useState(loadDrafts),
    [selected, setSelected] = useState("P07"),
    [editing, setEditing] = useState(false);
  const [category, setCategory] = useState("Todos"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all");
  const [photos, setPhotos] = useState<
      Record<string, { url: string; name: string }[]>
    >({}),
    [results, setResults] = useState<Record<string, string>>({}),
    [message, setMessage] = useState("");
  const urls = useRef<string[]>([]);
  const p = CATALOG.find((x) => x.id === selected)!;
  const d = drafts[selected] || defaults(p);
  useEffect(() => {
    document.title = `Poster Lab — ${CATALOG.length} formas de crear`;
    return () => urls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("poster-lab-catalog-v1", JSON.stringify(drafts));
    } catch {
      setMessage(
        "No se pudo guardar en este navegador. Exporta tu selección para conservarla.",
      );
    }
  }, [drafts]);
  const patch = (change: Partial<Draft>) =>
    setDrafts((old) => ({ ...old, [selected]: { ...d, ...change } }));
  const counts = Object.fromEntries(
    Object.keys(REVIEW_LABELS).map((s) => [
      s,
      CATALOG.filter((x) => drafts[x.id]?.review === s).length,
    ]),
  );
  const visible = CATALOG.filter((x) =>
    (category === "Todos" || x.category === category) &&
    (filter === "all" || drafts[x.id]?.review === filter) &&
    `${x.name} ${x.category}`.toLocaleLowerCase().includes(
      query.toLocaleLowerCase(),
    )
  );
  function edit(item: CatalogPoster) {
    setSelected(item.id);
    setEditing(true);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function download(name: string, value: string, type = "text/plain") {
    const url = URL.createObjectURL(new Blob([value], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportAll() {
    download(
      "poster-lab-seleccion.json",
      JSON.stringify(
        {
          version: 1,
          date: new Date().toISOString(),
          mode: "local",
          presets: CATALOG.map((x) => ({
            id: x.id,
            name: x.name,
            visualTestApproved: x.approved,
            ...drafts[x.id],
          })),
        },
        null,
        2,
      ),
      "application/json",
    );
    setMessage(
      "Selección exportada. Las fotos y resultados no se incluyen en este archivo.",
    );
  }
  function upload(files: FileList | null, result = false) {
    if (!files?.length) return;
    const list = Array.from(files);
    if (
      list.length > 3 ||
      list.some((f) =>
        !["image/png", "image/jpeg", "image/webp"].includes(f.type) ||
        f.size > 8 * 1024 * 1024
      )
    ) {
      setMessage("Usa hasta 3 fotos JPG, PNG o WebP de hasta 8 MB cada una.");
      return;
    }
    const loaded = list.map((f) => {
      const url = URL.createObjectURL(f);
      urls.current.push(url);
      return { url, name: f.name };
    });
    if (result) setResults((old) => ({ ...old, [selected]: loaded[0].url }));
    else setPhotos((old) => ({ ...old, [selected]: loaded }));
    setMessage(
      result
        ? "Resultado cargado. Ya puedes evaluarlo."
        : "Fotos listas para esta prueba. Permanecen solo en esta sesión.",
    );
  }
  const preview = (item: CatalogPoster, large = false) => (
    <div className={(large ? "pl-preview" : "pl-card-photo") + " pl-reference"}>
      <ReferencePoster poster={item} />
    </div>
  );
  if(layerMode) return <LayerEditor key={layerMode} template={layerMode} onBack={()=>setLayerMode(false)}/>;
  return (
    <div className="pl">
      <header className="pl-header">
        <a className="pl-brand" href="/poster-lab">
          <span>p.</span> poster lab <small>ESTUDIO CREATIVO</small>
        </a>
        <span className="pl-local">● Modo local · sin consumo</span>
      </header>
      <main>
        {!editing
          ? (
            <>
              <section className="pl-intro">
                <div>
                  <p className="pl-eyebrow">{CATALOG.length} FORMAS DE CONTAR TU IDEA</p>
                  <h1>
                    Tu próximo póster.<br />
                    <em>Empieza aquí.</em>
                  </h1>
                  <p>
                    Explora, personaliza y decide qué estilos se quedan en tu
                    colección.
                  </p>
                </div>
                <div className="pl-intro-note">
                  <span>LA COLECCIÓN / 01</span>
                  <p>
                    {CATALOG.length} referencias de Kimi.<br />El mismo estilo, paso a paso.
                  </p>
                </div>
              </section>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P03");window.scrollTo(0,0);}}>Probar editor por capas · Minimal diagonal</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P07");window.scrollTo(0,0);}}>Probar editor por capas · Retrato suizo</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P01");window.scrollTo(0,0);}}>Probar editor por capas · Conferencista geométrico</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P02");window.scrollTo(0,0);}}>Probar editor por capas · Producto editorial</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P04");window.scrollTo(0,0);}}>Probar editor por capas · Collage eléctrico</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P05");window.scrollTo(0,0);}}>Probar editor por capas · Cine nocturno</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P06");window.scrollTo(0,0);}}>Probar editor por capas · Tipografía gigante</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P08");window.scrollTo(0,0);}}>Probar editor por capas · Ondas experimentales</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P09");window.scrollTo(0,0);}}>Probar editor por capas · Galería fotográfica</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P10");window.scrollTo(0,0);}}>Probar editor por capas · Retrato fragmentado</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P11");window.scrollTo(0,0);}}>Probar editor por capas · Revista de arquitectura</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P12");window.scrollTo(0,0);}}>Probar editor por capas · Conferencia en bloques</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P13");window.scrollTo(0,0);}}>Probar editor por capas · Mascotas y compañía</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P14");window.scrollTo(0,0);}}>Probar editor por capas · Música en semitono</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P15");window.scrollTo(0,0);}}>Probar editor por capas · Arquitectura de impacto</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P16");window.scrollTo(0,0);}}>Probar editor por capas · Geometría en papel</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P17");window.scrollTo(0,0);}}>Probar editor por capas · Archivo cultural</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P18");window.scrollTo(0,0);}}>Probar editor por capas · Retrato futurista</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P19");window.scrollTo(0,0);}}>Probar editor por capas · Foto y acento rojo</button>
              <button className="pl-secondary" onClick={()=>{setLayerMode("P20");window.scrollTo(0,0);}}>Probar editor por capas · Texto en perspectiva</button>
              <div className="pl-review-summary">
                {(Object.keys(REVIEW_LABELS) as Review[]).map((s) => (
                  <button
                    className={filter === s ? "active" : ""}
                    key={s}
                    onClick={() => setFilter(filter === s ? "all" : s)}
                    aria-pressed={filter === s}
                  >
                    <strong>{counts[s]}</strong> {REVIEW_LABELS[s]}
                  </button>
                ))}
                <button className="pl-export" onClick={exportAll}>
                  <Download size={15} /> Exportar selección
                </button>
              </div>
              <div className="pl-gallery-tools">
                <div className="pl-categories">
                  {categories.map((c) => (
                    <button
                      key={c}
                      className={category === c ? "active" : ""}
                      onClick={() => setCategory(c)}
                      aria-pressed={category === c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <label className="pl-search">
                  <Search size={17} />
                  <input
                    aria-label="Buscar estilo"
                    placeholder="Busca tu estilo…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="pl-gallery-count">
                <span>
                  {visible.length} {visible.length === 1 ? "estilo" : "estilos"}
                  {" "}
                  {filter !== "all"
                    ? `· ${REVIEW_LABELS[filter as Review]}`
                    : ""}
                </span>
                {(filter !== "all" || query || category !== "Todos") && (
                  <button
                    onClick={() => {
                      setFilter("all");
                      setQuery("");
                      setCategory("Todos");
                    }}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
              <section className="pl-cards pl-catalog" aria-label="Estilos">
                {visible.map((item) => (
                  <button
                    key={item.id}
                    className="pl-card"
                    onClick={() => edit(item)}
                  >
                    {preview(item)}
                    <div className="pl-card-info">
                      <div className="pl-card-meta">
                        <span>{item.category}</span>
                        <span>{item.id}</span>
                      </div>
                      <strong>{item.name}</strong>
                      <div className="pl-card-bottom">
                        <span className={`pl-badge ${drafts[item.id]?.review}`}>
                          {REVIEW_LABELS[drafts[item.id]?.review || "pending"]}
                        </span>
                        <ArrowUpRight size={17} />
                      </div>
                      <small>
                        Referencia Kimi · remix en español
                      </small>
                    </div>
                  </button>
                ))}
              </section>
              {!visible.length && (
                <div className="pl-empty">
                  No hay estilos con estos filtros. Prueba otra categoría o
                  borra la búsqueda.
                </div>
              )}
            </>
          )
          : (
            <>
              <button
                className="pl-back"
                onClick={() => {
                  setEditing(false);
                  setMessage("");
                }}
              >
                <ArrowLeft size={16} /> Volver a los {CATALOG.length} estilos
              </button>
              <div className="pl-editor-heading">
                <div>
                  <p className="pl-eyebrow">
                    {p.id} / {p.category.toUpperCase()}
                  </p>
                  <h1>{p.name}</h1>
                  <p>
                    Conservamos el diseño y los colores. Cambiamos solo lo que tú indiques.
                  </p>
                </div>
                <span className={`pl-badge ${d.review}`}>
                  {REVIEW_LABELS[d.review]}
                </span>
              </div>
              <button className="pl-secondary" onClick={()=>{setLayerMode(p.id as LayerTemplate);window.scrollTo(0,0);}}>Editar este diseño por capas</button>
              <section className="pl-workspace">
                <div className="pl-controls">
                  <p className="pl-eyebrow">01 / PERSONALIZA</p>
                  <h2>Los detalles los pones tú.</h2>
                  {p.kind !== "none"
                    ? (
                      <>
                        <label className="pl-upload">
                          <input
                            aria-label="Subir fotos"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(e) => upload(e.target.files)}
                          />
                          <Upload size={24} />
                          <span>
                            <strong>
                              {p.kind === "product"
                                ? "Sube tu producto"
                                : p.kind === "architecture"
                                ? "Sube tu arquitectura"
                                : p.kind === "pets"
                                ? "Sube tus mascotas"
                                : "Sube tus fotos"}
                            </strong>
                            <small>
                              Hasta 3 fotos · JPG, PNG o WebP · 8 MB cada una
                            </small>
                          </span>
                        </label>
                        {photos[selected]?.length > 0 && (
                          <div className="pl-photo-list">
                            {photos[selected].map((f, i) => (
                              <figure key={f.url}>
                                <img
                                  src={f.url}
                                  alt={`Foto de referencia ${i + 1}`}
                                />
                                <figcaption>{f.name}</figcaption>
                              </figure>
                            ))}
                            <button
                              onClick={() =>
                                setPhotos((old) => ({
                                  ...old,
                                  [selected]: [],
                                }))}
                            >
                              Quitar fotos
                            </button>
                          </div>
                        )}
                      </>
                    )
                    : (
                      <p className="pl-local-note">
                        Este estilo se crea con formas y texto. No necesitas
                        subir una foto.
                      </p>
                    )}
                  {p.kind === "portrait" && (
                    <label>
                      ¿A quién conservamos?<select
                        value={d.subject}
                        onChange={(e) => patch({ subject: e.target.value })}
                      >
                        <option value="solo">La persona principal</option>
                        <option value="izquierda">
                          La persona de la izquierda
                        </option>
                        <option value="derecha">
                          La persona de la derecha
                        </option>
                      </select>
                    </label>
                  )}
                  <label>
                    Título <span>{d.title.length}/70</span>
                    <input
                      value={d.title}
                      maxLength={70}
                      onChange={(e) => patch({ title: e.target.value })}
                    />
                  </label>
                  <label>
                    Subtítulo <span>Opcional</span>
                    <input
                      value={d.subtitle}
                      maxLength={100}
                      onChange={(e) => patch({ subtitle: e.target.value })}
                    />
                  </label>
                  <p className="pl-local-note">Formato de salida: <strong>9:16 vertical</strong> · proporción de 1080 × 1920.</p>
                  <label>
                    Cambios pequeños <span>Opcional</span>
                    <textarea rows={3} value={d.tweaks} maxLength={2000}
                      onChange={(e) => patch({ tweaks: e.target.value })}
                      placeholder="Por ejemplo: cambia únicamente el círculo rojo por azul. Conserva todo lo demás." />
                  </label>
                  <p className="pl-hint">Sin ajustes, se mantienen los colores, las formas y la distribución de Kimi. La referencia permanece intacta; verás los cambios cuando generes una prueba.</p>
                  <details className="pl-remix" open>
                    <summary>Remix base en español</summary>
                    <p className="pl-hint">{p.sourceNote}</p>
                    <label>Prompt del remix
                      <textarea rows={12} value={d.remix} maxLength={12000}
                        onChange={(e) => patch({ remix: e.target.value })} />
                    </label>
                    <button type="button" className="pl-secondary" onClick={() => patch({remix:p.remix})}>Restaurar remix base</button>
                    <a className="pl-secondary" href={p.image} target="_blank" rel="noreferrer">Ver captura original y texto de Kimi</a>
                  </details>
                  <label>
                    Información adicional <span>Opcional</span>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      placeholder="Nombre, fecha, lugar, programa o notas que sí deben aparecer…"
                      value={d.details}
                      onChange={(e) => patch({ details: e.target.value })}
                    />
                  </label>
                  {p.kind === "scene" && (
                    <label>
                      Describe la escena<textarea
                        rows={3}
                        maxLength={600}
                        placeholder="Una calle de piedra iluminada por faroles al anochecer…"
                        value={d.scene}
                        onChange={(e) => patch({ scene: e.target.value })}
                      />
                    </label>
                  )}
                  <button
                    className="pl-generate"
                    disabled={!d.title.trim()}
                    onClick={() => {
                      download(`${p.id}-instrucciones.txt`, recipe(p, d));
                      setMessage(
                        "Prueba preparada. Adjunta la referencia de Kimi y tus fotos al generador, y usa el prompt descargado. Después carga aquí el resultado.",
                      );
                    }}
                  >
                    <Download size={18} /> Preparar prueba{" "}
                    <span>Descargar instrucciones</span>
                  </button>
                  <p className="pl-hint">
                    Estamos preparando la app local. La generación integrada se
                    conectará después. Puedes probar estas instrucciones en tu
                    generador y volver con el resultado.
                  </p>
                  <details>
                    <summary>Ver prompt final para la prueba</summary>
                    <pre>{recipe(p,d)}</pre>
                    <button
                      className="pl-secondary"
                      onClick={() =>
                        navigator.clipboard.writeText(recipe(p, d)).then(() =>
                          setMessage("Instrucciones copiadas.")
                        ).catch(() =>
                          setMessage(
                            "Selecciona y copia las instrucciones manualmente.",
                          )
                        )}
                    >
                      Copiar instrucciones
                    </button>
                  </details>
                  <section className="pl-evaluate">
                    <p className="pl-eyebrow">02 / DECIDE QUÉ SE QUEDA</p>
                    <h2>¿Cómo salió la prueba?</h2>
                    <label className="pl-upload">
                      <input
                        aria-label="Cargar resultado de prueba"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => upload(e.target.files, true)}
                      />
                      <Upload size={20} />
                      <span>
                        <strong>Cargar resultado de prueba</strong>
                        <small>Compara el resultado con la referencia de Kimi</small>
                      </span>
                    </label>
                    <label>
                      Tu decisión<select
                        value={d.review}
                        onChange={(e) =>
                          patch({ review: e.target.value as Review })}
                      >
                        {Object.entries(REVIEW_LABELS).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Notas de la prueba<textarea
                        rows={3}
                        maxLength={1000}
                        value={d.notes}
                        onChange={(e) => patch({ notes: e.target.value })}
                        placeholder="Parecido, texto legible, composición, qué cambiarías…"
                      />
                    </label>
                    <p className="pl-hint">
                      Textos, decisiones y notas se guardan en este navegador.
                      Las fotos y resultados duran esta sesión. Exporta la
                      selección para conservar una copia.
                    </p>
                  </section>
                </div>
                <div className="pl-result">
                  <div className="pl-preview-label">
                    <span>
                      REFERENCIA · MARCO 9:16
                    </span>
                    <small>{p.name}</small>
                  </div>
                  {preview(p, true)}
                  <p className="pl-example-note">
                    Referencia original sin deformar dentro de un marco 9:16. Los márgenes son solo de la vista previa: el prompt pide adaptar el diseño al lienzo completo en español.
                  </p>
                  {results[selected] && (
                    <div className="pl-uploaded-result">
                      <p className="pl-eyebrow">TU RESULTADO DE PRUEBA</p>
                      <img
                        src={results[selected]}
                        alt="Resultado de prueba cargado"
                      />
                      <button
                        className="pl-secondary"
                        onClick={() =>
                          setResults((old) => {
                            const next = { ...old };
                            delete next[selected];
                            return next;
                          })}
                      >
                        Quitar resultado
                      </button>
                    </div>
                  )}
                  <div className="pl-direction">
                    <SlidersHorizontal size={16} />
                    <p>{p.direction}</p>
                  </div>
                </div>
              </section>
            </>
          )}
        <p role="status" className="pl-message">{message}</p>
        <footer>
          POSTER LAB <span>Primero crear. Después conectar.</span>
          <button onClick={exportAll}>Exportar selección</button>
        </footer>
      </main>
    </div>
  );
}
