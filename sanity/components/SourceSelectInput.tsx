import { useFormValue, set, unset, type StringInputProps } from "sanity";

type Source = { _key: string; text?: string };

// The citation annotation stores a source's _key. Nobody can type a key, so the
// field renders as a dropdown of the sources on the note being edited.
//
// NOTE: this uses a plain <select> rather than @sanity/ui's <Select>. That
// component only resolves as a nested dependency of `sanity` and `next-sanity`
// (node_modules/sanity/node_modules/@sanity/ui, node_modules/next-sanity/node_modules/@sanity/ui) —
// it is not hoisted to the top-level node_modules, so `import { Select } from
// "@sanity/ui"` does not resolve from this file and fails both bundling and
// `tsc`. Adding @sanity/ui as an explicit dependency would fix that, but touches
// package.json/package-lock.json, which is outside this task's file list, so it
// was not done without checking first. See the migration report for the two
// options (add the dependency, or keep this plain <select>).
export function SourceSelectInput(props: StringInputProps) {
  const sources = (useFormValue(["sources"]) as Source[] | undefined) ?? [];
  const { value, onChange } = props;

  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        const next = e.currentTarget.value;
        onChange(next ? set(next) : unset());
      }}
      style={{
        width: "100%",
        height: 35,
        padding: "0 12px",
        borderRadius: 6,
        border: "1px solid var(--card-border-color)",
        background: "var(--card-bg-color)",
        color: "var(--card-fg-color)",
        font: "inherit",
      }}
    >
      <option value="">
        {sources.length ? "Choose a source…" : "Add sources to this note first"}
      </option>
      {sources.map((s, i) => (
        <option key={s._key} value={s._key}>
          {i + 1}. {(s.text ?? "").slice(0, 70)}
        </option>
      ))}
    </select>
  );
}
