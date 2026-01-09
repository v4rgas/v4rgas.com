import { minify } from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import { readFileSync, writeFileSync, cpSync, rmSync, existsSync, watch } from 'fs';

const cleanCSS = new CleanCSS();
const isWatch = process.argv.includes('--watch');

// Process partials: replaces {{> partial-name}} with contents of src/partials/partial-name.html
function processPartials(html) {
    return html.replace(/\{\{>\s*([a-z0-9-]+)\s*\}\}/gi, (match, name) => {
        const partialPath = `src/partials/${name}.html`;
        if (!existsSync(partialPath)) {
            console.warn(`Warning: partial "${name}" not found at ${partialPath}`);
            return match;
        }
        return readFileSync(partialPath, 'utf8').trim();
    });
}

async function build() {
    // Minify CSS
    const css = readFileSync('src/style.css', 'utf8');
    const minifiedCSS = cleanCSS.minify(css).styles;

    // Helper to build an HTML file
    async function buildHTML(srcPath, destPath, inlineCSS = false) {
        let html = readFileSync(srcPath, 'utf8');
        html = processPartials(html);
        if (inlineCSS) {
            html = html.replace('<link rel="stylesheet" href="style.css">', `<style>${minifiedCSS}</style>`);
        }
        const minified = await minify(html, {
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
        });
        writeFileSync(destPath, minified);
        return minified;
    }

    // Build HTML files
    const minifiedHTML = await buildHTML('src/index.html', 'index.html', true);
    await buildHTML('src/cv.html', 'cv.html', false);

    // Write CSS
    writeFileSync('style.css', minifiedCSS);
    cpSync('src/robots.txt', 'robots.txt');
    cpSync('src/sitemap.xml', 'sitemap.xml');

    // Copy images
    rmSync('images', { recursive: true, force: true });
    cpSync('src/images', 'images', { recursive: true });

    // Report sizes
    const size = Buffer.byteLength(minifiedHTML, 'utf8');
    console.log(`[${new Date().toLocaleTimeString()}] index.html: ${size} bytes, style.css: ${Buffer.byteLength(minifiedCSS, 'utf8')} bytes ${size < 14336 ? '✓' : '✗'}`);
}

await build();

if (isWatch) {
    console.log('Watching src/ for changes...');
    watch('src', { recursive: true }, async (event, filename) => {
        console.log(`Changed: ${filename}`);
        await build();
    });
}
