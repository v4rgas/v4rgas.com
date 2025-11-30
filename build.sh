#!/bin/bash
# Build script for v4rgas.com
# Minifies HTML, CSS, JS and inlines CSS into HTML to reduce requests
# Target: <14KB for index.html (single TCP packet)

set -e

cd "$(dirname "$0")"

echo "Building v4rgas.com..."

# Read and minify CSS
minify_css() {
    cat "$1" | \
    sed 's/\/\*[^*]*\*\+\([^/*][^*]*\*\+\)*\///g' | \
    tr '\n' ' ' | \
    sed 's/  */ /g' | \
    sed 's/ *{ */{/g' | \
    sed 's/ *} */}/g' | \
    sed 's/ *: */:/g' | \
    sed 's/ *; */;/g' | \
    sed 's/ *, */,/g' | \
    sed 's/;}/}/g'
}

# Minify JS (basic - removes comments and extra whitespace)
minify_js() {
    cat "$1" | \
    sed 's/\/\/.*$//g' | \
    sed 's/\/\*[^*]*\*\+\([^/*][^*]*\*\+\)*\///g' | \
    tr '\n' ' ' | \
    sed 's/  */ /g' | \
    sed 's/ *{ */{/g' | \
    sed 's/ *} */}/g' | \
    sed 's/ *= */=/g' | \
    sed 's/ *( */(/g' | \
    sed 's/ *) */)/g' | \
    sed 's/ *; */;/g' | \
    sed 's/ *, */,/g'
}

# Minify HTML with inlined CSS
build_index() {
    local css=$(minify_css src/style.css)

    # Read HTML, inline CSS, minify
    cat src/index.html | \
    # Replace stylesheet link with inline style
    sed "s|<link rel=\"stylesheet\" href=\"style.css\">|<style>$css</style>|" | \
    # Remove HTML comments (except conditionals)
    sed 's/<!--[^>]*-->//g' | \
    # Remove extra whitespace between tags
    tr '\n' ' ' | \
    sed 's/  */ /g' | \
    sed 's/> *</></g' | \
    # Trim
    sed 's/^ *//;s/ *$//'
}

# Build index.html
echo "  Building index.html..."
build_index > index.html

# Copy other files (cv.html needs style.css separately for now)
echo "  Copying cv.html and style.css..."
cp src/cv.html cv.html
minify_css src/style.css > style.css

# Copy images
echo "  Copying images..."
rm -rf images
cp -r src/images images

# Show sizes
echo ""
echo "Build complete! Sizes:"
echo "  index.html: $(wc -c < index.html | tr -d ' ') bytes"
echo "  style.css:  $(wc -c < style.css | tr -d ' ') bytes"
echo "  cv.html:    $(wc -c < cv.html | tr -d ' ') bytes"
echo ""

# Check if under 14KB
size=$(wc -c < index.html | tr -d ' ')
if [ "$size" -lt 14336 ]; then
    echo "✓ index.html is under 14KB ($size bytes) - fits in one TCP packet!"
else
    echo "✗ index.html is $size bytes - over 14KB target"
fi
