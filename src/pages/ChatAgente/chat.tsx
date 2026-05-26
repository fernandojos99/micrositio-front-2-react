// Chat.tsx
import {
  useEffect,
  useRef,
  useState
} from 'react';

import { fetchStream } from '@/apiClient';

import './chat.css';

type MessageRole =
  | 'user'
  | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
}

interface ParsedChunkItem {
  text?: string;
}

interface ParsedSSEData {
  token?: string;
  data?: {
    chunk?: {
      content?:
        | string
        | ParsedChunkItem[]
        | string[];
    };
  };
}

export default function Chat() {
  const [messages, setMessages] =
    useState<Message[]>([
      {
        role: 'assistant',
        content: 'Hola, soy tu agente.'
      }
    ]);

  const [input, setInput] =
    useState<string>('');

  const [loading, setLoading] =
    useState<boolean>(false);

  const threadIdRef =
    useRef<string>(
      crypto.randomUUID()
    );

  const abortControllerRef =
    useRef<AbortController | null>(
      null
    );

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  const appendTokenToLastMessage = (
    token: string
  ): void => {
    if (!token) return;

    setMessages((prev) => {
      const updated = [...prev];

      const lastIndex =
        updated.length - 1;

      const lastMessage =
        updated[lastIndex];

      if (
        !lastMessage ||
        lastMessage.role !==
          'assistant'
      ) {
        return prev;
      }

      updated[lastIndex] = {
        ...lastMessage,
        content:
          lastMessage.content +
          token
      };

      return updated;
    });
  };

  const parseSSEEvent = (
    event: string
  ): string => {
    const lines =
      event.split('\n');

    const dataLines: string[] = [];

    for (const line of lines) {
      if (
        !line ||
        line.startsWith(':')
      ) {
        continue;
      }

      if (
        line.startsWith('data:')
      ) {
        dataLines.push(
          line.replace(
            /^data:\s?/,
            ''
          )
        );
      }
    }

    return dataLines.join('\n');
  };

  const extractToken = (
    parsed: ParsedSSEData
  ): string => {
    if (
      typeof parsed.token ===
      'string'
    ) {
      return parsed.token;
    }

    const chunkContent =
      parsed?.data?.chunk
        ?.content;

    if (
      typeof chunkContent ===
      'string'
    ) {
      return chunkContent;
    }

    if (
      Array.isArray(chunkContent)
    ) {
      return chunkContent
        .map((item) => {
          if (
            typeof item ===
            'string'
          ) {
            return item;
          }

          if (item?.text) {
            return item.text;
          }

          return '';
        })
        .join('');
    }

    return '';
  };

  const sendMessage =
    async (): Promise<void> => {
      if (
        !input.trim() ||
        loading
      ) {
        return;
      }

      const userMessage =
        input;

      setInput('');

      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: userMessage
        },
        {
          role: 'assistant',
          content: ''
        }
      ]);

      setLoading(true);

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

      try {
        const response =
          await fetchStream(
            '/api/chat/stream',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
                Accept:
                  'text/event-stream'
              },
              body: JSON.stringify({
                message:
                  userMessage,
                thread_id:
                  threadIdRef.current
              }),
              signal:
                controller.signal
            }
          );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        if (!response.body) {
          throw new Error(
            'No response body'
          );
        }

        const reader =
          response.body.getReader();

        const decoder =
          new TextDecoder(
            'utf-8'
          );

        let buffer = '';

        while (true) {
          const {
            value,
            done
          } =
            await reader.read();

          if (done) {
            break;
          }

          buffer +=
            decoder.decode(value, {
              stream: true
            });

          const events =
            buffer.split(
              '\n\n'
            );

          buffer =
            events.pop() || '';

          for (const event of events) {
            if (
              !event.trim()
            ) {
              continue;
            }

            const data =
              parseSSEEvent(
                event
              );

            if (!data) {
              continue;
            }

            console.log(
              'RAW SSE DATA:',
              data
            );

            if (
              data ===
              '[DONE]'
            ) {
              setLoading(false);
              return;
            }

            try {
              const parsed: ParsedSSEData =
                JSON.parse(
                  data
                );

              console.log(
                'PARSED:',
                parsed
              );

              const token =
                extractToken(
                  parsed
                );

              if (token) {
                appendTokenToLastMessage(
                  token
                );
              }
            } catch (err) {
              console.error(
                'SSE JSON parse error:',
                err,
                data
              );
            }
          }
        }

        if (buffer.trim()) {
          const data =
            parseSSEEvent(
              buffer
            );

          if (
            data &&
            data !== '[DONE]'
          ) {
            try {
              const parsed: ParsedSSEData =
                JSON.parse(
                  data
                );

              const token =
                extractToken(
                  parsed
                );

              if (token) {
                appendTokenToLastMessage(
                  token
                );
              }
            } catch (err) {
              console.error(
                'Final buffer parse error:',
                err
              );
            }
          }
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !==
            'AbortError'
        ) {
          console.error(
            'Streaming error:',
            error
          );

          setMessages((prev) => [
            ...prev,
            {
              role:
                'assistant',
              content:
                'Error conectando con el servidor.'
            }
          ]);
        }
      } finally {
        setLoading(false);

        abortControllerRef.current =
          null;
      }
    };

  const stopGeneration =
    (): void => {
      abortControllerRef.current?.abort();

      setLoading(false);
    };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {
      e.preventDefault();

      sendMessage();
    }
  };

  return (
    <main
      className="chat-page"
      style={{
        background:
          'var(--theme-bg-primary)',
        color:
          'var(--theme-text-primary)'
      }}
    >
      <div
        className="chat-container"
        style={{
          background:
            'var(--theme-bg-secondary)',
          border:
            '1px solid var(--theme-border)'
        }}
      >
        <div className="chat-messages">
          {messages.map(
            (
              message,
              index
            ) => (
              <div
                key={index}
                className={`chat-message ${
                  message.role ===
                  'user'
                    ? 'user-message'
                    : 'assistant-message'
                }`}
              >
                <div className="chat-role">
                  {message.role ===
                  'user'
                    ? 'Tú'
                    : 'Agente'}
                </div>

                <div className="chat-content">
                  {
                    message.content
                  }

                  {loading &&
                    index ===
                      messages.length -
                        1 && (
                      <span className="chat-cursor">
                        ▋
                      </span>
                    )}
                </div>
              </div>
            )
          )}

          <div
            ref={bottomRef}
          />
        </div>

        <div
          className="chat-input-container"
          style={{
            borderTop:
              '1px solid var(--theme-border)'
          }}
        >
          <textarea
            value={input}
            onChange={(e) =>
              setInput(
                e.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Escribe un mensaje..."
            className="chat-textarea"
            rows={1}
          />

          <div className="chat-buttons">
            {!loading ? (
              <button
                onClick={
                  sendMessage
                }
                className="chat-button"
              >
                Enviar
              </button>
            ) : (
              <button
                onClick={
                  stopGeneration
                }
                className="chat-button stop-button"
              >
                Detener
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}