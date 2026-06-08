"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  deleteSession as deleteSessionApi,
  fetchSessions as fetchSessionsApi,
  fetchSessionMessages as fetchSessionMessagesApi,
  streamMessage as streamMessageApi,
  pingBackend,
} from "../../services/chatService";
import type { Session } from "../../services/chatService";
import MessageList, { type Message } from "./MessageList";
import ChatInput from "./ChatInput";
import "./chat.css";

interface ParsedChunkItem {
  text?: string;
}

interface ParsedSSEData {
  type?: string;
  thread_id?: string;
  token?: string;
  titulo?: string;  // ← Añadido: el backend puede enviar título durante el stream
  data?: {
    chunk?: {
      content?: string | ParsedChunkItem[] | string[];
    };
  };
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hola, soy tu agente.",
};

export default function Chat() {
  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Chat
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs
  const threadIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Manda ping cada 5 min mientras el componente esté montado para mantener el backend despierto
  useEffect(() => {
    const check = async () => {
      try {
        const data = await pingBackend();
        console.log("Backend disponible");
        console.log(data.status);
        console.log(data.service);
      } catch (err) {
        console.error("Backend no disponible", err);
      }
    };

    // Ping inicial al montar el componente
    check();

    // Ping cada 5 minutos
    const id = setInterval(() => {
      check();
    }, 5 * 60 * 1000);

    // Si quiero que se mande mientras esté visto
    // const id = setInterval(() => {
    //   if (document.visibilityState === "visible") {
    //     check();
    //   }
    // }, 5 * 60 * 1000);

    // Se ejecuta cuando el componente se desmonta
    return () => clearInterval(id);
  }, []);

  // ─── Sessions ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await fetchSessionsApi();
      setSessions(data.sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const mapRole = (role: string): "user" | "assistant" => {
    return ["user", "User", "human", "Human"].includes(role)
      ? "user"
      : "assistant";
  };

  // ─── Session actions ─────────────────────────────────────────────────────────
  const fetchSessionMessages = async (threadId: string) => {
    try {
      setMessagesLoading(true);
      const data = await fetchSessionMessagesApi(threadId);

      if (data.messages && Array.isArray(data.messages)) {
        const formatted: Message[] = data.messages.map(
          (msg: { role: string; content: string }) => ({
            role: mapRole(msg.role),
            content: msg.content || "",
          })
        );

        // Merge consecutive assistant messages
        const merged: Message[] = [];
        for (const msg of formatted) {
          const last = merged[merged.length - 1];
          if (msg.role === "assistant" && last?.role === "assistant") {
            merged[merged.length - 1] = {
              ...last,
              content: last.content + msg.content,
            };
          } else {
            merged.push({ ...msg });
          }
        }

        setMessages(merged.length ? merged : [INITIAL_MESSAGE]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([
        { role: "assistant", content: "Error al cargar los mensajes de esta sesion." },
      ]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectSession = (threadId: string) => {
    setSelectedSession(threadId);
    threadIdRef.current = threadId;
    fetchSessionMessages(threadId);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setSelectedSession(null);
    threadIdRef.current = null;
    setMessages([INITIAL_MESSAGE]);
    setSidebarOpen(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar esta sesión?")) return;
    try {
      await deleteSessionApi(threadId);
      setSessions((prev) => prev.filter((s) => s.thread_id !== threadId));
      if (selectedSession === threadId) {
        setSelectedSession(null);
        threadIdRef.current = null;
        setMessages([INITIAL_MESSAGE]);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  // ─── Streaming helpers ───────────────────────────────────────────────────────
  const appendTokenToLastMessage = useCallback((token: string) => {
    if (!token) return;
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (!last || last.role !== "assistant") return prev;
      updated[updated.length - 1] = { ...last, content: last.content + token };
      return updated;
    });
  }, []);

  const parseSSEEvent = (event: string): string => {
    return event
      .split("\n")
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.replace(/^data:\s?/, ""))
      .join("\n");
  };

  const extractToken = (parsed: ParsedSSEData): string => {
    if (typeof parsed.token === "string") return parsed.token;
    const chunk = parsed?.data?.chunk?.content;
    if (typeof chunk === "string") return chunk;
    if (Array.isArray(chunk)) {
      return chunk
        .map((item) =>
          typeof item === "string" ? item : (item as ParsedChunkItem)?.text ?? ""
        )
        .join("");
    }
    return "";
  };

  // ─── Send message ────────────────────────────────────────────────────────────
  // Recibe el texto desde ChatInput (solo cuando el usuario presiona Enviar)
  const sendMessage = useCallback(
    async (userMessage: string): Promise<void> => {
      if (!userMessage.trim() || loading) return;

      // Añadir mensaje de usuario + placeholder vacío del agente
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { role: "assistant", content: "" },
      ]);

      setLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const requestBody: { message: string; thread_id?: string } = {
          message: userMessage,
          // thread_id mantiene el contexto de la conversación con el agente.
          // Si es null, el backend crea un hilo nuevo; si ya existe, el agente
          // recupera el historial completo de esa sesión.
          ...(threadIdRef.current ? { thread_id: threadIdRef.current } : {}),
        };

        const response = await streamMessageApi(requestBody, controller.signal);
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            if (!event.trim()) continue;
            const data = parseSSEEvent(event);
            if (!data) continue;
            if (data === "[DONE]") {
              setLoading(false);
              // Mejorar esto para que se actualice en cuanto llegue el primer mensaje de respuesta
              // de una nueva sesion.
              // fetchSessions();
              return;
            }
            try {
              const parsed: ParsedSSEData = JSON.parse(data);
              if (parsed.type === "thread_id" && parsed.thread_id) {
                threadIdRef.current = parsed.thread_id;
                setSelectedSession(parsed.thread_id);
                continue;
              }
              const token = extractToken(parsed);
              if (token) appendTokenToLastMessage(token);
            } catch (err) {
              console.error("SSE JSON parse error:", err, data);
            }
          }
        }

        // Flush remaining buffer
        if (buffer.trim()) {
          const data = parseSSEEvent(buffer);
          if (data && data !== "[DONE]") {
            try {
              const parsed: ParsedSSEData = JSON.parse(data);
              if (parsed.type === "thread_id" && parsed.thread_id) {
                threadIdRef.current = parsed.thread_id;
                setSelectedSession(parsed.thread_id);
              } else {
                const token = extractToken(parsed);
                if (token) appendTokenToLastMessage(token);
              }
            } catch (err) {
              console.error("Final buffer parse error:", err);
            }
          }
        }

        fetchSessions();
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Streaming error:", error);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Error conectando con el servidor." },
          ]);
        }
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [loading, appendTokenToLastMessage]
  );

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  const toggleSidebarCollapse = () => setSidebarCollapsed((prev) => !prev);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <main
      className="chat-page"
      style={{
        background: "var(--theme-bg-primary)",
        color: "var(--theme-text-primary)",
      }}
    >
      {/* Mobile sidebar toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "Cerrar" : "Sesiones"}
      </button>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`chat-sidebar ${sidebarOpen ? "open" : ""} ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
      >
        {sidebarCollapsed ? (
          <div className="collapsed-expand-button" onClick={toggleSidebarCollapse}>
            <span className="expand-icon">▶</span>
          </div>
        ) : (
          <>
            <div className="sidebar-header">
              <span className="sidebar-title">Historial</span>
              <div className="sidebar-header-actions">
                <button className="new-chat-button" onClick={handleNewChat}>
                  + Nuevo
                </button>
                <button
                  className="sidebar-collapse-button"
                  onClick={toggleSidebarCollapse}
                  aria-label="Colapsar sidebar"
                >
                  ◀
                </button>
              </div>
            </div>

            <div className="sessions-list">
              {sessionsLoading ? (
                <div className="sessions-loading">Cargando sesiones...</div>
              ) : sessions.length === 0 ? (
                <div className="sessions-empty">No hay sesiones</div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.thread_id}
                    className={`session-item ${
                      selectedSession === session.thread_id ? "active" : ""
                    }`}
                    onClick={() => handleSelectSession(session.thread_id)}
                  >
                    <div className="session-item-content">
                      <div className="session-preview">
                        {session.titulo || session.thread_id.slice(-8)}
                      </div>
                      {session.last_update && (
                        <div className="session-date">
                          {new Date(session.last_update).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <button
                      className="session-delete-btn"
                      onClick={(e) => handleDeleteSession(e, session.thread_id)}
                      title="Eliminar sesión"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {/* Main chat area */}
      <div className="chat-main">
        <div className="chat-container">
          {/* 
            MessageList recibe solo messages/loading → memo la protege de
            re-renders causados por cualquier otra cosa (incluyendo el input).
          */}
          <MessageList
            messages={messages}
            loading={loading}
            messagesLoading={messagesLoading}
          />

          {/* 
            ChatInput maneja su propio estado local de texto → nunca provoca
            re-renders en MessageList mientras el usuario escribe.
          */}
          <ChatInput
            onSend={sendMessage}
            onStop={stopGeneration}
            loading={loading}
            disabled={messagesLoading}
          />
        </div>
      </div>
    </main>
  );
}