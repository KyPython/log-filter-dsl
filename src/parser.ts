import {
  Token,
  TokenType,
  ASTNode,
  ASTNodeType,
  ExpressionNode,
  FieldNode,
  LiteralNode,
  BinaryOpNode,
  UnaryOpNode
} from './types';

/**
 * Parser for the log filter DSL
 * Builds an AST from tokens using recursive descent parsing
 */
export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Get the current token
   */
  private currentToken(): Token {
    if (this.position >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // Return EOF
    }
    return this.tokens[this.position];
  }

  /**
   * Advance to the next token
   */
  private advance(): void {
    if (this.position < this.tokens.length) {
      this.position++;
    }
  }

  /**
   * Check if current token matches expected type
   */
  private expect(type: TokenType): Token {
    const token = this.currentToken();
    if (token.type !== type) {
      throw new Error(
        `Expected ${type}, got ${token.type} at position ${token.position}`
      );
    }
    this.advance();
    return token;
  }

  /**
   * Parse an expression (lowest precedence)
   * expression -> or_expr
   */
  public parse(): ExpressionNode {
    const expr = this.parseOr();
    if (this.currentToken().type !== TokenType.EOF) {
      throw new Error(
        `Unexpected token ${this.currentToken().type} at position ${this.currentToken().position}`
      );
    }
    return expr;
  }

  /**
   * Parse OR expression (lowest precedence)
   * or_expr -> and_expr (OR and_expr)*
   */
  private parseOr(): ExpressionNode {
    let left = this.parseAnd();

    while (this.currentToken().type === TokenType.OR) {
      this.advance();
      const right = this.parseAnd();
      left = {
        type: ASTNodeType.OR,
        left,
        right
      } as BinaryOpNode;
    }

    return left;
  }

  /**
   * Parse AND expression
   * and_expr -> not_expr (AND not_expr)*
   */
  private parseAnd(): ExpressionNode {
    let left = this.parseNot();

    while (this.currentToken().type === TokenType.AND) {
      this.advance();
      const right = this.parseNot();
      left = {
        type: ASTNodeType.AND,
        left,
        right
      } as BinaryOpNode;
    }

    return left;
  }

  /**
   * Parse NOT expression
   * not_expr -> NOT not_expr | comparison
   */
  private parseNot(): ExpressionNode {
    if (this.currentToken().type === TokenType.NOT) {
      this.advance();
      const operand = this.parseNot();
      return {
        type: ASTNodeType.NOT,
        operand
      } as UnaryOpNode;
    }

    return this.parseComparison();
  }

  /**
   * Parse comparison expression
   * comparison -> field EQUALS value | field CONTAINS value | primary
   */
  private parseComparison(): ExpressionNode {
    const left = this.parsePrimary();

    // Check for binary operators
    const token = this.currentToken();
    if (token.type === TokenType.EQUALS) {
      this.advance();
      const right = this.parsePrimary();
      // Convert identifier on right side to string literal if it's a field node
      const rightAsString = this.convertFieldToLiteralIfNeeded(right);
      return {
        type: ASTNodeType.EQUALS,
        left,
        right: rightAsString
      } as BinaryOpNode;
    }

    if (token.type === TokenType.CONTAINS) {
      this.advance();
      const right = this.parsePrimary();
      // Convert identifier on right side to string literal if it's a field node
      const rightAsString = this.convertFieldToLiteralIfNeeded(right);
      return {
        type: ASTNodeType.CONTAINS,
        left,
        right: rightAsString
      } as BinaryOpNode;
    }

    return left;
  }

  /**
   * Convert a field node to a string literal if needed
   * (Unquoted identifiers on the right side of operators are treated as string values)
   */
  private convertFieldToLiteralIfNeeded(node: ExpressionNode): ExpressionNode {
    if (node.type === ASTNodeType.FIELD) {
      const fieldNode = node as any;
      return {
        type: ASTNodeType.STRING,
        value: fieldNode.name
      } as LiteralNode;
    }
    return node;
  }

  /**
   * Parse primary expression (field, literal, or parenthesized expression)
   * primary -> IDENTIFIER | STRING | NUMBER | LPAREN expression RPAREN
   */
  private parsePrimary(): ExpressionNode {
    const token = this.currentToken();

    // Parenthesized expression
    if (token.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseOr();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    // String literal
    if (token.type === TokenType.STRING) {
      this.advance();
      return {
        type: ASTNodeType.STRING,
        value: token.value as string
      } as LiteralNode;
    }

    // Number literal
    if (token.type === TokenType.NUMBER) {
      this.advance();
      return {
        type: ASTNodeType.NUMBER,
        value: token.value as number
      } as LiteralNode;
    }

    // Identifier (field name)
    if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      return {
        type: ASTNodeType.FIELD,
        name: token.value as string
      } as FieldNode;
    }

    throw new Error(
      `Unexpected token ${token.type} at position ${token.position}`
    );
  }
}

