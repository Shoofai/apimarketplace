#!/usr/bin/env node
/**
 * LukeAPI Marketplace CLI
 *
 * Usage:
 *   lukeapi auth                  Sign in to the platform
 *   lukeapi auth status           Show current login status
 *   lukeapi auth logout           Sign out
 *   lukeapi search <query>        Search marketplace APIs
 *   lukeapi subscribe <slug>      Subscribe to a marketplace API
 *   lukeapi test <url>            Test an API endpoint via the platform proxy
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';

import { registerAuth } from './commands/auth';
import { registerSearch } from './commands/search';
import { registerSubscribe } from './commands/subscribe';
import { registerTest } from './commands/test';

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const program = new Command();

program
  .name('lukeapi')
  .description('LukeAPI Marketplace CLI — discover, subscribe, and test APIs from your terminal')
  .version(pkg.version, '-v, --version');

registerAuth(program);
registerSearch(program);
registerSubscribe(program);
registerTest(program);

program.parse(process.argv);
