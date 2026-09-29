# Cookie Clicker Web Application

A simple, interactive web application featuring a centered SVG cookie button, a click counter, and persistent storage via browser cookies (`document.cookie`) with client-side security protections.

## Features

- **Centered Interactive Cookie**: Built using clean SVG graphics with smooth hover and click animations.
- **Click Counter Display**: Real-time counter showing total clicks.
- **Visual Feedback**: Floating `+1` animation appears where the cookie is clicked.
- **Cookie Persistence**: Saves the click count in `document.cookie` (`cookieClicks`).
- **Cookie Integrity Verification**: Uses a hashed signature (`cookieSig`) to detect manual tampering of the cookie value. If modified directly, the application resets the count to 0.
- **Client-Side Anti-Tampering Protections**:
  - Disabled right-click context menu (`contextmenu` prevention).
  - Intercepted developer tool shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U).
- **Reset Functionality**: Allows resetting the counter back to 0.
- **Accessibility & Responsiveness**: Fully keyboard navigable (`Space`/`Enter` keys on the cookie) and mobile-responsive.

> **Security Disclaimer**:
> Client-side anti-tampering measures (such as blocking right-click or F12) and cookie checksums reduce casual manual modification, but true security cannot rely solely on the client side. Any determined user can bypass browser-level restrictions.

## File Structure

- `index.html` - HTML document structure, inline CSS styling, and SVG cookie layout.
- `script.js` - Application logic including cookie read/write, signature calculation, animations, and anti-tampering listeners.
- `README.md` - Documentation for setup and usage.

## How to Run

1. Open `index.html` directly in any standard browser (e.g. Chrome, Firefox, Safari, Edge).
2. Click the cookie in the center of the screen to increase the counter.
3. Refresh the page to verify that your click count persists via cookies.
