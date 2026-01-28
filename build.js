import { minify } from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import { readFileSync, writeFileSync, cpSync, rmSync, existsSync, watch, mkdirSync, readdirSync } from 'fs';

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

function minifyCSS(path) {
    return cleanCSS.minify(readFileSync(path, 'utf8')).styles;
}

async function build() {
    // Minify CSS files
    const coreCSS = minifyCSS('src/core.css');
    const landingCSS = minifyCSS('src/landing.css');
    const cvCSS = minifyCSS('src/cv.css');
    const stuffCSS = minifyCSS('src/stuff.css');
    const rocketCSS = minifyCSS('src/rocket.css');

    // Write CSS files
    writeFileSync('core.css', coreCSS);
    writeFileSync('landing.css', landingCSS);
    writeFileSync('cv.css', cvCSS);
    writeFileSync('stuff.css', stuffCSS);
    writeFileSync('rocket.css', rocketCSS);

    // Helper to build an HTML file
    async function buildHTML(srcPath, destPath, inlineStyles = null) {
        let html = readFileSync(srcPath, 'utf8');
        html = processPartials(html);

        // Inline CSS if provided
        if (inlineStyles) {
            for (const [href, css] of Object.entries(inlineStyles)) {
                html = html.replace(`<link rel="stylesheet" href="${href}">`, `<style>${css}</style>`);
            }
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
    const minifiedHTML = await buildHTML('src/index.html', 'index.html', {
        'core.css': coreCSS,
        'landing.css': landingCSS
    });
    await buildHTML('src/cv.html', 'cv.html');
    await buildHTML('src/rocket.html', 'rocket.html');

    // Build stuff/*.html
    if (existsSync('src/stuff')) {
        mkdirSync('stuff', { recursive: true });
        for (const file of readdirSync('src/stuff').filter(f => f.endsWith('.html'))) {
            await buildHTML(`src/stuff/${file}`, `stuff/${file}`);
        }
    }

    // Copy JS files
    cpSync('src/landing.js', 'landing.js');

    cpSync('src/robots.txt', 'robots.txt');
    cpSync('src/sitemap.xml', 'sitemap.xml');

    // Copy images
    rmSync('images', { recursive: true, force: true });
    cpSync('src/images', 'images', { recursive: true });

    // Report sizes
    const size = Buffer.byteLength(minifiedHTML, 'utf8');
    console.log(`[${new Date().toLocaleTimeString()}] index.html: ${size} bytes ${size < 14336 ? '✓' : '✗'}`);
}

await build();

if (isWatch) {
    console.log('Watching src/ for changes...');
    watch('src', { recursive: true }, async (event, filename) => {
        console.log(`Changed: ${filename}`);
        await build();
    });
}
