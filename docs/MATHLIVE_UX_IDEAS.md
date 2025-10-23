# MathLive UX Ideas & Alternatives

## Current UX Flow

### Dialog-Based Editing (Current Implementation)

**User Journey:**
```
1. User writing question text in editor
2. Needs to insert math formula
3. Clicks "𝑥²" button in toolbar
4. Dialog opens, covering the document
5. Types LaTeX in text input: "x^2 + y^2 = z^2"
6. Sees preview below input
7. Clicks "Insert"
8. Returns to editor, formula appears
```

**Pros:**
- ✅ Focused editing environment
- ✅ More space for complex formulas
- ✅ Can include help documentation
- ✅ Symbol palette easily accessible

**Cons:**
- ❌ Breaks document flow
- ❌ Context switching
- ❌ Extra clicks (open, insert, close)
- ❌ Can't see surrounding content
- ❌ Modal fatigue on mobile

---

## Proposed UX Options

### Option A: MathLive Dialog (Recommended First Step)

Replace current LaTeX text dialog with MathLive WYSIWYG editor dialog.

**User Journey:**
```
1. User writing question
2. Clicks "𝑥²" button
3. MathLive dialog opens
4. User types "x^2" and sees "x²" immediately
5. Can use virtual keyboard for symbols
6. Clicks "Insert"
7. Formula appears in editor
```

**Example UI:**
```
┌─────────────────────────────────────────────┐
│ Math Editor                              [×]│
│─────────────────────────────────────────────│
│                                             │
│  [     Edit formula here (WYSIWYG)      ]  │
│  │                                          │
│  │  x² + y² = z²                           │
│  │_                                         │
│                                             │
│  Tips:                                      │
│  • Type "x^2" for superscript               │
│  • Use "/" for fractions                    │
│  • Type "\sqrt" for square root             │
│                                             │
│  [Clear]              [Cancel]  [Insert]   │
└─────────────────────────────────────────────┘
```

**Improvements over current:**
- ✅ Visual editing (WYSIWYG)
- ✅ No LaTeX knowledge required
- ✅ Virtual keyboard on mobile
- ✅ Immediate visual feedback
- ✅ Easy for beginners

**Still has:**
- ⚠️ Dialog overhead (context switch)
- ⚠️ Multiple clicks
- ⚠️ Can't see document while editing

**Implementation Effort:** Low (2-3 days)

---

### Option B: Inline Popover Editor

Click to insert inline, formula edits in small popover above/below cursor.

**User Journey:**
```
1. User writing question
2. Clicks "𝑥²" button (or types "$")
3. Small MathLive editor appears inline
4. Edit directly in document flow
5. Press Enter or click away
6. Formula remains in place
```

**Example UI:**
```
Question: Calculate when ┌──────────────────┐ equals zero.
                         │ x² + 2x + 1      │
                         │                  │
                         │ [🔘 Keyboard]    │
                         └──────────────────┘
                         
Document text continues here...
```

**Visual Design:**
```
Before formula:
┌─────────────────────────────────────┐
│ The solution to the equation [📐]   │
│ is approximately 3.14.              │
└─────────────────────────────────────┘

Click formula button:
┌─────────────────────────────────────┐
│ The solution to the equation        │
│ ┌─────────────────────────┐         │
│ │ [MathLive editor here]  │         │
│ │ x² + y²                 │         │
│ │ [keyboard button]       │         │
│ └─────────────────────────┘         │
│ is approximately 3.14.              │
└─────────────────────────────────────┘

After pressing Enter:
┌─────────────────────────────────────┐
│ The solution to the equation x²+y²  │
│ is approximately 3.14.              │
└─────────────────────────────────────┘
```

**Pros:**
- ✅ No context switching
- ✅ Inline editing
- ✅ See surrounding content
- ✅ Faster workflow
- ✅ Modern UX

**Cons:**
- ❌ Less space for complex formulas
- ❌ Can be cramped on mobile
- ❌ Might obscure content below
- ❌ Complex TipTap integration

**Implementation Effort:** Medium-High (1-2 weeks)

---

### Option C: Inline + Full Dialog (Hybrid)

Best of both worlds: quick inline editing for simple formulas, full dialog for complex ones.

**User Journey - Simple Edit:**
```
1. Click existing formula
2. Inline editor appears
3. Quick edit
4. Press Enter
```

**User Journey - Complex Formula:**
```
1. Click "𝑥²" in toolbar
2. Full MathLive dialog opens
3. Access to templates, help, etc.
4. Insert formula
```

**User Journey - Expand:**
```
1. Editing inline
2. Formula gets complex
3. Click "Expand" button
4. Opens full dialog with current content
5. Continue editing with more space
```

**Example UI:**

Inline editing:
```
Question text here ┌──────────────────┐ more text
                   │ x² + y²          │
                   │ [⤢ Expand]       │
                   └──────────────────┘
```

