# Validation plan

Tom de Base is an experimental computer-vision and colorimetry prototype. A visually convincing demo is not enough to claim shade-matching accuracy. Productization requires measured repeatability across devices, lighting conditions and skin tones.

## What is already validated in software

The automated regression suite checks the deterministic color-science implementation used by the deployed page:

- sRGB → CIELAB reference points;
- CIEDE2000 against published Sharma/Wu/Dalal reference pairs;
- current ITA° bucket boundaries;
- current prototype undertone thresholds.

These tests validate implementation consistency. They do **not** validate the camera as a colorimeter.

## What still needs empirical validation

### 1. Repeatability in one session

For each participant and device:

1. keep lighting and position fixed;
2. capture at least 10 readings before makeup;
3. record L*, a*, b*, ITA° and selected shade;
4. compute dispersion and pairwise ΔE00 between repeated readings.

Goal: quantify how much the camera pipeline moves even when the real skin color has not changed.

### 2. Lighting sensitivity

Repeat the same protocol under at least:

- indirect daylight near a window;
- neutral/white LED room light;
- warm household light;
- mixed light;
- controlled backlight stress case.

Run once without white-reference calibration and once after calibration. The useful output is the reduction (or lack of reduction) in Lab/ΔE dispersion produced by calibration.

### 3. Device sensitivity

Repeat on multiple camera pipelines, including at minimum:

- Android Chrome front camera;
- desktop/laptop Chrome webcam;
- iPhone Safari front camera.

Record browser, OS, device and camera-facing mode. Do not assume one device's calibration transfers to another.

### 4. Skin-tone coverage

Validation must include a broad range of measured skin colors rather than only one ITA° band. Report performance by band and avoid presenting an aggregate average that could hide poor performance for darker or lighter skin.

Useful outputs:

- landmark detection/dropout rate;
- reading dispersion by ITA° band;
- calibration benefit by ITA° band;
- shade-ranking stability;
- face-versus-neck ΔE stability.

### 5. Real product catalog

The built-in 36-shade catalog is synthetic and cannot validate SKU recommendation quality.

For a real cosmetic catalog:

1. obtain physical samples from the brand;
2. define a repeatable substrate/application method;
3. measure each sample under controlled conditions with a colorimeter or spectrophotometer;
4. store measured Lab values with measurement metadata;
5. compare camera-ranked candidates against controlled reference measurements and human evaluation.

## Metrics to record

For every capture session, store at least:

- device/browser;
- lighting condition;
- calibration on/off;
- sampled L*, a*, b*;
- ITA°;
- selected/ranked shade IDs;
- ΔE00 to selected candidate;
- landmark success/dropout;
- frame processing latency;
- whether face/neck regions were successfully sampled.

Do not store face images unless a study protocol explicitly requires them and participants have consented.

## Claims policy

Until this validation is completed, the project should be described as:

> a browser-based prototype for investigating camera-assisted cosmetic shade matching with CIELAB, ITA° and CIEDE2000.

Avoid claims such as:

- "accurate shade match";
- "professional colorimeter replacement";
- "works equally on all skin tones";
- "clinically validated";
- "guarantees the correct foundation SKU".

## Reference for CIEDE2000 regression data

The automated test vectors are drawn from the supplementary implementation data published by Gaurav Sharma, Wencheng Wu and Edul N. Dalal for CIEDE2000 verification.
