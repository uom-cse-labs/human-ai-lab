import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import type { Publication, FocusArea, TeamMember } from '@/types';
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

export function PaperReaderModal({ paper, onClose }: PaperReaderModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/80 backdrop-blur-xs p-4">
      <div
        className="bg-background border border-outline w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in rounded-2xl relative"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 bg-surface border border-outline shadow-sm hover:bg-surface-dim rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="w-full flex flex-col p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <Badge>{paper.category}</Badge>
            <span className="font-mono text-xs text-white/40 font-bold mr-10">
              YEAR: {paper.year}
            </span>
          </div>

          <h2 className="font-sans text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-4 uppercase pr-10">
            {paper.title}
          </h2>

          <p className="font-sans text-base text-white/50 leading-relaxed italic mb-8">
            {paper.authors}
          </p>

          <div className="bg-surface p-5 border-l-2 border-primary mb-8 rounded-2xl">
            <p className="font-mono text-[10px] font-black text-on-background/40 uppercase tracking-wider mb-1">
              PUBLISHED IN / CITED AS:
            </p>
            <p className="font-sans text-sm text-on-background/80 leading-relaxed">
              {paper.citation}
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <h3 className="font-mono text-xs font-black tracking-[0.2em] text-on-background/50 uppercase border-b border-outline pb-2">
              ABSTRACT
            </h3>
            <p className="font-sans text-base text-on-background/70 leading-[1.7] font-normal">
              {paper.abstract}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-mono text-xs font-black tracking-[0.2em] text-on-background/50 uppercase border-b border-outline pb-2">
              KEY RESEARCH FINDINGS
            </h3>
            <ul className="space-y-4 pt-2">
              {paper.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="font-mono text-xs font-black text-primary mt-0.5">•</span>
                  <p className="font-sans text-sm text-on-background/60 leading-[1.5]">
                    {finding}
                  </p>
                </li>
              ))}
            </ul>
          </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/80 backdrop-blur-xs p-4">
      <div
        className="bg-background border border-outline w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in rounded-2xl"
      >
        <div className="p-6 md:p-8 border-b border-outline bg-surface flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] font-black text-primary tracking-[0.2em] uppercase select-none">
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

          <div className="flex justify-end gap-4 pt-2">

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/80 backdrop-blur-xs p-4">
      <div
        className="bg-background border border-outline w-full max-w-lg overflow-hidden animate-fade-in rounded-2xl"
      >
        <div className="p-6 border-b border-outline bg-surface flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] font-black text-primary tracking-[0.2em] uppercase">
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
            <div className="w-16 h-16 bg-surface text-primary border border-outline flex items-center justify-center mx-auto rounded-full">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-sans text-lg font-black text-on-background uppercase tracking-tight">
              PROPOSAL REGISTERED SUCCESSFULLY
            </h3>
            <p className="font-sans text-sm text-on-background/60 leading-relaxed max-w-sm mx-auto font-normal">
              Thank you for connecting with Human AI Lab at the University of Moratuwa. Our lead research administrator will review your proposal and respond shortly.
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
// 5. BIO DETAIL MODAL
// ==========================================
interface BioModalProps {
  member: TeamMember;
  onClose: () => void;
}

export function BioModal({ member, onClose }: BioModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/80 backdrop-blur-xs p-4">
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

            <div className="bg-surface p-4 border-l-2 border-primary rounded-2xl">
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
