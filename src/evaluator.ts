import {
  ExpressionNode,
  ASTNodeType,
  LogRecord,
  BinaryOpNode,
  UnaryOpNode,
  FieldNode,
  LiteralNode
} from './types';

/**
 * Evaluator for the log filter DSL
 * Evaluates an AST against a log record
 */
export class Evaluator {
  /**
   * Evaluate an expression node against a log record
   */
  public evaluate(node: ExpressionNode, record: LogRecord): boolean {
    switch (node.type) {
      case ASTNodeType.EQUALS:
        return this.evaluateEquals(node as BinaryOpNode, record);
      case ASTNodeType.CONTAINS:
        return this.evaluateContains(node as BinaryOpNode, record);
      case ASTNodeType.AND:
        return this.evaluateAnd(node as BinaryOpNode, record);
      case ASTNodeType.OR:
        return this.evaluateOr(node as BinaryOpNode, record);
      case ASTNodeType.NOT:
        return this.evaluateNot(node as UnaryOpNode, record);
      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }

  /**
   * Evaluate equals operation
   */
  private evaluateEquals(node: BinaryOpNode, record: LogRecord): boolean {
    const left = this.getValue(node.left, record);
    const right = this.getValue(node.right, record);
    return this.compareValues(left, right) === 0;
  }

  /**
   * Evaluate contains operation
   */
  private evaluateContains(node: BinaryOpNode, record: LogRecord): boolean {
    const left = this.getValue(node.left, record);
    const right = this.getValue(node.right, record);

    // Convert both to strings for contains check
    const leftStr = String(left).toLowerCase();
    const rightStr = String(right).toLowerCase();
    return leftStr.includes(rightStr);
  }

  /**
   * Evaluate AND operation
   */
  private evaluateAnd(node: BinaryOpNode, record: LogRecord): boolean {
    return (
      this.evaluate(node.left, record) && this.evaluate(node.right, record)
    );
  }

  /**
   * Evaluate OR operation
   */
  private evaluateOr(node: BinaryOpNode, record: LogRecord): boolean {
    return (
      this.evaluate(node.left, record) || this.evaluate(node.right, record)
    );
  }

  /**
   * Evaluate NOT operation
   */
  private evaluateNot(node: UnaryOpNode, record: LogRecord): boolean {
    return !this.evaluate(node.operand, record);
  }

  /**
   * Get the value of a node (field access or literal)
   */
  private getValue(node: ExpressionNode, record: LogRecord): any {
    if (node.type === ASTNodeType.FIELD) {
      const fieldNode = node as FieldNode;
      return this.getFieldValue(record, fieldNode.name);
    }

    if (node.type === ASTNodeType.STRING || node.type === ASTNodeType.NUMBER) {
      const literalNode = node as LiteralNode;
      return literalNode.value;
    }

    throw new Error(
      `Cannot get value from node type: ${(node as any).type}. Expected FIELD, STRING, or NUMBER`
    );
  }

  /**
   * Get field value from log record (supports nested fields with dot notation)
   */
  private getFieldValue(record: LogRecord, fieldName: string): any {
    // Support dot notation for nested fields (e.g., "user.name")
    const parts = fieldName.split('.');
    let value: any = record;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return null;
      }
      if (typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * Compare two values (returns -1, 0, or 1)
   */
  private compareValues(a: any, b: any): number {
    // Type coercion for comparison
    if (a === b) {
      return 0;
    }

    // Convert to strings and compare case-insensitively
    const aStr = String(a).toLowerCase();
    const bStr = String(b).toLowerCase();

    if (aStr < bStr) {
      return -1;
    }
    if (aStr > bStr) {
      return 1;
    }
    return 0;
  }
}

