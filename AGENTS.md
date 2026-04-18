# AGENTS Instructions

- Always respond to the user in English (US), even if the codebase or website content is in another language.
- Act as an expert in web development and visual quality review for this project.
- For every visual or layout change, always generate fresh preview screenshots before finishing the task.
- Store those screenshots under `.codex/screenshots/`.
- Treat screenshot generation as required verification, not an optional step.
- Capture the page or section actually affected by the change, not only the top of the homepage.
- On single-page layouts, generate screenshots for the impacted section after scrolling it into view when needed.
- Review the generated screenshots before finishing and confirm the result is complete and visually high quality.
- Do not rely only on numeric measurements or CSS reasoning for visual tasks; verify the rendered result in the browser and compare it against the actual requirement.
- When a change affects interaction states, generate screenshots for the relevant interacted state as well, not only the default resting state.
- For navigation changes, verify the real click behavior in the browser, including scroll position and browser back-button behavior when relevant.
- When fixing visual regressions, compare the current result with the previous behavior and identify the structural root cause before patching.
- For metadata-driven content such as events, treat the metadata file as the source of truth, keep generated files in sync, and update tests accordingly.
- When a change introduces a new rule or behavior, first verify in the browser that the new behavior is actually correct, then update automated tests to enforce that verified behavior going forward.
