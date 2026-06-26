import { JOB_ID as WC_ID, JOB_META as WC_META, BREAK_REWARDS as WC_BREAK } from "./woodcutter.js";
import { JOB_ID as MI_ID, JOB_META as MI_META, BREAK_REWARDS as MI_BREAK } from "./miner.js";
import { JOB_ID as FA_ID, JOB_META as FA_META, BREAK_REWARDS as FA_BREAK } from "./farmer.js";
import { JOB_ID as HU_ID, JOB_META as HU_META, KILL_REWARDS as HU_KILL } from "./hunter.js";
import { JOB_ID as FI_ID, JOB_META as FI_META, FISH_REWARDS as FI_FISH } from "./fisherman.js";
import { JOB_ID as BU_ID, JOB_META as BU_META, PLACE_REWARDS as BU_PLACE } from "./builder.js";

export const ALL_JOBS = {
  [WC_ID]: { meta: WC_META, actions: { break: WC_BREAK } },
  [MI_ID]: { meta: MI_META, actions: { break: MI_BREAK } },
  [FA_ID]: { meta: FA_META, actions: { break: FA_BREAK } },
  [HU_ID]: { meta: HU_META, actions: { kill:  HU_KILL } },
  [FI_ID]: { meta: FI_META, actions: { fish:  FI_FISH } },
  [BU_ID]: { meta: BU_META, actions: { place: BU_PLACE } },
};
