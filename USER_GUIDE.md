# 🕉️ Hanuman Chalisa App - Asset Guide

This guide explains how to replace the demo content with your own images, audio, and text.

## 1. Your Images
Place your images in the following folder:
`public/assets/images/`

Current filenames: `image1.png`, `image2.png`, `image3.png`.
*   **Tip**: You can add as many as you want! Just update the `images` array in `src/App.jsx`.
*   **Recommended**: Use high-resolution vertical images for the best mobile feel.

## 2. Your Audio
Place your audio files (MP3/WAV) in:
`public/assets/audio/`

*   `chalisa.mp3`: Your main Hanuman Chalisa audio.
*   `bell.mp3`: Small bell sound effect.
*   `shankh.mp3`: Conch shell sound effect.

## 3. Your Text (Chalisa & Mantras)
Open this file to update the lyrics:
`src/data/chalisa.js`

Simply replace the text inside the `hindi` and `english` fields. The app will automatically update the screen.

## 4. Repetition Settings
In `src/App.jsx`, you can find the `repeatCount` logic. The app already supports repeating the audio 1, 3, 7, or 11 times.
