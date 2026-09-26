import { beforeEach, describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { defaults, loadDrafts, recipe } from "./local-model";
beforeEach(() => localStorage.clear());
describe("40-style recipe catalog", () => {
  it("has 40 unique IDs and exactly three approved examples", () => {
    expect(new Set(CATALOG.map((p) => p.id)).size).toBe(40);
    expect(CATALOG.filter((p) => p.approved).map((p) => p.id)).toEqual([
      "P01",
      "P07",
      "P10",
    ]);
  });
  it("does not add portrait constraints to product, architectural or typographic recipes", () => {
    for (const id of ["P02", "P03", "P15"]) {
      const p = CATALOG.find((p) => p.id === id)!;
      const text = recipe(p, defaults(p));
      expect(text).not.toContain("persona principal");
    }
    const p = CATALOG.find((p) => p.id === "P15")!;
    expect(recipe(p, defaults(p))).toContain("Conserva la geometría");
  });
  it("recovers corrupt storage with the approved defaults", () => {
    localStorage.setItem("poster-lab-catalog-v1", "broken");
    const d = loadDrafts();
    expect(Object.keys(d)).toHaveLength(40);
    expect(d.P07.review).toBe("keep");
    expect(d.P02.review).toBe("pending");
  });
  it("delimits supplied event text and omits invented data", () => {
    const p = CATALOG[0];
    const d = { ...defaults(p), details: 'Mi evento "especial"' };
    const text = recipe(p, d);
    expect(text).toContain('Mi evento \\"especial\\"');
    expect(text).toContain("No inventes nombres");
  });
});

it("uses 9:16 for every style including saved older formats", () => {
 localStorage.setItem("poster-lab-catalog-v1", JSON.stringify({P02:{format:"cuadrado",remix:"Base 1:1",notes:"Conservar nota"}}));
 const drafts=loadDrafts();
 expect(drafts.P02.notes).toBe("Conservar nota");
 for (const p of CATALOG) {
  expect(drafts[p.id].format).toBe("story");
  expect(recipe(p,drafts[p.id])).toContain("FORMATO: 9:16");
  expect(recipe(p,drafts[p.id])).toContain("prevalece sobre cualquier formato");
 }
});
