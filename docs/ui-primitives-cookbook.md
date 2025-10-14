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


---

### Matching and Ranking patterns with Field

Use `Field`, `FieldLabel`, `FieldContent`, and `FieldError` to group dynamic collections for Matching and Ranking question types.

```tsx
import { Field, FieldLabel, FieldContent, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function MatchingPairsExample({ pairs, onAdd, onRemove, register, errorId, errorText }: any) {
  return (
    <Field>
      <FieldLabel>Matching pairs</FieldLabel>
      <FieldContent>
        <div className="space-y-3">
          {pairs.map((_: any, index: number) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
              <div className="sm:col-span-2 space-y-1">
                <span className="text-xs text-muted-foreground sm:hidden" aria-hidden>
                  Left
                </span>
                <Input placeholder="Left" {...register(`matchingPairs.${index}.left` as const)} />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <span className="text-xs text-muted-foreground sm:hidden" aria-hidden>
                  Right
                </span>
                <Input placeholder="Right" {...register(`matchingPairs.${index}.right` as const)} />
              </div>
              <Button type="button" variant="destructive" size="sm" onClick={() => onRemove(index)} className="w-full sm:w-auto">
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={onAdd} className="w-full sm:w-auto">
            Add
          </Button>
          <FieldError id={errorId}>{errorText}</FieldError>
        </div>
      </FieldContent>
    </Field>
  )
}

export function RankingItemsExample({ items, onAdd, onMove, onRemove, register, errorId, errorText }: any) {
  return (
    <Field>
      <FieldLabel>Ranking items</FieldLabel>
      <FieldContent>
        <div className="space-y-3">
          {items.map((_: any, index: number) => (
            <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input className="flex-1" placeholder="Item" {...register(`rankingItems.${index}` as const)} />
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => onMove(index, Math.max(0, index - 1))} className="flex-1 sm:flex-none">
                  Up
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => onMove(index, Math.min(items.length - 1, index + 1))} className="flex-1 sm:flex-none">
                  Down
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => onRemove(index)} className="flex-1 sm:flex-none">
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={onAdd} className="w-full sm:w-auto">
            Add
          </Button>
          <FieldError id={errorId}>{errorText}</FieldError>
        </div>
      </FieldContent>
    </Field>
  )
}
```

Notes:
- Keep per-row micro captions for small screens as spans with `aria-hidden` unless they truly label an input.
- Group-level labeling and errors should be handled by `Field`/`FieldLabel`/`FieldError`.

---

### Uzbekistan-only PhoneField example

The shared `PhoneField` component enforces Uzbekistan-only numbers and formats input while keeping normalized E.164 in form state.

```tsx
import { Form } from '@/components/ui/form'
import { PhoneField } from '@/components/shared/form/PhoneField'

export function UzbekistanPhoneFieldDemo({ form, disabled }: any) {
  return (
    <Form {...form}>
      <form>
        <PhoneField
          control={form.control}
          name="phone"
          label="Phone Number"
          placeholder="+998 90 123 45 67"
          disabled={disabled}
        />
      </form>
    </Form>
  )
}
```

Behavior:
- Display mask: `+998 XX XXX XX XX` with non-interactive add-on `🇺🇿 +998`.
- Form state holds normalized E.164: `+998XXXXXXXXX`.
- Robust input handling: pastes with spaces/dashes are normalized; non-digits are ignored; capped to 9 national digits.

Accessibility:
- `FieldLabel`/`htmlFor` links to the input `id`.
- Errors rendered via `FieldError` and referenced from the control with `aria-describedby`.
- Decorative country flag/prefix uses `aria-hidden`.
