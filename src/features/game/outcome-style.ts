import type { OutcomeType } from "@/lib/types";

interface OutcomeStyle {
  label: string;
  emoji: string;
  /** Tailwind text color class. */
  text: string;
  /** Tailwind background tint class. */
  chip: string;
  /** Glow/ring class for emphasis. */
  ring: string;
}

export const OUTCOME_STYLE: Record<OutcomeType, OutcomeStyle> = {
  reward: {
    label: "Reward",
    emoji: "🎁",
    text: "text-reward",
    chip: "bg-reward/15 text-reward",
    ring: "ring-reward/50 shadow-reward/30",
  },
  punishment: {
    label: "Punishment",
    emoji: "⚡",
    text: "text-punish",
    chip: "bg-punish/15 text-punish",
    ring: "ring-punish/50 shadow-punish/30",
  },
  leave: {
    label: "Eliminated",
    emoji: "💀",
    text: "text-leave",
    chip: "bg-leave/15 text-leave",
    ring: "ring-leave/50 shadow-leave/30",
  },
};
