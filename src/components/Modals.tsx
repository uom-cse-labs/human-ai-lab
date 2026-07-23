import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import type { Publication, FocusArea, TeamMember, NewsItem } from '@/types';
import { X, Send, Bot, CheckCircle, ArrowRight, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// ==========================================
// 1. PAPER READER & AI CHAT ASSISTANT MODAL
// ==========================================
interface PaperReaderModalProps {
  paper: Publication;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  isWarning?: boolean;
}

export function PaperReaderModal({ paper, onClose }: PaperReaderModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello! I am your AIM Research Companion. I have indexed the research blueprint for "${paper.title}". You may inquire about its methodologies, real-world constraints, or local cultural implications.`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiActive, setAiActive] = useState<boolean | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/summarize-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.id, customQuestion: textToSend })
      });
      const data = await response.json();

      setIsTyping(false);
      setAiActive(data.aiActive);

      if (data.warning) {
        setWarningMessage(data.warning);
      } else {
        setWarningMessage(null);
      }

      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: data.text }
      ]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: 'Error contacting research server. Please ensure the dev server is active.' }
      ]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const sampleQuestions = [
    'How does this apply to South Asia?',
    'Summarize the key methodology.',
    'What are the real-world limitations?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        className="bg-background border border-outline w-full max-w-6xl h-[90vh] md:h-[85vh] flex flex-col md:flex-row overflow-hidden animate-fade-in rounded-2xl"
      >
        <div className="w-full md:w-3/5 border-b md:border-b-0 md:border-r border-outline flex flex-col h-1/2 md:h-full p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Badge>{paper.category}</Badge>
            <span className="font-mono text-xs text-white/40 font-bold">
              YEAR: {paper.year}
            </span>
          </div>

          <h2 className="font-sans text-2xl font-black text-white leading-tight tracking-tight mb-4 uppercase">
            {paper.title}
          </h2>

          <p className="font-sans text-sm text-white/50 leading-relaxed italic mb-6">
            {paper.authors}
          </p>

          <div className="bg-surface p-5 border-l-2 border-[#F27D26] mb-8 rounded-2xl">
            <p className="font-mono text-[10px] font-black text-on-background/40 uppercase tracking-wider mb-1">
              PUBLISHED IN / CITED AS:
            </p>
            <p className="font-sans text-xs text-on-background/70 leading-relaxed">
              {paper.citation}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-mono text-[10px] font-black tracking-[0.2em] text-on-background/50 uppercase border-b border-outline pb-2">
              ABSTRACT
            </h3>
            <p className="font-sans text-sm text-on-background/60 leading-[1.65] font-normal">
              {paper.abstract}
            </p>
          </div>

          <div className="space-y-4 mb-4">
            <h3 className="font-mono text-[10px] font-black tracking-[0.2em] text-on-background/50 uppercase border-b border-outline pb-2">
              KEY RESEARCH FINDINGS
            </h3>
            <ul className="space-y-3">
              {paper.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="font-mono text-xs font-black text-[#F27D26] mt-0.5">•</span>
                  <p className="font-sans text-sm text-on-background/60 leading-[1.5]">
                    {finding}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full md:w-2/5 flex flex-col h-1/2 md:h-full bg-surface-dim">

          <div className="px-6 py-4 border-b border-outline bg-surface flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F27D26] flex items-center justify-center text-black font-black italic rounded-full">
                A.
              </div>
              <div>
                <h4 className="font-sans text-xs font-black text-on-background uppercase tracking-wider">
                  Research Companion
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${aiActive === true ? 'bg-emerald-500 animate-pulse' : 'bg-[#F27D26] animate-pulse'}`} />
                  <span className="font-mono text-[9px] text-on-background/40 tracking-wider">
                    {aiActive === true ? 'GEMINI LIVE' : 'LOCAL SYNTHESIS'}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon-sm" onClick={onClose} title="Close Panel">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-full`}
              >
                <div className={`p-4 rounded-2xl max-w-[90%] font-sans text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-on-background text-background font-semibold'
                    : 'bg-surface text-on-background border border-outline'
                }`}>
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>
                </div>
                <span className="font-mono text-[8px] tracking-wider text-on-background/40 mt-1 uppercase px-1">
                  {msg.sender === 'user' ? 'YOU' : 'ASSISTANT'}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-on-background/40 font-mono text-xs px-2 animate-pulse">
                <Bot className="w-4 h-4 text-[#F27D26]" />
                <span>AIM Assistant is reasoning...</span>
              </div>
            )}

            {warningMessage && (
              <div className="p-3 bg-surface border border-outline flex gap-2.5 text-on-background/60 rounded-2xl my-2">
                <AlertCircle className="w-4 h-4 text-[#F27D26] shrink-0 mt-0.5" />
                <div className="font-sans text-[11px] leading-normal font-normal">
                  <strong>Developer Note:</strong> To activate conversational intelligence powered by Google Gemini, define a valid <code>GEMINI_API_KEY</code> in the Secrets dashboard.
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="px-6 py-3 border-t border-outline bg-surface space-y-2">
            <span className="font-mono text-[8px] font-black text-on-background/40 tracking-[0.2em] block uppercase">
              RECOMMENDED QUESTIONS
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleQuestions.map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-4 border-t border-outline bg-surface flex gap-2"
          >
            <Input
              ref={searchInputRef}
              placeholder="Ask a custom scholarly question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim()}
              size="icon"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. FOCUS AREA DETAIL MODAL
// ==========================================
interface FocusAreaModalProps {
  area: FocusArea;
  onClose: () => void;
  onViewPublications: () => void;
}

export function FocusAreaModal({ area, onClose, onViewPublications }: FocusAreaModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        className="bg-background border border-outline w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in rounded-2xl"
      >
        <div className="p-6 md:p-8 border-b border-outline bg-surface flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] font-black text-[#F27D26] tracking-[0.2em] uppercase select-none">
              {area.type}
            </span>
            <h2 className="font-sans text-2xl font-black text-on-background mt-1 uppercase">
              {area.title}
            </h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto space-y-6">

          <div className="space-y-3">
            <h4 className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase">
              OVERVIEW & MOTIVATION
            </h4>
            <p className="font-sans text-sm text-on-background/60 leading-[1.65] font-normal">
              {area.detailedDescription}
            </p>
          </div>

          <div className="h-px bg-outline" />

          <div className="space-y-3">
            <h4 className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase">
              CURRENT RESEARCH PROJECTS
            </h4>
            <div className="space-y-2.5">
              {area.projects.map((proj, idx) => {
                const parts = proj.split(':');
                return (
                  <div key={idx} className="flex gap-2">
                    <span className="text-[#F27D26] font-mono">•</span>
                    <p className="font-sans text-sm text-on-background/60 leading-relaxed">
                      <strong className="text-on-background font-bold">{parts[0]}</strong>: {parts[1]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-outline" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface flex items-center justify-center text-[#F27D26] border border-outline rounded-full">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-mono text-[8px] text-on-background/40 tracking-[0.2em] uppercase">
                  INVESTIGATOR LEAD
                </p>
                <p className="font-sans text-sm font-black text-on-background uppercase">
                  {area.leadResearcher}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => {
                onClose();
                onViewPublications();
              }}
              className="gap-2"
            >
              EXPLORE PUBLICATIONS <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. CONTACT FORM MODAL
// ==========================================
interface ContactModalProps {
  onClose: () => void;
}

export function ContactModal({ onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setIsSubmitting(false);
      if (data.success) {
        setSubmitted(true);
      }
    } catch {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        className="bg-background border border-outline w-full max-w-lg overflow-hidden animate-fade-in rounded-2xl"
      >
        <div className="p-6 border-b border-outline bg-surface flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] font-black text-[#F27D26] tracking-[0.2em] uppercase">
              LABORATORY INQUIRY
            </span>
            <h2 className="font-sans text-xl font-black text-on-background uppercase mt-1">
              Connect With Us
            </h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-surface text-[#F27D26] border border-outline flex items-center justify-center mx-auto rounded-full">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-sans text-lg font-black text-on-background uppercase tracking-tight">
              PROPOSAL REGISTERED SUCCESSFULLY
            </h3>
            <p className="font-sans text-sm text-on-background/60 leading-relaxed max-w-sm mx-auto font-normal">
              Thank you for connecting with AIM at the University of Moratuwa. Our lead research administrator will review your proposal and respond shortly.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={onClose}
            >
              CLOSE WINDOW
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase block mb-1">
                Full Name *
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Dr. Jane Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase block mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                required
                placeholder="e.g. jsmith@academy.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase block mb-1">
                Subject Area
              </label>
              <Input
                type="text"
                placeholder="e.g. Collaborative Robotics Fellowship"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase block mb-1">
                Inquiry / Proposal Details *
              </label>
              <Textarea
                required
                placeholder="Please outline your proposed focus area, requested faculty, or technical scope..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-outline">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onClose}
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. SUBMISSIONS DRAWER
// ==========================================
interface SubmissionsDrawerProps {
  onClose: () => void;
}

export function SubmissionsDrawer({ onClose }: SubmissionsDrawerProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/contact/submissions');
        const data = await res.json();
        setSubmissions(data);
      } catch {
        console.error('Error loading submissions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l border-outline shadow-2xl flex flex-col p-6 animate-slide-in text-on-background">
      <div className="flex items-center justify-between border-b border-outline pb-4 mb-6">
        <div>
          <span className="font-mono text-[9px] font-black text-[#F27D26] tracking-[0.2em] uppercase">
            SERVER STATE ACTIVE
          </span>
          <h2 className="font-sans text-lg font-black text-on-background uppercase mt-1">
            Active Submissions
          </h2>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {isLoading ? (
          <div className="text-center font-mono text-xs text-on-background/40 py-12">
            LOADING ACTIVE ARCHIVE STATE...
          </div>
        ) : submissions.length > 0 ? (
          submissions.map((sub: any) => (
            <div
              key={sub.id}
              className="bg-surface border border-outline p-5 space-y-2 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-black text-on-background uppercase tracking-tight">
                  {sub.name}
                </span>
                <span className="font-mono text-[9px] text-on-background/40">
                  {sub.timestamp}
                </span>
              </div>
              <p className="font-sans text-xs text-on-background/50">
                {sub.email}
              </p>
              <div className="h-px bg-outline my-1.5" />
              <p className="font-mono text-[9px] font-black text-[#F27D26] uppercase tracking-wider">
                SUBJECT: {sub.subject || 'GENERAL INQUIRY'}
              </p>
              <p className="font-sans text-xs text-on-background/70 leading-relaxed italic whitespace-pre-wrap">
                &ldquo;{sub.message}&rdquo;
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-outline rounded-2xl bg-surface/30">
            <p className="font-sans text-xs text-on-background/40 font-normal">
              No submissions registered in this server session yet.
            </p>
            <p className="font-mono text-[9px] text-[#F27D26] mt-2 tracking-wider">
              Submit a proposal in the Connect box to see it register live!
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-outline pt-4 mt-6">
        <Button
          variant="secondary"
          size="lg"
          className="w-full justify-center py-4"
          onClick={onClose}
        >
          CLOSE AUDIT PANEL
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// 5. BIO DETAIL MODAL
// ==========================================
interface BioModalProps {
  member: TeamMember;
  onClose: () => void;
}

export function BioModal({ member, onClose }: BioModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        className="bg-background border border-outline w-full max-w-2xl overflow-hidden animate-fade-in rounded-2xl"
      >
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-2/5 aspect-[4/5] md:aspect-auto md:h-full bg-surface-dim overflow-hidden relative border-b md:border-b-0 md:border-r border-outline rounded-l-2xl">
            <img
              src={member.imageUrl}
              alt={member.name}
              className="w-full h-full object-cover grayscale contrast-110 brightness-90"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant="ghost" className="text-[10px]">{member.title}</Badge>
                  <h2 className="font-sans text-xl font-black text-on-background mt-1 uppercase">
                    {member.name}
                  </h2>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="h-px bg-outline mb-4" />

              <p className="font-sans text-sm text-on-background/60 leading-[1.65] font-normal mb-6">
                {member.bio}
              </p>
            </div>

            <div className="bg-surface p-4 border-l-2 border-[#F27D26] rounded-2xl">
              <p className="font-mono text-[8px] font-black text-on-background/40 tracking-[0.2em] uppercase mb-1">
                CORE INVESTIGATION FOCUS
              </p>
              <p className="font-sans text-xs text-on-background font-semibold leading-relaxed">
                {member.expertise}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. NEWS ARTICLE DETAIL MODAL
// ==========================================
interface NewsModalProps {
  news: NewsItem;
  onClose: () => void;
}

export function NewsModal({ news, onClose }: NewsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        className="bg-background border border-outline w-full max-w-2xl overflow-hidden animate-fade-in rounded-2xl"
      >
        <div className="aspect-[16/9] w-full relative overflow-hidden bg-surface border-b border-outline rounded-t-2xl">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover filter grayscale contrast-110 brightness-90"
            referrerPolicy="no-referrer"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/80 text-white hover:bg-[#F27D26] hover:text-black"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-8 space-y-4 bg-background">
          <span className="font-mono text-[10px] font-black text-[#F27D26] tracking-[0.2em] uppercase block">
            PUBLISHED: {news.date}
          </span>
          <h2 className="font-sans text-2xl font-black text-on-background tracking-tight leading-snug uppercase">
            {news.title}
          </h2>
          <div className="h-px bg-outline my-3" />
          <p className="font-sans text-sm text-on-background/60 leading-[1.65] font-normal">
            {news.details}
          </p>
        </div>
      </div>
    </div>
  );
}
