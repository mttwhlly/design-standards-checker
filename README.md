# Design Standards Checker for Figma

A comprehensive Figma plugin for ensuring design consistency by checking adherence to your team's design standards.

## Features

### 🔍 Design Validation
- Checks color usage against your allowed color palette
- Validates typography usage (fonts and text styles)
- Ensures proper spacing and alignment on your grid system
- Verifies component usage and naming conventions
- Validates accessibility standards

### 🧰 Team Standards Management
- **New:** Store standards as plugin data in each document for project-specific rules
- **New:** Import standards from team library files for team-wide consistency
- **New:** Dedicated UI for editing standards directly in the plugin
- **New:** Export/Import functionality for sharing standards between team members

### 🚦 Development Handoff
- Mark designs as "Ready for Development" after validation
- Quick on-the-fly checking as you design
- Detailed issue reporting with direct navigation to problematic elements

## Setup & Usage

### Installation
1. Install the plugin from the Figma Community
2. Access it via Plugins > Design Standards Checker

### Setting Up Your Standards
1. Go to the "Standards" tab to customize design rules
2. Configure your color palette, typography, spacing, component usage, naming conventions, and accessibility requirements
3. Your settings will be saved automatically with the document

### Importing Team Standards
1. Navigate to the "Team Library" tab
2. Enter the file key of your team's standards library file
3. Click "Import Standards" to apply team-wide standards
4. Alternatively, paste in exported standards JSON

### Validating Designs
1. Select an element or frame you want to check
2. Click the "Check Selection" button
3. Review issues in the "Issues" tab
4. Click on any issue to navigate directly to the problematic element

### Marking as Ready for Development
1. Select a frame or component
2. Run a complete check to ensure all standards are met
3. If passed, click "Mark Ready for Dev"
4. The element will be tagged as ready for development handoff

## Configuration Options

### Colors
- Define your brand color palette with hex values
- Set color tolerance levels for slight variations

### Typography
- Specify allowed font families
- Define required text style naming patterns

### Spacing
- Set your base grid unit (e.g., 8px)
- Configure tolerance percentage for alignment

### Components
- Define components that must be instances (not direct elements)
- Specify required components for different frame types

### Naming
- Set regex patterns for frame, component, and layer naming
- Enforce consistent naming conventions across your design system

### Accessibility
- Set minimum contrast ratio requirements
- Define minimum interactive element size for touch targets

## Best Practices

1. **Team Setup**: Have your design system lead export the standards configuration and share with the team
2. **Project-Specific Rules**: For projects that need different standards, use the document-specific settings
3. **Continuous Checking**: Enable "Check on selection change" for real-time feedback
4. **Pre-Handoff Verification**: Always run a complete check before marking elements as ready for development

## Troubleshooting

- **Standards Not Saving**: Ensure you have edit permissions for the document
- **Team Import Failing**: Verify the file key is correct and you have access to the team library
- **False Positives**: Adjust tolerance settings if standards are too strict

## Support & Feedback

If you encounter any issues or have suggestions for improvement, please reach out via:
- [GitHub Issues](https://github.com/yourorg/design-standards-checker/issues)
- [Figma Community Forum](https://forum.figma.com)