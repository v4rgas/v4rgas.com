const penguin = document.getElementById('penguin');
const canvas = document.getElementById('penguinCanvas');
const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });

// Shaders
const vs = `#version 300 es
in vec2 aV; in vec3 aI; in float aA; uniform vec2 uR; out vec2 vU; out float vA;
void main() { vU = aV*.5+.5; vA = aA; vec2 p = aI.xy + aV*aI.z*.5; gl_Position = vec4((p/uR)*2.-1., 0, 1); gl_Position.y *= -1.; }`;
const fs = `#version 300 es
precision mediump float; in vec2 vU; in float vA; uniform sampler2D uT; out vec4 o;
void main() { vec4 c = texture(uT, vU); o = vec4(c.rgb, c.a * vA); }`;

const compile = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog);
gl.useProgram(prog);

const uRes = gl.getUniformLocation(prog, 'uR');
const aV = gl.getAttribLocation(prog, 'aV');
const aI = gl.getAttribLocation(prog, 'aI');
const aA = gl.getAttribLocation(prog, 'aA');

// Buffers
const instData = new Float32Array(9000), alphaData = new Float32Array(3000);
const quadBuf = gl.createBuffer(), instBuf = gl.createBuffer(), alphaBuf = gl.createBuffer();

gl.bindVertexArray(gl.createVertexArray());
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(aV);
gl.vertexAttribPointer(aV, 2, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
gl.bufferData(gl.ARRAY_BUFFER, instData, gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(aI);
gl.vertexAttribPointer(aI, 3, gl.FLOAT, false, 0, 0);
gl.vertexAttribDivisor(aI, 1);

gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuf);
gl.bufferData(gl.ARRAY_BUFFER, alphaData, gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(aA);
gl.vertexAttribPointer(aA, 1, gl.FLOAT, false, 0, 0);
gl.vertexAttribDivisor(aA, 1);

// Texture
const img = new Image();
img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
};
img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 32 32" shape-rendering="crispEdges"><path stroke="%23070606" d="M14 6h5M13 7h7M12 8h9M15 9h2M19 9h2M14 10h4M19 10h2M14 11h1M17 11h1M19 11h2M12 12h1M19 12h2M11 13h3M18 13h3M10 14h2M19 14h3M9 15h3M20 15h3M9 16h2M20 16h3M8 17h3M21 17h3M8 18h2M21 18h3M7 19h3M21 19h3M7 20h4M20 20h4M6 21h1M10 21h2M19 21h2M23 21h2M6 22h1M11 22h1M19 22h1M24 22h1M6 23h1M12 23h1M18 23h1M24 23h1M6 24h1M12 24h7M24 24h1M7 25h1M12 25h7M23 25h1M8 26h5M18 26h5"/><path stroke="%23000000" d="M12 9h1M12 10h1M12 11h1M25 23h1"/><path stroke="%23f8f6f0" d="M13 9h2M17 9h2M13 10h1M18 10h1M13 11h1M18 11h1M12 14h2M18 14h1M12 15h8M11 16h9M11 17h10M10 18h11M10 19h11M11 20h9M12 21h7M12 22h7M13 23h5"/><path stroke="%23fcbd16" d="M15 11h2M13 12h6M7 21h3M21 21h2M7 22h4M20 22h4M7 23h5M19 23h5M8 24h4M19 24h4M10 25h1M20 25h2"/><path stroke="%23d48b07" d="M14 13h4M7 24h1M23 24h1M8 25h2M11 25h1M19 25h1M22 25h1"/><path stroke="%23d1d0cb" d="M14 14h4"/></svg>';

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; gl.viewport(0, 0, canvas.width, canvas.height); };
resize();
addEventListener('resize', resize);

// Physics state
const MAX_BODIES = 2000, MAX_PARTICLES = 500;
const bodyX = new Float32Array(MAX_BODIES), bodyY = new Float32Array(MAX_BODIES);
const bodyVX = new Float32Array(MAX_BODIES), bodyVY = new Float32Array(MAX_BODIES);
const bodySize = new Float32Array(MAX_BODIES), bodySpawn = new Float32Array(MAX_BODIES);
const bodyDead = new Uint8Array(MAX_BODIES);
const partX = new Float32Array(MAX_PARTICLES), partY = new Float32Array(MAX_PARTICLES);
const partVX = new Float32Array(MAX_PARTICLES), partVY = new Float32Array(MAX_PARTICLES);
const partLife = new Float32Array(MAX_PARTICLES), partSize = new Float32Array(MAX_PARTICLES);

let bodyCount = 0, partCount = 0, animating = false, sunX, sunY;

