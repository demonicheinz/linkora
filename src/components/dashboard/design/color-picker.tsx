type ColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export function ColorPicker({
  value,
  onChange,
  label = "Pick color",
}: ColorPickerProps) {
  return (
    <div
      className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
      style={{ backgroundColor: value }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer border-0 p-0 opacity-0"
        aria-label={label}
      />
    </div>
  );
}
