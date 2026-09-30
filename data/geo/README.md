# Geographic sources

| File | Source | Licence |
| --- | --- | --- |
| `sources/bangladesh-outline.ne10m.geojson` | Natural Earth 1:10m Admin 0 — Countries (Bangladesh extracted) | Public domain |
| `sources/rivers.ne10m.geojson` | Natural Earth 1:10m Rivers + lake centerlines (Ganges, Brahmaputra, Tista, Barak/"Balak", Karnaphuli reach) | Public domain |
| `sources/divisions.geoboundaries-adm1.geojson` | geoBoundaries gbOpen BGD ADM1 (simplified) — 8 divisions | CC BY 4.0 |
| elevation (fetched at build time, cached in `cache/`) | AWS Terrain Tiles, Terrarium encoding, zoom 8 (SRTM and other sources via Mapzen) | See https://github.com/tilezen/joerd/blob/master/docs/attribution.md |

`npm run geo:build` projects everything into the map's coordinate space and writes
`content/geo/geo.generated.json`, `public/geo/elevation.png` (R = √-scaled height, G = Bangladesh mask)
and `public/geo/contours.json`.

River courses marked "schematic" in the generated file connect well-known river towns where the
Natural Earth centerline is missing (e.g. the lower Meghna, Old Brahmaputra, Rupsha–Pasur, Buriganga).
