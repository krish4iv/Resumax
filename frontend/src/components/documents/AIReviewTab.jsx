// src/components/documents/AIReviewTab.jsx
import { useState, useRef } from "react"
import { UploadCloud, Loader2, File as FileIcon, X } from "lucide-react"
import ErrorBanner from "./ErrorBanner.jsx"
import ScoreCard from "./ScoreCard.jsx"
import { analyzeResume, createResume } from "../../services/resume.service.js"

function Dropzone({ file, onFile, disabled }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(fileList) {
    const f = fileList?.[0]
    if (!f) return
    if (f.type !== "application/pdf") {
      onFile(null, "Please upload a PDF file.")
      return
    }
    onFile(f, null)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        if (!disabled) handleFiles(e.dataTransfer.files)
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
        disabled
          ? "cursor-not-allowed border-white/10 bg-white/[0.02]"
          : dragOver
          ? "border-cyan-300/60 bg-cyan-300/[0.06]"
          : "border-white/15 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {file ? (
        <>
          <FileIcon size={26} className="text-cyan-300" />
          <p className="mt-3 text-sm font-medium text-white">{file.name}</p>
          <p className="mt-1 text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB · click to replace</p>
        </>
      ) : (
        <>
          <UploadCloud size={26} className="text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-200">Drop your resume PDF here</p>
          <p className="mt-1 text-xs text-slate-500">or click to browse · PDF only</p>
        </>
      )}
    </div>
  )
}

export default function AIReviewTab({ onSaved }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  function handleFile(f, err) {
    setResult(null)
    setError(err)
    setStatus("idle")
    setFile(f)
  }

  async function handleAnalyze() {
    if (!file) return
    setStatus("analyzing")
    setError(null)
    try {
      const analysis = await analyzeResume(file)

      const record = {
        filename: file.name,
        content: analysis.extracted_content || {},
        ats_score: analysis.ats_score,
        content_quality: analysis.content_quality,
        ats_structure: analysis.ats_structure,
        job_optimization: analysis.job_optimization,
        writing_quality: analysis.writing_quality,
        app_ready: analysis.app_ready,
        strengths: analysis.strengths || [],
        findings: analysis.findings || [],
      }

      setStatus("saving")
      const saved = await createResume(record)

      setResult(saved?.id ? saved : record)
      setStatus("done")
      onSaved?.()
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Something went wrong during analysis.")
      setStatus("error")
    }
  }

  const busy = status === "analyzing" || status === "saving"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">AI Review</h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload a resume and Nova will score it against ATS and quality benchmarks.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      <Dropzone file={file} onFile={handleFile} disabled={busy} />

      <div className="flex items-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={!file || busy}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {status === "analyzing" && "Analyzing…"}
          {status === "saving" && "Saving…"}
          {status !== "analyzing" && status !== "saving" && "Analyze resume"}
        </button>
        {file && !busy && (
          <button
            onClick={() => handleFile(null, null)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {status === "done" && result && (
        <ScoreCard resume={result} eyebrow={`Analysis complete · ${result.filename}`} showDetails />
      )}
    </div>
  )
}