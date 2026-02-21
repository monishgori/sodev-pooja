# Hanuman Chalisa App Implementation Plan

This project aims to recreate the experience of the Spiritual Studio Hanuman Chalisa app, customized with your own images, chalisa, and mantras.

## 1. Project Setup
- [x] Initialize Vite + React project.
- [x] Create directory structure for custom assets (`public/assets/images`, `public/assets/audio`, etc.).
- [x] Clean up boilerplate code.

## 2. Audio & Logic Core
- [x] Implement an audio player hook for handling playback, looping, and repetition counts (1, 3, 7, 11).
- [x] Develop logic for cycling background images at set intervals.
- [x] Set up a data structure for synchronized lyrics (Hindi & English).

## 3. UI Design (Premium Devotional Experience)
- [x] Create a "Glassmorphic" UI layer over the dynamic background.
- [x] Implement interactive pooja elements:
    - [x] Functional Bell (with sound shell).
    - [x] Functional Shankh/Conch (with sound shell).
    - [x] Flower shower animation.
- [x] Build a sleek playback control panel.
- [x] Implement a smooth lyrics display with toggle between Hindi/English.

## 4. Features & Customization
- [ ] Settings menu for:
    - [ ] Image transition interval.
    - [ ] Selection of Repetition count.
    - [ ] Language preference.
- [ ] Offline-ready configuration (PWA features if requested).

## 5. Asset Integration
- [ ] Placeholder assets setup (user will replace these).
- [ ] Guide for the user to upload their `image/chalisa/mantra`.

---
**Current Status:** Setting up the core design system and data structure.
