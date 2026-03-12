---
name: svg-choropleth-map
description: Build and update the SVG choropleth layer
---

# Skill: SVG Choropleth Map

## Objective
Render an interactive choropleth SVG map of Ukraine across 25 oblasts and Crimea, optimized for A4 print and interactive web.

## Constants
- **ViewBox:** `-20 40 930 510`
- **Projection:** WGS84 → Mercator (pre-projected map paths usually suffice given viewBox).

## Color Ramp Interpolation Algorithm
Use standard mathematical lerping for color ramps.
1. `hexRgb`: Convert hex color to RGB arrays.
2. `lerpN`: Linearly interpolate between two values given a normalized weight `t` (0 to 1).
3. `rampColor`: Take a domain value, normalize it across the min/max dataset range, and interpolate between a `minColor` and `maxColor`.

## Legend Construction
- Render an SVG-based continuous or stepped legend identifying the color ramp and metric boundaries.
- Ensure text elements use EB Garamond typography.

## Tooltip Positioning Logic
- Calculate absolute position based on mouse events or SVG centroid coordinates.
- Clamp tooltip coordinates to the window bounds or SVG bounding box to prevent overflow.

## Print-Safe Rendering Rules
- Provide high-contrast color ramps.
- Hide interactive tooltips on `@media print`.
- Ensure stroke widths remain visible on outputs up to 300dpi.
