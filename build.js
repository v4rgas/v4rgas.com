import { minify } from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import { readFileSync, writeFileSync, cpSync, rmSync, mkdirSync } from 'fs';

const cleanCSS = new CleanCSS();

// Minify CSS
const css = readFileSync('src/style.css', 'utf8');
const minifiedCSS = cleanCSS.minify(css).styles;

// Read HTML and inline CSS
let html = readFileSync('src/index.html', 'utf8');
html = html.replace(
    '<link rel="stylesheet" href="style.css">',
    `<style>${minifiedCSS}</style>`
);

// Minify HTML (includes JS minification)
const minifiedHTML = await minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
});

// Write outputs
writeFileSync('index.html', minifiedHTML);
writeFileSync('style.css', minifiedCSS);

// Copy other files
cpSync('src/cv.html', 'cv.html');
cpSync('src/robots.txt', 'robots.txt');
cpSync('src/sitemap.xml', 'sitemap.xml');

// Copy images
rmSync('images', { recursive: true, force: true });
cpSync('src/images', 'images', { recursive: true });

// Report sizes
const size = Buffer.byteLength(minifiedHTML, 'utf8');
console.log(`index.html: ${size} bytes`);
console.log(`style.css:  ${Buffer.byteLength(minifiedCSS, 'utf8')} bytes`);
console.log();
if (size < 14336) {
    console.log(`✓ Under 14KB (${size} bytes)`);
} else {
    console.log(`✗ Over 14KB (${size} bytes)`);
}
