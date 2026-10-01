/**
 * Minimal stand-in for Framer's runtime so the Framer section components in
 * /framer/sections render unchanged in this Next.js app. Property controls are
 * Framer-editor metadata only, so they are no-ops here.
 */
export const ControlType: Record<string, string> = new Proxy({}, { get: (_t, k) => String(k) });
export function addPropertyControls(..._args: unknown[]) {}
export function useIsStaticRenderer() {
  return false;
}
export const RenderTarget = { current: () => "PREVIEW", canvas: "CANVAS", preview: "PREVIEW" };
