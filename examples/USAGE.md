# Example Usage

## Basic Examples

### Filter by level
```bash
cat examples/app.log | node ../dist/cli.js 'level = ERROR'
```

### Filter by service and level
```bash
cat examples/app.log | node ../dist/cli.js 'service = "auth" and level = ERROR'
```

### Filter with contains
```bash
cat examples/app.log | node ../dist/cli.js 'message contains "timeout"'
```

### Complex filter with parentheses
```bash
cat examples/app.log | node ../dist/cli.js 'service = "auth" and (level = WARN or level = ERROR)'
```

### Using NOT
```bash
cat examples/app.log | node ../dist/cli.js 'not level = DEBUG'
```

## Key-Value Format

The CLI also supports key=value format logs:

```bash
cat examples/keyvalue.log | node ../dist/cli.js 'level = ERROR'
```

## After Building

Once you've run `npm run build`, you can use the CLI directly:

```bash
log-filter 'level = ERROR' < examples/app.log
```