Click "Expand" →

```
┌─────────────────────────────────────────────┐
│ Math Editor (Expanded View)              [×]│
│─────────────────────────────────────────────│
│                                             │
│  [     Large editing area                ] │
│  │                                          │
│  │  x² + y² = z²                           │
│  │_                                         │
│                                             │
│  [Templates] [Symbols] [Functions]          │
│                                             │
│  [Close]              [Cancel]  [Insert]   │
└─────────────────────────────────────────────┘
```

**Pros:**
- ✅ Flexibility for all use cases
- ✅ Quick edits stay inline
- ✅ Complex formulas get space
- ✅ Best user experience

**Cons:**
- ❌ Most complex to implement
- ❌ Two editing modes to maintain
- ❌ User learning curve

**Implementation Effort:** High (2-3 weeks)

---

### Option D: Trigger-Based Inline (Advanced)

Automatically opens inline editor when user types certain characters.

**User Journey:**
```
1. User typing question
2. Types "$" character
3. MathLive editor appears inline automatically
4. User types formula
5. Types "$" again or presses Esc
6. Formula locks in place
```

**Example UI:**
```
Typing: "The equation $█"

Automatically becomes:
┌─────────────────────────────────────┐
│ The equation ┌──────────────┐       │
│              │ [Math editor] │       │
│              └──────────────┘       │
└─────────────────────────────────────┘

After "$": "The equation $x^2$"
Renders as: "The equation x²"
```

**Pros:**
- ✅ Zero clicks to start
- ✅ Natural LaTeX-like flow
- ✅ Power user friendly
- ✅ Fastest workflow

**Cons:**
- ❌ Discovery issue (hidden feature)
- ❌ Conflicts with literal "$" character
- ❌ Complex state management
- ❌ Needs good documentation

**Implementation Effort:** High (2+ weeks)

---

### Option E: Sidebar Panel (Alternative Approach)

Persistent math editing panel on the side, separate from document.

**User Journey:**
```
1. Click "Math Panel" in toolbar
2. Panel slides in from right
3. Edit formulas in panel
4. Drag or click to insert
5. Panel stays open for multiple insertions
```

**Example UI:**
```
┌──────────────────────┬──────────────────┐
│ Question Editor      │ Math Panel       │
│                      │                  │
│ Type your question   │ [MathLive Editor]│
│ here. The formula    │                  │
│ ______ equals zero.  │  x² + y² = z²   │
│                      │                  │
│                      │ [Insert]         │
│                      │                  │
│                      │ Recent:          │
│                      │ • x²             │
│                      │ • √x             │
│                      │ • ∑ᵢ₌₁ⁿ         │
│                      │                  │
│                      │ [Templates] [×]  │
└──────────────────────┴──────────────────┘
```

**Pros:**
- ✅ Non-modal (see both editor and panel)
- ✅ Can edit multiple formulas
- ✅ Save frequently used formulas
- ✅ More screen space utilization

**Cons:**
- ❌ Takes up screen real estate
- ❌ Poor mobile experience
- ❌ Not standard UX pattern
- ❌ Complex state synchronization

**Implementation Effort:** Medium-High (1-2 weeks)

---

## Recommendation Matrix

| Option | UX Score | Impl. Effort | Mobile | Best For |
|--------|----------|--------------|--------|----------|
| **A: MathLive Dialog** | ⭐⭐⭐⭐ | 🔨 Low | 📱 Good | **Start here** |
| B: Inline Popover | ⭐⭐⭐⭐⭐ | 🔨🔨 Medium | 📱 OK | Simple formulas |
| C: Hybrid | ⭐⭐⭐⭐⭐ | 🔨🔨🔨 High | 📱 Good | Power users |
| D: Trigger-Based | ⭐⭐⭐⭐ | 🔨🔨🔨 High | 📱 OK | LaTeX users |
| E: Sidebar Panel | ⭐⭐⭐ | 🔨🔨 Medium | 📱 Poor | Desktop only |

---

## Recommended Roadmap

### Phase 1: Foundation (MVP) ✅ RECOMMENDED START
**Implementation: Option A**
- Replace current dialog with MathLive dialog
- Improve UX immediately
- Learn usage patterns
- Get user feedback

**Timeline:** 2-3 days  
**Risk:** Low  
**Value:** High ⭐⭐⭐

### Phase 2: Inline Enhancement (Future)
**Implementation: Option B or C**
- Based on Phase 1 feedback
- Add inline editing for existing formulas
- Keep dialog for new/complex formulas

**Timeline:** 1-2 weeks  
**Risk:** Medium  
**Value:** Very High ⭐⭐⭐⭐

### Phase 3: Advanced Features (Optional)
**Implementation: Selected from C or D**
- Power user features
- Keyboard shortcuts
- Formula templates
- Auto-suggestions

