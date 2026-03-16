<p align="center">
  <a href="http://www.systemaccounting.org/" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

[mxfactorial.io](https://mxfactorial.io/) demo web client in svelte.js

[platform services](https://github.com/systemaccounting/mxfactorial/tree/develop/services) accessed through graphql

as the platform is primarily a set of static and streaming endpoints, the public is welcome to develop their own clients and integrations

## theme

the UI is a viewport onto the surface of the conformal geometric algebra space described in the project README. transactions are rotations, debitor/creditor dimensions carry +1/-1 signature, value is conserved. the background gradient is the sphere this geometry lives on — globally curved, locally flat

### current: css surface

the radial gradient centered high (50% left, 20% top) fades from teal to blue, producing atmospheric curvature at the periphery while any local area reads as a flat surface. all UI elements exist as features of this surface, not objects floating above it

**surface features** — elements are beveled into or raised from the sphere surface. light source matches the gradient — brighter top-center, shadows cast down-right. colors are translucent surface shades, not opaque blocks — the blue shows through everything

- **inputs** — inset bevel. shallow depressions in the surface. translucent background (0.22 opacity)
- **buttons** — raised bevel. subtle surface-tinted shades that differ only slightly. on hover the bevel deepens, on press it inverts to inset
- **cards** — raised bevel. translucent background (0.12 opacity)
- **text** — body default is inset (`--text-inset`). input placeholders inherit inset, typed text overrides to raised (`--text-raised`). buttons use raised. lowercase throughout
- **switch buttons** — raised bevel on the group container
- **nav menu items** — raised bevel from the left

**tokens** — two raw values compose all shadows:

- `--bevel-light: rgba(255, 255, 255, 0.35)` — highlight edge (top-left)
- `--bevel-shadow: rgba(30, 60, 120, 0.35)` — shadow edge (bottom-right), blue-tinted to match the surface

button colors are translucent surface shades, not saturated blocks:

- `--color-primary: rgba(40, 90, 150, 0.6)` — slightly deeper than the surface
- `--color-request: rgba(80, 140, 120, 0.5)` — faint green-blue tint
- `--color-pay: rgba(100, 80, 130, 0.5)` — faint violet-blue tint

### future: WebGL sphere

the css gradient is a stand-in. the eventual design replaces sveltekit multi-route navigation with a single page app built on a three.js sphere (threlte for svelte). the sphere is the scene — screen transitions are sphere rotations, not page loads

- sveltekit routes collapse into a single entry point
- threlte renders the sphere and equation
- svelte components for each screen are positioned on or overlaid relative to sphere orientation
- browser history / deep links map to sphere rotation state, not URL paths
- camera stays fixed at the surface normal. the sphere rolls underneath

**sphere behavior:**

- the equation is fixed inside the sphere — visible through the translucent surface
- tilted 30 degrees from vertical for 3d depth
- screen transitions rotate the sphere, and the equation rotates with it
- non-transaction navigation keeps the equation within a 0-180 degree arc
- completing a transaction rotates the equation through a full 360
