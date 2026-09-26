import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import PosterLab from "./PosterLab";
import { CATALOG } from "./catalog";
import { defaults, loadDrafts, recipe } from "./local-model";
beforeEach(() => { localStorage.clear(); vi.spyOn(window,"scrollTo").mockImplementation(() => {}); });
afterEach(() => {cleanup(); vi.restoreAllMocks();});
it("restores all 40 Kimi references and preserves style structure", () => {
 const {container}=render(<PosterLab />);
 expect(container.querySelectorAll(".pl-reference svg")).toHaveLength(40);
 expect(container.querySelector(".pc")).toBeNull();
 expect(CATALOG[3].remix).toContain("rayo");
 expect(CATALOG[6].remix).toContain("círculo rojo");
 expect(CATALOG.every(p=>p.remix.length>400 && p.sourceNote && p.ratio)).toBe(true);
});
it("persists edits to the remix and small changes without changing the reference",()=>{
 render(<PosterLab />);
 fireEvent.click(screen.getByRole("button",{name:/Referencia de Producto editorial/}));
 const src=screen.getByRole("img",{name:"Referencia de Producto editorial"}).querySelector("image")?.getAttribute("href");
 fireEvent.change(screen.getByRole("textbox",{name:"Prompt del remix"}),{target:{value:"Mi remix revisado"}});
 fireEvent.change(screen.getByRole("textbox",{name:/Cambios pequeños/}),{target:{value:"Solo el sello naranja pasa a verde"}});
 expect(loadDrafts().P02.remix).toBe("Mi remix revisado");
 expect(recipe(CATALOG[1],loadDrafts().P02)).toContain("Solo el sello naranja pasa a verde");
 expect(screen.getByRole("img",{name:"Referencia de Producto editorial"}).querySelector("image")?.getAttribute("href")).toBe(src);
 fireEvent.click(screen.getByRole("button",{name:"Restaurar remix base"}));
 expect(screen.getByRole("textbox",{name:"Prompt del remix"})).toHaveValue(CATALOG[1].remix);
});
it("ignores obsolete color/shape overrides and requests Spanish with original format",()=>{
 const p=CATALOG[3];
 localStorage.setItem("poster-lab-catalog-v1",JSON.stringify({P04:{color:"#12ab34",element:"arc",format:"vertical",notes:"Guardar nota"}}));
 const d=loadDrafts().P04;
 expect(d.notes).toBe("Guardar nota");
 const text=recipe(p,d);
 expect(text).toContain("FORMATO: 9:16");
 expect(text).toContain("IDIOMA: español");
 expect(text).toContain("Mantén los colores");
 expect(text).not.toContain("#12ab34");
 expect(text).not.toContain("No reproduzcas la composición");
});
