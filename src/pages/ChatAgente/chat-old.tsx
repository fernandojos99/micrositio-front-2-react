"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  deleteSession as deleteSessionApi,
  fetchSessions as fetchSessionsApi,
  fetchSessionMessages as fetchSessionMessagesApi,
  streamMessage as streamMessageApi,
  pingBackend,
} from "../../services/chatService";
import type { Session } from "../../services/chatService";
import "./chat.css";

type MessageRole = "user" | "assistant";

interface Message {
  role: MessageRole;
  content: string;
}

interface ParsedChunkItem {
  text?: string;
}

interface ParsedSSEData {
  type?: string;
  thread_id?: string;
  token?: string;
  data?: {
    chunk?: {
      content?: string | ParsedChunkItem[] | string[];
    };
  };
}

export default function Chat() {
  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionPreviews, setSessionPreviews] = useState<Record<string, string>>({});

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hola, soy tu agente.",
    },
  ]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // UI state for desktop sidebar collapse (tab mode)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Refs
  const threadIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const previewsFetchedRef = useRef<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Adjust textarea height
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = window.innerHeight * 0.5;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);



  // Manda ping cada 5  min mientras el compoente esté montado para mantener el backend despierto 
    useEffect(() => {
    const checkBackend = async () => {
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
    checkBackend();
  
    // Ping cada 5 minutos
    const intervalId = setInterval(() => {
      checkBackend();
    }, 5 * 60 * 1000);

    // Si quiero que se mande mientres este visto 
    // const intervalId = setInterval(() => {
    //   if (document.visibilityState === "visible") {
    //     checkBackend();
    //   }
    // }, 5 * 60 * 1000);
  
    // Se ejecuta cuando el componente se desmonta
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  useEffect(() => {
    window.addEventListener("resize", adjustTextareaHeight);
    return () => window.removeEventListener("resize", adjustTextareaHeight);
  }, [adjustTextareaHeight]);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Auto-scroll to bottom , Falla porque cada que se actualizan los mensajes se vuelve a
  // ejecutar el efecto y el scroll se va al final, incluso si el usuario esta leyendo mensajes 
  // anteriores
  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);


  // Nota: No implemente la parte de que "Cuando el usuario
  // mande un mensaje vaya hasta abajo"

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await fetchSessionsApi();
      setSessions(data.sessions);
      loadPreviewsOnce(data.sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadPreviewsOnce = async (sessionList: Session[]) => {
    const missing = sessionList.filter((s) => !previewsFetchedRef.current.has(s.thread_id));
    if (missing.length === 0) return;
    const results = await Promise.allSettled(
      missing.map((s) => fetchSessionMessagesApi(s.thread_id))
    );
    const updates: Record<string, string> = {};
    for (let i = 0; i < missing.length; i++) {
      const res = results[i];
      if (res.status === "fulfilled" && res.value.messages) {
        const preview = extractPreview(res.value.messages);
        if (preview) {
          updates[missing[i].thread_id] = preview;
          previewsFetchedRef.current.add(missing[i].thread_id);
        }
      }
    }
    if (Object.keys(updates).length > 0) {
      setSessionPreviews((prev) => ({ ...prev, ...updates }));
    }
  };

  const mapRole = (role: string): "user" | "assistant" => {
    const userRoles = ["user", "User", "human", "Human"];
    return userRoles.includes(role) ? "user" : "assistant";
  };

  const extractPreview = (rawMessages: { role: string; content: string }[]): string => {
    const firstUser = rawMessages.find((m) => mapRole(m.role) === "user");
    if (!firstUser || !firstUser.content) return "";
    const cleaned = firstUser.content.replace(/\s+/g, " ").trim();
    const words = cleaned.split(" ");
    return words.length > 5 ? words.slice(0, 5).join(" ") + "..." : cleaned;
  };

  const fetchSessionMessages = async (threadId: string) => {
    try {
      setMessagesLoading(true);
      const data = await fetchSessionMessagesApi(threadId);
  
      if (data.messages && Array.isArray(data.messages)) {
        const formattedMessages: Message[] = data.messages.map(
          (msg: { role: string; content: string }) => ({
            role: mapRole(msg.role),
            content: msg.content || "",
          })
        );
  
        const mergedMessages: Message[] = [];
        for (const msg of formattedMessages) {
          if (msg.role === "assistant" && mergedMessages.length > 0 && mergedMessages[mergedMessages.length - 1].role === "assistant") {
            mergedMessages[mergedMessages.length - 1].content += msg.content;
          } else {
            mergedMessages.push({ ...msg });
          }
        }
  
        if (mergedMessages.length > 0) {
          setMessages(mergedMessages);
        } else {
          setMessages([
            {
              role: "assistant",
              content: "Hola, soy tu agente.",
            },
          ]);
        }
  
        setSessionPreviews((prev) => {
          if (prev[threadId]) return prev;
          const preview = extractPreview(data.messages);
          if (preview) return { ...prev, [threadId]: preview };
          return prev;
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([
        {
          role: "assistant",
          content: "Error al cargar los mensajes de esta sesion.",
        },
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
    setMessages([
      {
        role: "assistant",
        content: "Hola, soy tu agente.",
      },
    ]);
    setSidebarOpen(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar esta sesión?")) return;
    try {
      await deleteSessionApi(threadId);
      setSessions((prev) => prev.filter((s) => s.thread_id !== threadId));
      setSessionPreviews((prev) => {
        const next = { ...prev };
        delete next[threadId];
        return next;
      });
      previewsFetchedRef.current.delete(threadId);
      if (selectedSession === threadId) {
        setSelectedSession(null);
        threadIdRef.current = null;
        setMessages([
          {
            role: "assistant",
            content: "Hola, soy tu agente.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const appendTokenToLastMessage = useCallback((token: string): void => {
    if (!token) return;
    setMessages((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      const lastMessage = updated[lastIndex];
      if (!lastMessage || lastMessage.role !== "assistant") {
        return prev;
      }
      updated[lastIndex] = {
        ...lastMessage,
        content: lastMessage.content + token,
      };
      return updated;
    });
  }, []);

  const parseSSEEvent = (event: string): string => {
    const lines = event.split("\n");
    const dataLines: string[] = [];
    for (const line of lines) {
      if (!line || line.startsWith(":")) continue;
      if (line.startsWith("data:")) {
        dataLines.push(line.replace(/^data:\s?/, ""));
      }
    }
    return dataLines.join("\n");
  };

  const extractToken = (parsed: ParsedSSEData): string => {
    if (typeof parsed.token === "string") return parsed.token;
    const chunkContent = parsed?.data?.chunk?.content;
    if (typeof chunkContent === "string") return chunkContent;
    if (Array.isArray(chunkContent)) {
      return chunkContent
        .map((item) => {
          if (typeof item === "string") return item;
          if (item?.text) return item.text;
          return "";
        })
        .join("");
    }
    return "";
  };

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");

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
      };
      if (threadIdRef.current) {
        requestBody.thread_id = threadIdRef.current;
      }

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
        buffer = events.pop() || "";

        for (const event of events) {
          if (!event.trim()) continue;
          const data = parseSSEEvent(event);
          if (!data) continue;
          if (data === "[DONE]") {
            setLoading(false);
            fetchSessions();
            return;
          }
          try {
            const parsed: ParsedSSEData = JSON.parse(data);
            if (parsed.type === "thread_id" && parsed.thread_id) {
              threadIdRef.current = parsed.thread_id;
              setSelectedSession(parsed.thread_id);
              setSessionPreviews((prev) => {
                if (prev[parsed.thread_id!]) return prev;
                const preview = userMessage.replace(/\s+/g, " ").trim().split(" ").slice(0, 5).join(" ") + (userMessage.split(" ").length > 5 ? "..." : "");
                return { ...prev, [parsed.thread_id!]: preview };
              });
              continue;
            }
            const token = extractToken(parsed);
            if (token) appendTokenToLastMessage(token);
          } catch (err) {
            console.error("SSE JSON parse error:", err, data);
          }
        }
      }

      if (buffer.trim()) {
        const data = parseSSEEvent(buffer);
        if (data && data !== "[DONE]") {
          try {
            const parsed: ParsedSSEData = JSON.parse(data);
            if (parsed.type === "thread_id" && parsed.thread_id) {
              threadIdRef.current = parsed.thread_id;
              setSelectedSession(parsed.thread_id);
              setSessionPreviews((prev) => {
                if (prev[parsed.thread_id!]) return prev;
                const preview = userMessage.replace(/\s+/g, " ").trim().split(" ").slice(0, 5).join(" ") + (userMessage.split(" ").length > 5 ? "..." : "");
                return { ...prev, [parsed.thread_id!]: preview };
              });
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
          {
            role: "assistant",
            content: "Error conectando con el servidor.",
          },
        ]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = (): void => {
    abortControllerRef.current?.abort();
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle desktop sidebar collapse (tab mode)
  const toggleSidebarCollapse = () => setSidebarCollapsed((prev) => !prev);

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

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar: when collapsed, becomes a narrow tab with expand button */}
      <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}>
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
                        {sessionPreviews[session.thread_id] || session.thread_id.slice(-8)}
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
          {messagesLoading ? (
            <div className="messages-loading">Cargando mensajes...</div>
          ) : (
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    message.role === "user"
                      ? "user-message"
                      : "assistant-message"
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
                        {loading && index === messages.length - 1 && (
                          <span className="chat-cursor">|</span>
                        )}
                      </>
                    ) : (
                      <>
                        {message.content}
                        {loading && index === messages.length - 1 && (
                          <span className="chat-cursor">|</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>
          )}

          <div className="chat-input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="chat-textarea"
              rows={1}
              disabled={messagesLoading}
              style={{
                overflow: "hidden",
                resize: "none",
              }}
            />

            <div className="chat-buttons">
              {!loading ? (
                <button
                  onClick={sendMessage}
                  className="chat-button"
                  disabled={messagesLoading}
                >
                  Enviar
                </button>
              ) : (
                <button onClick={stopGeneration} className="chat-button stop-button">
                  Detener
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}