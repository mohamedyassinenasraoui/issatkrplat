# Adding Your ISSAT Logo

## Option 1: Use Your Own Logo Image

To use the actual ISSAT logo you shared:

1. Save your logo image as `logo.png` (or `logo.jpg`, `logo.svg`)
2. Copy it to: `client/public/images/logo.png`
3. Update the Login page to use it:

In `client/src/pages/auth/Login.tsx`, change:
```jsx
src="/images/logo.svg"
```
to:
```jsx
src="/images/logo.png"
```

## Option 2: Keep the SVG Placeholder

The current SVG logo (`client/public/images/logo.svg`) is a simplified version inspired by the ISSAT branding. It includes:
- Dark navy blue (#1E3A5F) - matching the institutional color
- Red (#C41E3A) - matching the accent color
- Gear teeth (representing technology)
- Circuit elements (representing engineering)
- Mosque silhouette (representing Kairouan heritage)

## Color Scheme

The new design uses ISSAT's official colors:
- **Navy Blue**: `#1E3A5F` - Primary color (headers, buttons, accents)
- **Red**: `#C41E3A` - Secondary color (alerts, warnings, highlights)
- **White/Light Gray**: `#F8FAFC` - Background

## Files Updated

- `client/tailwind.config.js` - New color palette
- `client/src/index.css` - Custom styles and fonts
- `client/src/pages/auth/Login.tsx` - New login page design
- `client/src/components/layout/Layout.tsx` - New navigation design
- `client/src/pages/student/StudentDashboard.tsx` - New student dashboard
- `client/src/pages/admin/AdminDashboard.tsx` - New admin dashboard
- `client/src/components/layout/ProtectedRoute.tsx` - Loading state
- `client/public/images/logo.svg` - SVG logo placeholder

