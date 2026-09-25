import {basis, type Scene} from './model';
export const videoPresets = [
  {
    id: 'add-rain', label: 'Añadir lluvia',
    description: 'Elige un render seco. La IA anima la llegada de la lluvia; no necesitas una segunda imagen.',
    mode: 'animate', duration: 5, movement: 'fixed',
    prompt: 'One continuous five-second architectural weather shot from the single supplied reference. Keep the camera locked and preserve the exact building, furniture, materials and framing. Clouds gradually gather outside, gentle rain begins outdoors and exposed ground becomes wet with subtle reflections. Keep sheltered interiors dry. No rain inside rooms, no structural changes, no cuts or crossfades.'
  },
  {
    id: 'animate-night', label: 'Hacer que anochezca',
    description: 'Elige un render de día. La IA anima el anochecer y el encendido de luces; no necesitas una imagen nocturna.',
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
    "label": "Recorrido lateral",
    "description": "La cámara se desplaza de lado. Usa un render de la fachada o del espacio que quieres recorrer.",
    "mode": "animate",
    "duration": 5,
    "movement": "slide",
    "prompt": "One continuous 5-second photorealistic architectural shot. Start from the exact reference image. Truck the camera RIGHT three metres along the street while panning slightly left to hold the glazed corner centered. Foreground trees and cars cross frame faster than the facade. Clear lateral parallax. Establish the specified movement immediately, maintain it through the middle, and ease out for a clean final half-second. Preserve the original building, floor count, facade materials, structural columns, window grid and proportions. No added floors, moving walls, melting glass, cuts, text or logos. Do not invent hidden interiors. Natural realistic perspective."
  },
  {
    "id": "day-night",
    "label": "Conectar día y noche",
    "description": "La iluminación pasa de día a noche. Usa el mismo espacio y encuadre: primero de día, después de noche.",
    "mode": "transition",
    "duration": 5,
    "movement": "fixed",
    "prompt": "Locked-off architectural timelapse. Start exactly at the daylight reference and finish exactly at the nighttime reference. Keep the camera fixed. Daylight fades through sunset into blue hour, the sky darkens, warm interior lights and soffit lights progressively switch on. Preserve the building geometry, floors, windows and materials. No orbit, no camera travel, no melting or reconstruction. A continuous lighting transformation, not a crossfade."
  },
  {
    "id": "render-transition",
    "label": "Entre dos renders",
    "description": "La cámara conecta dos vistas del mismo proyecto. Usa encuadres cercanos y compatibles, sin personas.",
    "mode": "transition",
    "duration": 5,
    "movement": "slide",
    "prompt": "A continuous architectural camera transition between the supplied two renders of the same project. Travel naturally from the initial view toward the final view. Preserve the architecture, furniture and materials, with no added people. No crossfade, no melting geometry, no abrupt jump. Use a short coherent camera path."
  },
  {
    "id": "aerial",
    "label": "Revelación aérea",
    "description": "La cámara retrocede y asciende. Usa una vista cercana como inicio y una vista aérea amplia como final.",
    "mode": "transition",
    "duration": 5,
    "movement": "rise",
    "prompt": "One continuous aerial drone pullback. Start close to the house at the exact first reference. Fly backward and rise steadily, revealing the whole garden, forest and distant landscape, ending at the wide aerial reference. Strong visible retreat and elevation change throughout the shot. Keep the house rigid and unchanged, no orbit, no dissolves or transformations. Smooth controlled deceleration at the end."
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
    "description": "El clima cambia de seco a lluvioso. Usa el mismo encuadre: primero seco, después con lluvia.",
    "mode": "transition",
    "duration": 5,
    "movement": "fixed",
    "prompt": "Locked tripod architectural weather timelapse, same house and same camera throughout. Begin with the dry daylight reference. Clouds gradually thicken, light becomes overcast, rain starts gently then grows, the deck and gravel gradually darken with moisture and puddles develop realistic reflections. Finish at the rainy reference. Preserve every wall, window, roof line and object. Continuous weather evolution, no crossfade, no orbit, no zoom, no structural changes."
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
    "description": "La cubierta se eleva para mostrar el interior. Usa la casa con cubierta al inicio y una vista compatible sin cubierta al final.",
    "mode": "transition",
    "duration": 5,
    "movement": "rise",
    "prompt": "Architectural exploded-view reveal in one continuous shot. Start at the supplied completed house aerial view. Its roof lifts vertically upward as one intact rigid assembly, progressively uncovering the furnished rooms beneath. Gently raise and tilt the camera downward to reach the supplied cutaway view. End with the roof out of frame and the room layout visible. Preserve all existing walls, furniture, openings and floor levels. The roof must physically lift, not dissolve or melt. No demolition, no orbit, no collapsing walls, no jump cut."
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
