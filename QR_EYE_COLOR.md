# Independent QR eye color

Open **Design Your QR Code → Color → Eye color**. Choose a circular color
swatch or use the rainbow custom color picker. The control uses the existing
site palette styling. It changes all three corner eyes while keeping the
selected eye shape and QR design.

Foreground colors and gradients do not overwrite a custom eye color. Use the
reset icon in the Eye color row to restore the default behavior. Applying a
new template or resetting the complete design restores that template's defaults.

The live preview, PNG export, and SVG export share the updated renderer.
Eye contrast is included in the download readability check.

Validation: TypeScript, all 10 QR tests (including actual decoding of codes
with custom eyes), 100 template checks, and the existing localization suite
passed. Standard and template QR output was visually compared. Browser-level
visual QA remains unavailable because the Chromium download failed; the
full production build remains unverified due to the earlier environment error.
