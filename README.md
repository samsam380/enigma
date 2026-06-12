# Enigma Brute Force Lab

A minimalist interactive website/game that teaches how an Enigma-like rotor machine works and how brute forcing feels conceptually.

## What it teaches

- A letter passes through a plugboard, rotors, a reflector, then back through the rotors.
- Rotor positions change the output.
- Brute forcing means trying candidate keys, decrypting, scoring/rejecting, and repeating until readable text appears.
- Cribs are reusable: the game starts with several known words and players can add or remove their own words before scanning.

## Brute-force playground

The crack panel lets players:

- Edit the challenge plaintext that gets encrypted with the hidden starting key.
- Add multiple known words, such as `FLEET`, `ATTACK`, `DAWN`, `WEATHER`, or any other clue they want to test.
- Choose whether every active crib must match before stopping, or whether any single crib is enough.
- Watch partial crib matches in the scan log and track the best score while the keyspace is searched.

## Important simplification

This is an educational model, not a perfect wartime Enigma emulator. It uses historical Enigma I rotor wirings and Reflector B, but simplifies stepping into odometer-style stepping and brute-forces only 26³ rotor starting positions.
