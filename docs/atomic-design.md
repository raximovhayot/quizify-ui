# Atomic Design Methodology

This document outlines the component structure of the application, following the principles of atomic design.

## Component Mapping

### Atoms

- **Location:** `src/components/ui`
- **Description:** Atoms are the basic building blocks of the application. They are the smallest, indivisible UI elements.
- **Examples:** `Button`, `Input`, `Card`, `Checkbox`, `Dialog`, `Dropdown`, `Label`, `Radio`, `Select`, `Switch`, `Textarea`

### Molecules

- **Location:** `src/components/shared`
- **Description:** Molecules are groups of atoms that function together as a unit.
- **Examples:** `Form`, `Layout`, `Navigation`, `Header`, `Footer`, `Sidebar`

### Organisms

- **Location:** `src/components/features`
- **Description:** Organisms are more complex UI components that are composed of molecules and atoms.
- **Examples:** `Profile`, `Dashboard`, `Settings`, `Course`, `Lesson`, `Quiz`