function spawnOrbit(e) {
    e.preventDefault();
    const rect = penguin.getBoundingClientRect();
    sunX = rect.left + rect.width / 2;
    sunY = rect.top + rect.height / 2;

    if (!animating) { bodyCount = 0; partCount = 0; }
    const now = performance.now(), startIdx = bodyCount;

    for (let i = 0; i < 150 && bodyCount < MAX_BODIES; i++) {
        const idx = bodyCount++;
        const edge = Math.random() * 4 | 0;
        if (edge === 0) { bodyX[idx] = Math.random() * canvas.width; bodyY[idx] = -20; }
        else if (edge === 1) { bodyX[idx] = canvas.width + 20; bodyY[idx] = Math.random() * canvas.height; }
        else if (edge === 2) { bodyX[idx] = Math.random() * canvas.width; bodyY[idx] = canvas.height + 20; }
        else { bodyX[idx] = -20; bodyY[idx] = Math.random() * canvas.height; }

        const dx = sunX - bodyX[idx], dy = sunY - bodyY[idx];
        const dist = Math.hypot(dx, dy);
        const speed = Math.sqrt(4000000 / dist) * (1.5 + Math.random() * 0.5);
        const inward = 0.6 + Math.random() * 0.3;
        const tangent = Math.sqrt(1 - inward * inward) * (Math.random() > 0.5 ? 1 : -1);

        bodyVX[idx] = (dx / dist * inward - dy / dist * tangent) * speed;
        bodyVY[idx] = (dy / dist * inward + dx / dist * tangent) * speed;
        bodySize[idx] = 28 * (0.7 + Math.random() * 0.6);
        bodySpawn[idx] = now + (idx - startIdx) * 8;
        bodyDead[idx] = 0;
    }

    if (animating) return;
    animating = true;
    let lastTime = now;

    (function simulate() {
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.033);
        lastTime = now;

        // Update bodies
        for (let i = 0; i < bodyCount; i++) {
            if (bodyDead[i] || now < bodySpawn[i]) continue;
            const dx = sunX - bodyX[i], dy = sunY - bodyY[i];
            const distSq = dx * dx + dy * dy + 400;
            const f = 4000000 / distSq / Math.sqrt(distSq);
            bodyVX[i] = (bodyVX[i] + f * dx * dt) * 0.9995;
            bodyVY[i] = (bodyVY[i] + f * dy * dt) * 0.9995;
            bodyX[i] += bodyVX[i] * dt;
            bodyY[i] += bodyVY[i] * dt;

            if (dx * dx + dy * dy < 2500) {
                bodyDead[i] = 1;
                for (let p = 0; p < 6 && partCount < MAX_PARTICLES; p++) {
                    const pi = partCount++, angle = p / 6 * Math.PI * 2;
                    partX[pi] = bodyX[i]; partY[pi] = bodyY[i];
                    partVX[pi] = Math.cos(angle) * 200;
                    partVY[pi] = Math.sin(angle) * 200;
                    partLife[pi] = 0.4;
                    partSize[pi] = bodySize[i] * 0.4;
                }
            }
        }

        // Update particles
        for (let i = 0; i < partCount; i++) {
            if (partLife[i] <= 0) continue;
            partX[i] += partVX[i] * dt;
            partY[i] += partVY[i] * dt;
            partLife[i] -= dt;
        }

        // Build instance data
        let count = 0;
        for (let i = 0; i < bodyCount; i++) {
            if (bodyDead[i] || now < bodySpawn[i]) continue;
            instData[count * 3] = bodyX[i];
            instData[count * 3 + 1] = bodyY[i];
            instData[count * 3 + 2] = bodySize[i];
            alphaData[count++] = 1;
        }
        for (let i = 0; i < partCount; i++) {
            if (partLife[i] <= 0) continue;
            instData[count * 3] = partX[i];
            instData[count * 3 + 1] = partY[i];
            instData[count * 3 + 2] = partSize[i];
            alphaData[count++] = partLife[i] * 2.5;
        }

        // Render
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, instData.subarray(0, count * 3));
        gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, alphaData.subarray(0, count));
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
        requestAnimationFrame(simulate);
    })();
}

const updateSun = () => {
    if (!animating) return;
    const rect = penguin.getBoundingClientRect();
    sunX = rect.left + rect.width / 2;
    sunY = rect.top + rect.height / 2;
};
addEventListener('resize', updateSun);
addEventListener('scroll', updateSun);

penguin.addEventListener('mouseenter', () => penguin.classList.add('jumping'));
penguin.addEventListener('animationend', () => penguin.classList.remove('jumping'));
penguin.addEventListener('click', spawnOrbit);
penguin.addEventListener('touchstart', spawnOrbit, { passive: false });
