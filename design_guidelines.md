# VirtuBuild.ai Design Guidelines

## Design Approach
**Reference-Based + Custom System Hybrid**: Draw inspiration from developer-focused platforms (Replit, Linear, Vercel) combined with creative tools (Figma, Framer, Midjourney) to create a futuristic AI creation studio aesthetic.

## Visual Identity

### Color Palette
- **Primary**: Neon Purple (#6C63FF) - Used for primary CTAs, active states, key UI elements
- **Secondary**: Cyan Blue (#00D4FF) - Accent color for interactive elements, highlights, secondary actions
- **Background**: Deep Space (#0B0B15) - Main background creating depth and focus
- **Surface**: Slightly lighter than background (#151520) for cards, panels, and elevated elements
- **Text Primary**: Off-white (#F8F9FA) for main content
- **Text Secondary**: Muted gray (#A0A0B0) for supporting text
- **Gradient**: Purple-to-cyan gradients for hero sections, buttons, and visual highlights

### Typography
**Font Families**:
- **Display/Headers**: Inter (700-800 weight) - Bold, modern, tech-forward
- **Body Text**: Inter (400-500 weight) - Clean readability
- **Code/Monospace**: JetBrains Mono - For code editor and technical elements

**Hierarchy**:
- Hero Headlines: 3xl-5xl, bold, gradient text treatment
- Section Headers: 2xl-3xl, semibold
- Card Titles: xl, semibold
- Body Text: base-lg, regular
- Captions: sm, medium

### Layout System
**Spacing**: Use Tailwind units of 1, 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Tight elements: 1-2 units (p-1, gap-2)
- Standard spacing: 4-8 units (p-4, m-6, gap-8)
- Section spacing: 12-24 units (py-16, my-20)

**Container Widths**:
- Marketing pages: max-w-7xl
- Dashboard content: max-w-screen-2xl
- Code editors: Full width with internal constraints

## Core Components

### Navigation
- **Main Header**: Fixed top position, glass-morphism effect (backdrop blur, semi-transparent), neon border bottom
- **Studio Tabs**: Horizontal tab navigation with icon + label, active state with gradient underline
- **Mobile**: Slide-out drawer with studio icons in vertical list

### Hero Section
- **Layout**: Full viewport height (100vh) with centered content
- **Background**: Animated gradient mesh or 3D interactive globe element
- **Content**: Large gradient headline, descriptive subtext, dual CTA buttons (primary gradient, secondary outline)
- **Image**: Abstract 3D illustration or animated WebGL background showing creative tools/platforms merging
- **Particles**: Subtle floating particles or grid lines for depth

### Studio Cards
- **Grid**: 3-column on desktop (grid-cols-3), 2-column tablet, 1-column mobile
- **Card Design**: Dark surface with gradient border, icon at top, studio name, brief description, "Launch Studio" button
- **Hover State**: Lift effect (translate-y), enhanced glow on border, smooth transition
- **Icons**: Large (size-12) Lucide icons with gradient fill

### Code Editor Interface
- **Split Layout**: 50/50 split (or adjustable divider) - left pane code, right pane preview
- **Editor**: Monaco editor with VS Code dark theme, line numbers, syntax highlighting
- **Toolbar**: Top bar with file name, language selector, run button, deploy button
- **Preview**: Live iframe with device frame options (desktop/tablet/mobile)

### Dashboard
- **Sidebar**: Fixed left sidebar (w-64) with studio icons, "Create New" prominent button, user profile at bottom
- **Main Content**: Grid layout for project cards, filters/search at top, pagination at bottom
- **Project Cards**: Thumbnail preview, project name, type badge, last edited timestamp, action menu (three dots)

### AI Copilot Widget
- **Position**: Fixed bottom-right corner as floating chat bubble
- **Design**: Gradient circle button with AI sparkle icon, expands to chat interface
- **Chat UI**: Sleek chat window with message bubbles, input field, suggested prompts chips
- **Animation**: Smooth slide-up expansion, typing indicators

### Marketplace
- **Gallery Grid**: 4-column masonry layout on desktop, responsive columns
- **Project Cards**: Large thumbnail, creator avatar, project title, category badge, clone count, live demo button
- **Filters**: Top filter bar with category chips, search, sort options

### Buttons
- **Primary**: Gradient background (purple to cyan), white text, rounded corners (rounded-lg), hover lift and glow
- **Secondary**: Transparent with gradient border, gradient text, hover filled gradient
- **Ghost**: Transparent, text only, subtle hover background
- **Icon Buttons**: Circular or square with icon, subtle background, hover glow

### Form Elements
- **Input Fields**: Dark background, subtle border, focused state with gradient border glow
- **Dropdowns**: Custom styled select with gradient accent
- **Toggles**: Modern switch design with gradient active state
- **Labels**: Small caps, semibold, secondary text color

### Data Display
- **Tables**: Minimal borders, alternating row backgrounds, gradient header
- **Charts**: Use gradient fills, neon accent colors, dark backgrounds
- **Metrics Cards**: Large number display with gradient text, icon, trend indicator

## Animations
**Use Sparingly and Purposefully**:
- Page transitions: Subtle fade + slide
- Card hover: Translate-y lift with glow
- Button interactions: Scale on press, glow on hover
- Loading states: Gradient shimmer or pulse
- AI copilot: Smooth expand/collapse, typing animation
- Avoid: Excessive scroll-triggered animations, parallax (unless hero section)

## Images
**Hero Section**: Large abstract 3D illustration showing multiple creative workspaces merging (AI chat interface + code editor + game preview + website mockup) in a futuristic, holographic style - positioned as full-width background with overlay gradient

**Studio Icons**: Custom gradient-filled icons for each studio type (AI brain, website grid, chat bubble, game controller, blockchain)

**Dashboard Thumbnails**: Auto-generated preview images of user projects with gradient overlays

**Marketplace**: User-submitted project screenshots with hover zoom effect

## Responsive Behavior
- **Desktop (lg+)**: Full multi-column layouts, sidebar navigation, split-screen editors
- **Tablet (md)**: Reduce columns, collapsible sidebar, stacked editor views
- **Mobile (base)**: Single column, hamburger menu, full-screen editor or preview toggle

## Accessibility
- Maintain WCAG AA contrast ratios (adjust gradients for text readability)
- Keyboard navigation for all interactive elements
- Focus states with visible gradient outlines
- Screen reader labels for icon-only buttons
- Reduced motion alternative for users who prefer it

## Special Treatments
**Glass-morphism**: Apply to navigation bar, floating panels, modal overlays (backdrop-blur-xl, bg-opacity-10)

**Neon Glow Effects**: Use box-shadow with gradient colors for active states, hover effects, and emphasis

**Grid Patterns**: Subtle background grid or dot pattern for technical aesthetic

**3D Elements**: Hero section interactive globe or floating UI elements (use Three.js or Spline integration)

This design system creates a cutting-edge, developer-focused platform that feels both powerful and approachable, with visual cohesion across all modules while maintaining creative flexibility for each studio type.