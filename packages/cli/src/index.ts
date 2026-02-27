#!/usr/bin/env node
/**
 * Kinetic API Marketplace CLI
 *
 * Usage:
 *   kinetic auth                  Sign in to the platform
 *   kinetic auth status           Show current login status
 *   kinetic auth logout           Sign out
 *   kinetic search <query>        Search marketplace APIs
 *   kinetic subscribe <slug>      Subscribe to a marketplace API
 *   kinetic test <url>            Test an API endpoint via the platform proxy
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
  .name('kinetic')
  .description('Kinetic API Marketplace CLI — discover, subscribe, and test APIs from your terminal')
  .version(pkg.version, '-v, --version');

registerAuth(program);
registerSearch(program);
registerSubscribe(program);
registerTest(program);

program.parse(process.argv);
