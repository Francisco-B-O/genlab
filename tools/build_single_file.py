"""Builds the game as ONE html file (JS and CSS inlined), handy to publish it as a page.

Usage: python tools/build_single_file.py <output-dir>
Writes <output-dir>/app.html. It uses a temporary vite config and leaves the project's own untouched.
"""
import os, re, subprocess, sys

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, 'dist-single'))
build = os.path.join(out, 'build')
cfg = os.path.join(root, 'vite.single.config.ts')
with open(cfg, 'w', encoding='utf-8') as f:
    f.write(f"""import {{ defineConfig }} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({{
  plugins: [react()],
  base: './',
  resolve: {{ alias: {{ '@': path.resolve(__dirname, './src') }} }},
  build: {{ target: 'esnext', outDir: {build!r}, emptyOutDir: true, sourcemap: false, modulePreload: false,
    rollupOptions: {{ output: {{ inlineDynamicImports: true }} }} }},
}});
""")
try:
    subprocess.run('npx vite build -c vite.single.config.ts', cwd=root, shell=True, check=True)
finally:
    os.remove(cfg)

assets = os.path.join(build, 'assets')
read = lambda ext: open(os.path.join(assets, [n for n in os.listdir(assets) if n.endswith(ext)][0]), encoding='utf-8').read()
js = read('.js').replace('</script', '<' + chr(92) + '/script')
css = read('.css')
html = open(os.path.join(build, 'index.html'), encoding='utf-8').read()
html = re.sub(r'<script[^>]*src="[^"]*"[^>]*></script>', '', html)
html = re.sub(r'<link[^>]*href="\./assets/[^"]*\.css"[^>]*>', lambda m: '<style>' + css + '</style>', html)
html = html.replace('</body>', '<script type="module">' + js + '</script></body>')
with open(os.path.join(out, 'app.html'), 'w', encoding='utf-8') as f:
    f.write(html)
print('wrote', os.path.join(out, 'app.html'))
