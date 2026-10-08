import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Upload, Sparkles, Leaf, ShieldCheck, AlertTriangle, RotateCcw, Recycle, ScanLine, Lightbulb, MapPin } from "lucide-react";
import { CATEGORY_INFO, CONFIDENCE_THRESHOLD, confidenceLabel, type Analysis } from "@/lib/waste";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RECYCLAI — From image to action" },
      { name: "description", content: "AI-powered waste identification and disposal decision-support system." },
      { property: "og:title", content: "RECYCLAI — From image to action" },
      { property: "og:description", content: "Snap a photo of waste and get practical, responsible disposal guidance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const MAX_MB = 4;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Downscale large photos in the browser so uploads are fast and under the size limit.
async function toDataUrl(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = img.width * scale; c.height = img.height * scale;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

function Index() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  async function onFile(f?: File) {
    setError(null); setResult(null);
    if (!f) return;
    if (!TYPES.includes(f.type)) return setError("Invalid image. Please use JPG, JPEG, PNG or WEBP.");
    if (f.size > 15 * 1024 * 1024) return setError("File is too large. Please use an image under 15 MB.");
    try { setPreview(await toDataUrl(f)); } catch { setError("We couldn't read this image. Please try another file."); }
  }

  async function analyze() {
    if (!preview) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: preview }) });
      const data = await res.json().catch(() => ({ error: "Invalid server response." }));
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setError((e as Error).message || "We couldn't analyze this image. Please try another photo with the object clearly visible.");
    } finally { setLoading(false); }
  }

  function reset() {
    setPreview(null); setResult(null); setError(null);
    document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 glass border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Recycle className="size-5" /></span>
            RECYCL<span className="text-primary">AI</span>
          </a>
          <nav className="flex gap-4 text-sm text-muted-foreground sm:gap-7">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#impact" className="hover:text-foreground">Impact</a>
            <a href="#about" className="hover:text-foreground">About</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        <section className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> AI-powered waste disposal decision support
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-[1.02] sm:text-6xl md:text-7xl">
              From image<br />to <span className="text-primary">action.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Use AI to identify waste, understand its material, and discover how to dispose of it responsibly.
            </p>
            <a href="#analyze" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition hover:scale-[1.03]">
              <ScanLine className="size-5" /> Analyze my waste
            </a>
          </div>

          <div id="analyze" className="scroll-mt-24 rounded-2xl border bg-card p-4 shadow-2xl sm:p-6">
            {!preview ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
                className="grid-bg flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 text-center"
              >
                <div className="grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary"><Upload className="size-7" /></div>
                <div>
                  <p className="font-display text-xl font-semibold">Upload an image</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG or WEBP · drag & drop supported</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Upload className="size-4" /> Choose file</button>
                  <button onClick={() => camRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"><Camera className="size-4" /> Take a photo</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="relative overflow-hidden rounded-xl">
                  <img src={preview} alt="Selected waste item" className="aspect-[4/3] w-full object-cover" />
                  {loading && <div className="scan-line absolute inset-x-0 h-1 bg-primary shadow-[0_0_20px_var(--primary)]" />}
                </div>
                <div className="mt-4 flex gap-2">
                  <button disabled={loading} onClick={analyze} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-70">
                    {loading ? <><span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Analyzing your waste...</> : <><Sparkles className="size-4" /> Analyze with AI</>}
                  </button>
                  <button disabled={loading} onClick={reset} className="rounded-full border px-4 hover:bg-secondary" aria-label="Remove image"><RotateCcw className="size-4" /></button>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
            <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
            {error && (
              <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <AlertTriangle className="size-4 shrink-0 text-destructive" /> {error}
              </div>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">Images are analyzed in real time and never stored.</p>
          </div>
        </section>

        {result && <ResultCard r={result} onReset={reset} />}

        <section id="how" className="scroll-mt-24 py-16">
          <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Upload, "Upload", "Take or upload a photo of the item."],
              [ScanLine, "Analyze", "A vision AI model identifies object and material."],
              [Lightbulb, "Understand", "See category, recyclability and confidence."],
              [Leaf, "Act", "Follow clear steps to dispose of it responsibly."],
            ].map(([Icon, t, d], i) => {
              const I = Icon as typeof Upload;
              return (
                <div key={i} className="rounded-2xl border bg-card p-5">
                  <div className="flex items-center justify-between"><I className="size-6 text-primary" /><span className="font-display text-sm text-muted-foreground">0{i + 1}</span></div>
                  <h3 className="mt-4 text-lg font-semibold">{t as string}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="impact" className="scroll-mt-24 py-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Why sorting is hard</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Uncertainty is one of the biggest barriers to recycling. RECYCLAI turns that uncertainty into a clear decision.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Materials are confusing", "Mixed plastics, coated paper and composites are hard to identify by eye."],
              ["Contamination spreads", "One wrong item can contaminate a whole batch of recyclables."],
              ["Doubt reduces action", "When people are unsure, they often skip recycling altogether."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border bg-gradient-to-b from-secondary to-card p-6">
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="scroll-mt-24 py-16">
          <div className="grid gap-6 rounded-2xl border bg-card p-6 sm:p-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">About RECYCLAI</h2>
              <p className="mt-3 text-muted-foreground">Not just an image classifier — an AI-powered waste disposal decision-support system that converts a photo into practical, responsible action.</p>
            </div>
            <div className="rounded-xl border p-5">
              <h3 className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-5 text-primary" /> Responsible AI</h3>
              <p className="mt-2 text-sm text-muted-foreground">RECYCLAI is designed to minimize data collection and focus only on the waste object. AI classifications are estimates and local disposal rules should always be verified.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">RECYCLAI · From image to action</footer>
    </div>
  );
}

function ResultCard({ r, onReset }: { r: Analysis; onReset: () => void }) {
  const uncertain = r.category === "unknown" || r.confidence < CONFIDENCE_THRESHOLD;
  const cat = CATEGORY_INFO[uncertain ? "unknown" : r.category];
  const recy = uncertain || r.recyclable === null ? "Uncertain" : r.recyclable ? "Potentially recyclable" : "Not recyclable";
  const fields = [
    ["Object", r.object || "—"],
    ["Material", r.material || "—"],
    ["Category", `${cat.emoji} ${cat.label}`],
    ["Recyclability", recy],
    ["AI confidence", `${confidenceLabel(r.confidence)} · ${Math.round(r.confidence * 100)}% (model estimate)`],
  ];
  return (
    <section id="result" className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 pb-8">
      <div className="rounded-2xl border bg-card p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold sm:text-3xl">Analysis result</h2>
          <button onClick={onReset} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><RotateCcw className="size-4" /> Analyze another item</button>
        </div>

        {uncertain && (
          <div className="mt-5 flex gap-2 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
            <AlertTriangle className="size-5 shrink-0 text-warning" />
            We couldn't confidently identify this item. Please check local disposal guidance.
          </div>
        )}
        {cat.hazardous && (
          <div className="mt-5 flex gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertTriangle className="size-5 shrink-0 text-destructive" />
            Potentially hazardous waste. Do not put it in household bins — use a specialized collection point.
          </div>
        )}

        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {fields.map(([k, v]) => (
            <div key={k} className="rounded-xl bg-secondary p-4">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-display font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold">What should I do?</h3>
            <ol className="mt-4 space-y-3">
              {r.instructions.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Why it matters</h3>
            <p className="mt-4 flex gap-3 text-muted-foreground"><Leaf className="size-5 shrink-0 text-primary" />{r.environmentalImpact || "No impact information available."}</p>
            {r.warnings.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm text-warning">{r.warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}</ul>
            )}
            <p className="mt-5 flex gap-2 rounded-xl border p-3 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-accent" /> Local rules may vary. Check your municipality's guidance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
