# Project Rules

## Vue Templates

- **No function calls in templates.** All derived values must be computed properties or pre-computed in `<script setup>`. Template expressions should only reference reactive state, props, computed properties, or simple property access — never call functions.
