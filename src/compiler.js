import JSZip from 'jszip';
// Helper to rewrite imports in transpiled JS files
export function rewriteImports(code, currentPath, fileKeys) {
  // Replace relative or absolute workspace imports
  // E.g., import App from './App.js' -> import App from './App.js'
  // E.g., import { Button } from './components/Button.js' -> import { Button } from './components/Button.js'
  // E.g., /* CSS import removed and compiled into index.html: @/src/index.css */-> commented out
  let result = code;

  // 1. Comment out CSS imports to prevent ES Module import failures in the browser
  result = result.replace(/import\s+['"]([^'"]+\.css)['"]\s*;?/g, '/* CSS import removed and compiled into index.html: $1 */');

  // 2. Rewrite paths ending in .tsx, .ts, .jsx to .js
  result = result.replace(/((?:import|export)\s+[\s\S]*?\s+from\s+['"])([^'"]+)(['"])/g, (match, prefix, source, suffix) => {
    if (source.startsWith('.') || source.startsWith('/') || source.startsWith('@/')) {
      let cleanSource = source;

      // Resolve alias '@/src/...' or '@/...' to relative path based on the current file's depth
      if (cleanSource.startsWith('@/')) {
        const segments = currentPath.split('/');
        const depth = segments.length - 2; // e.g., src/main.tsx (length 2) -> depth 0, src/components/ZipUploader.tsx (length 3) -> depth 1
        const relativePrefix = depth > 0 ? '../'.repeat(depth) : './';
        if (cleanSource.startsWith('@/src/')) {
          cleanSource = cleanSource.replace(/^@\/src\//, relativePrefix);
        } else {
          cleanSource = cleanSource.replace(/^@\//, relativePrefix);
        }
      }

      // If absolute workspace path like '/src/main.tsx', make relative to project root
      // (This prevents absolute URLs from breaking when deployed under a GitHub Pages subfolder like username.github.io/repo/)
      if (cleanSource.startsWith('/src/')) {
        const segments = currentPath.split('/');
        const depth = segments.length - 1; // e.g., src/main.tsx (length 2) -> depth 1, src/components/ZipUploader.tsx (length 3) -> depth 2
        const relativeToRootPrefix = depth > 0 ? '../'.repeat(depth) : './';
        cleanSource = cleanSource.replace(/^\/src\//, relativeToRootPrefix + 'src/');
      }
      if (cleanSource.endsWith('.tsx')) {
        cleanSource = cleanSource.slice(0, -4) + '.js';
      } else if (cleanSource.endsWith('.ts')) {
        cleanSource = cleanSource.slice(0, -3) + '.js';
      } else if (cleanSource.endsWith('.jsx')) {
        cleanSource = cleanSource.slice(0, -4) + '.js';
      } else if (!cleanSource.endsWith('.js') && !cleanSource.endsWith('.json') && !cleanSource.endsWith('.svg') && !cleanSource.endsWith('.png') && !cleanSource.endsWith('.jpg') && !cleanSource.endsWith('.jpeg') && !cleanSource.endsWith('.css')) {
        // Extensionless relative import (e.g. './components/Button') -> append '.js'
        cleanSource = cleanSource + '.js';
      }
      return `${prefix}${cleanSource}${suffix}`;
    }
    return match;
  });
  return result;
}

// Dynamically load Babel Standalone from CDN
export function loadBabelStandalone() {
  return new Promise((resolve, reject) => {
    if (window.Babel) {
      resolve(window.Babel);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@babel/standalone@7.24.0/babel.min.js';
    script.async = true;
    script.onload = () => {
      resolve(window.Babel);
    };
    script.onerror = () => {
      reject(new Error('Kunde inte ladda Babel-transpileraren från unpkg CDN. Kontrollera din internetanslutning.'));
    };
    document.head.appendChild(script);
  });
}

// The core compilation function
export async function compileZip(zipFile, onProgress) {
  const startTime = Date.now();
  const warnings = [];
  onProgress('Läser ZIP-fil...');
  const inZip = await JSZip.loadAsync(zipFile);
  const outZip = new JSZip();

  // Load Babel Standalone
  onProgress('Förbereder Babel-kompilatorn...');
  const Babel = await loadBabelStandalone();

  // Detect common prefix (e.g. folder wrapper from Mac/Windows compression or GitHub)
  const paths = Object.keys(inZip.files).filter(p => !inZip.files[p].dir);
  let commonPrefix = '';
  if (paths.length > 0) {
    const firstPath = paths[0];
    const firstSlashIdx = firstPath.indexOf('/');
    if (firstSlashIdx !== -1) {
      const potentialPrefix = firstPath.slice(0, firstSlashIdx + 1);
      const allSharePrefix = paths.every(p => p.startsWith(potentialPrefix));
      if (allSharePrefix) {
        commonPrefix = potentialPrefix;
        warnings.push(`Identifierade en omslutande mapp "${commonPrefix.slice(0, -1)}" i ZIP-filen. Mappen har tagits bort för att göra den produktionsklara strukturen ren.`);
      }
    }
  }

  // Look for configuration files in ZIP and auto-scan imports
  let packageJsonContent = '';
  let metadataJsonContent = '';
  let indexHtmlContent = '';
  let indexCssContent = '';
  const scannedPackages = new Set();
  const fileKeys = Object.keys(inZip.files);
  const cleanedFileKeys = fileKeys.map(rawPath => commonPrefix && rawPath.startsWith(commonPrefix) ? rawPath.slice(commonPrefix.length) : rawPath);
  for (const rawPath of fileKeys) {
    const file = inZip.files[rawPath];
    if (file.dir) continue;
    const path = commonPrefix && rawPath.startsWith(commonPrefix) ? rawPath.slice(commonPrefix.length) : rawPath;
    if (path.endsWith('package.json')) {
      packageJsonContent = await file.async('string');
    } else if (path.endsWith('metadata.json')) {
      metadataJsonContent = await file.async('string');
    } else if (path.endsWith('index.html')) {
      indexHtmlContent = await file.async('string');
    } else if (path.endsWith('src/index.css') || path.endsWith('index.css')) {
      indexCssContent = await file.async('string');
    }

    // Scan TSX/TS/JSX/JS files for imports to ensure we include them in the Import Map
    if (path.endsWith('.tsx') || path.endsWith('.ts') || path.endsWith('.jsx') || path.endsWith('.js')) {
      try {
        const code = await file.async('string');
        let match;
        const importRegex = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
        while ((match = importRegex.exec(code)) !== null) {
          const source = match[1];
          if (!source.startsWith('.') && !source.startsWith('/') && !source.startsWith('@/') && !source.startsWith('http://') && !source.startsWith('https://')) {
            // Extrahera baspaketnamnet (t.ex. lodash/debounce -> lodash, @radix-ui/react-slot -> @radix-ui/react-slot)
            let pkgName = source;
            if (pkgName.startsWith('@')) {
              const parts = pkgName.split('/');
              if (parts.length >= 2) {
                pkgName = `${parts[0]}/${parts[1]}`;
              }
            } else {
              const parts = pkgName.split('/');
              pkgName = parts[0];
            }
            if (pkgName && pkgName !== 'react' && pkgName !== 'react-dom') {
              scannedPackages.add(pkgName);
            }
          }
        }
      } catch (e) {
        // Ignored
      }
    }
  }

  // Parse package.json for dependencies
  let dependencies = {
    'react': '^19.0.0',
    'react-dom': '^19.0.0',
    'lucide-react': '^0.546.0',
    'motion': '^12.23.24'
  };
  let appName = 'AI Studio App';
  let appVersion = '1.0.0';
  let appDescription = 'Kompilerad AI Studio Applikation';
  if (packageJsonContent) {
    try {
      const pkg = JSON.parse(packageJsonContent);
      if (pkg.name) appName = pkg.name;
      if (pkg.version) appVersion = pkg.version;
      if (pkg.dependencies) {
        dependencies = {
          ...dependencies,
          ...pkg.dependencies
        };
      }
    } catch (e) {
      warnings.push('Kunde inte tolka package.json, använder standardberoenden.');
    }
  }
  if (metadataJsonContent) {
    try {
      const meta = JSON.parse(metadataJsonContent);
      if (meta.name) appName = meta.name;
      if (meta.description) appDescription = meta.description;
    } catch (e) {
      // Ignored
    }
  }

  // Merge auto-scanned packages that might be missing from package.json
  scannedPackages.forEach(pkg => {
    if (!dependencies[pkg]) {
      dependencies[pkg] = 'latest';
    }
  });

  // Capitalize name for presentation
  const formattedAppName = appName.split(/[-_ ]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Min PWA App';

  // Build the Import Map based on package.json dependencies
  // We point them to high-speed stable ESM CDN (esm.sh)
  const importMapImports = {
    'react': 'https://esm.sh/react@19.0.0',
    'react-dom': 'https://esm.sh/react-dom@19.0.0',
    'react-dom/client': 'https://esm.sh/react-dom@19.0.0/client',
    'react/jsx-runtime': 'https://esm.sh/react@19.0.0/jsx-runtime',
    'react/jsx-dev-runtime': 'https://esm.sh/react@19.0.0/jsx-runtime'
  };

  // Add all other found dependencies to import map
  Object.keys(dependencies).forEach(dep => {
    if (dep === 'react' || dep === 'react-dom') return;

    // Resolve dynamic version syntax (e.g. ^1.2.3 -> 1.2.3)
    const cleanVersion = dependencies[dep].replace(/[\^~>=<]/g, '').trim();
    if (dep === 'motion' || dep === 'framer-motion') {
      importMapImports['motion'] = 'https://esm.sh/motion@12.23.24';
      importMapImports['motion/react'] = 'https://esm.sh/motion@12.23.24';
    } else {
      importMapImports[dep] = `https://esm.sh/${dep}${cleanVersion && cleanVersion !== 'latest' ? '@' + cleanVersion : ''}`;
    }
  });

  // Compile individual files
  let compiledCount = 0;
  for (const rawPath of fileKeys) {
    const file = inZip.files[rawPath];
    if (file.dir) continue;

    // Strip prefix if exists to keep output zip clean and flat at root level
    const path = commonPrefix && rawPath.startsWith(commonPrefix) ? rawPath.slice(commonPrefix.length) : rawPath;

    // Ignore build configurations and development files that are not needed on GitHub Pages
    if (path === 'package.json' || path === 'tsconfig.json' || path === 'vite.config.ts' || path === '.env.example' || path === '.gitignore' || path === 'metadata.json' || path.startsWith('.git/') || path.startsWith('node_modules/') || path.includes('.aistudio')) {
      continue;
    }

    // Process JSX/TSX/TS files
    if (path.endsWith('.tsx') || path.endsWith('.ts') || path.endsWith('.jsx')) {
      onProgress(`Kompilerar ${path}...`);
      const originalCode = await file.async('string');
      let compiledCode = '';
      try {
        // Transpile using Babel
        const transpileResult = Babel.transform(originalCode, {
          presets: [['react', {
            runtime: 'automatic'
          }], ['typescript', {
            isTSX: path.endsWith('x'),
            allExtensions: true
          }]],
          filename: path
        });
        compiledCode = transpileResult.code || '';
        // Apply our custom import rewriter with the cleaned keys list
        compiledCode = rewriteImports(compiledCode, path, cleanedFileKeys);
      } catch (err) {
        warnings.push(`Fel vid kompilering av ${path}: ${err.message || err}`);
        // Fallback to original code if compilation fails
        compiledCode = originalCode;
      }

      // Save as JS in output zip
      const outPath = path.replace(/\.(tsx|ts|jsx)$/, '.js');
      outZip.file(outPath, compiledCode);
      compiledCount++;
    } else if (path.endsWith('index.html')) {
      // Handled separately below
      continue;
    } else if (path.endsWith('index.css')) {
      // CSS is packed directly into index.html or copied
      const cssContent = await file.async('string');
      // Strip tailwind import statements which are redundant with the CDN loaded styles
      const cleanedCss = cssContent.replace(/@import\s+["']tailwindcss["']\s*;?/g, '').replace(/@tailwind\s+[^;]+;?/g, '');
      indexCssContent = cleanedCss;
    } else {
      // Copy asset files (images, json, svgs, etc) completely untouched and prefix-stripped
      const assetData = await file.async('blob');
      outZip.file(path, assetData);
    }
  }

  // Generate compiled index.html
  onProgress('Genererar index.html...');
  let finalHtml = '';
  if (indexHtmlContent) {
    // 1. Injektion av Import Map
    const importMapScript = `
    <!-- Native Import Map för högpresterande ESM i webbläsaren -->
    <script type="importmap">
    {
      "imports": ${JSON.stringify(importMapImports, null, 2)}
    }
    </script>
    `;

    // 2. Tailwind CSS CDN + Anpassade CSS-stilar
    let cssInjection = `
    <!-- Tailwind CSS Play CDN för direkt rendering -->
    <script src="https://cdn.tailwindcss.com"></script>
    `;
    if (indexCssContent.trim()) {
      cssInjection += `
    <!-- Anpassade CSS-stilar från index.css -->
    <style>
      ${indexCssContent}
    </style>
    `;
    }

    // 3. PWA Meta-taggar och Manifest
    const pwaMeta = `
    <!-- PWA Kapabiliteter -->
    <link rel="manifest" href="./manifest.json" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <meta name="theme-color" content="#1e293b" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="apple-touch-icon" href="./favicon.svg" />
    `;

    // 4. Service Worker registrering
    const swRegistration = `
    <!-- Registrera Service Worker för PWA-installationsstöd och offline-läge -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrerad för appen!', reg))
            .catch(err => console.log('Service Worker misslyckades:', err));
        });
      }
    </script>
    `;
    finalHtml = indexHtmlContent;

    // Replace the title with the parsed application name
    finalHtml = finalHtml.replace(/<title>.*?<\/title>/i, `<title>${formattedAppName}</title>`);

    // Extremely robust replacement of any script tag containing main.tsx to load compiled main.js relatively
    finalHtml = finalHtml.replace(/<script\s+[^>]*src=["'](?:.*?)\/src\/main\.tsx["'][^>]*>(?:\s*<\/script>)?/gi, '<script type="module" src="./src/main.js"></script>');

    // Also replace absolute links for favicon and manifest to make them relative for subfolders like /repository-name/
    finalHtml = finalHtml.replace(/href=["']\/favicon\.svg["']/g, 'href="./favicon.svg"');
    finalHtml = finalHtml.replace(/href=["']\/manifest\.json["']/g, 'href="./manifest.json"');

    // Inject Import Map, Tailwind and PWA Meta in <head>
    if (finalHtml.includes('</head>')) {
      finalHtml = finalHtml.replace('</head>', `${pwaMeta}${importMapScript}${cssInjection}</head>`);
    } else {
      finalHtml = pwaMeta + importMapScript + cssInjection + finalHtml;
    }

    // Inject Service Worker registration at end of <body>
    if (finalHtml.includes('</body>')) {
      finalHtml = finalHtml.replace('</body>', `${swRegistration}</body>`);
    } else {
      finalHtml = finalHtml + swRegistration;
    }
  } else {
    // Generate fallback index.html if one wasn't present
    warnings.push('Ingen index.html hittades i ZIP-filen. Skapade en generisk.');
    finalHtml = `<!doctype html>
<html lang="sv">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${formattedAppName}</title>
    <link rel="manifest" href="./manifest.json" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <meta name="theme-color" content="#1e293b" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="importmap">
    {
      "imports": ${JSON.stringify(importMapImports, null, 2)}
    }
    </script>
  </head>
  <body class="bg-slate-900 text-white min-h-screen">
    <div id="root"></div>
    <script type="module" src="./src/main.js"></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js');
        });
      }
    </script>
  </body>
</html>`;
  }
  outZip.file('index.html', finalHtml);

  // Generate manifest.json for output ZIP
  onProgress('Skapar manifest.json...');
  const appManifest = {
    short_name: formattedAppName.slice(0, 12),
    name: formattedAppName,
    description: appDescription,
    icons: [{
      src: 'favicon.svg',
      type: 'image/svg+xml',
      sizes: '512x512',
      purpose: 'any maskable'
    }],
    start_url: './index.html',
    background_color: '#0f172a',
    theme_color: '#3b82f6',
    display: 'standalone',
    orientation: 'any'
  };
  outZip.file('manifest.json', JSON.stringify(appManifest, null, 2));

  // Generate sw.js for output ZIP
  onProgress('Skapar sw.js...');
  const uniqueCacheSuffix = Math.random().toString(36).substring(2, 8);
  const appSw = `const CACHE_NAME = '${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${uniqueCacheSuffix}-cache';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

// Network-First with Cache Fallback strategy
// This guarantees that any online developer sees their new commits and code updates instantly,
// while still preserving offline capability and falling back to cache when disconnected.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});`;
  outZip.file('sw.js', appSw);

  // Generate a beautiful generic favicon SVG for the compiled PWA
  onProgress('Skapar favicon...');
  const appFaviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#g)" />
  <circle cx="256" cy="256" r="140" fill="none" stroke="#ffffff" stroke-width="40" />
  <path d="M256 160 L256 352 M160 256 L352 256" stroke="#ffffff" stroke-width="40" stroke-linecap="round" />
</svg>`;
  outZip.file('favicon.svg', appFaviconSvg);

  // Package everything back into a zip
  onProgress('Paketerar den kompilerade appen...');
  const outputZip = await outZip.generateAsync({
    type: 'blob'
  });
  const durationMs = Date.now() - startTime;
  return {
    outputZip,
    result: {
      fileName: zipFile.name.replace('.zip', '') + '_compiled.zip',
      fileCount: Object.keys(outZip.files).length,
      success: true,
      warnings,
      durationMs,
      appTitle: formattedAppName,
      appVersion: appVersion
    }
  };
}