"use client";

import { memo, useRef, useEffect, useCallback } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  loading: boolean;
  disabled: boolean;
}

// Completamente aislado: su propio estado local para `input`.
// El padre (Chat) nunca sabe qué está escribiendo el usuario hasta
// que presiona Enviar → cero re-renders en MessageList mientras se escribe.
const ChatInput = memo(({ onSend, onStop, loading, disabled }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputRef = useRef<string>("");          // valor actual sin causar re-render
  const [, forceRender] = [0, useCallback(() => {}, [])]; // solo para el botón disabled

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = window.innerHeight * 0.5;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, [adjustHeight]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      inputRef.current = e.target.value;
      adjustHeight();
    },
    [adjustHeight]
  );

  const handleSend = useCallback(() => {
    const value = inputRef.current.trim();
    if (!value || loading) return;

    onSend(value);

    // Limpiar textarea manualmente (sin estado en el padre)
    if (textareaRef.current) {
      textareaRef.current.value = "";
      inputRef.current = "";
      adjustHeight();
    }
  }, [loading, onSend, adjustHeight]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="chat-input-container">
      <textarea
        ref={textareaRef}
        defaultValue=""
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje..."
        className="chat-textarea"
        rows={1}
        disabled={disabled}
        style={{ overflow: "hidden", resize: "none" }}
      />

      <div className="chat-buttons">
        {!loading ? (
          <button
            onClick={handleSend}
            className="chat-button"
            disabled={disabled}
          >
            Enviar
          </button>
        ) : (
          <button onClick={onStop} className="chat-button stop-button">
            Detener
          </button>
        )}
      </div>
    </div>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
