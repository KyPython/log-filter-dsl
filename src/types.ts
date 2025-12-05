/**
 * Token types for the log filter DSL
 */
export enum TokenType {
  // Literals
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  
  // Operators
  EQUALS = 'EQUALS',
  CONTAINS = 'CONTAINS',
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  
  // Grouping
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  
  // End of input
  EOF = 'EOF'
}

/**
 * Token representation
 */
export interface Token {
  type: TokenType;
  value: string | number;
  position: number;
}

/**
 * AST node types
 */
export enum ASTNodeType {
  // Comparison operations
  EQUALS = 'EQUALS',
  CONTAINS = 'CONTAINS',
  
  // Logical operations
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  
  // Field access
  FIELD = 'FIELD',
  
  // Literals
  STRING = 'STRING',
  NUMBER = 'NUMBER'
}

/**
 * Base AST node interface
 */
export interface ASTNode {
  type: ASTNodeType;
}

/**
 * Field access node
 */
export interface FieldNode extends ASTNode {
  type: ASTNodeType.FIELD;
  name: string;
}

/**
 * Literal value node
 */
export interface LiteralNode extends ASTNode {
  type: ASTNodeType.STRING | ASTNodeType.NUMBER;
  value: string | number;
}

/**
 * Union type for all AST nodes
 * Forward declaration to allow circular reference
 */
export type ExpressionNode = BinaryOpNode | UnaryOpNode | FieldNode | LiteralNode;

/**
 * Binary operation node (e.g., =, contains, and, or)
 */
export interface BinaryOpNode extends ASTNode {
  type: ASTNodeType.EQUALS | ASTNodeType.CONTAINS | ASTNodeType.AND | ASTNodeType.OR;
  left: ExpressionNode;
  right: ExpressionNode;
}

/**
 * Unary operation node (not)
 */
export interface UnaryOpNode extends ASTNode {
  type: ASTNodeType.NOT;
  operand: ExpressionNode;
}

/**
 * Log record type (can be JSON object or key=value parsed object)
 */
export type LogRecord = Record<string, any>;

