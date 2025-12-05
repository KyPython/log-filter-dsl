import { Lexer } from './lexer';
import { Parser } from './parser';
import { ASTNodeType } from './types';

describe('Parser', () => {
  test('parses simple equals expression', () => {
    const lexer = new Lexer('level = ERROR');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast.type).toBe(ASTNodeType.EQUALS);
    expect((ast as any).left.type).toBe(ASTNodeType.FIELD);
    // Unquoted identifiers on right side are converted to string literals
    expect((ast as any).right.type).toBe(ASTNodeType.STRING);
    expect((ast as any).right.value).toBe('ERROR');
  });

  test('parses contains expression', () => {
    const lexer = new Lexer('message contains "timeout"');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast.type).toBe(ASTNodeType.CONTAINS);
    expect((ast as any).left.type).toBe(ASTNodeType.FIELD);
    expect((ast as any).right.type).toBe(ASTNodeType.STRING);
  });

  test('parses and expression', () => {
    const lexer = new Lexer('level = ERROR and service = auth');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast.type).toBe(ASTNodeType.AND);
  });

  test('parses or expression', () => {
    const lexer = new Lexer('level = WARN or level = ERROR');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast.type).toBe(ASTNodeType.OR);
  });

  test('parses not expression', () => {
    const lexer = new Lexer('not level = ERROR');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast.type).toBe(ASTNodeType.NOT);
  });

  test('parses parenthesized expression', () => {
    const lexer = new Lexer('(level = ERROR)');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast.type).toBe(ASTNodeType.EQUALS);
  });

  test('parses complex expression with parentheses', () => {
    const lexer = new Lexer('service = "auth" and (level = WARN or level = ERROR)');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast.type).toBe(ASTNodeType.AND);
    expect((ast as any).right.type).toBe(ASTNodeType.OR);
  });

  test('respects operator precedence (and before or)', () => {
    const lexer = new Lexer('level = ERROR and service = auth or level = WARN');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Should be: (level = ERROR and service = auth) or level = WARN
    expect(ast.type).toBe(ASTNodeType.OR);
    expect((ast as any).left.type).toBe(ASTNodeType.AND);
  });

  test('parses string literals', () => {
    const lexer = new Lexer('service = "auth"');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect((ast as any).right.type).toBe(ASTNodeType.STRING);
    expect((ast as any).right.value).toBe('auth');
  });

  test('parses number literals', () => {
    const lexer = new Lexer('count = 42');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect((ast as any).right.type).toBe(ASTNodeType.NUMBER);
    expect((ast as any).right.value).toBe(42);
  });

  test('throws error on invalid syntax', () => {
    const lexer = new Lexer('level =');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    expect(() => parser.parse()).toThrow();
  });

  test('throws error on unmatched parentheses', () => {
    const lexer = new Lexer('(level = ERROR');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    expect(() => parser.parse()).toThrow();
  });
});

