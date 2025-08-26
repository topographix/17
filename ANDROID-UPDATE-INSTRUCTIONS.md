# RedVelvet Android Update Instructions

## File to Update:
Replace the contents of: `android/app/src/main/assets/public/index.html`

## What's Fixed:
- Chat functionality now works properly
- Back button returns to home screen (doesn't exit app)
- Diamond counter decreases with messages
- All 5 companions have working "Start Chat" buttons
- Messaging system with companion responses

## Your Process:
1. Download this project code
2. Extract to your git uploads folder
3. Replace the android/app/src/main/assets/public/index.html file
4. Push to your GitHub repository
5. Run GitHub Actions to build APK

## Updated File Content:
The new index.html file has been updated with simplified JavaScript that works reliably in Android WebView.

## Verification:
- File size: 7,511 bytes
- Contains 5 companion selection buttons
- Chat interface with proper navigation
- Android back button handling