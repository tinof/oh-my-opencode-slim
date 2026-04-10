export type BooleanArg = 'yes' | 'no';

export type PresetName = 'openai' | 'copilot' | 'kimi' | 'zai-plan';

export const VALID_PRESETS: PresetName[] = [
  'openai',
  'copilot',
  'kimi',
  'zai-plan',
];

export const DEFAULT_PRESET: PresetName = 'copilot';

export interface InstallArgs {
  tui: boolean;
  tmux?: BooleanArg;
  skills?: BooleanArg;
  preset?: PresetName;
  dryRun?: boolean;
  reset?: boolean;
}

export interface OpenCodeConfig {
  plugin?: string[];
  provider?: Record<string, unknown>;
  agent?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface InstallConfig {
  hasTmux: boolean;
  installSkills: boolean;
  installCustomSkills: boolean;
  preset: PresetName;
  dryRun?: boolean;
  reset: boolean;
}

export interface ConfigMergeResult {
  success: boolean;
  configPath: string;
  error?: string;
}

export interface DetectedConfig {
  isInstalled: boolean;
  hasKimi: boolean;
  hasOpenAI: boolean;
  hasAnthropic?: boolean;
  hasCopilot?: boolean;
  hasZaiPlan?: boolean;
  hasAntigravity: boolean;
  hasChutes?: boolean;
  hasOpencodeZen: boolean;
  hasTmux: boolean;
}