**Timeline:** 2-3 weeks  
**Risk:** Medium-High  
**Value:** High ⭐⭐⭐

---

## User Personas & Use Cases

### Persona 1: Math Teacher (Primary User)

**Profile:**
- Creates 10-20 quizzes per week
- Each quiz has 5-10 math formulas
- Comfortable with basic LaTeX
- Uses desktop 80%, mobile 20%

**Preferred Option:** Option C (Hybrid)
- Quick inline edits for simple formulas
- Full dialog for complex equations
- Formula library for common expressions

**Example Workflow:**
```
1. Writing quiz on quadratic equations
2. Types question text
3. Needs x²: clicks formula, quick inline edit
4. Needs full quadratic formula: opens dialog, uses template
5. Saves template for future use
```

### Persona 2: Science Teacher (Secondary User)

**Profile:**
- Creates 5 quizzes per week
- Formulas are simple (subscripts, superscripts)
- Not familiar with LaTeX
- Uses desktop primarily

**Preferred Option:** Option A (MathLive Dialog)
- Visual editing, no LaTeX needed
- Virtual keyboard for symbols
- Simple and straightforward

**Example Workflow:**
```
1. Writing chemistry quiz
2. Needs H₂O formula
3. Clicks formula button
4. Uses visual editor: "H" then subscript "2" then "O"
5. Inserts formula
```

### Persona 3: Mobile User (Edge Case)

**Profile:**
- Reviews/edits quizzes on phone
- Makes quick corrections
- Limited screen space

**Preferred Option:** Option A or B
- Option A: Full-featured dialog
- Option B: Quick inline edits

**Example Workflow:**
```
1. Reviewing quiz on phone
2. Notices typo in formula
3. Taps formula
4. Quick edit in inline editor (Option B)
5. OR opens dialog for complex changes (Option A)
```

---

## Detailed UX Specifications

### Option A: MathLive Dialog (Recommended)

#### Desktop Layout
```
┌───────────────────────────────────────────────────────┐
│ Math Editor                                        [×] │
├───────────────────────────────────────────────────────┤
│                                                        │
│ ┌────────────────────────────────────────────────┐   │
│ │                                                 │   │
│ │  x² + y² = z²                                  │   │
│ │                                                 │   │
│ └────────────────────────────────────────────────┘   │
│                                                        │
│ Quick Insert:                                          │
│ [½] [x²] [√x] [∑] [∫] [π] [α] [∞]                   │
│                                                        │
│ [Show Virtual Keyboard]                               │
│                                                        │
│ Tips: Type naturally, we'll format automatically       │
│ • x^2 → x²     • x/y → x/y     • \sqrt → √           │
│                                                        │
│                              [Clear] [Cancel] [Insert]│
└───────────────────────────────────────────────────────┘
```

#### Mobile Layout
```
┌─────────────────────────┐
│ Math Editor          [×]│
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐│
│ │  x² + y²            ││
│ │                     ││
│ └─────────────────────┘│
│                         │
│ [½] [x²] [√] [∑]       │
│                         │
│ [Show Keyboard]         │
│                         │
│ [Clear] [Cancel] [✓]    │
└─────────────────────────┘
```

### Option B: Inline Popover

#### Desktop
```
Question text here ┌─────────────────────────────┐
                   │ x² + y²                     │
                   │                             │
                   │ [⌨️ Keyboard] [⤢ Expand]    │
                   └─────────────────────────────┘
continuing text...
```

#### Mobile
```
Question text
┌───────────────┐
│ x² + y²       │
│               │
│ [⌨️] [⤢]      │
└───────────────┘
more text
```

---

## A/B Testing Plan

If implementing multiple options, run A/B tests:

### Test Group A: MathLive Dialog
- 50% of users
- Track: insertion speed, error rate, feature usage

### Test Group B: Inline Popover
- 50% of users  
- Track: same metrics

### Metrics to Measure
1. **Time to insert formula** (seconds)
2. **Successful insertions** (%)
3. **User satisfaction** (1-5 rating)
4. **Mobile vs Desktop** usage
5. **Error rate** (invalid LaTeX)
6. **Feature discovery** (% users who find math editor)

---

## Accessibility Considerations

All options must support:
- ✅ Keyboard navigation
- ✅ Screen reader announcements
- ✅ High contrast mode
- ✅ Focus indicators
- ✅ ARIA labels

**MathLive advantages:**
- Built-in accessibility
- Screen reader math speech
- Keyboard shortcuts
- WCAG 2.1 AA compliant

---

## Conclusion

**Start with Option A** (MathLive Dialog):
- Lowest risk, highest immediate value
- Foundation for future enhancements
- Learn user behavior and preferences
- Iterate based on real data

**Then consider Option B or C** based on:
- User feedback from Phase 1
- Usage patterns (simple vs complex formulas)
- Mobile vs desktop usage
- Feature requests

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-22  
**Status:** Proposal for Discussion
