import { useEffect, useId, useMemo, useRef, useState } from "react";
import "./ModelSelect.css";

const PROVIDER_LABELS = {
  gemini: "Google Gemini",
  groq: "Groq",
  openrouter: "OpenRouter",
  nvidia: "NVIDIA",
  ovhcloud: "OVHcloud",
};

const providerLabel = (provider) => PROVIDER_LABELS[provider] || provider || "Other";

function Chevron() {
  return (
    <svg className="model-select-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true" focusable="false">
      <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/**
 * A listbox dropdown that replaces the native <select> so the list can be styled:
 * models are grouped by provider, a model already chosen in the other selector is
 * shown as unavailable, and the list works with the keyboard (arrows, Home/End,
 * Enter/Space, Escape, type-ahead).
 */
export default function ModelSelect({
  id,
  label,
  models,
  value,
  onChange,
  unavailableId = "",
  unavailableNote = "",
  placeholder = "Select model",
  disabled = false,
  invalid = false,
  className = "",
}) {
  const listboxId = useId();
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const typeahead = useRef({ text: "", timer: null });
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  // Flat, ordered list that matches what is drawn, so arrow keys follow the screen.
  const groups = useMemo(() => {
    const byProvider = new Map();
    models.forEach((model) => {
      const key = model.provider || "other";
      if (!byProvider.has(key)) byProvider.set(key, []);
      byProvider.get(key).push(model);
    });
    return [...byProvider.entries()]
      .map(([provider, items]) => ({ provider, label: providerLabel(provider), items }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [models]);

  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const isUnavailable = (model) => Boolean(unavailableId) && model.id === unavailableId;
  const selected = models.find((model) => model.id === value);

  const close = () => setOpen(false);

  const openList = () => {
    if (disabled) return;
    const start = selected && !isUnavailable(selected) ? selected : flat.find((model) => !isUnavailable(model));
    setActiveId(start ? start.id : "");
    setOpen(true);
  };

  const choose = (model) => {
    if (isUnavailable(model)) return;
    onChange(model.id);
    close();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || !activeId || !listRef.current) return;
    listRef.current.querySelector(`[data-model-id="${CSS.escape(activeId)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeId]);

  useEffect(() => () => clearTimeout(typeahead.current.timer), []);

  const move = (step) => {
    const enabled = flat.filter((model) => !isUnavailable(model));
    if (!enabled.length) return;
    const index = enabled.findIndex((model) => model.id === activeId);
    const next = index === -1 ? (step > 0 ? 0 : enabled.length - 1) : (index + step + enabled.length) % enabled.length;
    setActiveId(enabled[next].id);
  };

  const jumpTo = (model) => model && setActiveId(model.id);

  const handleTypeahead = (key) => {
    const state = typeahead.current;
    clearTimeout(state.timer);
    state.text += key.toLowerCase();
    state.timer = setTimeout(() => { state.text = ""; }, 600);
    const match = flat.find((model) => !isUnavailable(model) && model.name.toLowerCase().startsWith(state.text));
    if (match) setActiveId(match.id);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown": event.preventDefault(); move(1); break;
      case "ArrowUp": event.preventDefault(); move(-1); break;
      case "Home": event.preventDefault(); jumpTo(flat.find((model) => !isUnavailable(model))); break;
      case "End": event.preventDefault(); jumpTo([...flat].reverse().find((model) => !isUnavailable(model))); break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const model = flat.find((item) => item.id === activeId);
        if (model) choose(model);
        break;
      }
      case "Escape": event.preventDefault(); close(); break;
      case "Tab": close(); break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) handleTypeahead(event.key);
    }
  };

  return (
    <div className={`model-select ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        id={id}
        className={`model-select-trigger${open ? " is-open" : ""}${invalid ? " is-invalid" : ""}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && activeId ? `${listboxId}-${activeId}` : undefined}
        aria-label={label ? `${label}: ${selected ? selected.name : placeholder}` : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? "model-select-value" : "model-select-placeholder"}>
          {selected ? selected.name : placeholder}
        </span>
        <Chevron />
      </button>

      {open && (
        <div className="model-select-popup" ref={listRef}>
          <ul id={listboxId} className="model-select-list" role="listbox" aria-label={label}>
            {groups.map((group) => (
              <li key={group.provider} role="presentation" className="model-select-group">
                <span className="model-select-group-label" role="presentation">{group.label}</span>
                <ul role="group" aria-label={group.label}>
                  {group.items.map((model) => {
                    const unavailable = isUnavailable(model);
                    const isSelected = model.id === value;
                    return (
                      <li
                        key={model.id}
                        id={`${listboxId}-${model.id}`}
                        data-model-id={model.id}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={unavailable || undefined}
                        className={[
                          "model-select-option",
                          model.id === activeId ? "is-active" : "",
                          isSelected ? "is-selected" : "",
                          unavailable ? "is-unavailable" : "",
                        ].filter(Boolean).join(" ")}
                        onPointerEnter={() => !unavailable && setActiveId(model.id)}
                        onClick={() => choose(model)}
                      >
                        <span className="model-select-option-name">{model.name}</span>
                        {unavailable && unavailableNote && <span className="model-select-option-note">{unavailableNote}</span>}
                        {isSelected && <span className="model-select-option-check"><CheckIcon /></span>}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
