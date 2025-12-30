# Firebase Configuration Setup

## Security Notice

The Firebase API key has been moved to a separate configuration file to prevent exposure in the git repository.

## Local Development Setup

1. **Copy the example config file:**
   ```bash
   Copy-Item js/firebase-config.example.js js/firebase-config.js
   ```

2. **Edit `js/firebase-config.js`** and replace `YOUR_FIREBASE_API_KEY_HERE` with your actual Firebase API key

3. The `js/firebase-config.js` file is already in `.gitignore` and will **not** be committed to GitHub

## Important Notes

- ✅ `js/firebase-config.example.js` - Safe to commit (contains placeholder)
- ❌ `js/firebase-config.js` - Should NOT be committed (contains real API key)
- The API key is already set up locally for you

## For New Team Members

If you clone this repository:

1. Copy `js/firebase-config.example.js` to `js/firebase-config.js`
2. Get the Firebase API key from Firebase Console or from the team
3. Update the `apiKey` value in `js/firebase-config.js`

## Firebase API Key Info

Firebase API keys for web apps are **meant to be public** and are not secret. They identify your Firebase project on Google servers. The real security comes from:

1. **Firebase Security Rules** - Control who can read/write data
2. **Firebase App Check** - Prevent unauthorized access
3. **Domain restrictions** - Limit which domains can use your API key

However, GitHub secret scanning flags them, so we're using this approach to avoid alerts.

## Rotating the API Key (If Needed)

If you need to rotate the exposed key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **electric-oracle-spiritual**
3. Go to Project Settings → General
4. Under "Your apps" → Web apps, find your app
5. Click the config icon and regenerate the API key
6. Update `js/firebase-config.js` locally with the new key
7. Inform your team members to update their local config

## Files Modified

- `track.html` - Now loads config from `js/firebase-config.js`
- `admin-waybill.html` - Now loads config from `js/firebase-config.js`
- `.gitignore` - Updated to exclude `js/firebase-config.js`
