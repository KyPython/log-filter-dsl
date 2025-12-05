import { Token, TokenType } from './types';

/**
 * Lexer for the log filter DSL
 * Tokenizes input strings into tokens
 */
export class Lexer {
  private input: string;
  private position: number = 0;
  private currentChar: string | null;

  constructor(input: string) {
    this.input = input;
    this.currentChar = input.length > 0 ? input[0] : null;
  }

  /**
   * Advance to the next character
   */
  private advance(): void {
    this.position++;
    if (this.position >= this.input.length) {
      this.currentChar = null;
    } else {
      this.currentChar = this.input[this.position];
    }
  }

  /**
   * Skip whitespace characters
   */
  private skipWhitespace(): void {
    while (this.currentChar !== null && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  /**
   * Read an identifier or keyword (supports dots for nested fields)
   */
  private readIdentifier(): string {
    let result = '';
    while (
      this.currentChar !== null &&
      (/\w/.test(this.currentChar) || this.currentChar === '_' || this.currentChar === '.')
    ) {
      result += this.currentChar;
      this.advance();
    }
    return result;
  }

  /**
   * Read a string literal (handles escaped quotes)
   */
  private readString(): string {
    let result = '';
    const quote = this.currentChar as string;
    this.advance(); // Skip opening quote

    while (this.currentChar !== null && this.currentChar !== quote) {
      if (this.currentChar === '\\') {
        this.advance();
        if (this.currentChar === null) {
          throw new Error('Unexpected end of string');
        }
        // Handle escape sequences
        const escapedChar: string = this.currentChar;
        if (escapedChar === 'n') {
          result += '\n';
        } else if (escapedChar === 't') {
          result += '\t';
        } else if (escapedChar === 'r') {
          result += '\r';
        } else if (escapedChar === '\\') {
          result += '\\';
        } else if (escapedChar === quote) {
          result += quote;
        } else {
          result += escapedChar;
        }
      } else {
        result += this.currentChar;
      }
      this.advance();
    }

    if (this.currentChar !== quote) {
      throw new Error('Unterminated string literal');
    }
    this.advance(); // Skip closing quote
    return result;
  }

  /**
   * Read a number literal
   */
  private readNumber(): number {
    let result = '';
    while (this.currentChar !== null && /\d/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    return parseInt(result, 10);
  }

  /**
   * Check if a string is a keyword
   */
  private isKeyword(identifier: string): TokenType | null {
    const keywords: Record<string, TokenType> = {
      and: TokenType.AND,
      or: TokenType.OR,
      not: TokenType.NOT,
      contains: TokenType.CONTAINS
    };
    return keywords[identifier.toLowerCase()] || null;
  }

  /**
   * Get the next token from the input
   */
  public nextToken(): Token {
    while (this.currentChar !== null) {
      // Skip whitespace
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      const startPos = this.position;

      // Single character tokens
      if (this.currentChar === '(') {
        this.advance();
        return { type: TokenType.LPAREN, value: '(', position: startPos };
      }
      if (this.currentChar === ')') {
        this.advance();
        return { type: TokenType.RPAREN, value: ')', position: startPos };
      }
      if (this.currentChar === '=') {
        this.advance();
        return { type: TokenType.EQUALS, value: '=', position: startPos };
      }

      // String literals
      if (this.currentChar === '"' || this.currentChar === "'") {
        const value = this.readString();
        return { type: TokenType.STRING, value, position: startPos };
      }

      // Numbers
      if (/\d/.test(this.currentChar)) {
        const value = this.readNumber();
        return { type: TokenType.NUMBER, value, position: startPos };
      }

      // Identifiers and keywords (support dots for nested fields)
      if (/\w/.test(this.currentChar) || this.currentChar === '_' || this.currentChar === '.') {
        const identifier = this.readIdentifier();
        const keyword = this.isKeyword(identifier);
        if (keyword) {
          return { type: keyword, value: identifier, position: startPos };
        }
        return { type: TokenType.IDENTIFIER, value: identifier, position: startPos };
      }

      // Unknown character
      throw new Error(
        `Unexpected character: ${this.currentChar} at position ${this.position}`
      );
    }

    // End of input
    return { type: TokenType.EOF, value: '', position: this.position };
  }

  /**
   * Tokenize the entire input string
   */
  public tokenize(): Token[] {
    const tokens: Token[] = [];
    let token = this.nextToken();
    while (token.type !== TokenType.EOF) {
      tokens.push(token);
      token = this.nextToken();
    }
    tokens.push(token); // Include EOF token
    return tokens;
  }
}

