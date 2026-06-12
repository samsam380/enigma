# Enigma Brute Force Lab

A minimalist interactive website/game that teaches how an Enigma-like rotor machine works and how brute forcing feels conceptually.

## What it teaches

- A letter passes through a plugboard, rotors, a reflector, then back through the rotors.
- Rotor positions change the output.
- Brute forcing means trying candidate keys, decrypting, scoring/rejecting, and repeating until readable text appears.

## Important simplification

This is an educational model, not a perfect wartime Enigma emulator. It uses historical Enigma I rotor wirings and Reflector B, but simplifies stepping into odometer-style stepping and brute-forces only 26³ rotor starting positions.

## Run locally

Open `index.html` in a browser.

Or serve it locally:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md`.
3. Go to **Settings → Pages**.
4. Deploy from the `main` branch, root folder.

## Server deployment

Copy the folder to your server web root, for example:

```bash
scp -r enigma-bruteforce-game sam@raspberrypi:/var/www/enigma
```

Then serve it using Nginx, Caddy, Apache, or a simple Python server for testing.
