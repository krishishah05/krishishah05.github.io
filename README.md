# krishishah05.github.io

Personal portfolio website for Krishi Shah.

**Live site:** [krishishah05.github.io](https://krishishah05.github.io)

---

## Pages

- **Home**: intro, photo collage, quick nav
- **Professional**: experience, research, awards, skills, certifications, organizations, volunteering
- **Music**: singing portfolio, recordings & performances, concerts gallery
- **Travel**: passport stamps, world map, destination photo galleries

## Features

- Light / dark mode toggle with localStorage persistence
- Cinematic intro animation on homepage
- Google Drive integration: photos and videos load directly from Drive folders
- Interactive terminal widget on Professional page
- Scroll progress bar, piano key ripple effect, scroll-reveal animations
- Fully responsive

## Google Drive Setup

Photos and videos are served dynamically from Google Drive. To configure:

1. Create a Google Cloud project and enable the **Google Drive API**
2. Create an API key restricted to your domain and the Drive API
3. Copy `js/drive-config.js`, fill in your API key and Drive folder IDs
4. Make each Drive folder public ("Anyone with the link, Viewer")

The `js/drive-config.js` file is not tracked in git.

## Tech

Pure HTML / CSS / JavaScript. No frameworks, no build step.
