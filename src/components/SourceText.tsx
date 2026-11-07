// A source is free text that may contain one or more URLs. Render the URLs as
// links (new tab) and leave the rest as plain text.
const URL_RE = /(https?:\/\/[^\s]+)/g;

export function SourceText({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}
