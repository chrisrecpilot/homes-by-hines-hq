import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import roofFlat from "@/assets/roof-flat.jpg";
import roofPitched from "@/assets/roof-pitched.jpg";
import frenchDoors from "@/assets/doors-0.jpg";
import bifoldDoors from "@/assets/doors-1.jpg";
import slidingDoors from "@/assets/doors-2.jpg";
import brickWall from "@/assets/walls-0.jpg";
import renderWall from "@/assets/walls-1.jpg";
import lvtFloor from "@/assets/flooring-0.jpg";
import timberFloor from "@/assets/flooring-1.jpg";
import tileFloor from "@/assets/flooring-2.jpg";
import { Button } from "@/components/ui/button";

export type VisualChoice = {
  value: string;
  label: string;
  description: string;
  image?: string;
  message: string;
};
export type VisualChoiceSet = { id: string; options: VisualChoice[] };

const SETS: Record<string, VisualChoiceSet> = {
  sizes: { id: "sizes", options: [
    { value: "3x4", label: "3m × 4m", description: "About 12m² — a compact single room.", message: "About 3m × 4m (12m²)." },
    { value: "4x5", label: "4m × 5m", description: "About 20m² — a comfortable kitchen-diner.", message: "About 4m × 5m (20m²)." },
    { value: "5x6", label: "5m × 6m", description: "About 30m² — a generous open-plan space.", message: "About 5m × 6m (30m²)." },
    { value: "6x6", label: "6m × 6m", description: "About 36m² — a large open-plan space.", message: "About 6m × 6m (36m²)." },
    { value: "custom", label: "Enter my own", description: "Type the dimensions you have in mind.", message: "I'd like to give you my own dimensions." },
    { value: "not_sure", label: "Not sure", description: "We'll help you work out a sensible size.", message: "I'm not sure about the size yet — can you help me work it out?" },
  ] },
  storeys: { id: "storeys", options: [
    { value: "1", label: "Single storey", description: "Ground floor only.", message: "Single storey." },
    { value: "2", label: "Double storey", description: "Ground floor with a floor above.", message: "Double storey." },
  ] },
  refine: { id: "refine", options: [
    { value: "roof", label: "Choose a roof style", description: "Flat or pitched, with pictures.", message: "Let me choose the roof style." },
    { value: "doors", label: "Choose doors", description: "French, bifold or sliding.", message: "Let me choose the doors." },
    { value: "finishes", label: "Choose finishes", description: "Exterior walls and flooring.", message: "Let me choose the exterior finish and flooring." },
    { value: "photos", label: "Upload photos or plans", description: "Helps us understand your space.", message: "I'd like to upload photos or plans." },
    { value: "survey", label: "Arrange a survey", description: "A visit to confirm everything properly.", message: "I'd like to arrange a survey." },
    { value: "skip", label: "That's fine for now", description: "Leave the estimate as it is.", message: "That's fine for now, thanks." },
  ] },
  doors: { id: "doors", options: [
    { value: "french", label: "French doors", description: "Two hinged glazed doors.", image: frenchDoors, message: "I'd like French doors." },
    { value: "bifold", label: "Bifold doors", description: "Folding glazed panels.", image: bifoldDoors, message: "I'd like bifold doors." },
    { value: "sliding", label: "Sliding doors", description: "Large sliding glazed panels.", image: slidingDoors, message: "I'd like sliding doors." },
  ] },
  walls: { id: "walls", options: [
    { value: "brick", label: "Brickwork", description: "Exposed facing brick.", image: brickWall, message: "I'd like exposed brickwork outside." },
    { value: "render", label: "Render", description: "A smooth rendered exterior.", image: renderWall, message: "I'd like a rendered exterior." },
  ] },
  flooring: { id: "flooring", options: [
    { value: "lvt", label: "LVT flooring", description: "Wood-effect luxury vinyl.", image: lvtFloor, message: "I'd like LVT flooring." },
    { value: "timber", label: "Timber flooring", description: "Natural timber boards.", image: timberFloor, message: "I'd like timber flooring." },
    { value: "tiles", label: "Floor tiles", description: "Large-format porcelain tiles.", image: tileFloor, message: "I'd like tiled flooring." },
  ] },
  roof: {
    id: "roof",
    options: [
      {
        value: "flat",
        label: "Flat roof",
        description: "A clean, modern look. Often the more economical option.",
        image: roofFlat,
        message: "I'd like a flat roof.",
      },
      {
        value: "pitched",
        label: "Pitched roof",
        description: "A traditional tiled roof that matches most existing houses.",
        image: roofPitched,
        message: "I'd like a pitched roof.",
      },
      {
        value: "not_sure",
        label: "Not sure",
        description: "We'll talk you through the options and what each means for cost.",
        message: "I'm not sure about the roof yet — can you talk me through the options?",
      },
    ],
  },
};

export function getChoiceSet(id: string): VisualChoiceSet | null {
  return SETS[id] ?? null;
}

/** Extracts a <choices>set-id</choices> tag from assistant text. */
export function parseChoices(text: string): string | null {
  const m = text.match(/<choices>([a-z_]+)<\/choices>/);
  return m?.[1] && SETS[m[1]] ? m[1] : null;
}

/** Removes any <choices> tag (and a trailing partial tag) from display text. */
export function stripChoices(text: string): string {
  return text
    .replace(/<choices>[\s\S]*?(<\/choices>|$)/, "")
    .replace(/<choices?$/, "")
    .trim();
}

export function VisualChoiceCards({
  setId,
  selected,
  disabled,
  onPick,
}: {
  setId: string;
  selected: string | null;
  disabled: boolean;
  onPick: (choice: VisualChoice) => void;
}) {
  const set = getChoiceSet(setId);
  if (!set) return null;
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Options">
      {set.options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            disabled={disabled || selected !== null}
            onClick={() => onPick(option)}
            aria-pressed={isSelected}
            className={cn(
              "group h-auto min-w-0 flex-col items-stretch gap-0 overflow-hidden rounded-none border border-border bg-card p-0 text-left whitespace-normal transition-colors",
              "hover:border-primary hover:bg-card hover:text-card-foreground focus-visible:outline-2 focus-visible:outline-primary",
              "disabled:cursor-default",
              isSelected && "border-primary ring-1 ring-primary",
              selected !== null && !isSelected && "opacity-50",
            )}
          >
            {option.image ? (
              <span className="relative block aspect-[4/3] w-full overflow-hidden bg-secondary">
                <img
                  src={option.image}
                  alt={option.label}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {isSelected && (
                  <span className="absolute right-2 top-2 flex size-6 items-center justify-center bg-primary text-primary-foreground">
                    <Check size={14} aria-hidden />
                  </span>
                )}
              </span>
            ) : (
              <span className="flex aspect-[4/3] w-full items-center justify-center bg-secondary px-3 text-center font-display text-lg text-foreground">
                {option.label}
                {isSelected && <Check size={16} className="ml-2 text-primary" aria-hidden />}
              </span>
            )}
            <span className="block p-3">
              {option.image && (
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
              )}
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {option.description}
              </span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
