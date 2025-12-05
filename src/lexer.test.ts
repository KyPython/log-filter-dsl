import { Lexer } from './lexer';
import { TokenType } from './types';

describe('Lexer', () => {
  test('tokenizes simple identifier', () => {
    const lexer = new Lexer('level');
    const tokens = lexer.tokenize();
    expect(tokens).toHaveLength(2); // IDENTIFIER + EOF
    expect(tokens[0]).toEqual({
      type: TokenType.IDENTIFIER,
      value: 'level',
      position: 0
    });
  });

  test('tokenizes equals operator', () => {
    const lexer = new Lexer('level = ERROR');
    const tokens = lexer.tokenize();
    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].type).toBe(TokenType.EQUALS);
    expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
  });

  test('tokenizes string literals', () => {
    const lexer = new Lexer('message = "hello world"');
    const tokens = lexer.tokenize();
    expect(tokens[2].type).toBe(TokenType.STRING);
    expect(tokens[2].value).toBe('hello world');
  });

  test('tokenizes string literals with single quotes', () => {
    const lexer = new Lexer("message = 'hello world'");
    const tokens = lexer.tokenize();
    expect(tokens[2].type).toBe(TokenType.STRING);
    expect(tokens[2].value).toBe('hello world');
  });

  test('tokenizes escaped quotes in strings', () => {
    const lexer = new Lexer('message = "hello \\"world\\""');
    const tokens = lexer.tokenize();
    expect(tokens[2].value).toBe('hello "world"');
  });

  test('tokenizes keywords (and, or, not, contains)', () => {
    const lexer = new Lexer('level = ERROR and service = auth');
    const tokens = lexer.tokenize();
    const tokenTypes = tokens.map(t => t.type);
    expect(tokenTypes).toContain(TokenType.AND);
  });

  test('tokenizes contains keyword', () => {
    const lexer = new Lexer('message contains "timeout"');
    const tokens = lexer.tokenize();
    expect(tokens[1].type).toBe(TokenType.CONTAINS);
  });

  test('tokenizes parentheses', () => {
    const lexer = new Lexer('(level = ERROR)');
    const tokens = lexer.tokenize();
    expect(tokens[0].type).toBe(TokenType.LPAREN);
    // Tokens: LPAREN, IDENTIFIER(level), EQUALS, IDENTIFIER(ERROR), RPAREN, EOF
    expect(tokens[4].type).toBe(TokenType.RPAREN);
  });

  test('tokenizes numbers', () => {
    const lexer = new Lexer('count = 42');
    const tokens = lexer.tokenize();
    expect(tokens[2].type).toBe(TokenType.NUMBER);
    expect(tokens[2].value).toBe(42);
  });

  test('handles whitespace', () => {
    const lexer = new Lexer('level   =   ERROR');
    const tokens = lexer.tokenize();
    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].type).toBe(TokenType.EQUALS);
    expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
  });

  test('throws error on unterminated string', () => {
    const lexer = new Lexer('message = "unterminated');
    expect(() => lexer.tokenize()).toThrow('Unterminated string literal');
  });
});

