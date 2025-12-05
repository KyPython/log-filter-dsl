# Quick Start Guide

## Install

```bash
npm install -g log-filter-dsl
```

## Use

```bash
# Filter JSON logs
cat app.log | log-filter 'level = ERROR'

# Filter with complex conditions
cat app.log | log-filter 'service = "auth" and (level = WARN or level = ERROR)'

# Filter with contains
cat app.log | log-filter 'message contains "timeout"'
```

## Examples

### Filter error logs
```bash
log-filter 'level = ERROR' < app.log
```

### Filter by service and level
```bash
log-filter 'service = "auth" and level = ERROR' < app.log
```

### Exclude debug logs
```bash
log-filter 'not level = DEBUG' < app.log
```

## Supported Formats

- **JSON**: `{"level":"ERROR","message":"error occurred"}`
- **Key=Value**: `level=ERROR message="error occurred"`

## Learn More

- [Full Documentation](README.md)
- [GitHub Repository](https://github.com/KyPython/log-filter-dsl)
- [npm Package](https://www.npmjs.com/package/log-filter-dsl)
