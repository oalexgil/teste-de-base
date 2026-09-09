# Architecture

## Current shape

Tom de Base is intentionally a browser-first prototype. The deployed application is currently concentrated in `index.html` and uses no backend.

Runtime flow:

1. request camera permission with `getUserMedia`;
2. load MediaPipe Face Landmarker from a pinned CDN version;
3. normalize the frame orientation used for landmark sampling;
4. sample forehead, cheeks, chin and an estimated neck region;
5. apply optional white-reference channel gains;
6. convert sampled sRGB values to CIELAB;
7. classify ITA° and the current experimental undertone buckets;
8. compare skin and shade candidates with CIEDE2000;
9. track color movement from the bare-skin baseline toward the selected target during application.

No application server, account system or image upload endpoint exists in the current prototype.

## Current technical debt

The prototype grew inside a single HTML file. That makes iteration fast, but it couples several concerns:

- camera lifecycle;
- MediaPipe model loading;
- frame orientation;
- pixel sampling;
- color science;
- calibration;
- shade catalog generation;
- application-progress heuristics;
- speech guidance;
- DOM rendering.

The most important risk is not file size by itself. It is the possibility of changing color math, camera handling or UI behavior without an isolated regression test.

## Transitional test strategy

Until the runtime is modularized, `tests/color-science.test.js` extracts the exact color-science block from the deployed `index.html` and executes it in a Node `vm` context. This deliberately tests the code that is actually shipped rather than a duplicated implementation.

The suite currently protects:

- sRGB → CIELAB reference points;
- CIEDE2000 reference pairs;
- CIEDE2000 symmetry for the covered pairs;
- current ITA° classification boundaries;
- current experimental undertone thresholds.

This extraction approach is transitional and should be deleted once the color functions become normal ES modules.

## Target architecture

```text
src/
  color/
    srgb.js
    lab.js
    delta-e.js
    ita.js
  vision/
    face-landmarks.js
    regions.js
    sampling.js
  calibration/
    white-reference.js
    capture-constraints.js
  shade/
    catalog.js
    matcher.js
  application/
    baseline.js
    coverage.js
    coaching.js
  camera/
    stream.js
    orientation.js
  ui/
    render.js
    speech.js
    state.js
index.html
styles.css
tests/
  color/
  calibration/
  application/
```

## Architectural principles

### 1. Pure color math

Color conversions and ΔE calculations must remain pure functions with no DOM, camera, MediaPipe or storage dependencies. They should be testable with reference data in Node.

### 2. Explicit coordinate conventions

Camera pixels, landmark coordinates and displayed mirror orientation must have one documented coordinate convention. Orientation conversion should happen at a single boundary.

### 3. Calibration is data, not UI state

A calibration result should be represented as explicit channel gains plus metadata such as timestamp and capture conditions. Changing or clearing calibration must invalidate any baseline derived under the previous calibration.

### 4. Heuristics are not measurements

Coverage percentages, undertone buckets and coaching messages are prototype heuristics. They must be labeled separately from measured quantities such as sampled RGB/Lab values and computed ΔE00.

### 5. Privacy by architecture

Frames are processed in the browser. If a future backend is introduced, image transfer must be an explicit product decision rather than an accidental implementation detail.

## Next refactor

The next code-level PR should extract `src/color/*` first because it has the clearest mathematical contract and already has regression coverage. Camera and MediaPipe code should be separated only after the deployed color pipeline is protected.
