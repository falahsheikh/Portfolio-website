/* ============================================================
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Add art:    drop image files into the album's folder
               (artsite/imagefolders/<folder>) and push — they
               load automatically, no need to list them here.
   Add album:  copy one of the blocks in `albums` below and set
               its title / gif. Give it a `folder` (images), a
               `writings` list (text), or BOTH in one album.

   (The site name, tagline and intro banner are set in art.html.
    The engine that renders all this lives in app.js.)
   ============================================================ */

const CONFIG = {
    // GIFs — set once, used everywhere.
    defaultGif: './gifs/giphy2.webp',   // fallback GIF for any album without one
    headerGif:  './gifs/giphy6.webp',   // GIF in the top header

    // The repo this site is published from. On the live site GitHub Pages
    // can't list a folder in the browser, so the page asks the GitHub API
    // what's inside each folder. Only change this if the repo moves.
    repo: {
        owner: 'falahsheikh',
        name: 'Portfolio-website',
        branch: 'main',
        basePath: 'artsite',   // image folders live under this path in the repo
    },

    // ---------------------------------------------------------
    // ALBUMS — each one can hold images, writing, or both.
    //
    //   folder     './imagefolders/<name>'  every image inside loads
    //              automatically; just drop files in and push.
    //
    //   writings   [ { title, type, text, fullText } ]
    //                title      name of the piece
    //                type       any label you like: haiku, essay, poem, note…
    //                text       one-line blurb shown on the card
    //                fullText   the full piece (optional; falls back to text).
    //                           Just write plain text — a blank line starts a
    //                           new paragraph, a single line break stays in the
    //                           same one. No HTML tags needed.
    //
    //   (advanced) images   [ { path, filename } ]  list files by hand
    //                        instead of auto-loading a folder.
    //
    // ----- a MIXED album (images + writing together) -----
    //   {
    //       title: 'mixed',
    //       gif: './gifs/giphy2.webp',
    //       folder: './imagefolders/mixed',   // images auto-load from here
    //       writings: [                       // …and writing sits in the same album
    //           {
    //               title: 'a short note',
    //               type: 'note',
    //               text: 'one line shown on the card',
    //               fullText: `
    //                   First paragraph, first line.
    //                   Still the first paragraph, second line.
    //
    //                   A blank line above started a new paragraph.
    //               `,
    //           },
    //       ],
    //   },
    // ---------------------------------------------------------
    albums: [
        {
            title: 'rays',
            gif: './gifs/sun5.gif',
            writings: [
                {
                    title: 'time',
                    type: 'poetry',
                    text: 'time will continously pass you by...',
                    fullText: `
                        time will continously pass you by
                        so run forward, and fast, to escape its settling grasp

                        stop, and be left behind
                        or stay unchaging and unintersting as you just walk against it

                        ...

                        stationarily
                    `,
                },
            ],
        },
        {
            title: 'hazy',
            gif: './gifs/glitch2.gif',
            folder: './imagefolders/hazy',
        },
        {
            title: 'pairs',
            gif: './gifs/roll.gif',
            folder: './imagefolders/pairs',
        },
        {
            title: 'vesmuhunu',
            gif: './gifs/mask.gif',
            folder: './imagefolders/vesmuhunu',
        },
        {
            title: 'selene',
            gif: './gifs/butterfly2.gif',
            folder: './imagefolders/selene',
        },
        {
            title: 'BOLD.',
            gif: './gifs/monolith.gif',
            folder: './imagefolders/bold',
        },
        {
            title: 'bleeding',
            gif: './gifs/heart.gif',
            writings: [
                {
                    title: 'needings',
                    type: 'poetry',
                    text: "if you didn't have those eyes, i would love your smile...",
                    fullText: `
                        if you didn't have those eyes
                        i would love your smile
                        if you didn't have that smile
                        i would love your voice

                        if you didn't exist
                        i would love nothing
                    `,
                },
            ],
        },
    ],
};
