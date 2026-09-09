# Changelog

All notable repository-level changes are documented here.

## Unreleased

### Added

- zero-dependency Node.js regression test workflow;
- GitHub Actions CI for pull requests to `main`;
- CIEDE2000 verification against published reference pairs;
- Lab and ITA regression coverage for the deployed inline color-science code;
- architecture, validation, security and contribution documentation;
- explicit `.gitignore` and `.nojekyll` files.

### Changed

- README repositioned around the actual product state instead of repository-creation instructions;
- product claims now distinguish a functional prototype from a validated color-measurement product;
- privacy language now distinguishes local camera processing from third-party runtime asset downloads.

### Not changed

- deployed camera behavior;
- MediaPipe version/model;
- shade-ranking formulas;
- application-progress heuristics;
- UI layout.

Those runtime changes should be handled in separate pull requests with focused testing.
