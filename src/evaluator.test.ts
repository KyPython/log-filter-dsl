import { Lexer } from './lexer';
import { Parser } from './parser';
import { Evaluator } from './evaluator';
import { LogRecord } from './types';

function parseAndEvaluate(filter: string, record: LogRecord): boolean {
  const lexer = new Lexer(filter);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const evaluator = new Evaluator();
  return evaluator.evaluate(ast, record);
}

describe('Evaluator', () => {
  test('evaluates simple equals expression', () => {
    const record: LogRecord = { level: 'ERROR', message: 'Something went wrong' };
    expect(parseAndEvaluate('level = ERROR', record)).toBe(true);
    expect(parseAndEvaluate('level = WARN', record)).toBe(false);
  });

  test('evaluates equals with string literal', () => {
    const record: LogRecord = { service: 'auth', level: 'ERROR' };
    expect(parseAndEvaluate('service = "auth"', record)).toBe(true);
    expect(parseAndEvaluate('service = "api"', record)).toBe(false);
  });

  test('evaluates contains expression', () => {
    const record: LogRecord = { message: 'request timeout occurred' };
    expect(parseAndEvaluate('message contains "timeout"', record)).toBe(true);
    expect(parseAndEvaluate('message contains "error"', record)).toBe(false);
  });

  test('evaluates contains case-insensitively', () => {
    const record: LogRecord = { message: 'Request Timeout Occurred' };
    expect(parseAndEvaluate('message contains "timeout"', record)).toBe(true);
  });

  test('evaluates and expression', () => {
    const record: LogRecord = { level: 'ERROR', service: 'auth' };
    expect(parseAndEvaluate('level = ERROR and service = auth', record)).toBe(true);
    expect(parseAndEvaluate('level = ERROR and service = api', record)).toBe(false);
  });

  test('evaluates or expression', () => {
    const record: LogRecord = { level: 'WARN' };
    expect(parseAndEvaluate('level = WARN or level = ERROR', record)).toBe(true);
    expect(parseAndEvaluate('level = INFO or level = DEBUG', record)).toBe(false);
  });

  test('evaluates not expression', () => {
    const record: LogRecord = { level: 'INFO' };
    expect(parseAndEvaluate('not level = ERROR', record)).toBe(true);
    expect(parseAndEvaluate('not level = INFO', record)).toBe(false);
  });

  test('evaluates complex expression with parentheses', () => {
    const record: LogRecord = { service: 'auth', level: 'WARN' };
    expect(
      parseAndEvaluate('service = "auth" and (level = WARN or level = ERROR)', record)
    ).toBe(true);
  });

  test('evaluates example from requirements', () => {
    const record1: LogRecord = {
      level: 'ERROR',
      message: 'request timeout occurred'
    };
    expect(
      parseAndEvaluate('level = ERROR and message contains "timeout"', record1)
    ).toBe(true);

    const record2: LogRecord = { service: 'auth', level: 'WARN' };
    expect(
      parseAndEvaluate('service = "auth" and (level = WARN or level = ERROR)', record2)
    ).toBe(true);
  });

  test('handles missing fields gracefully', () => {
    const record: LogRecord = { level: 'ERROR' };
    expect(parseAndEvaluate('service = "auth"', record)).toBe(false);
    expect(parseAndEvaluate('service = "auth" or level = ERROR', record)).toBe(true);
  });

  test('handles nested fields with dot notation', () => {
    const record: LogRecord = {
      user: { name: 'john', role: 'admin' }
    };
    expect(parseAndEvaluate('user.name = "john"', record)).toBe(true);
    expect(parseAndEvaluate('user.role = "admin"', record)).toBe(true);
  });

  test('handles number comparisons', () => {
    const record: LogRecord = { count: 42, status: 200 };
    expect(parseAndEvaluate('count = 42', record)).toBe(true);
    expect(parseAndEvaluate('status = 200', record)).toBe(true);
  });

  test('handles case-insensitive string comparison', () => {
    const record: LogRecord = { level: 'error' };
    expect(parseAndEvaluate('level = ERROR', record)).toBe(true);
    expect(parseAndEvaluate('level = Error', record)).toBe(true);
  });
});

