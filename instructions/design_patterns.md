# React Native Screen Design Patterns

## Directory Structure
```
ScreenName/
├── index.js           # Main container component
├── components/        # Screen-specific components
│   └── index.js      # Export all components
└── hooks/            # Screen-specific custom hooks
    └── index.js      # Export all hooks

```

## Component Structure Guidelines

### 1. Main Container (index.js)
- State management
- Data fetching
- Error handling
- Navigation logic
- Layout structure
- Component composition

### 2. Component Guidelines
- Single responsibility
- Props interface documentation
- Local state only when necessary
- Proper error boundaries
- Performance optimization
- Consistent styling patterns

## Implementation Checklist

### 1. Initial Setup
- [ ] Create screen directory structure
- [ ] Move existing code to index.js
- [ ] Setup component exports

### 2. Component Breakdown
- [ ] Identify reusable sections
- [ ] Create separate component files
- [ ] Implement prop interfaces
- [ ] Add debug logging

### 3. State Management
- [ ] Identify global vs local state
- [ ] Implement loading states
- [ ] Handle error states
- [ ] Add data fetching logic

### 4. Styling
- [ ] Use theme constants
- [ ] Implement responsive layouts
- [ ] Add proper spacing
- [ ] Handle safe areas

### 5. Performance
- [ ] Implement useCallback/useMemo
- [ ] Add proper list rendering
- [ ] Optimize images and animations
- [ ] Add loading skeletons

### 6. Testing & Documentation
- [ ] Add component documentation
- [ ] Implement basic tests
- [ ] Add accessibility labels
- [ ] Document complex logic

## Code Standards

### 1. File Naming
- PascalCase for components
- camelCase for utilities and hooks
- index.js for exports

### 2. Component Template
```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@theme';

// Debug logging
console.debug('ComponentName mounted');

const ComponentName = ({ prop1, prop2 }) => {
  // Component logic

  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base styles
  }
});

export default ComponentName;
```

### 3. Hook Template
```javascript
import { useState, useEffect } from 'react';

const useCustomHook = (params) => {
  // Hook logic
  
  return {
    // Hook return values
  };
};

export default useCustomHook;
```

## Performance Guidelines

1. Use `useCallback` for function props
2. Implement `useMemo` for expensive calculations
3. Use `React.memo()` for pure components
4. Implement proper list rendering with `FlatList`
5. Optimize image loading and caching
6. Add loading states and skeletons

## Debug Logging Standards

1. Component mounting
```javascript
console.debug('ComponentName mounted');
```

2. Data fetching
```javascript
console.debug('Fetching data:', { params });
console.debug('Data received:', { data });
```

3. User interactions
```javascript
console.debug('User action:', { action, data });
```

4. Error handling
```javascript
console.error('Error in ComponentName:', error);
```

## Accessibility Guidelines

1. Add proper accessibility labels
2. Implement proper navigation flow
3. Use semantic HTML elements
4. Add proper color contrast
5. Implement proper touch targets

## Theme Integration

1. Use theme constants for:
- Colors
- Spacing
- Typography
- Border radius
- Shadows

2. Example:
```javascript
import { COLORS, SPACING, FONT, RADIUS } from '@theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  text: {
    fontSize: FONT.size.md,
    color: COLORS.text,
  }
});
```

## Error Handling

1. Implement proper error boundaries
2. Add user-friendly error messages
3. Add retry mechanisms
4. Log errors properly
5. Handle edge cases

## Navigation Standards

1. Use typed navigation
2. Implement proper deep linking
3. Add navigation guards
4. Handle navigation events
5. Add proper transitions

## State Management Guidelines

1. Local vs Global State
- Use local state for UI-specific data
- Use global state for shared data
- Implement proper data fetching
- Add loading states

2. Example:
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch data
      setData(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
``` 