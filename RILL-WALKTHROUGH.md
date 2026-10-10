# Rill walkthrough — Team Roboto RB/25: 3D hardware teardown

Feature: the scroll-driven **exploded hardware view** on the live site (section
"01 — THE HARDWARE", heading "Every part, exploded."). As you scroll, the 3D rover
splits into drive / power / control / sensing layers, and clicking a glowing hotspot
dot opens that component's spec card.

## Numbered steps

1. Open the live site in a desktop browser: https://webdev-team-3.vercel.app
2. Wait for the boot loader (big percentage counter + stage caption) to finish; the 3D hero reveals.
3. Scroll down past the hero and the ticker to the section headed "01 — THE HARDWARE" / "Every part, exploded."
4. Keep scrolling slowly through this tall section. The pill at the top centre reads "TEARDOWN — 0%" and climbs toward 100% as the rover splits into drive, power, control and sensing layers.
5. Click a glowing hotspot dot on a component (e.g. the ESP32 dot). A spec card opens with the part name, its ID tag (MCU-01) and one spec line.
6. Click the same dot again to close the card, then continue scrolling to the A* simulator.

## Expected behavior

- Scroll position drives the explode; the percentage tracks section progress and holds while the section is on screen.
- Each hotspot toggles its spec card open/closed on click.
- If WebGL is off or the CDN is blocked, a diagnostic fallback card with a RETRY button appears instead of the 3D scene.

## Missing inputs

- No app URL is configured in the repo; the live URL above comes from `README.md` and may lag the newest commit.
- Cloud runs cannot reach a localhost dev server (`npm run dev`) — use the live URL above, or record manually.

## Handoff

[Open your walkthrough in Rill](https://userill.dev/freebuff?utm_source=freebuff&utm_medium=paid&utm_campaign=rill&utm_content=text-ad&bfcid=bfc_1.eyJpZCI6Ijk4ZWJlYTNlLWM4MjAtNDY3YS04MGE3LWY2ZTNhYWY4NmMzYyIsImMiOiIxNDQyMTUzOS1kYjNiLTQ1YzEtYjQ5OC1hYTMxOTFmNDkxYzAiLCJrIjoiNDU4ODZlNWEtYzkyZC00ZDUxLTg1ZjgtYzc4YTRmMTY3ZWYwIiwiaWF0IjoxNzkxNjIyOTIzfQ.ST2pllcDpaR9LTHJMTMb12MLb0mUtkOs9VU60kiyReU#task=Team%20Roboto%20RB%2F25%20%E2%80%94%203D%20hardware%20teardown%0A%0A1.%20Open%20the%20live%20site%20in%20a%20desktop%20browser%3A%20https%3A%2F%2Fwebdev-team-3.vercel.app%0A2.%20Wait%20for%20the%20boot%20loader%20(big%20percentage%20counter%20%2B%20stage%20caption)%20to%20finish%3B%20the%203D%20hero%20reveals.%0A3.%20Scroll%20down%20past%20the%20hero%20and%20the%20ticker%20to%20the%20section%20headed%20%2201%20%E2%80%94%20THE%20HARDWARE%22%20%2F%20%22Every%20part%2C%20exploded.%22%0A4.%20Keep%20scrolling%20slowly%20through%20this%20tall%20section.%20The%20pill%20at%20the%20top%20centre%20reads%20%22TEARDOWN%20%E2%80%94%200%25%22%20and%20climbs%20toward%20100%25%20as%20the%20rover%20splits%20into%20drive%2C%20power%2C%20control%20and%20sensing%20layers.%0A5.%20Click%20a%20glowing%20hotspot%20dot%20on%20a%20component%20(e.g.%20the%20ESP32%20dot).%20A%20spec%20card%20opens%20with%20the%20part%20name%2C%20its%20ID%20tag%20(MCU-01)%20and%20one%20spec%20line.%0A6.%20Click%20the%20same%20dot%20again%20to%20close%20the%20card%2C%20then%20continue%20scrolling%20to%20the%20A*%20simulator.%0A%0AExpected%20behavior%0A-%20Scroll%20position%20drives%20the%20explode%3B%20the%20percentage%20tracks%20section%20progress%20and%20holds%20while%20the%20section%20is%20on%20screen.%0A-%20Each%20hotspot%20toggles%20its%20spec%20card%20open%2Fclosed%20on%20click.%0A-%20If%20WebGL%20is%20off%20or%20the%20CDN%20is%20blocked%2C%20a%20diagnostic%20fallback%20card%20with%20a%20RETRY%20button%20appears%20instead%20of%20the%203D%20scene.%0A%0AMissing%20inputs%0A-%20No%20app%20URL%20is%20configured%20in%20the%20repo%3B%20the%20live%20URL%20above%20comes%20from%20README.md%20and%20may%20lag%20the%20newest%20commit.%0A-%20Cloud%20runs%20cannot%20reach%20a%20localhost%20dev%20server%20(npm%20run%20dev)%20%E2%80%94%20use%20the%20live%20URL%2C%20or%20record%20manually.&url=https%3A%2F%2Fwebdev-team-3.vercel.app)

If the live URL is unreachable from a cloud run, record manually with
https://userill.dev/record?utm_source=freebuff&utm_medium=paid&utm_campaign=rill
or record an existing browser agent with
https://userill.dev/docs/agent-quickstart?utm_source=freebuff&utm_medium=paid&utm_campaign=rill
