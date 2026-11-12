"use client";

type Option = string | { value: string; label: string };

type ChipGroupProps = {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
};

export default function ChipGroup({ options, value, onChange, multi = false }: ChipGroupProps) {
  const selectedList = Array.isArray(value) ? value : [value];

  function toggle(v: string) {
    if (multi) {
      const list = Array.isArray(value) ? value : [];
      onChange(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
    } else {
      onChange(v);
    }
  }

  return (
    <div className="choice-group">
      {options.map((opt) => {
        const v = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const selected = selectedList.includes(v);
        return (
          <button
            key={v}
            type="button"
            className={`choice-chip${selected ? " selected" : ""}`}
            onClick={() => toggle(v)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
