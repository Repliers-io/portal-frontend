const vertexDeclarations = `
uniform highp vec4 uPortalWindows;
out highp vec2 vPortalWindowPosition;
out highp float vPortalWindowSeed;
out highp float vPortalWindowColumns;
out highp vec2 vPortalWindowLimits;
out highp float vPortalWindowHeight;
out float vPortalWindowRoof;
`

const vertexPosition = `
// Ring distances restart in clipped tiles. An axis-aligned, tile-periodic grid
// gives overlapping copies of a facade the same windows instead of z-fighting.
float columns = max(1.0, floor(EXTENT / (u_width_scale * uPortalWindows.y) + 0.5));
float facade = abs(normal.x) > abs(normal.y) ? pos_nx.y : pos_nx.x;
vPortalWindowPosition = vec2(facade * columns / EXTENT, (h - c_ele - base) / uPortalWindows.z);
vPortalWindowColumns = columns;
// Reserve one floor below the roof, including any incomplete top row.
vPortalWindowLimits = vec2(top_up_ny_start.w,
    max(0.0, floor((attr_height - base) / uPortalWindows.z) - 1.0));
vPortalWindowHeight = (attr_height - base) / uPortalWindows.z;
vPortalWindowSeed = floor(color.r * 255.0 + 0.5);
vPortalWindowRoof = normal.z;
// Our layer carries a feature seed in the paint color; restore its white material.
if (uPortalWindows.x > 0.0) color.rgb = vec3(1.0);
`

const fragmentDeclarations = `
uniform highp vec4 uPortalWindows;
uniform highp float uPortalWindowLit;
in highp vec2 vPortalWindowPosition;
in highp float vPortalWindowSeed;
in highp float vPortalWindowColumns;
in highp vec2 vPortalWindowLimits;
in highp float vPortalWindowHeight;
in float vPortalWindowRoof;

float portalWindowHash(vec2 cell) {
    // Perspective interpolation introduces tiny errors even for constant varyings.
    float building = floor(vPortalWindowSeed + 0.5);
    vec3 p = fract(vec3(cell, building) * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}
`

const fragmentWindows = `
if (uPortalWindows.x > 0.0 && uPortalWindows.w > 0.0 && vPortalWindowRoof < 0.5) {
    vec2 grid = vPortalWindowPosition;
    vec2 cell = floor(grid);
    cell.x = mod(cell.x, floor(vPortalWindowColumns + 0.5));
    vec2 width = max(fwidth(grid), vec2(0.001));
    vec2 edge = abs(fract(grid) - 0.5);
    float style = portalWindowHash(vec2(17.0, 29.0));
    vec2 size = style < 0.25 ? vec2(0.17, 0.32) :
                style < 0.50 ? vec2(0.24, 0.30) :
                style < 0.75 ? vec2(0.28, 0.29) : vec2(0.31, 0.27);
    // Both varyings are affine along a wall. Their derivative ratio recovers
    // its endpoints without extra vertex buffers or camera-dependent padding.
    vec2 edgeGradient = vec2(dFdx(vPortalWindowLimits.x), dFdy(vPortalWindowLimits.x));
    vec2 gridGradient = vec2(dFdx(grid.x), dFdy(grid.x));
    float span = dot(gridGradient, edgeGradient) / max(dot(edgeGradient, edgeGradient), 1e-12);
    float start = grid.x - vPortalWindowLimits.x * span;
    vec2 bounds = vec2(min(start, start + span), max(start, start + span));
    float center = floor(grid.x) + 0.5;
    float rows = floor(vPortalWindowLimits.y + 0.5);
    // A single-storey facade has no floor to reserve below the roof: its one row
    // stays as long as the pane itself (top edge at 0.5 + size.y floors) clears it.
    float single = step(rows, 0.5) * step(cell.y, 0.5)
                 * step(0.5 + size.y, vPortalWindowHeight);
    float fits = step(bounds.x + 0.1, center - size.x)
               * step(center + size.x, bounds.y - 0.1)
               * max(step(cell.y + 1.0, rows), single);
    vec2 pane = 1.0 - smoothstep(size - width, size + width, edge);
    float seed = portalWindowHash(cell);
    float visible = smoothstep(seed, min(seed + 0.025, 1.0), uPortalWindows.w);
    float lit = smoothstep(seed, min(seed + 0.025, 1.0), uPortalWindowLit);
    float distanceFade = 1.0 - smoothstep(0.4, 1.0, max(width.x, width.y));
    float mask = pane.x * pane.y * distanceFade * visible * fits;
    mask *= step(0.0, vPortalWindowPosition.y);
    float tint = portalWindowHash(cell + vec2(43.0, 71.0));
    vec3 light = tint < 0.7
        ? mix(vec3(1.0, 0.58, 0.24), vec3(1.0, 0.90, 0.70), tint / 0.7)
        : mix(vec3(1.0, 0.95, 0.85), vec3(0.65, 0.81, 1.0), (tint - 0.7) / 0.3);
    // During the rise, visible == lit: panes appear illuminated, never black.
    vec3 glass = mix(vec3(0.008, 0.012, 0.018), light, lit / max(visible, 0.0001));
    color.rgb = mix(color.rgb, glass * u_opacity, mask);
}
`

// These anchors belong to Mapbox GL JS 3.25.0's non-pattern extrusion shader.
export const patchBuildingShaders = <
  T extends {
    vertexSource: string
    fragmentSource: string
  }
>(
  source: T
): T => {
  const position = /pos\s*=\s*vec3\(pos_nx\.xy,\s*h\);/
  if (
    !position.test(source.vertexSource) ||
    !source.vertexSource.includes('void main()') ||
    !source.fragmentSource.includes('#ifdef FOG')
  ) {
    throw new Error('Mapbox building window shader anchors changed')
  }

  return {
    ...source,
    vertexSource: source.vertexSource
      .replace('void main()', `${vertexDeclarations}\nvoid main()`)
      .replace(position, (match) => `${match}\n${vertexPosition}`),
    fragmentSource: source.fragmentSource
      .replace('void main()', `${fragmentDeclarations}\nvoid main()`)
      .replace('#ifdef FOG', `${fragmentWindows}\n#ifdef FOG`)
  }
}
