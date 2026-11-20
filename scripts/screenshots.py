"""Render the card with the demo apartment (scripts/demo_map.py), light and dark, into screenshots/: the map stills,
a gallery of the header with a few Roborock models, and the header animations as GIFs (needs ffmpeg on PATH).

pip install -r requirements_test.txt playwright && playwright install chromium && npm install --no-save @mdi/js
python scripts/screenshots.py

Run by the Screenshots workflow, which commits the result on the pull request as the screenshots GitHub App: the
clock is fixed and paused, every animation stepped by hand, so two runs give the same bytes (exact comparison).
"""

from __future__ import annotations

import asyncio
import functools
import http.server
import json
import os
import shutil
import subprocess
import tempfile
import threading
from pathlib import Path
from urllib.parse import quote

from demo_map import payload
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
ICONS = [
    "mdiRobotVacuum", "mdiToilet", "mdiShower", "mdiSilverwareForkKnife", "mdiStove", "mdiBed", "mdiDoor",
    "mdiShoePrint", "mdiSofa", "mdiLightningBolt", "mdiSquareRoundedOutline", "mdiDesk", "mdiFullscreen", "mdiClose",
]  # fmt: skip


def _icons() -> str:
    script = (
        "const m=require('@mdi/js');const o={};"
        f"for(const n of {json.dumps(ICONS)})o[n.replace(/^mdi/,'').replace(/[A-Z]/g,(c,i)=>(i?'-':'')+c.toLowerCase())]=m[n];"
        "process.stdout.write('const ICONS='+JSON.stringify(o)+';')"
    )
    return subprocess.run(["node", "-e", script], cwd=ROOT, check=True, capture_output=True, text=True).stdout


# Header gallery: a few Roborock models (`model` option), docked and out cleaning
GALLERY = [
    {"title": "S8 MaxV Ultra", "model": "roborock.vacuum.a97", "state": "docked"},
    {"title": "Qrevo", "model": "roborock.vacuum.a75", "state": "docked"},
    {"title": "Saros 10R", "model": "roborock.vacuum.a143", "state": "cleaning"},
    {"title": "Q7 Max", "model": "roborock.vacuum.a38", "state": "cleaning"},
    {"title": "F25 Ultra", "model": "roborock.wdv.a194", "state": "docked"},
]
# Animated header states: one GIF each, light and dark (file, card)
GIFS = [
    ("header-cleaning", {"state": "cleaning"}),
    ("header-returning", {"state": "returning"}),
    ("header-error", {"state": "error"}),
    ("header-f25-cleaning", {"state": "cleaning", "model": "roborock.wdv.a194"}),
]

# The robot pictures are SVG <img>: their CSS animations run in a document of their own, out of reach of
# getAnimations(). For the GIFs each one is redrawn inline in a shadow root of its own (its styles stay apart), so
# that every animation can be paused and stepped: the GIF is the same whatever the machine's speed. Returns the
# animations of the card's shadow root and of the pictures.
INLINE = """() => {
  const cards = [...document.querySelectorAll('vacuum-map-card')].map((c) => c.shadowRoot);
  window.roots ||= [];
  for (const img of cards.flatMap((c) => [...c.querySelectorAll('.vm-dev img')])) {
    const src = img.getAttribute('src');
    const svg = new DOMParser().parseFromString(decodeURIComponent(src.slice(src.indexOf(',') + 1)), 'image/svg+xml').documentElement;
    const host = document.createElement('div');
    host.style.cssText = `width:100%;height:100%;filter:${getComputedStyle(img).filter}`;
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    host.attachShadow({ mode: 'open' }).appendChild(svg);
    img.replaceWith(host);
    window.roots.push(host.shadowRoot);
  }
  window.roots = window.roots.filter((r) => r.host.isConnected);
  // A transition still running (the theme applied after the first paint) is ended at once: only the looping
  // animations are stepped, so that a still or a frame never catches one half-way.
  const all = [...cards, ...window.roots].flatMap((r) => r.getAnimations());
  for (const a of all) if (a instanceof CSSTransition) a.finish();
  return all.filter((a) => !(a instanceof CSSTransition));
}"""


# A fixed, paused clock in every page (Date, timers, requestAnimationFrame): the robot's travel and the three.js view
# only move when the script steps them, so every run renders the same pixels (the bot's comparison is exact).
T0 = 1_763_632_800_000  # 2025-11-20 10:00 UTC


async def _open(browser, url: str, settle_ms: int):
    page = await browser.new_page(viewport={"width": 552, "height": 700}, device_scale_factor=2)
    await page.clock.install(time=T0)
    await page.clock.pause_at(T0 + 1000)
    await page.goto(url)
    await page.wait_for_load_state("networkidle")
    await page.wait_for_timeout(500)  # scripts and the demo map load (real time: no timer runs meanwhile)
    await page.clock.run_for(settle_ms)
    # What the steps started in real time (three.js loaded, fonts, the map's room styles) lands, then a last step
    await page.wait_for_timeout(800)
    await page.clock.run_for(1000)
    await page.wait_for_timeout(300)  # a WebGL frame drawn in the last step reaches the screen
    return page


