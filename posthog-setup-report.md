<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into v4rgas.com. `posthog-js` was installed and initialized in `main.js` using environment variables from `.env`. Four user interaction events are now tracked: scene initialization, penguin voxel explosions, desk lamp throws, and navigation link clicks. Environment variables are gitignored and never hardcoded.

| Event name | Description | File |
|---|---|---|
| `scene loaded` | Fires when the 3D scene finishes initializing (GLB + voxels fully loaded). Properties: `voxel_count`, `is_mobile` | `main.js` |
| `penguin exploded` | Fires when the user clicks to explode the voxel penguin. Properties: `voxels_remaining` | `main.js` |
| `lamp thrown` | Fires when the user clicks the throwable desk lamp | `main.js` |
| `link clicked` | Fires when the user clicks a nav link (CV, GitHub, LinkedIn). Properties: `link_label`, `link_href` | `main.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1595487)
- [Unique visitors (scene loaded)](/insights/XM94oO2t)
- [Interactions: penguin exploded & lamp thrown](/insights/qg96wpor)
- [Link clicks by destination](/insights/Q7IeYbci)
- [Mobile vs Desktop visitors](/insights/XA9OfhIH)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
