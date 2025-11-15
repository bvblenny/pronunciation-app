# Interactive Text Transcription Feature

## Overview

The Interactive Text View is a new mobile-first transcription display that replaces the traditional timeline format with a readable, interactive text interface. Users can click on individual words or sentences to get detailed information in a sleek overlay.

## Features

### 📱 Mobile-First Design
- Optimized for touch interactions
- Responsive layout across all screen sizes
- Larger touch targets for mobile devices
- Clean, readable typography

### 🎯 Interactive Text Segments
- **Word-level interactions**: Click individual words for detailed information
- **Sentence-level interactions**: Click entire sentences for broader context
- Mode selector to switch between word and sentence level
- Visual hover effects to indicate clickable elements

### 💡 Extensible Overlay System
The overlay system is designed to be easily extended with new features:

**Currently Implemented:**
- Placeholder content showing future capabilities

**Architecture Ready For:**
- Pronunciation guides with phonetic transcriptions
- Audio playback of selected segments
- Translation options in multiple languages
- Grammar information and explanations
- Custom annotations and notes
- Dictionary definitions
- Context-aware suggestions

### ♿ Accessibility
- Full keyboard navigation support (Tab, Enter, Space)
- ARIA labels and role attributes
- Screen reader friendly
- Clear focus indicators
- Accessibility hints for keyboard users

### ⚡ Performance
- Event delegation for efficient handling of many segments
- Optimized rendering for long transcripts
- Smooth animations and transitions

## Usage

### Accessing the Interactive View

1. Navigate to the Transcription page (`/transcribe`)
2. Upload an audio/video file or use live transcription
3. Select the "Interactive" tab (first tab, default view)

### Interacting with Text

1. **Choose Interaction Mode**:
   - Click "Word Level" for word-by-word interaction
   - Click "Sentence Level" for sentence-by-sentence interaction

2. **Select Text**:
   - **Mouse**: Hover over text to see highlight, click to open overlay
   - **Touch**: Tap any word or sentence to open overlay
   - **Keyboard**: Use Tab to navigate, Enter/Space to select

3. **View Information**:
   - The overlay displays information about the selected text
   - Click outside the overlay or the close button to dismiss

## Architecture

### Component Structure

```
InteractiveTextViewComponent (Main container)
├── Mode Selector (Word/Sentence toggle)
├── Text Flow Container
│   └── TextSegmentComponent[] (Individual segments)
│       ├── Hover effects
│       ├── Click handlers
│       └── Keyboard handlers
└── TextSegmentOverlayComponent (Info overlay)
    ├── Backdrop
    ├── Header with title and close button
    └── Content area (extensible)
```

### Data Flow

1. Parent component provides transcript segments
2. InteractiveTextViewComponent splits into word/sentence segments
3. TextSegmentComponents handle user interactions
4. Overlay shows content based on selected segment

### Extensibility

The overlay content system uses a type-based approach:

```typescript
interface OverlayContent {
  type: 'placeholder' | 'pronunciation' | 'definition' | 'translation' | 'grammar' | 'custom';
  title?: string;
  text?: string;
  audioUrl?: string;
  metadata?: Record<string, any>;
}
```

To add new content types:

1. Add a new type to the `OverlayContent` interface
2. Implement the display logic in `TextSegmentOverlayComponent`
3. Update the content generation in `InteractiveTextViewComponent`

## Mobile Optimization

### Touch Interactions
- Increased touch target sizes
- Disabled hover effects on touch devices
- Optimized overlay positioning for mobile screens
- Full-width mode selector on small screens

### Responsive Typography
- Fluid font sizes using clamp()
- Adjusted line heights for readability
- Optimal text spacing for mobile reading

### Viewport Considerations
- Overlay automatically positions within viewport
- Prevents overflow on small screens
- Centered overlay on keyboard navigation

## Testing

All components have comprehensive unit test coverage:

- **TextSegmentComponent**: 8 tests
  - Component creation and rendering
  - Click and keyboard interactions
  - CSS class applications
  - Accessibility attributes

- **TextSegmentOverlayComponent**: 7 tests
  - Content display
  - Event handling
  - Positioning
  - Close functionality

- **InteractiveTextViewComponent**: 12 tests
  - Segmentation logic
  - Mode switching
  - Overlay management
  - Empty states

Run tests with:
```bash
npm test
```

## Browser Support

- Modern browsers with ES6+ support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari iOS 14+
- Chrome Mobile Android 90+

## Future Enhancements

Planned features leveraging the extensible architecture:

1. **Pronunciation Analysis**
   - Phonetic transcription
   - Stress patterns
   - Common pronunciation errors

2. **Audio Playback**
   - Play selected word/sentence
   - Adjustable playback speed
   - Compare with reference audio

3. **Translation**
   - Multiple language support
   - In-context translations
   - Translation confidence scores

4. **Grammar Assistance**
   - Part of speech tagging
   - Grammar explanations
   - Usage examples

5. **Learning Tools**
   - Vocabulary lists
   - Flashcards from transcript
   - Difficulty ratings

## Contributing

When extending the interactive text view:

1. Follow the existing component patterns
2. Maintain accessibility standards
3. Add comprehensive tests for new features
4. Update this documentation
5. Ensure mobile-first responsive design

## License

Part of the Pronunciation App project.
