/**
 * Post-edit nudge — appends a gentle reminder to run lsp_diagnostics
 * after edit or write tool calls to catch type errors early.
 */

const EDIT_NUDGE =
  '\n\n---\nlsp_diagnostics is available to verify this change if needed.';

interface ToolExecuteAfterInput {
  tool: string;
  sessionID?: string;
  callID?: string;
}

interface ToolExecuteAfterOutput {
  title: string;
  output: string;
  metadata: Record<string, unknown>;
}

export function createPostEditNudgeHook() {
  return {
    'tool.execute.after': async (
      input: ToolExecuteAfterInput,
      output: ToolExecuteAfterOutput,
    ): Promise<void> => {
      if (input.tool === 'edit' || input.tool === 'write') {
        output.output = output.output + EDIT_NUDGE;
      }
    },
  };
}
