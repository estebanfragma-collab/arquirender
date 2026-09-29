import {basis, type Scene} from './model';
export const videoPresets = [
  {
    id: 'add-rain', label: 'Añadir lluvia',
    description: 'Nubes, lluvia y un relámpago lejano sobre el mismo proyecto, con un acercamiento mínimo. Sin audio. Efecto experimental: revisa que conserve la arquitectura.',
    mode: 'animate', duration: 5, movement: 'push',
    prompt: 'A single uninterrupted five-second weather animation of the ONE supplied architectural image. The first and last frames must show the SAME exact house and surroundings from essentially the same viewpoint. Treat the building silhouette, floor count, roof, windows, balconies, furniture, rocks, trees and terrain as fixed reference geometry throughout. Animate ONLY the weather: storm clouds drift naturally into the visible sky, outdoor rain gradually begins and continues to the end, and existing exposed surfaces develop subtle wet reflections. Keep clouds above the building, sheltered interiors dry, and existing interior lights unchanged. Include one faint distant lightning glow within the clouds, without a full-frame flash or blackout. Silent video. Allow only a barely perceptible slow forward drift, keeping the whole original facade and revealing no hidden surfaces; stay fixed if motion would require inventing geometry. End on the original house under rain. No transition to another image or location, no cross-dissolve, no cut, no morphing, no replacement house, no new buildings, streets, pools, vehicles or people. Architectural fidelity takes priority over weather intensity and camera movement.'
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
    "description": "Acercamiento continuo hacia lo que ya se ve en tu render, sin pasar a otra escena. El resultado depende de la imagen y del modelo.",
    "mode": "animate",
    "duration": 10,
    "movement": "push",
    "prompt": "One continuous ten-second shot of the supplied architectural image. Move slowly FORWARD toward the visible architectural subject, along a single straight path with gentle ease-out. Keep the same room or exterior for the entire shot. Stop before entering doors, crossing walls or revealing unseen areas. Preserve the exact layout, floor count, openings, furniture, materials, vegetation and lighting. Do not assume a street or an entrance if absent from the image. No sideways motion, orbit, cut, cross-dissolve, image transition, morphing or replacement scene. Reduce travel rather than invent geometry. End looking at the same original subject."
  },
  {
    "id": "lateral",
    "label": "Movimiento lateral · en prueba",
    "description": "Pide un desplazamiento corto de lado en el mismo espacio. La IA puede desviarse o avanzar; todavía estamos validando este movimiento.",
    "mode": "animate",
    "duration": 5,
    "movement": "slide",
    "prompt": "One continuous five-second shot of the ONE supplied interior or exterior. Request ONLY a tiny slow camera translation to the RIGHT, parallel to the visible main wall or facade, at constant height, distance and focal length. No forward or backward travel, zoom, pan or orbit. Keep the original room or building, walls, openings, furniture, materials, vegetation and lighting unchanged. Do not reveal hidden corners or cross doorways. If the image provides insufficient room for lateral motion, remain nearly static instead of switching to a forward approach. No cuts, cross-dissolves, fades, image-to-image transitions, morphing, replacement architecture or new objects. The last frame must still show the same original space."
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
    "prompt": "One continuous five-second aerial drone pullback between the supplied views of the same project. Begin at the exact close reference. Immediately start moving the camera smoothly backward and gradually upward, revealing the wider surroundings and reaching the wide final reference. Spread the retreat and ascent across the entire shot with gentle acceleration and deceleration. Preserve the building geometry, materials and landscape. No static hold followed by a jump, no hard cut, no sudden zoom, no orbit and no opacity dissolve replacing the physical camera movement. Do not invent a flight through walls or hidden rooms. No cross-dissolves, fades, image swaps or morphing. Keep the same original project throughout; reduce travel if the supplied views cannot be connected without inventing architecture. A coherent continuous backward camera path is the priority."
  },
  {
    "id": "model",
    "label": "Giro suave de maqueta · en prueba",
    "description": "Pide un giro pequeño de la maqueta y su base, con cámara fija. Usa una maqueta física; revisa que no cambie el diseño.",
    "mode": "animate",
    "duration": 5,
    "movement": "fixed",
    "prompt": "One uninterrupted five-second shot of the physical architectural scale model supplied in the image. Keep the camera and original background fixed. Request ONLY a very small clockwise turn of the existing model and its base together, keeping all attached miniature elements rigidly connected. Preserve the original geometry, materials, scale and lighting. Do not create a new white plinth, trees or studio background. Keep the angle minimal; if it would expose unsupported hidden geometry, reduce rotation toward zero. No camera approach, zoom, orbit, cut, fade, cross-dissolve, image transition, morphing or transformation into a full-scale building. End on the same model."
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
    "label": "Movimiento sobre un detalle · en prueba",
    "description": "Pide un deslizamiento mínimo sobre el material que subes, sin cambiar de textura ni de escena. Usa un primer plano.",
    "mode": "animate",
    "duration": 5,
    "movement": "slide",
    "prompt": "One uninterrupted five-second close-up of ONLY the surface supplied in the image. Request a minimal slow sideways camera translation parallel to that surface, at constant distance, height, focal length and focus. Preserve its exact material, grain, colors, joints, edges, lighting and existing background. Do not assume concrete, metal, glass, mountains or sunset. Remain within the original visible surface; if there is no room, stay nearly fixed. No forward approach, zoom, orbit, focus transition, cuts, fades, cross-dissolves, image transitions, replacement texture, morphing or new objects. End on the same original detail."
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

// Keep retired definitions so saved projects remain readable.
export const availablePresetIds:readonly string[]=['add-rain','approach','lateral','day-night','render-transition','aerial','model','rain','roof'];
export function presetsForMode(mode:Scene['mode']) {
 return videoPresets.filter(p=>p.mode===mode&&availablePresetIds.includes(p.id));
}

export function changeSceneMode(scene:Scene,mode:Scene['mode']):Scene {
 if(scene.mode===mode)return scene;
 // Keep references and user intent, but discard directions written for the other mode.
 return {...scene,mode,presetId:undefined,prompt:'',promptBasis:'',notes:'',movement:mode==='transition'?'fixed':'push',duration:5};
}
