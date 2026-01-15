# Model Dashboard App

A Flutter mobile application for tracking model performance metrics.

## Features

- 🔐 Secure login with username/password
- 📊 Real-time performance tracking (daily & monthly targets)
- ⏱️ Session time tracking with device fingerprinting
- 📱 Beautiful Material Design UI
- 🔄 Pull-to-refresh data updates
- 💾 Secure local storage for authentication

## Setup

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Android Studio / Xcode for mobile development
- Access to the backend API at `https://www.camstudio.fun`

### Installation

1. Navigate to the project directory:
```bash
cd flutter_model_app
```

2. Install dependencies:
```bash
flutter pub get
```

3. Add wallpaper images (1.png, 2.png, 3.png, 4.png) to `assets/images/` folder

4. Run the app:
```bash
flutter run
```

## Project Structure

```
lib/
├── main.dart                   # App entry point
├── models/                     # Data models
│   └── model.dart
├── providers/                  # State management
│   ├── auth_provider.dart
│   └── dashboard_provider.dart
├── screens/                    # UI screens
│   ├── splash_screen.dart
│   ├── login_screen.dart
│   └── dashboard_screen.dart
├── services/                   # API services
│   └── api_service.dart
└── utils/                      # Helper utilities
    ├── device_helper.dart
    └── timezone_helper.dart
```

## API Configuration

The app connects to: `https://www.camstudio.fun`

To change the API URL, edit [lib/services/api_service.dart](lib/services/api_service.dart):

```dart
static const String baseUrl = 'YOUR_API_URL';
```

## Building for Production

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## Features Details

### Splash Screen
- Random wallpaper selection (1-4)
- Smooth fade-in animation
- Auto-navigation to login

### Login Screen
- Username & password validation
- Secure storage integration
- Device fingerprinting
- Session logging

### Dashboard Screen
- Today's metrics (Target/Achieved/Due)
- Monthly performance tracking
- Session time display
- Last 7 days session history
- Pull-to-refresh
- Logout functionality

## Dependencies

- `provider`: State management
- `http`: API communication
- `flutter_secure_storage`: Secure data storage
- `device_info_plus`: Device fingerprinting
- `intl`: Date/time formatting
- `google_fonts`: Custom fonts

## License

MIT License
