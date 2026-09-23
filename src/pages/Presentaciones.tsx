/** Separate document keeps the approved editor's CSS isolated from the renderer. */
export default function Presentaciones() {
  return <iframe
    title="ArquiRender · Editor de presentaciones"
    src="/presentaciones-demo.html?mode=app"
    style={{ width: '100%', height: '100dvh', display: 'block', border: 0 }}
  />;
}
