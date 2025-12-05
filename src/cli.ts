#!/usr/bin/env node

import * as readline from 'readline';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Evaluator } from './evaluator';
import { LogRecord } from './types';

/**
 * Parse a log line into a record object
 * Supports both JSON and key=value formats
 */
function parseLogLine(line: string): LogRecord | null {
  line = line.trim();
  if (!line) {
    return null;
  }

  // Try JSON first
  try {
    return JSON.parse(line);
  } catch {
    // If not JSON, try key=value format
    const record: LogRecord = {};
    const pairs = line.split(/\s+/);
    
    for (const pair of pairs) {
      const match = pair.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value: any = match[2].trim();
        
        // Try to parse as number or boolean
        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (/^-?\d+$/.test(value)) {
          value = parseInt(value, 10);
        } else if (/^-?\d+\.\d+$/.test(value)) {
          value = parseFloat(value);
        } else {
          // Remove quotes if present
          value = value.replace(/^["']|["']$/g, '');
        }
        
        record[key] = value;
      }
    }
    
    return Object.keys(record).length > 0 ? record : null;
  }
}

/**
 * Main CLI function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: log-filter "<filter expression>"');
    console.error('Example: log-filter \'level = ERROR and message contains "timeout"\'');
    process.exit(1);
  }

  const filterExpression = args.join(' ');

  // Parse the filter expression
  let evaluator: Evaluator;
  try {
    const lexer = new Lexer(filterExpression);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    evaluator = new Evaluator();
    
    // Store AST for evaluation (we'll evaluate it for each line)
    const evaluateLine = (record: LogRecord) => evaluator.evaluate(ast, record);
    
    // Read from stdin
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', (line) => {
      const record = parseLogLine(line);
      if (record && evaluateLine(record)) {
        console.log(line);
      }
    });

    rl.on('close', () => {
      process.exit(0);
    });
  } catch (error) {
    console.error(`Error parsing filter: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