async def _banner(page, card: int = 0):
    return await page.evaluate_handle(
        f"() => document.querySelectorAll('vacuum-map-card')[{card}].shadowRoot.querySelector('.banner')"
    )


async def _gif(browser, port: int, theme: str, name: str, card: dict, fps: int = 15, seconds: float = 2.4) -> None:
    query = f"theme={theme}&cards={quote(json.dumps([card]))}"
    page = await _open(browser, f"http://localhost:{port}/index.html?{query}", 1500)
    box = await (await _banner(page)).as_element().bounding_box()
    clip = {"x": box["x"] - 4, "y": box["y"] - 4, "width": box["width"] + 8, "height": box["height"] + 8}
    with tempfile.TemporaryDirectory() as frames:
        for i in range(round(fps * seconds)):
            n = await page.evaluate(
                f"(t) => {{ const all = ({INLINE})(); for (const a of all) {{ a.pause(); a.currentTime = t; }} return all.length; }}",
                i * 1000 / fps,
            )
            if not n:
                raise RuntimeError(f"{name}: no animation to step")
            await page.wait_for_timeout(80)  # the stepped picture (its drop-shadow layer) is painted again
            await page.screenshot(path=f"{frames}/f{i:03d}.png", clip=clip)
        # Halve the retina capture, one palette per clip, ordered dithering: small and deterministic
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps), "-i", f"{frames}/f%03d.png", "-vf",
             f"scale={round(clip['width'])}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];"
             "[b][p]paletteuse=dither=bayer:bayer_scale=4", "-loop", "0",
             str(ROOT / "screenshots" / f"{name}{'-dark' if theme == 'dark' else ''}.gif")],
            check=True,
        )  # fmt: skip
    await page.close()


async def _shoot(port: int) -> None:
    async with async_playwright() as p:
        # WebGL without a GPU, for the 3D view
        browser = await p.chromium.launch(
            args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
        )
        shots = (
            ("light", "2d", "map.png"),
            ("dark", "2d", "map-dark.png"),
            ("light", "3d", "map-3d.png"),
            ("dark", "3d", "map-3d-dark.png"),
        )
        for theme, view, name in shots:
            # The robot travels its last segment, three.js loads
            page = await _open(browser, f"http://localhost:{port}/index.html?theme={theme}&view={view}", 3000)
            # Every animation paused at its start: the still is the same on every run (exact comparison)
            await page.evaluate(f"() => {{ for (const a of ({INLINE})()) {{ a.pause(); a.currentTime = 0; }} }}")
            await page.wait_for_timeout(300)
            await (await page.query_selector("#host")).screenshot(path=ROOT / "screenshots" / name)
            await page.close()
        # The header of a few models, the map hidden
        for theme in ("light", "dark"):
            url = f"http://localhost:{port}/index.html?theme={theme}&cards={quote(json.dumps(GALLERY))}"
            page = await _open(browser, url, 1500)
            await page.evaluate(
                "() => { for (const c of document.querySelectorAll('vacuum-map-card')) {"
                " c.shadowRoot.querySelector('.body').style.display = 'none'; } }"
            )
            name = f"header-models{'-dark' if theme == 'dark' else ''}.png"
            await page.evaluate(f"() => {{ for (const a of ({INLINE})()) {{ a.pause(); a.currentTime = 0; }} }}")
            await (await page.query_selector("#host")).screenshot(path=ROOT / "screenshots" / name)
            await page.close()
        if os.environ.get("NO_GIF") != "1":
            for name, card in GIFS:
                for theme in ("light", "dark"):
                    await _gif(browser, port, theme, name, card)
        await browser.close()


def main() -> None:
    (ROOT / "screenshots").mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        site = Path(tmp)
        shutil.copy(ROOT / "scripts" / "harness" / "index.html", site)
        shutil.copy(ROOT / "custom_components" / "vacuum_map" / "frontend" / "vacuum-map-card.js", site)
        (site / "vacuum_map" / "vendor").mkdir(parents=True)
        shutil.copy(
            ROOT / "custom_components" / "vacuum_map" / "frontend" / "vendor" / "three.min.js",
            site / "vacuum_map" / "vendor",
        )
        (site / "icons.js").write_text(_icons())
        (site / "demo.json").write_text(json.dumps(payload()))
        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=tmp)
        server = http.server.ThreadingHTTPServer(("localhost", 0), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            asyncio.run(_shoot(server.server_address[1]))
        finally:
            server.shutdown()


if __name__ == "__main__":
    main()
