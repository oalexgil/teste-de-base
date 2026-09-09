# Tom de Base

**Browser-based computer vision experiment for cosmetic shade matching with CIELAB, ITA° and CIEDE2000.**

Tom de Base measures color from selected facial regions, estimates a skin-color profile, ranks a synthetic foundation catalog and follows color change during application. The current prototype runs in the browser and uses MediaPipe face landmarks to keep sampling regions aligned with the face.

> Status: functional research prototype. It is **not** a validated colorimeter, clinical tool or guarantee of the correct cosmetic SKU.

The product name is **Tom de Base**; the repository is still named `teste-de-base`.

## What the prototype does

- opens the camera with browser permission;
- detects a single face with MediaPipe Face Landmarker;
- samples forehead, both cheeks, chin and an estimated neck region;
- applies an optional white-reference channel calibration;
- converts sampled sRGB values to CIELAB;
- calculates ITA° and a prototype undertone bucket;
- ranks 36 synthetic shade candidates using CIEDE2000 (ΔE00);
- lets the user override the automatic candidate;
- records a bare-skin baseline and estimates application progress by region;
- gives optional spoken coaching while makeup is being applied.

Camera frames are processed in the browser. The app has no project-controlled backend or image-upload endpoint. Runtime libraries/model assets are still downloaded from third-party hosts; see [SECURITY.md](SECURITY.md) for the exact privacy boundary.

## Demo

When GitHub Pages is enabled from the repository root, the expected project URL is:

`https://oalexgil.github.io/teste-de-base/`

Camera access requires a secure context (`https://` or `http://localhost`). Opening `index.html` directly with `file://` is not a supported test path.

## Why this project is technically interesting

The difficult part is not drawing a color swatch. Consumer cameras continuously alter exposure and white balance, face landmarks must stay attached to anatomically meaningful regions, and the color comparison needs deterministic math that can be regression-tested.

The prototype therefore separates the problem conceptually into four layers:

1. **vision** — find and track sampling regions;
2. **capture/calibration** — reduce camera/lighting variation;
3. **color science** — convert to Lab and compute ΔE00;
4. **product heuristics** — rank shades and guide application.

The runtime is still implemented in a single `index.html`; [ARCHITECTURE.md](ARCHITECTURE.md) documents the current technical debt and the planned module boundaries.

## Color pipeline

### Sampling

Four facial regions are sampled from MediaPipe landmarks: forehead, right cheek, left cheek and chin. A fifth region is estimated below the chin for a neck comparison.

Within each sample patch, pixels are sorted by luminance and the darkest/lightest quartiles are discarded before averaging. This is a lightweight attempt to reduce contamination from highlights, shadows and hair; it is not a substitute for semantic skin segmentation.

### sRGB → CIELAB

The current implementation converts camera sRGB values to linear RGB, XYZ D65 and CIELAB.

### CIEDE2000

Shade candidates are ranked by ΔE00. The implementation is now protected by automated regression tests using published CIEDE2000 reference pairs from Sharma, Wu and Dalal.

### ITA°

The prototype calculates Individual Typology Angle from Lab values and displays the current six-band classification used by the application.

### Undertone

The current `frio / neutro / quente` classification is a **prototype heuristic based on hue angle in the a*b* plane**. It is not presented as an industry standard and needs empirical validation before product use.

## Synthetic shade catalog

The built-in 36-shade wall is generated mathematically from lightness and hue parameters. It does **not** represent measured products from a cosmetic brand.

That means the prototype can demonstrate ranking behavior, interface flow and application tracking, but cannot honestly claim SKU-level recommendation accuracy.

For a real catalog, physical product samples should be measured under controlled conditions with a colorimeter or spectrophotometer and stored with measurement metadata.

## White-reference calibration

The calibration control estimates per-channel gains from a white object in the central frame region. It helps investigate whether simple normalization reduces camera color drift.

It does not solve every capture problem. Automatic exposure, tone mapping, device-specific camera processing, mixed illumination and reflected environmental color can still move the result substantially.

The empirical validation plan is documented in [VALIDATION.md](VALIDATION.md).

## Running locally

No build step is required for the deployed application.

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Allow camera access when requested.

## Automated tests

Node.js is used only for repository tests; it is not a runtime dependency of the deployed page.

Requirements:

- Node.js 20+

Run:

```bash
npm test
```

The current regression suite extracts the **actual deployed color-science block from `index.html`** and checks it directly. This avoids maintaining a second copy of the formulas while the application is still monolithic.

Protected behavior currently includes:

- sRGB white/black reference endpoints;
- sRGB red → CIELAB D65 reference value;
- CIEDE2000 reference pairs and symmetry;
- current ITA° bucket boundaries;
- current prototype undertone thresholds.

GitHub Actions runs these tests on pull requests to `main`.

## Current limitations

### Camera ≠ colorimeter

A phone or webcam is not a calibrated measurement instrument. Automatic white balance and exposure can shift Lab values even when the physical skin color has not changed.

### Lighting sensitivity

Warm light, mixed light, colored walls and backlight can alter the measurement. A controlled validation protocol is required before accuracy claims.

### Synthetic catalog

The demo shades are generated, not measured from commercial foundation products.

### Face/neck sampling

The neck point is geometrically estimated below the chin. Occlusion, pose, hair, hands and brushes can disrupt sampling.

### Monolithic runtime

Camera, vision, color science, calibration, application heuristics and UI currently live in one HTML module. The next engineering refactor is to extract pure color functions first, then isolate camera/vision state.

### External runtime dependencies

MediaPipe code/model files and fonts are fetched from third-party hosts. A production version should review CSP, asset self-hosting and supply-chain controls.

## Validation before productization

The next important milestone is not adding more UI. It is measuring repeatability.

At minimum, test the same participants across:

- repeated captures in one session;
- indirect daylight, neutral LED, warm light and mixed light;
- calibration off/on;
- Android Chrome, desktop Chrome and iPhone Safari;
- a broad range of measured skin colors.

Track Lab dispersion, pairwise ΔE00, shade-ranking stability, landmark dropout and processing latency. See [VALIDATION.md](VALIDATION.md).

## Repository map

```text
.
├── index.html                  current browser prototype
├── tests/
│   └── color-science.test.js   regression tests against deployed math
├── .github/workflows/ci.yml    automated CI
├── ARCHITECTURE.md             current + target architecture
├── VALIDATION.md               empirical validation plan
├── SECURITY.md                 privacy/security boundaries
├── package.json                development/test commands only
├── .nojekyll                   explicit GitHub Pages behavior
├── .gitignore
├── LICENSE
└── README.md
```

## Technical roadmap

1. extract pure color math into `src/color/` without changing numerical behavior;
2. add calibration tests and invalidate baselines when capture calibration changes;
3. separate camera orientation from display mirroring;
4. add explicit GPU → CPU model-loading fallback and differentiated camera/model errors;
5. retain the last valid face pose during short hand/brush occlusions;
6. collect repeatability data across devices, lighting and skin-color ranges;
7. replace the synthetic catalog with measured brand data;
8. only then define product accuracy claims and candidate thresholds.

## Reference

CIEDE2000 regression data: G. Sharma, W. Wu and E. N. Dalal, *The CIEDE2000 Color-Difference Formula: Implementation Notes, Supplementary Test Data, and Mathematical Observations*, Color Research & Application 30(1), 2005.

## License

MIT. See [LICENSE](LICENSE).
