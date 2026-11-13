"""Render the card with the demo apartment (scripts/demo_map.py), light and dark, into screenshots/.

pip install -r requirements_test.txt playwright && playwright install chromium && npm install --no-save @mdi/js
python scripts/screenshots.py
"""

from __future__ import annotations

import asyncio
import functools
import http.server
import json
import shutil
import subprocess
import tempfile
import threading
from pathlib import Path

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


async def _shoot(port: int) -> None:
    async with async_playwright() as p:
        # WebGL without a GPU, for the 3D view
        browser = await p.chromium.launch(
            args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
        )
        page = await browser.new_page(viewport={"width": 552, "height": 700}, device_scale_factor=2)
        shots = (
            ("light", "2d", "map.png"),
            ("dark", "2d", "map-dark.png"),
            ("light", "3d", "map-3d.png"),
            ("dark", "3d", "map-3d-dark.png"),
        )
        for theme, view, name in shots:
            await page.goto(f"http://localhost:{port}/index.html?theme={theme}&view={view}")
            await page.wait_for_timeout(3000)  # the robot travels its last segment, three.js loads
            await (await page.query_selector("#host")).screenshot(path=ROOT / "screenshots" / name)
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
