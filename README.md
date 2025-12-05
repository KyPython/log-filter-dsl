# Log Filter DSL

A domain-specific language (DSL) for filtering log lines, inspired by "Domain Languages" from *The Pragmatic Programmer*.

## Overview

This project implements a simple DSL that allows you to write expressive filters for log lines, similar to SQL WHERE clauses or search queries. The DSL supports comparison operations, text matching, and logical operators.

## DSL Syntax

### Comparison Operations

- **Equals**: `field = value`
  ```dsl
  level = ERROR
  service = "auth"
  count = 42
  ```

- **Contains**: `field contains "text"`
  ```dsl
  message contains "timeout"
  error contains "database"
  ```

### Logical Operations

- **AND**: `expression and expression`
  ```dsl
  level = ERROR and service = "auth"
  ```

- **OR**: `expression or expression`
  ```dsl
  level = WARN or level = ERROR
  ```

- **NOT**: `not expression`
  ```dsl
  not level = DEBUG
  ```

### Grouping

Use parentheses to group expressions and control precedence:

```dsl
service = "auth" and (level = WARN or level = ERROR)
```

### Operator Precedence

1. Parentheses (highest)
2. NOT
3. AND
4. OR (lowest)

## Examples

### Example 1: Filter by level and message
```bash
log-filter 'level = ERROR and message contains "timeout"' < app.log
```

### Example 2: Filter by service and level
```bash
log-filter 'service = "auth" and (level = WARN or level = ERROR)' < app.log
```

### Example 3: Exclude debug logs
```bash
log-filter 'not level = DEBUG' < app.log
```

### Example 4: Complex filter
```bash
log-filter '(service = "api" or service = "auth") and level = ERROR' < app.log
```

## Installation

```bash
npm install
npm run build
```

## Usage

### CLI

The CLI reads log lines from stdin and prints only those matching the filter:

```bash
log-filter "<filter expression>" < logfile.log
```

### Supported Log Formats

The tool supports two log formats:

1. **JSON** (one JSON object per line):
   ```json
   {"timestamp":"2024-01-01T12:00:00Z","level":"ERROR","service":"auth","message":"request timeout"}
   ```

2. **Key=Value** format:
   ```
   timestamp=2024-01-01T12:00:00Z level=ERROR service=auth message="request timeout"
   ```

### Programmatic Usage

```typescript
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Evaluator } from './evaluator';

const filter = 'level = ERROR and message contains "timeout"';
const lexer = new Lexer(filter);
const tokens = lexer.tokenize();
const parser = new Parser(tokens);
const ast = parser.parse();

const evaluator = new Evaluator();
const record = { level: 'ERROR', message: 'request timeout occurred' };
const matches = evaluator.evaluate(ast, record); // true
```

## Architecture

The DSL is implemented using a classic compiler architecture:

1. **Lexer** (`src/lexer.ts`): Tokenizes the input string into tokens
2. **Parser** (`src/parser.ts`): Builds an Abstract Syntax Tree (AST) from tokens using recursive descent parsing
3. **Evaluator** (`src/evaluator.ts`): Evaluates the AST against log records

### Token Types

- Identifiers (field names)
- String literals (quoted strings)
- Number literals
- Operators: `=`, `contains`, `and`, `or`, `not`
- Grouping: `(`, `)`

### AST Node Types

- Binary operations: `EQUALS`, `CONTAINS`, `AND`, `OR`
- Unary operations: `NOT`
- Field access: `FIELD`
- Literals: `STRING`, `NUMBER`

## Testing

Run tests with:

```bash
npm test
```

Tests cover:
- Lexer tokenization
- Parser AST construction
- Evaluator expression evaluation
- Edge cases and error handling

## Development

```bash
# Build TypeScript
npm run build

# Run tests
npm test

# Watch mode for tests
npm run test:watch
```

## Connection to "Domain Languages"

This project demonstrates the concept of **Domain Languages** from *The Pragmatic Programmer* by Andy Hunt and Dave Thomas. The book emphasizes:

> "When you have a problem, see if you can express the solution in the language of the problem domain."

Instead of writing complex filtering logic in a general-purpose language, we've created a small DSL that lets users express filters in a natural, domain-specific way. This makes the filters:

- **More readable**: `level = ERROR and message contains "timeout"` is clearer than nested if-statements
- **More maintainable**: Changes to filter logic don't require code changes
- **More accessible**: Non-programmers can write filters
- **More expressive**: The syntax matches the problem domain (log filtering)

## License

MIT

