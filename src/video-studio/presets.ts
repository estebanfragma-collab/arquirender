import {basis, type Scene} from './model';
export const videoPresets = [
  {
    id: 'add-rain', label: 'Añadir lluvia',
    description: 'Elige un render seco. La IA anima la llegada de la lluvia; no necesitas una segunda imagen.',
    mode: 'animate', duration: 5, movement: 'fixed',
    prompt: 'One continuous five-second architectural weather shot from the single supplied reference. Keep the camera locked and preserve the exact building, furniture, materials and framing. Clouds gradually gather outside, gentle rain begins outdoors and exposed ground becomes wet with subtle reflections. Keep sheltered interiors dry. No rain inside rooms, no structural changes, no cuts or crossfades.'
  },
  {
    id: 'animate-night', label: 'Anochecer · experimental',
    description: 'Intenta oscurecer un render de día. Puede mover la cámara sin lograr el anochecer. Para definir el resultado final, usa «Conectar día y noche» con dos imágenes.',
    mode: 'animate', duration: 5, movement: 'fixed',
    prompt: 'One continuous five-second architectural lighting timelapse from the single daylight reference. Locked camera, unchanged architecture, furniture and materials. Daylight fades through sunset into night while existing interior and exterior lights gradually turn on. Preserve all geometry and framing. No added fixtures, cuts, crossfades or reconstruction.'
  },
  {
    "id": "approach",
    "label": "Acercamiento al proyecto",
    "description": "La cámara avanza hacia el acceso. Usa un render exterior donde se vea la entrada.",
    "mode": "animate",
    "duration": 10,
    "movement": "push",
    "prompt": "A continuous ten-second architectural tracking shot. The camera travels directly FORWARD toward the ground-floor entrance of the reference building, covering substantial distance. Begin in the wide street view and finish near the entrance where wood, glass and vegetation fill most of the frame. Constant purposeful forward travel with visible foreground parallax, gentle ease-out only at the very end. Preserve all architecture, floors, windows and materials. No lateral orbit, no cuts or dissolves."
  },
  {
    "id": "lateral",
    "label": "Desplazamiento lateral · experimental",
    "description": "Intenta un movimiento lateral corto sobre tu render. Puede alterar la arquitectura; revisa el resultado antes de usarlo para presentar el proyecto.",
    "mode": "animate",
    "duration": 5,
    "movement": "slide",
    "prompt": "One continuous five-second shot based strictly on the supplied architectural image. Attempt only a very small, slow lateral camera translation, keeping the same visible facade and composition throughout. Preserve the exact building silhouette, floor count, openings, structural elements, materials, terrain, vegetation and lighting of the reference. Do not reveal hidden sides or interiors. Do not add streets, vehicles, neighboring buildings, people or landscape elements absent from the reference. No orbit, redesign, geometry morphing or cuts. If lateral motion would require inventing unseen geometry, reduce the motion toward a static shot instead. Fidelity to the supplied project takes priority over movement."
  },
  {
    "id": "day-night",
    "label": "Conectar día y noche",
    "description": "Fusión gradual de la luz de día a la noche. Usa el mismo espacio y encuadre, primero de día y después de noche.",
    "mode": "transition",
    "duration": 5,
    "movement": "fixed",
    "prompt": "A five-second smooth cross-dissolve between the two supplied images. Blend daylight gradually into the supplied night view: sky darkens smoothly and existing lights appear progressively. Keep matching building edges aligned. Hold the first image for 0.5 seconds, blend continuously over the next 4 seconds with gentle ease-in and ease-out, then hold the final image for 0.5 seconds. Start the blend early; do not delay it until the end. No hard cuts, sudden switches, flashes, whip pans or geometry morphing. No added people, objects or text. Keep the camera still; create the transition through overlapping image opacity."
  },
  {
    "id": "render-transition",
    "label": "Entre dos renders",
    "description": "Fundido controlado de 1,5 segundos entre dos renders. Conserva ambas imágenes, sin movimiento de cámara ni costo de generación.",
    "mode": "transition",
    "duration": 5,
    "movement": "fixed",
    "prompt": "A five-second smooth cross-dissolve between the two supplied images. Use a classic editorial cross-dissolve between the two supplied renders. Fade out the first view while fading in the second. Preserve each image as a separate intact view instead of inventing a spatial camera route. Hold the first image for 0.5 seconds, blend continuously over the next 4 seconds with gentle ease-in and ease-out, then hold the final image for 0.5 seconds. Start the blend early; do not delay it until the end. No hard cuts, sudden switches, flashes, whip pans or geometry morphing. No added people, objects or text. Keep the camera still; create the transition through overlapping image opacity."
  },
  {
    "id": "aerial",
    "label": "Revelación aérea",
    "description": "La cámara retrocede y asciende desde la vista cercana hasta la vista aérea amplia. Usa dos vistas compatibles del mismo proyecto. Movimiento generado por IA.",
    "mode": "transition",
    "duration": 5,
    "movement": "rise",
    "prompt": "One continuous five-second aerial drone pullback between the supplied views of the same project. Begin at the exact close reference. Immediately start moving the camera smoothly backward and gradually upward, revealing the wider surroundings and reaching the wide final reference. Spread the retreat and ascent across the entire shot with gentle acceleration and deceleration. Preserve the building geometry, materials and landscape. No static hold followed by a jump, no hard cut, no sudden zoom, no orbit and no opacity dissolve replacing the physical camera movement. Do not invent a flight through walls or hidden rooms. A coherent continuous backward camera path is the priority."
  },
  {
    "id": "model",
    "label": "Giro de maqueta",
    "description": "La maqueta y su base giran juntas. Usa una imagen de una maqueta física con su base visible.",
    "mode": "animate",
    "duration": 5,
    "movement": "fixed",
    "prompt": "Product photography of a physical architectural scale model on its white display plinth. The entire model and plinth rotate together clockwise by approximately 35 degrees on a hidden turntable. The camera stays fixed at the same height and distance. Clearly visible rotation revealing the adjacent facade; miniature trees rotate with the base. Preserve every floor, window and miniature material. Soft studio light, static softly blurred background. No zoom, no morphing, no full-scale city transformation."
  },
  {
    "id": "rain",
    "label": "Conectar seco y lluvia",
    "description": "Fusión de la escena seca a la lluviosa. Usa el mismo encuadre: la humedad, las nubes y los reflejos aparecen gradualmente.",
    "mode": "transition",
    "duration": 5,
    "movement": "fixed",
    "prompt": "A five-second smooth cross-dissolve between the two supplied images. Blend the supplied dry view into the supplied rainy view. Cloud cover, wet surfaces and reflections appear progressively with the dissolve. Keep matching architecture aligned and sheltered interiors dry. Hold the first image for 0.5 seconds, blend continuously over the next 4 seconds with gentle ease-in and ease-out, then hold the final image for 0.5 seconds. Start the blend early; do not delay it until the end. No hard cuts, sudden switches, flashes, whip pans or geometry morphing. No added people, objects or text. Keep the camera still; create the transition through overlapping image opacity."
  },
  {
    "id": "material",
    "label": "Detalle de materiales",
    "description": "La cámara se desliza sobre una textura. Usa un primer plano del material que quieres mostrar.",
    "mode": "animate",
    "duration": 5,
    "movement": "slide",
    "prompt": "Architectural macro cinematography. A short smooth lateral camera slide of approximately 20 centimeters parallel to the textured concrete wall. Keep optical focus on the fine pores and grain of the wall; warm sunset grazes the texture. The distant glass frame and reflected mountains remain softly out of focus. Clearly visible subtle foreground parallax, constant focal length. Preserve the wall texture and straight metal profiles. No focus change, no orbit, no added objects, no morphing."
  },
  {
    "id": "roof",
    "label": "Revelar distribución",
    "description": "La cubierta se desvanece suavemente y aparece la distribución interior. Usa una vista con cubierta y otra compatible sin ella.",
    "mode": "transition",
    "duration": 5,
    "movement": "fixed",
    "prompt": "A five-second smooth cross-dissolve between the two supplied images. Use a gentle transparency dissolve from the supplied roofed house into the supplied roofless cutaway. The roof fades away while the furnished layout becomes visible. Do not lift, explode or demolish the roof; preserve the walls and furniture visible in each reference. Hold the first image for 0.5 seconds, blend continuously over the next 4 seconds with gentle ease-in and ease-out, then hold the final image for 0.5 seconds. Start the blend early; do not delay it until the end. No hard cuts, sudden switches, flashes, whip pans or geometry morphing. No added people, objects or text. Keep the camera still; create the transition through overlapping image opacity."
  }
] as const;
export function applyPreset(scene:Scene,id:string):Scene {
 const preset=videoPresets.find(p=>p.id===id);if(!preset||preset.mode!==scene.mode)return scene;
 const next:Scene={...scene,presetId:id,name:preset.label,mode:preset.mode,duration:preset.duration,movement:preset.movement,prompt:preset.prompt,notes:preset.description,brief:'',endId:preset.mode==='transition'?scene.endId:''};
 next.promptBasis=basis(next);return next;
}

export function presetsForMode(mode:Scene['mode']) {
 return videoPresets.filter(p=>p.mode===mode);
}

export function changeSceneMode(scene:Scene,mode:Scene['mode']):Scene {
 if(scene.mode===mode)return scene;
 // Keep references and user intent, but discard directions written for the other mode.
 return {...scene,mode,presetId:undefined,prompt:'',promptBasis:'',notes:'',movement:mode==='transition'?'fixed':'push',duration:5};
}
