# Enigma Brute Force Lab

A minimalist interactive website/game that teaches how an Enigma-like rotor machine works and how brute forcing feels conceptually.

## What it teaches

- A letter passes through a plugboard, rotors, a reflector, then back through the rotors.
- Rotor positions change the output.
- Brute forcing means trying candidate keys, decrypting, scoring/rejecting, and repeating until readable text appears.

## Important simplification

This is an educational model, not a perfect wartime Enigma emulator. It uses historical Enigma I rotor wirings and Reflector B, but simplifies stepping into odometer-style stepping and brute-forces only 26³ rotor starting positions.
