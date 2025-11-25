# 📄 Sheet Validator India - React

A powerful, production-ready React component library for validating Excel/CSV sheets with built-in Indian data validators (Aadhaar, Phone, PIN Code) and custom validation support.

## Features

- ✅ Excel (.xlsx, .xls) and CSV support
- ✅ Built-in Indian validators (Aadhaar, Phone, PIN Code)
- ✅ Custom validator functions
- ✅ **3 Styling modes**: Default CSS, Tailwind CSS, or Unstyled
- ✅ Light & Dark theme support
- ✅ Real-time validation feedback
- ✅ Detailed error reporting (row, column, value, message)
- ✅ React Hooks integration
- ✅ TypeScript support
- ✅ Accessible UI components
- ✅ Responsive design
- ✅ React 16, 17, 18 & 19 support

---

## Installation

```bash
npm install sheet-validator-india-react
```

```bash
yarn add sheet-validator-india-react
```

```bash
pnpm add sheet-validator-india-react
```

### Peer Dependencies

```json
{
  "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
  "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
}
```

---

## Quick Start

```tsx
import { SheetValidator, VALIDATORS } from 'sheet-validator-india-react';

function App() {
  return (
    <SheetValidator
      validatorConfig={{
        0: VALIDATORS.aadhaar,
        1: VALIDATORS.phone,
        2: VALIDATORS.pinCode,
      }}
      onValidationComplete={(result) => {
        console.log(result);
      }}
    />
  );
}
```

---

## Styling Options

The component supports **3 styling modes**:

### 1. Default CSS (Auto-injected)

No setup required. Styles are automatically injected.

```tsx
<SheetValidator styling="default" />
```

### 2. Tailwind CSS

For projects using Tailwind. Requires Tailwind CSS configured in your project.

```tsx
<SheetValidator styling="tailwind" />
```

### 3. Unstyled

Bring your own CSS. No styles applied.

```tsx
<SheetValidator styling="unstyled" />
```

---

## Full Example

```tsx
import { SheetValidator, VALIDATORS } from 'sheet-validator-india-react';

function App() {
  return (
    <SheetValidator
      styling="default"
      theme="light"
      title="📄 Sheet Validator"
      subtitle="Upload and validate your CSV or Excel files"
      showPreview={true}
      maxFileSize={5 * 1024 * 1024}
      validatorConfig={{
        0: VALIDATORS.aadhaar,
        1: VALIDATORS.phone,
        2: VALIDATORS.pinCode,
      }}
      columnNames={{
        0: 'Aadhaar Number',
        1: 'Phone Number',
        2: 'PIN Code',
      }}
      onValidationComplete={(result) => {
        if (result.success) {
          console.log('All rows valid!');
        } else {
          console.log(`Found ${result.invalidRows} invalid rows`);
        }
      }}
      onError={(error) => {
        console.error('Error:', error.message);
      }}
    />
  );
}
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `validatorConfig` | `Record<number, Validator>` | **required** | Column index to validator mapping |
| `onValidationComplete` | `(result) => void` | **required** | Callback with validation results |
| `styling` | `'default' \| 'tailwind' \| 'unstyled'` | `'default'` | Styling mode |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `title` | `string` | `'📄 Sheet Validator'` | Component title |
| `subtitle` | `string` | `'Upload and validate...'` | Component subtitle |
| `columnNames` | `Record<number, string>` | `{}` | Human-readable column names |
| `showPreview` | `boolean` | `true` | Show validation results UI |
| `maxFileSize` | `number` | `5242880` (5MB) | Max file size in bytes |
| `onError` | `(error) => void` | `undefined` | Error callback |

---

## Built-in Validators

| Validator | Format | Example |
|-----------|--------|---------|
| `VALIDATORS.aadhaar` | 12 digits, starts with 2-9 | `234567890123` |
| `VALIDATORS.phone` | 10 digits, starts with 6-9 | `9876543210` |
| `VALIDATORS.pinCode` | 6 digits | `110001` |

---

## Custom Validators

Create your own validator function:

```tsx
const emailValidator = (value: string) => {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return {
    valid: isValid,
    message: isValid ? 'Valid email' : 'Invalid email format',
  };
};

const panValidator = (value: string) => {
  const isValid = /^[A-Z]{5}\d{4}[A-Z]$/.test(value.toUpperCase());
  return {
    valid: isValid,
    message: isValid ? 'Valid PAN' : 'Invalid PAN format (AAAAA9999A)',
  };
};

<SheetValidator
  validatorConfig={{
    0: VALIDATORS.aadhaar,
    1: emailValidator,
    2: panValidator,
  }}
  onValidationComplete={handleResult}
/>
```

---

## Using the Hook

For custom UI, use the `useSheetValidator` hook:

```tsx
import { useSheetValidator, VALIDATORS } from 'sheet-validator-india-react';

function CustomValidator() {
  const { validateFile, loading, progress, result } = useSheetValidator();

  const handleFile = async (file: File) => {
    const result = await validateFile(file, {
      0: VALIDATORS.aadhaar,
      1: VALIDATORS.phone,
    });
    console.log(result);
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={loading}
      />
      {loading && <p>Processing: {progress}%</p>}
      {result && <p>Found {result.errors.length} errors</p>}
    </div>
  );
}
```

---

## Validation Result

```typescript
interface ValidationResult {
  success: boolean;
  message: string;
  totalRows: number;
  invalidRows: number;
  errors: ValidationError[];
}

interface ValidationError {
  row: number;
  column: number;
  value: any;
  error: string;
}
```

---

## Customizing Default Styles

Override CSS variables to customize the default theme:

```css
:root {
  --sv-primary: #3b82f6;
  --sv-success: #10b981;
  --sv-error: #ef4444;
  --sv-warning: #f59e0b;
  --sv-background: #ffffff;
  --sv-text: #1f2937;
  --sv-border: #e5e7eb;
  --sv-radius: 8px;
}

[data-theme='dark'] {
  --sv-background: #1f2937;
  --sv-text: #f3f4f6;
  --sv-border: #374151;
}
```

---

## Dark Mode

### With Default CSS

```tsx
<SheetValidator styling="default" theme="dark" />
```

### With Tailwind

Add `dark` class to your HTML element and use:

```tsx
<SheetValidator styling="tailwind" theme="dark" />
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

MIT

---

## Contributing

Contributions welcome! Please open an issue or submit a PR.

**GitHub**: [github.com/Rahulskumaroks/sheet-validator-india-react](https://github.com/Rahulskumaroks/sheet-validator-india-react)