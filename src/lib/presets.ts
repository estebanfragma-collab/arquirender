/**
 * Presets de transformación para la pestaña Sketch → Render.
 *
 * Cada preset resuelve un trabajo que hoy exige pelear con el prompt a mano.
 * No envuelven selects del acordeón: los campos que escriben (transformacion,
 * preservar, negativePrompt) no tienen UI propia, y el acordeón sigue editable
 * después de aplicar uno.
 *
 * Los cuatro campos van SIEMPRE en inglés: construirPrompt (rama sketch) arma
 * prosa en inglés y los inyecta literalmente, así que cualquier español
 * produciría un prompt mixto.
 *
 * `descripcion` es la excepción: es UI, la lee el usuario, nunca llega al prompt.
 */
export type Preset = {
  id: string;
  nombre: string;
  descripcion: string;      // una línea, para el card
  transformacion: string;   // en inglés
  preservar: string[];      // en inglés
  iluminacion?: string;     // solo si el preset la fuerza
  negativePrompt: string;   // en inglés
  /**
   * Desde qué imagen conviene ejecutarlo.
   *  - "original": interpreta la realidad fotografiada. Encadenarlo sobre un
   *    render generado lo deja sin objeto (limpiar una escena ya limpia,
   *    terminar una obra ya terminada).
   *  - "ultimo": es una capa sobre una propuesta ya resuelta.
   * Es solo un aviso en la UI; nunca bloquea la generación.
   */
  base: "original" | "ultimo";
};

export const PRESETS: Preset[] = [
  {
    id: "acabados",
    nombre: "Cambio de acabados",
    descripcion: "Cambia pisos, paredes y carpintería sin mover un solo muro.",
    transformacion:
      "Replace only the surface finishes — floor, walls, ceiling and cabinetry — keeping every other element identical. Render the new materials with accurate physical properties: correct reflectance, grain direction, grout lines and edge detailing where materials meet",
    preservar: [
      "the exact geometry: wall positions, ceiling height, window and door openings",
      "furniture layout and position",
      "camera angle and perspective lines",
    ],
    negativePrompt:
      "moved walls, new openings, changed room proportions, rearranged furniture, generic tiled textures",
    base: "original",
  },
  {
    id: "plano-render",
    nombre: "Plano a render",
    descripcion: "Convierte una planta 2D en axonométrico seccionado a 1.2m.",
    transformacion:
      "Convert this 2D architectural floor plan into a photorealistic 3D axonometric cutaway render, cutting the walls at 1.2m height with a clean horizontal section",
    preservar: [
      "wall thicknesses, door and window positions and room dimensions exactly as drawn",
      "the furniture layout drawn in the plan",
    ],
    negativePrompt:
      "invented rooms, undrawn partitions or openings, dimension lines, room labels, text, north arrows, scale bars",
    base: "original",
  },
  {
    id: "staging",
    nombre: "Amoblado vs. vacío",
    descripcion: "Amobla un espacio vacío a escala real, sin tocar acabados.",
    transformacion:
      "Furnish this empty interior with furniture scaled correctly to the real dimensions of the space, adding soft textiles, one or two plants and subtle decorative objects on horizontal surfaces",
    preservar: [
      "flooring and wall finishes exactly as photographed",
      "the exact geometry and camera angle",
    ],
    negativePrompt:
      "people, oversized furniture, changed flooring, changed wall finishes, cluttered composition",
    base: "original",
  },
  {
    id: "nocturno",
    nombre: "Diurno / nocturno",
    descripcion: "Pasa la escena a noche con la luz artificial encendida.",
    transformacion:
      "Convert this daytime interior into a night scene with all artificial lighting on, visible pools of light and realistic falloff, and deep blue twilight sky outside the windows",
    preservar: [
      "every material, object and furniture piece",
      "the exact camera angle and framing",
    ],
    // Debe coincidir exacto con iluminacionSketch[1] de promptsArquitectonicos.ts,
    // o el select del acordeón queda sin marcar.
    iluminacion: "Night — warm 2700K pendant lamps, cozy mood",
    negativePrompt:
      "black sky, daylight leaking in, changed materials, moved objects, motion blur",
    base: "ultimo",
  },
  {
    id: "obra-gris",
    nombre: "Obra gris a terminado",
    descripcion: "Termina una obra en bruto respetando la estructura existente.",
    transformacion:
      "Transform this raw construction-stage interior into the finished space, installing final surfaces, lighting fixtures, door and window frames, skirting and trim",
    preservar: [
      "the structural shell, slab levels and existing openings",
      "the exact camera viewpoint",
    ],
    negativePrompt:
      "scaffolding, debris, exposed conduits, temporary supports, construction materials, workers, elements that could not physically exist given the visible structure",
    base: "original",
  },
  {
    id: "limpiar",
    nombre: "Limpiar escena",
    descripcion: "Quita desorden y endereza verticales sin rediseñar nada.",
    transformacion:
      "Clean this architectural photograph without changing the design: remove clutter and temporary elements, repair the surfaces revealed underneath, correct verticals to plumb and balance the exposure",
    preservar: [
      "every designed element: materials, furniture, lighting fixtures and finishes",
      "the exact camera angle and framing",
    ],
    negativePrompt:
      "people, loose cables, trash, cleaning equipment, temporary signage, plastic coverings, blown-out windows, converging verticals, restyled or redesigned elements",
    base: "original",
  },
  {
    id: "ampliar",
    nombre: "Ampliar encuadre",
    descripcion: "Extiende el encuadre a 16mm sin tocar el cuadro original.",
    transformacion:
      "Extend this interior beyond its current frame to a wider field of view, as if shot with a 16mm lens from the same camera position, continuing the existing planes along their real perspective lines and vanishing points",
    preservar: [
      "the entire original frame untouched",
      "wall thickness, ceiling height and flooring pattern continuation",
      "lighting direction and color temperature",
    ],
    negativePrompt:
      "architecturally implausible additions, new rooms, mismatched flooring alignment, changed lighting, any alteration inside the original frame",
    base: "ultimo",
  },
  {
    id: "personas",
    nombre: "Escala humana",
    descripcion: "Añade personas a escala para dar lectura de tamaño al local.",
    transformacion:
      "Add people to this commercial interior at correct human scale, naturally occupying the space — browsing, walking, seated — with plausible contact shadows and grounded feet, at a density that leaves the architecture legible",
    preservar: [
      "the architecture, materials, furniture and finishes exactly as they are",
      "the exact camera angle and framing",
      "existing lighting direction and color temperature",
    ],
    negativePrompt:
      "distorted faces, extra limbs, floating figures, missing contact shadows, oversized or undersized people, crowds blocking the architecture, recognizable brands or logos on clothing",
    base: "ultimo",
  },
];

/** Campos del formulario que un preset sobrescribe. */
export const CLAVES_PRESET = ["transformacion", "preservar", "iluminacion", "negativePrompt"] as const;
