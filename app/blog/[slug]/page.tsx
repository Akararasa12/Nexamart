"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Sparkles, 
  Share2, 
  Check, 
  Loader2, 
  Clock 
} from "lucide-react";

interface Journal {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  read_time: string;
  author: string;
  created_at: string;
}

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [journal, setJournal] = useState<Journal | null>(null);
  const [relatedJournals, setRelatedJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchJournalData() {
      setIsLoading(true);
      try {
        // Fetch specific article
        const res = await fetch(`/api/journals?slug=${slug}`);
        const data = await res.json();
        
        if (data.success && data.journal) {
          setJournal(data.journal);
          
          // Fetch all articles to extract related ones
          const allRes = await fetch("/api/journals");
          const allData = await allRes.json();
          if (allData.success && allData.journals) {
            const filtered = allData.journals.filter(
              (j: Journal) => j.slug !== slug
            ).slice(0, 2);
            setRelatedJournals(filtered);
          }
        } else {
          setJournal(null);
        }
      } catch (e) {
        console.error("Gagal memuat artikel:", e);
        setJournal(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchJournalData();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    // Split into lines
    const lines = text.split("\n");
    let inList = false;
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = (keyPrefix: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${keyPrefix}`} className="list-disc list-inside ml-5 my-4 space-y-2">
            {listItems.map((item, idx) => (
              <li 
                key={`li-${idx}`} 
                className="text-neutral-800 text-[13px] sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: item
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>")
                }}
              />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Handle list items
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        inList = true;
        listItems.push(trimmed.substring(2));
        return;
      }
      
      // If it was a list and now it's not, flush list elements
      if (inList && !trimmed.startsWith("- ") && !trimmed.startsWith("* ")) {
        flushList(idx);
      }

      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={idx} className="font-serif text-2xl sm:text-3xl font-light text-neutral-950 mt-8 mb-4 border-b border-[#eadecb]/40 pb-2">
            {trimmed.replace("# ", "")}
          </h1>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={idx} className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mt-6 mb-3">
            {trimmed.replace("## ", "")}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={idx} className="font-serif text-lg sm:text-xl font-bold text-neutral-900 mt-5 mb-2">
            {trimmed.replace("### ", "")}
          </h3>
        );
      } else if (trimmed === "") {
        elements.push(<div key={idx} className="h-3" />);
      } else {
        // Normal paragraph
        elements.push(
          <p 
            key={idx} 
            className="my-3 text-neutral-800 leading-relaxed text-[13px] sm:text-sm font-sans"
            dangerouslySetInnerHTML={{
              __html: trimmed
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>")
            }}
          />
        );
      }
    });

    // Flush any remaining list at the end
    if (inList) {
      flushList(lines.length);
    }

    return elements;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf9]">
        <div className="flex flex-col items-center gap-2 text-xs text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin text-gold" />
          Memuat artikel jurnal...
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] py-16 px-6 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="font-serif text-2xl font-light text-neutral-950">Artikel Tidak Ditemukan</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Maaf, artikel jurnal yang Anda cari tidak tersedia atau telah dihapus oleh pengelola situs.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Jurnal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9] py-12 px-4 sm:px-6 luxury-pattern">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex justify-between items-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-900 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600" />
            Kembali ke Jurnal
          </Link>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#eadecb] rounded-full text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-950 hover:border-neutral-950 bg-white/50 backdrop-blur-sm transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-scale-up" />
                Tautan Disalin
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-600" />
                Bagikan
              </>
            )}
          </button>
        </div>

        {/* Article Container */}
        <article className="bg-white/80 backdrop-blur-md border border-[#eadecb] p-6 sm:p-10 rounded-3xl shadow-sm luxury-border space-y-6">
          
          {/* Header */}
          <div className="space-y-4 border-b border-[#eadecb]/40 pb-6">
            <div className="flex items-center gap-2 text-gold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-amber-700">
                {journal.category}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-neutral-950">
              {journal.title}
            </h1>

            <div className="flex flex-wrap gap-4 items-center text-xs text-neutral-400 pt-2 font-sans">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-300" />
                {formatDate(journal.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-300" />
                Oleh: {journal.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-300" />
                {journal.read_time}
              </span>
            </div>
          </div>

          {/* Excerpt / Lead */}
          {journal.excerpt && (
            <p className="font-serif italic text-neutral-600 border-l-2 border-amber-600 pl-4 py-1 text-sm sm:text-base leading-relaxed bg-[#fcfbfa]/50">
              {journal.excerpt}
            </p>
          )}

          {/* Dynamic Content Body */}
          <div className="prose max-w-none prose-neutral">
            {renderMarkdown(journal.content)}
          </div>

        </article>

        {/* Related Articles Section */}
        {relatedJournals.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-serif text-lg font-bold text-neutral-950">Artikel Jurnal Terkait</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedJournals.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="bg-white/60 border border-[#eadecb] p-5 rounded-2xl block hover:shadow-[0_8px_25px_rgba(195,164,117,0.04)] hover:border-amber-600/30 transition-all duration-300 group"
                >
                  <span className="text-[8px] uppercase tracking-wider font-bold text-amber-700 block mb-1">
                    {post.category}
                  </span>
                  <h4 className="font-serif font-bold text-neutral-950 group-hover:text-amber-700 transition-colors text-sm line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1.5 font-sans leading-relaxed">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
