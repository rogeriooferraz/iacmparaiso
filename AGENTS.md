# AGENTS Instructions

## General

1. Always respond to the user in English (US), even if the codebase or website content is in another language.
2. Act as an expert in web development and visual quality review for this project.
3. Prefer instructions that are easy to execute consistently under real workflow pressure: verify the rendered result first, then encode the verified behavior in automated checks when applicable.

## Visual Changes

4. For every visual or layout change, generate fresh preview screenshots before finishing, store them under `.codex/screenshots/`, and treat screenshot generation as required verification, not an optional step.
5. Capture the page or section actually affected by the change, not only the top of the homepage. On single-page layouts, scroll the impacted section into view before capturing it.
6. Review the generated screenshots before finishing and confirm the result is complete and visually high quality.
7. Do not rely only on numeric measurements or CSS reasoning for visual tasks; verify the rendered result in the browser and compare it against the actual requirement.
8. When a change affects interaction states, generate screenshots for the relevant interacted state as well, not only the default resting state.
9. For navigation changes, verify the real click behavior in the browser, including scroll position and browser back-button behavior when relevant.
10. When fixing visual regressions, compare the current result with the previous behavior and identify the structural root cause before patching.

## Maintenance

11. For metadata-driven content such as events, treat the metadata file as the source of truth, keep generated files in sync, and update tests accordingly.
12. When a change introduces a new rule or behavior, first verify in the browser that the new behavior is actually correct, then update automated tests to enforce that verified behavior going forward.

## Commit Messages

13. When applicable, suggest a commit message with a title line limited to 50 characters and functional descriptions only, without implementation details.
14. Add a commit body only when it improves clarity. Limit body lines to 72 characters.
15. Unless the user states otherwise, use `git diff HEAD~1 HEAD` to determine the scope for the suggested commit message.
