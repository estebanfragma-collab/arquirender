import type { CSSProperties } from "react";
import type { CatalogPoster } from "./catalog";
import type { Draft } from "./local-model";
import "./poster-composition.css";
export default function PosterComposition(
  { poster, draft, photos = [] }: {
    poster: CatalogPoster;
    draft: Draft;
    photos?: { url: string; name: string }[];
  },
) {
  const portrait = ["portrait", "group"].includes(poster.kind);
  const source = photos[0]?.url ||
    (portrait ? "/poster-lab/retrato-base.png" : "");
  const style = {
    "--ink": draft.color,
    "--paper": draft.background,
    "--motif": draft.elementColor,
  } as CSSProperties;
  return (
    <div
      className={`pc pc-${poster.id} pc-${draft.format}`}
      style={style}
      role="img"
      aria-label={`Composición propia de ${poster.name}: ${draft.title}`}
    >
      <div
        className={`pc-motif pc-motif-${draft.element}`}
        aria-hidden="true"
      />
      <div className="pc-rule" aria-hidden="true" />
      <div className="pc-kicker">
        POSTER LAB <span>{poster.category.toUpperCase()}</span>
      </div>
      <div className="pc-heading">
        <strong>{draft.title}</strong>
        {draft.subtitle && <span>{draft.subtitle}</span>}
      </div>
      <div
        className={`pc-art ${source ? "" : "pc-art-empty"} ${
          portrait
            ? `pc-art-portrait ${
              !photos.length || draft.subject !== "solo" ? "pc-crop-person" : ""
            } ${draft.subject === "derecha" ? "pc-person-right" : ""}`
            : ""
        }`}
      >
        {source
          ? (
            <img
              src={source}
              alt=""
              style={{
                objectPosition: draft.subject === "derecha"
                  ? "right center"
                  : "left center",
              }}
            />
          )
          : (
            <div className="pc-placeholder" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>
                {poster.kind === "none"
                  ? "FORMA / COLOR"
                  : poster.kind === "product"
                  ? "TU PRODUCTO"
                  : poster.kind === "architecture"
                  ? "TU ESPACIO"
                  : poster.kind === "pets"
                  ? "TU MASCOTA"
                  : "TU IMAGEN"}
              </span>
            </div>
          )}
        {photos.length > 1 && (
          <div className="pc-additional">
            {photos.slice(1).map((f) => <img key={f.url} src={f.url} alt="" />)}
          </div>
        )}
      </div>
      <div className="pc-caption">{draft.details || "UNA MIRADA PROPIA"}</div>
      <div className="pc-footer">
        <span>{poster.id} / ESTUDIO VISUAL</span>
        <span>CREADO A TU MANERA</span>
      </div>
    </div>
  );
}
