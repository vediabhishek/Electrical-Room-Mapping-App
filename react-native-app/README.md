# VoltMap AI - React Native Mobile App

This is the mobile version of the VoltMap AI Electrical Mapping application, built with React Native.

## 🚀 Getting Started

To run this app locally, follow these steps:

### 1. Prerequisites
- Node.js (v16 or newer)
- React Native CLI or Expo
- Android Studio (for Android) or Xcode (for iOS)

### 2. Setup a new project
We recommend using Expo for the fastest setup:
```bash
npx create-expo-app VoltMapApp
cd VoltMapApp
```

### 3. Install Dependencies
Copy the files from this folder into your project and install the following libraries:
```bash
npm install @react-navigation/native @react-navigation/native-stack 
npm install react-native-screens react-native-safe-area-context
npm install lucide-react-native
```

For the AI Scanner (Camera integration), you will need:
```bash
npm install react-native-vision-camera
```

### 4. File Structure
Place the provided files in your project as follows:
- `App.tsx` -> Root directory
- `src/screens/` -> Create this folder and add the screen files

### 5. Running the App
```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

## 📱 Features Implemented
- **Start Screen**: Immersive landing page with indigo/emerald theme.
- **Navigation**: Full stack navigation between Buildings, Floors, Rooms, and Details.
- **AI Scanner UI**: A professional camera interface with scanning animations (simulated logic included).
- **Manual Entry**: Searchable component selection with real-time count updates.
- **Hierarchical Data**: Structure for Buildings -> Floors -> Rooms -> Boards.

## 🛠️ Next Steps for Production
1. **API Integration**: Replace the mock fetch calls in `BuildingList.tsx` and `RoomDetail.tsx` with your actual backend URL.
2. **Camera Logic**: Implement the `onFrameProcessor` in `react-native-vision-camera` to send frames to your AI model.
3. **PDF Generation**: Use `react-native-html-to-pdf` to implement the professional reporting feature on mobile.
