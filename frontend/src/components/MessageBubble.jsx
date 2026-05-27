import { User, Bot } from "lucide-react";

function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`mb-4 flex gap-2 sm:mb-6 sm:gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border sm:h-9 sm:w-9 ${
          isUser
            ? "border-[var(--color-gold-dim)] bg-[var(--color-gold)]/15"
            : "border-[var(--color-border)] bg-[var(--color-ink-muted)]"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-[var(--color-gold)]" strokeWidth={1.5} />
        ) : (
          <Bot className="h-4 w-4 text-[var(--color-parchment-muted)]" strokeWidth={1.5} />
        )}
      </div>

      <div
        className={`min-w-0 max-w-[85%] rounded-2xl px-3.5 py-3 text-sm leading-relaxed sm:max-w-2xl sm:px-5 sm:py-3.5 sm:text-[15px] ${
          isUser
            ? "rounded-tr-md bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-gold)]/8 border border-[var(--color-border-strong)] text-[var(--color-parchment)]"
            : "rounded-tl-md border border-[var(--color-border)] bg-[var(--color-ink-muted)] text-[var(--color-parchment-muted)]"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export default MessageBubble;
