#!/usr/bin/env bun
import { install } from './install';
import {
  type BooleanArg,
  DEFAULT_PRESET,
  type InstallArgs,
  type PresetName,
  VALID_PRESETS,
} from './types';

function parseArgs(args: string[]): InstallArgs {
  const result: InstallArgs = {
    tui: true,
  };

  for (const arg of args) {
    if (arg === '--no-tui') {
      result.tui = false;
    } else if (arg.startsWith('--tmux=')) {
      result.tmux = arg.split('=')[1] as BooleanArg;
    } else if (arg.startsWith('--skills=')) {
      result.skills = arg.split('=')[1] as BooleanArg;
    } else if (arg.startsWith('--preset=')) {
      const value = arg.split('=')[1] as string;
      if (VALID_PRESETS.includes(value as PresetName)) {
        result.preset = value as PresetName;
      } else {
        console.error(
          `Invalid preset: "${value}". Valid presets: ${VALID_PRESETS.join(', ')}`,
        );
        process.exit(1);
      }
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg === '--reset') {
      result.reset = true;
    } else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  const presetList = VALID_PRESETS.map((p) =>
    p === DEFAULT_PRESET ? `${p} (default)` : p,
  ).join(', ');

  console.log(`
po-po-code installer

Usage: bunx po-po-code install [OPTIONS]

Options:
  --preset=PRESET        Provider preset: ${presetList}
  --tmux=yes|no          Enable tmux integration (yes/no)
  --skills=yes|no        Install recommended skills (yes/no)
  --no-tui               Non-interactive mode
  --dry-run              Simulate install without writing files
  --reset                Force overwrite of existing configuration
  -h, --help             Show this help message

Examples:
  bunx po-po-code install
  bunx po-po-code install --preset=copilot
  bunx po-po-code install --preset=openai --tmux=yes --skills=yes
  bunx po-po-code install --reset
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'install') {
    const hasSubcommand = args[0] === 'install';
    const installArgs = parseArgs(args.slice(hasSubcommand ? 1 : 0));
    const exitCode = await install(installArgs);
    process.exit(exitCode);
  } else if (args[0] === '-h' || args[0] === '--help') {
    printHelp();
    process.exit(0);
  } else {
    console.error(`Unknown command: ${args[0]}`);
    console.error('Run with --help for usage information');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
