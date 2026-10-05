import type { LessonSpec } from '../types';

import { LESSON as CLARIFY_BEFORE_YOU_DRAW } from './clarify-before-you-draw';
import { LESSON as LOGICAL_BEFORE_PHYSICAL } from './logical-before-physical';
import { LESSON as BUDGETS_NOT_ADJECTIVES } from './budgets-not-adjectives';
import { LESSON as THE_TRADE_OFF_COLUMN } from './the-trade-off-column';
import { LESSON as FOUR_NUMBERS_YOU_TRADE } from './four-numbers-you-trade';
import { LESSON as NAPKIN_ARITHMETIC } from './napkin-arithmetic';
import { LESSON as ONE_SERVER_TEN_THOUSAND_SOCKETS } from './one-server-ten-thousand-sockets';
import { LESSON as BIGGER_BOX_OR_MORE_BOXES } from './bigger-box-or-more-boxes';
import { LESSON as SPLIT_WHEN_THE_TEAM_SPLITS } from './split-when-the-team-splits';
import { LESSON as THE_REPOSITORY_THAT_PAYS } from './the-repository-that-pays';
import { LESSON as MODEL_FOR_THE_INVISIBLE_CHANGE } from './model-for-the-invisible-change';
import { LESSON as COST_IS_A_DESIGN_INPUT } from './cost-is-a-design-input';
import { LESSON as THE_COMPONENT_YOU_DID_NOT_ADD } from './the-component-you-did-not-add';

/**
 * System design, taught in order: what was asked for, what it must hold, what it costs, and only
 * then which boxes to draw. The array order is the reading order the learner sees inside the phase,
 * so a newcomer meets the brief before they meet the balancer.
 */
export const SD_MODULE_01_LESSONS: LessonSpec[] = [
  CLARIFY_BEFORE_YOU_DRAW,
  LOGICAL_BEFORE_PHYSICAL,
  BUDGETS_NOT_ADJECTIVES,
  THE_TRADE_OFF_COLUMN,
  FOUR_NUMBERS_YOU_TRADE,
  NAPKIN_ARITHMETIC,
  ONE_SERVER_TEN_THOUSAND_SOCKETS,
  BIGGER_BOX_OR_MORE_BOXES,
  SPLIT_WHEN_THE_TEAM_SPLITS,
  THE_REPOSITORY_THAT_PAYS,
  MODEL_FOR_THE_INVISIBLE_CHANGE,
  COST_IS_A_DESIGN_INPUT,
  THE_COMPONENT_YOU_DID_NOT_ADD,
];
