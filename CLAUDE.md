# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo contains JavaScript automation scripts for Adobe Illustrator 2026. Scripts run inside Illustrator's built-in scripting engine (ExtendScript).

## Language Constraints

All scripts must be valid **ExtendScript** — Adobe's ES3-era JavaScript dialect. Do not use ES6+ syntax: no `let`, `const`, arrow functions, template literals, `for...of`, destructuring, spread, `class`, or `Promise`. Use `var`, `function`, and string concatenation.

## Project Structure

All scripts live in `/scripts/*.jsx`.

## Running Scripts

- In Illustrator: **File > Scripts > Other Script…** → select the `.jsx` file from the `/scripts` folder
- Scripts can also be placed in Illustrator's Scripts folder for persistent menu access:
  - macOS: `/Applications/Adobe Illustrator 2026/Presets/en_US/Scripts/`

## Key Globals

| Object | Description |
|--------|-------------|
| `app` | Root application object |
| `app.activeDocument` | Currently open document |
| `app.documents` | All open documents |
| `doc.layers` | Layer collection |
| `doc.pathItems` | All path objects |
| `doc.textFrames` | All text frame objects |
| `doc.artboards` | Artboard collection |
| `doc.swatches` | Swatch collection |

## Script Conventions

- File extension: `.jsx`
- Wrap scripts in an immediately-invoked function to avoid polluting the global scope: `(function() { ... })();`
- Use `#target illustrator` at the top of each script so ExtendScript Toolkit targets the right app
- Alert users with `alert()` for errors; use `$.writeln()` for debug output to the ESTK console
- Always check `app.documents.length > 0` before accessing `app.activeDocument`
