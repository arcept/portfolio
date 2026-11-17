# Self-hosted Google fonts

The site's Google fonts, saved here so a build never has to reach Google Fonts (`next/font/google`
downloads them at build time, and failed downloads were breaking builds). Each folder holds the Latin
subset as WOFF2, loaded with `next/font/local` where the font was declared before.

Most are variable fonts, so one file carries every weight in its range (the file name says which).
Fraunces' files also carry its SOFT and opsz axes. Google Sans also keeps its `symbols` file (the
arrows and ✦ the homepage sets in it), loaded as a second face right after it (`app/_home/fonts.js`);
the other families never had those characters, so they fall back to the system font as before.

All of them are published on Google Fonts under the SIL Open Font License 1.1, which allows bundling
and redistributing them with the site.

To add a weight or a family, download it from fonts.googleapis.com/css2 with a modern browser's
User-Agent (so the response lists WOFF2 files), take the `/* latin */` faces, and add their files and
weight ranges to the `localFont` call.
