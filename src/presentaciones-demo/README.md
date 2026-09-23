# Prototipo independiente de presentaciones

Abrir `/presentaciones-demo.html` con el servidor Vite (`npm run dev`).

La entrada de demostración sigue disponible sin sesión. La ruta /app/presentaciones abre el mismo editor en un documento aislado (?mode=app), para evitar que sus estilos afecten al generador. Este modo requiere la sesión existente de Supabase y consulta renders filtrados por user_id (además de RLS). No llama a IA ni consume créditos. Vite incluye ambas entradas en el build. La integración permanece local, pendiente de revisión antes de publicar.

Incluye cuatro composiciones, selección de hasta tres imágenes por página, incorporación de JPG/PNG/WebP locales, edición de título y descripción, creación, duplicación, eliminación y orden de páginas, y vista completa. Usa tres renders coherentes del edificio boutique proporcionados por Esteban. Las imágenes de ejemplo están comprimidas a WebP sin cambiar su contenido.

Guardado manual de un borrador en IndexedDB, base independiente arquirender-presentaciones-prototipo-v1. Incluye imágenes subidas como data URLs, páginas, orden y plantilla. Se recupera al recargar en el mismo navegador/origen. Borrar los datos del navegador elimina el borrador. Se avisa al salir con cambios sin guardar.

Exportación mediante impresión nativa: el usuario elige Guardar como PDF y desactiva encabezados/pies. Composición HTML y textos vectoriales, páginas horizontales de 300 × 200 mm o verticales de 210 × 280 mm. Espera fuentes e imágenes antes de imprimir. No hay IA ni almacenamiento de presentaciones en la nube todavía. En modo integrado sí se carga el historial y se guarda un borrador local por ID de cuenta, separado del borrador demo. Los textos de proyecto/estudio son datos de demostración.

Validación: recuperación tras recargar incluyendo una imagen subida; cambios de plantilla; exportación de las cuatro plantillas, dos páginas cada una, tamaños de página verificados y revisión visual; interfaz móvil sin desbordamiento; TypeScript del prototipo sin errores.

Integración verificada con sesión e historial simulados: bloqueo sin sesión, filtro por usuario, imágenes del historial sin ejemplos mezclados, recuperación del borrador de cuenta y separación respecto a la demo. Falta validación con sesión real del usuario y publicación. No se han cambiado tablas, políticas, generación ni cobros.
