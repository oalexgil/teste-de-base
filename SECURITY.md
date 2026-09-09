# Security and privacy

## Scope

Tom de Base is currently a static browser application. It requests camera access, processes frames locally and has no application backend, user account system or image-upload endpoint.

## Camera data

The application uses `getUserMedia` only after browser permission is granted. Camera frames are consumed in memory for landmark detection and color sampling.

The application does not intentionally send captured frames to a project-controlled server and does not persist face images.

## External network requests

The page still requires network access for third-party runtime dependencies:

- MediaPipe Tasks Vision JavaScript/WASM from jsDelivr;
- the MediaPipe face-landmarker model from Google-hosted storage;
- Google Fonts used by the interface.

Therefore, "local processing" means the **camera analysis** runs in the browser; it does not mean the page makes zero network requests.

## Supply-chain boundary

Third-party CDN code executes in the page origin and is part of the security boundary. Current versions are pinned, but a production deployment should consider self-hosting audited runtime assets and defining a restrictive Content Security Policy.

## Sensitive data

Do not add:

- API keys or access tokens to client-side source;
- analytics that capture camera frames or derived biometric-like data without an explicit privacy decision;
- automatic image uploads;
- persistent face-image storage.

If derived color measurements are ever persisted, document exactly what is stored, for how long and for what purpose.

## Reporting a vulnerability

Please avoid publishing exploit details or private user data in a public issue. Report enough information to reproduce the problem without including personal images, credentials or unrelated sensitive data.

## Productization checklist

Before treating this prototype as a production beauty-tech product:

- define a Content Security Policy;
- self-host or integrity-control critical vision assets where practical;
- add explicit camera-state/error handling;
- verify that calibration and baseline data are invalidated together when capture conditions change;
- perform privacy review before adding telemetry or persistence;
- test camera behavior across browsers and devices.
