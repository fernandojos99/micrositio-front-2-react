"use client";

import { memo, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MessageRole = "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
}

// ─── Single message ───────────────────────────────────────────────────────────
interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  loading: boolean;
}

const ChatMessage = memo(({ message, isLast, loading }: ChatMessageProps) => {
  const showCursor = loading && isLast;

  return (
    <div
      className={`chat-message ${
        message.role === "user" ? "user-message" : "assistant-message"
      }`}
    >
      <div className="chat-role">
        {message.role === "user" ? "Tu" : "Agente"}
      </div>

      <div className="chat-content">
        {message.role === "assistant" ? (
          <>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {showCursor && <span className="chat-cursor">|</span>}
          </>
        ) : (
          <>
            {message.content}
            {showCursor && <span className="chat-cursor">|</span>}
          </>
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

// ─── Message list ─────────────────────────────────────────────────────────────
interface MessageListProps {
  messages: Message[];
  loading: boolean;
  messagesLoading: boolean;
}

const MessageList = memo(({ messages, loading, messagesLoading }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCount = useRef(messages.length);
  const isUserAtBottom = useRef(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Track whether the user is near the bottom
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 80; // px from bottom
    isUserAtBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  // Auto-scroll to bottom
  // Falla porque cada que se actualizan los mensajes se vuelve a
  // ejecutar el efecto y el scroll se va al final, incluso si el usuario esta leyendo mensajes
  // anteriores. Solución: solo hacer scroll cuando se agrega un mensaje nuevo,
  // no en cada token del stream.
  //
  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);
  //
  // Nota: No implemente la parte de que "Cuando el usuario
  // mande un mensaje vaya hasta abajo"
  //
  // → Solo hace scroll automático cuando el agente empieza a responder
  //   (se añaden 2 mensajes de golpe: user + placeholder vacío del agente),
  //   Y únicamente si el usuario ya estaba cerca del fondo.
  //   Si el usuario subió a leer historial, no lo interrumpimos.
  useEffect(() => {
    const newCount = messages.length;
    const prevCount = lastMessageCount.current;

    // Se añadieron 2 mensajes = el usuario envió uno y el agente abrió su placeholder
    // En ese momento sí queremos bajar, pero solo si el usuario estaba abajo
    if (newCount >= prevCount + 2 && isUserAtBottom.current) {
      // scrollIntoView puede mover el body completo si el contenedor
      // no es el ancestro scrollable directo. Scrollamos el contenedor
      // explícitamente para que el movimiento quede contenido aquí.
      const el = containerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }

    lastMessageCount.current = newCount;
  }, [messages.length]);

  if (messagesLoading) {
    return <div className="messages-loading">Cargando mensajes...</div>;
  }

  return (
    <div
      className="chat-messages"
      ref={containerRef}
      onScroll={handleScroll}
    >
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          isLast={index === messages.length - 1}
          loading={loading}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
});

MessageList.displayName = "MessageList";

export default MessageList;