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
  garden_attachment: { id: "garden_attachment", options: [
    { value: "standalone", label: "Freestanding", description: "", message: "A freestanding garden room." },
    { value: "attached", label: "Attached to the house", description: "", message: "The garden room would be attached to the house." },
  ] },
  garden_use: { id: "garden_use", options: [
    { value: "office", label: "Office", description: "", message: "A garden office." },
    { value: "gym", label: "Gym", description: "", message: "A garden gym." },
    { value: "studio", label: "Studio", description: "", message: "A garden studio." },
    { value: "leisure", label: "Leisure room", description: "", message: "A garden leisure room." },
    { value: "habitable", label: "Living accommodation", description: "", message: "Habitable garden accommodation." },
  ] },
  kitchen_scope: { id: "kitchen_scope", options: [
    { value: "refresh", label: "Cosmetic refresh", description: "", message: "A cosmetic kitchen refresh." },
    { value: "replacement", label: "New fitted kitchen", description: "", message: "A new fitted kitchen." },
    { value: "full", label: "Full renovation", description: "", message: "A full kitchen renovation including building work." },
  ] },
  bathroom_scope: { id: "bathroom_scope", options: [
    { value: "refresh", label: "Refresh", description: "", message: "A bathroom refresh." },
    { value: "replacement", label: "Replace fittings", description: "", message: "Replace the bathroom fittings." },
    { value: "full", label: "Full refurbishment", description: "", message: "A complete bathroom refurbishment." },
  ] },
  specification: { id: "specification", options: [
    { value: "standard", label: "Standard", description: "", message: "Standard specification." },
    { value: "premium", label: "Premium", description: "", message: "Premium specification." },
    { value: "bespoke", label: "Bespoke", description: "", message: "Bespoke specification." },
  ] },
  room_size: { id: "room_size", options: [
    { value: "small", label: "Compact room", description: "", message: "A compact room." },
    { value: "standard", label: "Average room", description: "", message: "An average-sized room." },
    { value: "large", label: "Large room", description: "", message: "A large room." },
  ] },
  kitchen_size: { id: "kitchen_size", options: [
    { value: "small", label: "Compact · up to 10m²", description: "", message: "A compact kitchen, up to about 10m²." },
    { value: "standard", label: "Average · 10–20m²", description: "", message: "An average kitchen, about 10–20m²." },
    { value: "large", label: "Large · over 20m²", description: "", message: "A large kitchen, over 20m²." },
    { value: "custom", label: "Enter my own", description: "", message: "I'll give you the measurements." },
  ] },
  bathroom_size: { id: "bathroom_size", options: [
    { value: "small", label: "Compact · up to 4m²", description: "", message: "A compact bathroom, up to about 4m²." },
    { value: "standard", label: "Average · 4–7m²", description: "", message: "An average bathroom, about 4–7m²." },
    { value: "large", label: "Large · over 7m²", description: "", message: "A large bathroom, over 7m²." },
    { value: "custom", label: "Enter my own", description: "", message: "I'll give you the measurements." },
  ] },
  bathroom_layout: { id: "bathroom_layout", options: [
    { value: "retained", label: "Keep positions", description: "", message: "Keep the plumbing layout." },
    { value: "changed", label: "Change layout", description: "", message: "Change the plumbing layout." },
  ] },
  bathroom_fittings: { id: "bathroom_fittings", options: [
    { value: "retained", label: "Keep sanitaryware", description: "", message: "Keep the existing sanitaryware." },
    { value: "replaced", label: "Replace sanitaryware", description: "", message: "Replace the sanitaryware." },
  ] },
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
    { value: "survey", label: "Arrange a site visit", description: "A free visit to price it properly.", message: "I'd like to arrange a site visit." },
  ] },
  refine_room: { id: "refine_room", options: [
    { value: "photos", label: "Upload photos or plans", description: "", message: "I'd like to upload photos or plans." },
    { value: "survey", label: "Arrange a site visit", description: "", message: "I'd like to arrange a site visit." },
  ] },
  doors: { id: "doors", options: [
    { value: "french", label: "French doors", description: "Two hinged glazed doors.", image: frenchDoors, message: "I'd like French doors." },
    { value: "bifold", label: "Bifold doors", description: "Folding glazed panels.", image: bifoldDoors, message: "I'd like bifold doors." },
    { value: "sliding", label: "Sliding doors", description: "Large sliding glazed panels.", image: slidingDoors, message: "I'd like sliding doors." },
  ] },
  walls: { id: "walls", options: [
    { value: "brick", label: "Brickwork", description: "Exposed facing brick.", image: brickWall, message: "I'd like exposed brickwork outside." },
    { value: "render", label: "Render", description: "A smooth rendered exterior.", image: renderWall, message: "I'd like a rendered exterior." },
    { value: "mixed", label: "Mixed finish", description: "Brick and render, subject to pricing review.", message: "A mixed brick and render finish." },
  ] },
  flooring: { id: "flooring", options: [
    { value: "lvt", label: "LVT flooring", description: "Wood-effect luxury vinyl.", image: lvtFloor, message: "I'd like LVT flooring." },
    { value: "timber", label: "Timber flooring", description: "Natural timber boards.", image: timberFloor, message: "I'd like timber flooring." },
    { value: "tiles", label: "Floor tiles", description: "Large-format porcelain tiles.", image: tileFloor, message: "I'd like tiled flooring." },
    { value: "other", label: "Other flooring", description: "Tell us the finish you have in mind.", message: "Other flooring, to be specified." },
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
  allowedValues,
}: {
  setId: string;
  selected: string | null;
  disabled: boolean;
  onPick: (choice: VisualChoice) => void;
  allowedValues?: string[];
}) {
  const set = getChoiceSet(setId);
  if (!set) return null;
  const hasImages = set.options.some((option) => option.image);
  return (
    <div className={hasImages ? "visual-options grid w-full grid-cols-2 items-start gap-3 sm:grid-cols-3" : "flex w-full flex-wrap gap-2"} role="group" aria-label={`${setId.replaceAll("_", " ")} options`}>
      {set.options.filter((option) => !allowedValues || allowedValues.includes(option.value)).map((option) => {
        const isSelected = selected === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => onPick(option)}
            aria-pressed={isSelected}
            className={cn(
              hasImages && option.image ? "group h-auto min-w-0 flex-col items-stretch gap-0 overflow-hidden rounded-lg border border-border bg-card p-0 text-left whitespace-normal transition-all" : "choice-pill h-auto min-h-10 min-w-0 rounded-full border-border bg-card px-4 py-2 text-sm whitespace-normal",
              "hover:border-primary hover:bg-card hover:text-card-foreground focus-visible:outline-2 focus-visible:outline-primary",
              "disabled:cursor-default",
              isSelected && "border-primary bg-primary/5 ring-1 ring-primary",
              
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
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {isSelected && (
                  <span className="absolute right-2 top-2 flex size-6 items-center justify-center bg-primary text-primary-foreground">
                    <Check size={14} aria-hidden />
                  </span>
                )}
              </span>
            ) : (
              <span className="flex w-full items-center justify-center text-center text-sm font-medium text-foreground">
                {option.label}
                {isSelected && <Check size={16} className="ml-2 text-primary" aria-hidden />}
              </span>
            )}
            <span className={option.image ? "block p-3" : "hidden"}>
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
