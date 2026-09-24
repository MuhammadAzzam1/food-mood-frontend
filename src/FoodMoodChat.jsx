import React, { useEffect, useRef, useState } from 'react';
import { Bot, ArrowUp, X, Sparkles, ShoppingBag, ChevronDown } from 'lucide-react';
import { api } from './services/api';
import { clientConfig } from './client-config';
import './food-mood-chat.css';

const assistantName = `${clientConfig.businessName} AI`;
const greeting = { role: 'assistant', text: `Hi, I'm ${assistantName}! 👋\nWhat are you craving today? I can help you explore the menu, manage your cart, and place your order.` };
const isClearChatCommand = text => /^(?:please )?(?:clear|delete|reset)(?: (?:the |my )?)?chat[.!?]*$|^start over[.!?]*$/i.test(text.trim());

export default function FoodMoodChat({ sessionId, refresh, hidden }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(`${clientConfig.businessSlug}-chat-${sessionId}`));
      if (Array.isArray(saved) && saved.length && saved.every(m => ['user', 'assistant'].includes(m.role) && typeof m.text === 'string')) return saved.slice(-60);
    } catch { /* Storage is optional. */ }
    return [greeting];
  });
  const sending = useRef(false);
  const input = useRef(null);
  const launcher = useRef(null);
  const log = useRef(null);
  useEffect(() => {
    try { sessionStorage.setItem(`${clientConfig.businessSlug}-chat-${sessionId}`, JSON.stringify(messages.slice(-60))); } catch { /* Keep chatting when storage is unavailable. */ }
  }, [messages, sessionId]);
  useEffect(() => { if (open && !hidden) input.current?.focus(); }, [open, hidden]);
  useEffect(() => { if (open && log.current) log.current.scrollTop = log.current.scrollHeight; }, [open, messages, busy, error]);
  const close = () => { setOpen(false); launcher.current?.focus(); };
  const send = async (text = draft) => {
    const message = text.trim();
    if (!message || sending.current) return;
    if (isClearChatCommand(message)) {
      setMessages([greeting]);
      setError('');
      setDraft('');
      try { sessionStorage.removeItem(`${clientConfig.businessSlug}-chat-${sessionId}`); } catch { /* Storage is optional. */ }
      input.current?.focus();
      return;
    }
    sending.current = true;
    setBusy(true);
    setError('');
    setDraft('');
    setMessages(previous => [...previous, { role: 'user', text: message }]);
    try {
      const response = await api.chat({ session_id: sessionId, message });
      if (typeof response?.reply !== 'string' || !response.reply.trim()) throw new Error('Empty reply');
      setMessages(previous => [...previous, { role: 'assistant', text: response.reply }]);
    } catch {
      setError("I couldn't get a reply. Please check your connection. If you requested a cart or order change, check its status before sending it again.");
    } finally {
      sending.current = false;
      setBusy(false);
      void refresh();
      input.current?.focus();
    }
  };
  if (hidden) return null;
  return <div className="fm-chat">
    {open && <section id="fm-chat-panel" className="fm-chat-panel" aria-labelledby="fm-chat-title" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
      <header className="fm-chat-header">
        <span className="fm-chat-avatar"><Bot size={29} strokeWidth={1.8}/></span>
        <div><h2 id="fm-chat-title">{assistantName} <Sparkles size={14}/></h2><p>Your little shopping companion</p></div>
        <button type="button" onClick={close} aria-label={`Minimize ${assistantName}`}><ChevronDown size={23}/></button>
      </header>
      <div className="fm-chat-shared"><ShoppingBag size={14}/><span>One cart. Here and on the website.</span></div>
      <div className="fm-chat-log" ref={log} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
        <div className="fm-chat-date">LET'S FIND YOUR HAPPY MEAL</div>
        {messages.map((message, index) => <div className={`fm-chat-message ${message.role}`} key={index}>
          {message.role === 'assistant' && <span className="fm-chat-smallbot" aria-hidden="true"><Bot size={18}/></span>}
          <div><span className="fm-chat-speaker">{message.role === 'assistant' ? assistantName : 'You'}</span><p>{message.text}</p></div>
        </div>)}
        {busy && <div className="fm-chat-thinking" role="status"><Bot size={18}/><span>Thinking</span><i/><i/><i/></div>}
        {error && <p className="fm-chat-error" role="alert">{error}</p>}
      </div>
      {messages.length === 1 && <div className="fm-chat-suggestions" aria-label="Conversation starters">
        {['Show me the menu', 'Show me my cart', 'How does payment work?'].map(text => <button key={text} type="button" disabled={busy} onClick={() => send(text)}>{text}</button>)}
      </div>}
      <form className="fm-chat-composer" onSubmit={event => { event.preventDefault(); void send(); }}>
        <label className="fm-chat-sr" htmlFor="fm-chat-input">Message {assistantName}</label>
        <textarea id="fm-chat-input" ref={input} rows={1} maxLength={1000} value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask me something delicious…" onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); }
        }}/>
        <button type="submit" disabled={busy || !draft.trim()} aria-label="Send message"><ArrowUp size={21}/></button>
      </form>
      <p className="fm-chat-footnote">A little AI help for every shopper.</p>
    </section>}
    <button className={`fm-chat-launcher ${open ? 'is-open' : ''}`} type="button" ref={launcher} aria-expanded={open} aria-controls="fm-chat-panel" aria-label={open ? `Close ${assistantName}` : `Chat with ${assistantName}`} onClick={() => open ? close() : setOpen(true)}>
      <span className="fm-chat-launcher-face">{open ? <X size={25}/> : <Bot size={32} strokeWidth={1.8}/>}</span>
      <span className="fm-chat-launcher-label"><strong>{assistantName}</strong><small>Let's talk food <Sparkles size={12}/></small></span>
    </button>
  </div>;
}
