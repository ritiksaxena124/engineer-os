import { describe, expect, test } from 'bun:test';
import {
  INTERVIEW_SCENARIOS,
  applyFixes,
  validateInterviewScenarios,
  type InterviewScenarioSpec,
} from '../prisma/content/interview-scenarios';
import { runFiles, summarize, toSandboxFiles } from '../src/interview/runner';
import { fitPrompt, parseRequired } from '../src/interview/promptFit';

/**
 * An interview scenario is only worth scheduling if its bug is real: the authored project must fail
 * its own checks and the authored fix must turn them all green. Both run through the same sandbox the
 * candidate gets, so a scenario that is green in this file cannot be green by luck in the room.
 */
function failing(outcome: Awaited<ReturnType<typeof runFiles>>) {
  return outcome.results.filter((result) => !result.passed).map((result) => result.name);
}

describe('interview scenario content', () => {
  test('the scenarios are structurally sound', () => {
    expect(validateInterviewScenarios()).toEqual([]);
    expect(INTERVIEW_SCENARIOS.length).toBeGreaterThan(0);
  });

  for (const scenario of INTERVIEW_SCENARIOS) {
    describe(scenario.slug, () => {
      test('the shipped project fails the ticket it describes', async () => {
        const outcome = await runFiles(toSandboxFiles(scenario.files));
        expect(outcome.crashed).toBeNull();
        expect(outcome.results.length).toBeGreaterThan(1);
        expect(failing(outcome).length).toBeGreaterThan(0);
        expect(summarize(outcome).allGreen).toBe(false);
      });

      test('every failing check says why rather than crashing the sandbox', async () => {
        const outcome = await runFiles(toSandboxFiles(scenario.files));
        for (const result of outcome.results.filter((entry) => !entry.passed)) {
          expect(result.message.length).toBeGreaterThan(0);
          expect(result.message).not.toMatch(/sandbox:|is not defined|cannot read/);
        }
      });

      test('the authored fix turns every check green', async () => {
        const patched = applyFixes(
          scenario,
          scenario.fixes.map((fix) => fix.filePath),
        );
        const outcome = await runFiles(toSandboxFiles(patched));
        expect(outcome.crashed).toBeNull();
        expect(outcome.results.length).toBeGreaterThan(1);
        expect(summarize(outcome)).toEqual({
          passed: outcome.results.length,
          failed: 0,
          allGreen: true,
        });
      });

      test('a patch is scoped to its file, so the checks cannot be rewritten', async () => {
        const patched = applyFixes(
          scenario,
          scenario.fixes.map((fix) => fix.filePath),
        );
        for (const file of scenario.files) {
          const after = patched.find((entry) => entry.path === file.path);
          expect(after?.isCheck).toBe(file.isCheck);
          if (!file.isCheck) continue;
          expect(after?.contents).toBe(file.contents);
        }
      });

      test('a prompt that names each requirement is accepted and a vague one is not', () => {
        for (const fix of scenario.fixes) {
          const groups = parseRequired(fix.requiredText);
          expect(groups.length).toBeGreaterThanOrEqual(2);
          const reference = groups.map((group) => group[0]).join(' and ');
          expect(fitPrompt(reference, fix.requiredText).satisfied).toBe(true);
          expect(fitPrompt('please fix this bug', fix.requiredText).satisfied).toBe(false);
        }
      });
    });
  }

  test('the ticket for each scenario cites checks the scenario actually ships', () => {
    for (const scenario of INTERVIEW_SCENARIOS as InterviewScenarioSpec[]) {
      const checks = scenario.files.filter((file) => file.isCheck).map((file) => file.path);
      for (const check of checks) {
        expect(scenario.ticketBody).toContain(check);
      }
    }
  });
});
