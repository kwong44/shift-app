# RealityShift App

RealityShift is a mobile application designed to empower users to transform their lives through a personalized, structured roadmap. Using React Native and Expo, the app delivers daily exercises, AI-driven insights, and adaptive progress tracking to guide users toward their goals.

## Features

1. **Onboarding with In-Depth Self-Assessment** (Implemented)
   - Collect user habits, improvement areas, goals, and preferences
   - Create personalized transformation roadmap

2. **Daily Engagement Exercises** (Coming Soon)
   - Guided Binaural Beats
   - Visualization Exercises
   - Task Planning
   - Deep Work Sessions
   - Mindfulness Check-ins
   - Journaling with AI Insights
   - Self-reflection

3. **Weekly & Quarterly Progress Tracking** (Coming Soon)
   - Progress reports and insights
   - AI-powered roadmap adaptation

## Tech Stack

- React Native / Expo
- Supabase (Authentication, Database, Storage)
- Redux (Coming Soon)
- OpenAI (Coming Soon)

## Setup Instructions

1. **Clone the Repository**

```
git clone <repository-url>
cd shift-app
```

2. **Install Dependencies**

```
npm install
```

3. **Set Up Supabase**

- Create a Supabase project at [https://supabase.com](https://supabase.com)
- Set up the required tables (self_assessments, roadmaps, etc.) as per the data model
- Update `src/config/supabase.js` with your Supabase URL and anon key

```javascript
// src/config/supabase.js
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

4. **Run the App**

```
npx expo start
```

## Database Schema

Key tables in Supabase:

- **users** (Managed by Supabase Auth)
- **self_assessments** - Stores user assessment responses
- **roadmaps** - Stores personalized transformation plans
- **progress_logs** - Tracks user engagement and progress

## Folder Structure

```
src/
├── api/              # API services
├── components/       # Reusable UI components
├── config/           # Configuration files
├── navigation/       # Navigation structure
└── screens/          # App screens
    ├── app/          # Main app screens
    ├── auth/         # Authentication screens
    └── onboarding/   # Onboarding screens
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[MIT License](LICENSE)

## UI Overhaul (2025)

The app underwent a UI overhaul to create a more modern, visually appealing experience for users on their transformation journey. The design draws inspiration from contemporary lifestyle and wellness apps with a focus on:

### Key Design Features

1. **Vibrant Gradient Cards** - Each category uses smooth color gradients for visual distinction
2. **Card-Based Layout** - Organized content in modular, rounded-corner cards 
3. **Modern Typography** - Clean, readable type hierarchy with proper visual weight
4. **Visual Progress Indicators** - Intuitive progress bars and counts
5. **Tab-Based Navigation** - Simple, icon-based bottom navigation

### Color Palette

- **Primary**: Purple (#5F52EE) - Main brand color used for interactive elements
- **Accent**: Coral (#FF5757) - For highlights and accent elements
- **Gradients**: Blue, Pink, Teal, Coral - For category cards and visual interest

### Implementation Details

The UI design system is implemented in a modular way:
- Base design tokens in `src/config/theme.js`
- Reusable components like `CustomButton`, `CustomInput`, and `OptionSelector`
- Consistent styling patterns across screens

### Usage Guidelines

When building new features:
1. Use the gradient system for main category cards
2. Maintain consistent padding with the SPACING system
3. Use provided component variants rather than custom styles
4. Follow the established color system for different states and actions

### Accessibility Considerations

- High contrast text on colored backgrounds
- Appropriate touch target sizes
- Consistent visual feedback on interaction

*Note: This design system will continue to evolve as we gather user feedback.* 