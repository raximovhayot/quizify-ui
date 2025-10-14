### FieldSet and FieldLegend

Use `FieldSet` to group related fields and `FieldLegend` to provide a descriptive caption. This improves accessibility by conveying relationships to assistive tech.

```tsx
import { FieldSet, FieldLegend, Field, FieldLabel, FieldContent, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function ProfileContactFields() {
  return (
    <FieldSet aria-describedby="contact-hint">
      <FieldLegend id="contact-hint">Contact information</FieldLegend>

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldContent>
          <Input id="email" type="email" placeholder="you@example.com" />
          <FieldError id="email-error" />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="phone">Phone</FieldLabel>
        <FieldContent>
          <Input id="phone" type="tel" placeholder="+1234567890" />
          <FieldError id="phone-error" />
        </FieldContent>
      </Field>
    </FieldSet>
  )
}
```

Notes:
- Prefer `FieldLegend` variant="legend" inside a `FieldSet` for a group title.
- When you visually hide a `FieldLegend`, keep it in the DOM to preserve semantics.

#### FieldLegend as label variant

```tsx
<FieldLegend variant="label">Shipping address</FieldLegend>
```

This variant is useful when you want the group title to visually match a regular label.

---

### Advanced InputGroup usage

Use `InputGroup` to add inline or block adornments such as prefix/suffix text, small buttons, or helper kbd hints. Ensure the adornments do not steal focus from the control unless intentional.

```tsx
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Eye, EyeOff, Search } from 'lucide-react'

export function PhoneWithPrefix() {
  return (
    <Field>
      <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
      <FieldContent>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText aria-hidden>+</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id="phone"
            type="tel"
            placeholder="+1234567890"
            aria-describedby="phone-error"
          />
        </InputGroup>
        <FieldError id="phone-error" />
      </FieldContent>
    </Field>
  )
}

export function PasswordWithToggle() {
  const [show, setShow] = React.useState(false)
  return (
    <Field>
      <FieldLabel htmlFor="password">Password</FieldLabel>
      <FieldContent>
        <InputGroup>
          <InputGroupInput
            id="password"
            type={show ? 'text' : 'password'}
            placeholder="Enter your password"
            aria-describedby="password-error"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              aria-label={show ? 'Hide password' : 'Show password'}
              onClick={() => setShow((s) => !s)}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldError id="password-error" />
      </FieldContent>
    </Field>
  )
}

export function SearchWithKbdHint() {
  return (
    <Field>
      <FieldLabel htmlFor="query">Search</FieldLabel>
      <FieldContent>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Search className="size-4" aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            id="query"
            type="search"
            placeholder="Search…"
            aria-describedby="query-hint"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <kbd>⌘</kbd> <kbd>K</kbd>
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <p id="query-hint" className="sr-only">
          Type to search. Press Command and K for the command palette.
        </p>
      </FieldContent>
    </Field>
  )
}
```

Accessibility tips:
- Keep labels associated via `htmlFor` and matching `id` on the control.
- If you render helper or error text, give it a stable `id` and reference it from the control via `aria-describedby`.
- Mark purely decorative icons with `aria-hidden`.
