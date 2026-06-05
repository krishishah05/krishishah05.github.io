/**
 * GOOGLE DRIVE PHOTO CONFIG
 * =========================
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a project → Enable "Google Drive API"
 * 3. Go to APIs & Services → Credentials → Create API Key
 * 4. Restrict it to: "Google Drive API" + your website's domain (HTTP referrer)
 * 5. Paste the key below as DRIVE_API_KEY
 *
 * For each section you want to connect:
 * - Create a folder in Google Drive
 * - Right-click → Share → "Anyone with the link" → Viewer
 * - Copy the folder ID from the URL:
 *   drive.google.com/drive/folders/THIS_IS_THE_FOLDER_ID
 * - Paste it under the matching key below
 *
 * Leave a value as '' to fall back to gallery-data.js for that section.
 */

const DRIVE_API_KEY = 'AIzaSyDaYzblMPlmKDxWKC5erEY52A0akVaU4L8';

const DRIVE_FOLDERS = {

  // ── HOMEPAGE PHOTOS ─────────────────────────────────────────────────
  homepage: '1A_a4I9Uj5rUA_IguPTzPbIF1_q6X3oOy',

  // ── TRAVEL ──────────────────────────────────────────────────────────
  travel: {
    aruba:            '1z_MsN7yt2wEUd_simbqPLf5Erb8OCrdu',
    canada:           '1to0TeOHkrZSlRzD5fFgUGyUjWS3TjSLD',
    'costa-rica':     '17oKkxOmJ89SxXAsCTvQ1jiQ9tRnjQV2q',
    iceland:          '1XJQbuBrDZ4rpDFWwKNpoRKoaI6YVy_5W',
    india:            '1g5v_yZl02rzEAOeXGCx7Ty-UxLT83cuR',
    jamaica:          '1jq3AAAUoxMeoRPBsRYWWaqU3vrEJm01V',
    japan:            '1DNu3-0pliK18YIKZ9841SJaKXCJNKFgF',
    mexico:           '12-suE4arnUiPtZpRMjp_O7ID8NmrE8_i',
    'new-york-city':  '1vMWvOqhg0pT27baCdQPIixcaN8DXc7aF',
    norway:           '1HwuEOSbPAHaVEu1r6m7fzhNk2w6ugnSi',
    'punta-cana':     '1ZxyoNK4-lTPdU3YL6L_KbiuERuMM5TAI',
    spain:            '1oJlrblGT20AvzmDp9m4OexAmnvLQvxuQ',
    thailand:         '1dmotFN9ve0KE4WznLwcMlEQ_eEA0R91o',
    alaska:           '1-UJoHQWamEzVt7_BY5DzAO_l3HLWB9Bq',
  },

  // ── CONCERTS ────────────────────────────────────────────────────────
  concerts: {
    'a-boogie-wit-da-hoodie': '1pato6QJYB3PNk2beu0H_9BX3xTCC_ghL',
    'atif-aslam':             '1vMt_7bMYkrqcRS6Aue2pzFl6NH1bEyRW',
    coldplay:                 '1U9cuEsVxFGgAYlY0v0sgdM_brSnT5Vi_',
    'dom-dolla':              '1mYTBz3XsAplYyBKjpChC8tMQIBACXYYH',
    'don-toliver':            '13OPFVYQpTAV0bV3tWmrAkrutx1yVwSIK',
    'future-metro-boomin':    '1W8-HxDFnVzPVlDvnOqcrK-il8uCEvEYX',
    'lil-tjay':               '1K8XhERi-10Lob6aUmNgUv_uTsXklu4RQ',
    nav:                      '13nYYt8ILtzOu3XoldzgAXUrYE8p4_I_P',
    'playboi-carti':          '1qGJdcVdticOU2TCzcEfhxwwgJ2o2swHk',
    'post-malone':            '12U3MmXHqXZMe8V838HEPGqsFZAi9gEwV',
    'rich-the-kid':           '1PFAwDYaAoZMmxKZNsuDh3byIWANhcb6c',
    'shawn-mendes':           '10up8p5LQhuWH-FR-29zjsKI0iogkJKR2',
    'travis-scott':           '19x_JojXVnGAnIl466GIvG2C_k44yjf9I',
    'the-weeknd':             '16bAGv6jKcgdkM4Vb1zAWK0E8QALrf_cK',
    'maroon-5':               '1T88qybXJmFhC49EXnj4fbs7-XFmF4eGt',
  },

  // ── SINGING PORTFOLIO ───────────────────────────────────────────────
  singing: '1Wbpzhw_nifEB9NP9P26MzJvV_F5UlgEL',

};
