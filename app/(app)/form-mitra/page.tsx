"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Step = "identity" | "business" | "agreement" | "payment" | "done"

const STEPS: { key: Step; label: string; short: string }[] = [
  { key: "identity", label: "Data Diri", short: "01" },
  { key: "business", label: "Bisnis", short: "02" },
  { key: "agreement", label: "Perjanjian", short: "03" },
  { key: "payment", label: "Pembayaran", short: "04" },
  { key: "done", label: "Selesai", short: "✓" }
]

const PLAN_OPTIONS = [
  {
    id: "starter",
    name: "Starter",
    price: 99000,
    desc: "Hingga 500 produk & 3 pengguna",
    highlight: false,
    features: ["500 produk", "3 pengguna", "Laporan dasar", "Support email"]
  },
  {
    id: "growth",
    name: "Growth",
    price: 299000,
    desc: "Hingga 5.000 produk & 10 pengguna",
    highlight: true,
    features: [
      "5.000 produk",
      "10 pengguna",
      "Laporan lanjutan",
      "Support prioritas",
      "API akses"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 799000,
    desc: "Unlimited produk & pengguna",
    highlight: false,
    features: [
      "Unlimited produk",
      "Unlimited pengguna",
      "Custom laporan",
      "Dedicated support",
      "White-label",
      "SLA 99.9%"
    ]
  }
]

const BUSINESS_TYPES = [
  "Retail / Toko",
  "Distributor",
  "Manufaktur",
  "E-Commerce",
  "Restoran / F&B",
  "Jasa / Layanan",
  "Lainnya"
]

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID")
}

export default function FormMitraPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("identity")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("growth")
  const [qrisLoading, setQrisLoading] = useState(false)
  const [qrisUrl, setQrisUrl] = useState("")
  const [paymentId, setPaymentId] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "paid" | "failed"
  >("pending")

  const [form, setForm] = useState({
    // identity
    pic_name: "",
    pic_email: "",
    pic_phone: "",
    pic_position: "",
    pic_ktp: "",
    // business
    company_name: "",
    company_type: "",
    company_npwp: "",
    company_address: "",
    company_city: "",
    company_province: "",
    company_postal: "",
    company_website: "",
    employee_count: "",
    // plan
    plan: "growth"
  })

  const handleChange =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const stepIndex = STEPS.findIndex((s) => s.key === step)
  const plan = PLAN_OPTIONS.find((p) => p.id === selectedPlan)!

  // ── Step navigation ──
  const goNext = () => {
    setError("")
    if (step === "identity") {
      if (
        !form.pic_name ||
        !form.pic_email ||
        !form.pic_phone ||
        !form.pic_position
      ) {
        setError("Semua field wajib diisi")
        return
      }
      setStep("business")
    } else if (step === "business") {
      if (
        !form.company_name ||
        !form.company_type ||
        !form.company_address ||
        !form.company_city
      ) {
        setError("Semua field wajib diisi")
        return
      }
      setStep("agreement")
    } else if (step === "agreement") {
      if (!agreed) {
        setError("Kamu harus menyetujui perjanjian kerjasama")
        return
      }
      setStep("payment")
      handleCreatePayment()
    }
  }

  // ── DOKU QRIS Payment ──
  const handleCreatePayment = async () => {
    setQrisLoading(true)
    try {
      const res = await fetch("/api/mitra/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: plan.price,
          pic_name: form.pic_name,
          pic_email: form.pic_email,
          pic_phone: form.pic_phone,
          company_name: form.company_name
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal membuat pembayaran")
        return
      }
      setQrisUrl(data.qris_url)
      setPaymentId(data.payment_id)
    } catch {
      setError("Terjadi kesalahan saat membuat pembayaran")
    } finally {
      setQrisLoading(false)
    }
  }

  // ── Poll payment status ──
  useEffect(() => {
    if (step !== "payment" || !paymentId) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mitra/payment-status?id=${paymentId}`)
        const data = await res.json()
        if (data.status === "paid") {
          setPaymentStatus("paid")
          clearInterval(interval)
          // Submit form data
          handleSubmitMitra()
        } else if (data.status === "failed") {
          setPaymentStatus("failed")
          clearInterval(interval)
        }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [step, paymentId])

  const handleSubmitMitra = async () => {
    setLoading(true)
    try {
      await fetch("/api/mitra/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          plan: selectedPlan,
          payment_id: paymentId
        })
      })
      setStep("done")
    } catch {
      setError("Gagal menyimpan data mitra")
    } finally {
      setLoading(false)
    }
  }

  const handleRetryPayment = () => {
    setPaymentStatus("pending")
    setQrisUrl("")
    setPaymentId("")
    handleCreatePayment()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.7); opacity: 0; } }
        @keyframes gridPan { from { background-position: 0 0; } to { background-position: 48px 48px; } }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes checkPop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }

        .fm-root { display: flex; min-height: 100vh; font-family: 'Nunito', sans-serif; }

        /* ── LEFT ── */
        .fm-left {
          position: relative; width: 52%; min-height: 100vh;
          background: linear-gradient(160deg, #060b1a 0%, #0c1733 30%, #0f2050 60%, #1e3a8a 100%);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .fm-left-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 48px 48px; animation: gridPan 8s linear infinite;
        }
        .fm-left-glow { position: absolute; top: -120px; right: -120px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,.22) 0%, transparent 70%); pointer-events: none; }
        .fm-left-glow2 { position: absolute; bottom: -80px; left: -80px; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, rgba(30,58,138,.18) 0%, transparent 70%); pointer-events: none; }

        /* Ticker */
        .fm-ticker-wrap { position: absolute; top: 0; left: 0; right: 0; background: rgba(0,0,0,.25); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(255,255,255,.08); height: 36px; overflow: hidden; display: flex; align-items: center; }
        .fm-ticker-track { display: flex; animation: ticker 28s linear infinite; white-space: nowrap; }
        .fm-ticker-item { display: inline-flex; align-items: center; gap: 14px; padding: 0 36px; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: .06em; }
        .fm-ticker-dot { width: 4px; height: 4px; border-radius: 50%; background: #60a5fa; }

        /* Brand */
        .fm-brand-area { position: relative; z-index: 2; padding: 52px 52px 0; display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .fm-brand-mark { width: 40px; height: 40px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(59,130,246,.35); }
        .fm-brand-mark span { font-weight: 900; font-size: 11px; color: #fff; letter-spacing: .05em; }
        .fm-brand-name { font-weight: 900; font-size: 18px; color: #fff; letter-spacing: .06em; }
        .fm-brand-sub { font-size: 11px; color: rgba(255,255,255,.4); font-weight: 600; margin-top: 2px; }

        /* Hero content */
        .fm-hero { position: relative; z-index: 2; padding: 40px 52px 0; flex: 1; }
        .fm-hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.08); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.15); border-radius: 100px; padding: 6px 14px; margin-bottom: 22px; }
        .fm-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; position: relative; }
        .fm-hero-tag-dot::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; background: rgba(96,165,250,.4); animation: pulse-ring 1.8s ease-out infinite; }
        .fm-hero-tag-text { color: rgba(255,255,255,.85); font-size: 11px; font-weight: 800; letter-spacing: .05em; }
        .fm-hero-title { font-weight: 900; font-size: clamp(26px, 2.8vw, 40px); line-height: 1.1; letter-spacing: -.02em; color: #fff; margin-bottom: 12px; }
        .fm-hero-title em { font-style: normal; color: #60a5fa; }
        .fm-hero-desc { font-size: 14px; color: rgba(255,255,255,.6); line-height: 1.7; max-width: 360px; font-weight: 500; margin-bottom: 28px; }

        /* Stepper visual on left */
        .fm-step-visual { display: flex; flex-direction: column; gap: 0; margin-bottom: 28px; }
        .fm-step-v-item { display: flex; align-items: flex-start; gap: 14px; position: relative; }
        .fm-step-v-item:not(:last-child)::after { content: ''; position: absolute; left: 13px; top: 28px; width: 2px; height: calc(100% + 6px); background: rgba(255,255,255,.1); }
        .fm-step-v-item.active::after { background: rgba(96,165,250,.3); }
        .fm-step-v-circle { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; border: 2px solid rgba(255,255,255,.15); color: rgba(255,255,255,.3); background: rgba(0,0,0,.2); margin-top: 2px; transition: all .3s; }
        .fm-step-v-circle.active { border-color: #60a5fa; color: #60a5fa; background: rgba(96,165,250,.1); }
        .fm-step-v-circle.done { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.1); }
        .fm-step-v-label { padding: 6px 0 12px; }
        .fm-step-v-title { font-size: 13px; font-weight: 800; color: rgba(255,255,255,.4); transition: color .3s; }
        .fm-step-v-title.active { color: rgba(255,255,255,.9); }
        .fm-step-v-title.done { color: rgba(255,255,255,.5); }
        .fm-step-v-sub { font-size: 11px; color: rgba(255,255,255,.25); font-weight: 600; margin-top: 2px; }

        /* Benefits */
        .fm-benefits { display: flex; flex-direction: column; gap: 8px; }
        .fm-benefit { display: flex; align-items: center; gap: 10px; font-size: 12px; color: rgba(255,255,255,.45); font-weight: 600; }
        .fm-benefit-ico { width: 20px; height: 20px; border-radius: 50%; background: rgba(34,197,94,.15); border: 1px solid rgba(34,197,94,.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .fm-bottom-bar { position: relative; z-index: 2; padding: 22px 52px; border-top: 1px solid rgba(255,255,255,.07); display: flex; align-items: center; justify-content: space-between; }
        .fm-bottom-trust { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,.35); font-weight: 700; }
        .fm-bottom-trust-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
        .fm-bottom-version { font-size: 11px; color: rgba(255,255,255,.2); font-weight: 700; }

        /* ── RIGHT ── */
        .fm-right { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 48px 40px; background: #fff; overflow-y: auto; min-height: 100vh; }
        .fm-card { width: 100%; max-width: 480px; animation: fadeUp .45s ease forwards; }

        /* Progress bar */
        .fm-progress { display: flex; gap: 6px; margin-bottom: 32px; }
        .fm-progress-step { flex: 1; height: 4px; border-radius: 2px; background: #e2e8f0; transition: background .4s; }
        .fm-progress-step.done { background: #22c55e; }
        .fm-progress-step.active { background: #3b82f6; }

        /* Section title */
        .fm-section-title { font-weight: 900; font-size: 26px; color: #0f172a; letter-spacing: -.02em; margin-bottom: 4px; }
        .fm-section-sub { font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 24px; line-height: 1.5; }

        /* Fields */
        .fm-field { margin-bottom: 16px; }
        .fm-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .fm-lbl { display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 7px; }
        .fm-lbl span { color: #ef4444; }
        .fm-inp-wrap { position: relative; display: flex; align-items: center; }
        .fm-inp-icon { position: absolute; left: 14px; width: 16px; height: 16px; pointer-events: none; color: #94a3b8; }
        .fm-inp {
          width: 100%; height: 48px; padding: 0 14px 0 44px;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #0f172a; outline: none; transition: border-color .2s, box-shadow .2s;
        }
        .fm-inp.no-icon { padding-left: 14px; }
        .fm-inp:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .fm-inp::placeholder { color: #cbd5e1; font-weight: 500; }
        .fm-sel {
          width: 100%; height: 48px; padding: 0 14px;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #0f172a; outline: none; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
          transition: border-color .2s;
        }
        .fm-sel:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); background-color: #fff; }
        .fm-textarea {
          width: 100%; padding: 12px 14px; min-height: 80px;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #0f172a; outline: none; resize: vertical; transition: border-color .2s;
        }
        .fm-textarea:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .fm-textarea::placeholder { color: #cbd5e1; font-weight: 500; }

        /* Plan cards */
        .fm-plans { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .fm-plan {
          border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px;
          cursor: pointer; transition: all .2s; position: relative; overflow: hidden;
        }
        .fm-plan:hover { border-color: #93c5fd; }
        .fm-plan.selected { border-color: #3b82f6; background: #eff6ff; }
        .fm-plan.highlight-card { border-color: #1e3a8a; }
        .fm-plan.highlight-card.selected { background: #eff6ff; }
        .fm-plan-badge { position: absolute; top: 12px; right: 12px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #fff; font-size: 10px; font-weight: 800; padding: 2px 10px; border-radius: 100px; letter-spacing: .04em; }
        .fm-plan-top { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .fm-plan-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5e1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; }
        .fm-plan.selected .fm-plan-radio { border-color: #3b82f6; background: #3b82f6; }
        .fm-plan-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; opacity: 0; transition: opacity .2s; }
        .fm-plan.selected .fm-plan-radio-dot { opacity: 1; }
        .fm-plan-name { font-weight: 900; font-size: 15px; color: #0f172a; }
        .fm-plan-price { font-weight: 900; font-size: 15px; color: #1e3a8a; margin-left: auto; padding-right: 48px; }
        .fm-plan-desc { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 8px; padding-left: 30px; }
        .fm-plan-feats { display: flex; flex-wrap: wrap; gap: 6px; padding-left: 30px; }
        .fm-plan-feat { font-size: 11px; background: rgba(59,130,246,.08); color: #1e40af; font-weight: 700; padding: 2px 8px; border-radius: 100px; }

        /* Agreement */
        .fm-agreement-box {
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px;
          padding: 20px; max-height: 240px; overflow-y: auto; margin-bottom: 16px;
          font-size: 13px; color: #374151; line-height: 1.8; font-weight: 500;
        }
        .fm-agreement-box h4 { font-weight: 900; font-size: 14px; color: #0f172a; margin-bottom: 10px; }
        .fm-agreement-box p { margin-bottom: 10px; }
        .fm-agreement-box ol { padding-left: 16px; }
        .fm-agreement-box li { margin-bottom: 6px; }
        .fm-checkbox-row { display: flex; align-items: flex-start; gap: 10px; padding: 14px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; cursor: pointer; }
        .fm-checkbox { width: 20px; height: 20px; border: 2px solid #0ea5e9; border-radius: 5px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #fff; transition: all .2s; margin-top: 1px; }
        .fm-checkbox.checked { background: #0ea5e9; border-color: #0ea5e9; }
        .fm-checkbox-label { font-size: 13px; color: #0c4a6e; font-weight: 700; line-height: 1.5; }

        /* Summary box */
        .fm-summary { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
        .fm-summary-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #475569; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
        .fm-summary-row:last-child { border-bottom: none; font-weight: 900; font-size: 15px; color: #0f172a; padding-top: 10px; }

        /* QRIS */
        .fm-qris-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 20px 0; }
        .fm-qris-img { width: 220px; height: 220px; border: 3px solid #e2e8f0; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: #fff; overflow: hidden; }
        .fm-qris-img img { width: 100%; height: 100%; object-fit: contain; }
        .fm-qris-label { font-size: 13px; color: #64748b; font-weight: 600; text-align: center; line-height: 1.6; }
        .fm-qris-timer { font-size: 12px; color: #94a3b8; font-weight: 700; }
        .fm-qris-apps { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
        .fm-qris-app { font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 100px; background: #f1f5f9; color: #475569; }
        .fm-spinner { width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }

        /* Done */
        .fm-done-wrap { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 20px 0; }
        .fm-done-check { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #16a34a); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; animation: checkPop .5s ease forwards; box-shadow: 0 12px 32px rgba(34,197,94,.3); }

        /* Error */
        .fm-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-bottom: 16px; text-align: center; }
        .fm-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-bottom: 16px; text-align: center; }

        /* Buttons */
        .fm-btn-row { display: flex; gap: 10px; margin-top: 8px; }
        .fm-btn {
          flex: 1; height: 50px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 800;
          cursor: pointer; font-family: 'Nunito', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(59,130,246,.3); transition: transform .2s, box-shadow .2s;
        }
        .fm-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59,130,246,.4); }
        .fm-btn:disabled { opacity: .65; cursor: not-allowed; }
        .fm-btn-ghost {
          flex: 0 0 auto; height: 50px; padding: 0 20px;
          background: #f1f5f9; color: #475569; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif;
          transition: background .2s;
        }
        .fm-btn-ghost:hover { background: #e2e8f0; }
        .fm-dots { display: flex; gap: 5px; align-items: center; }
        .fm-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: dotBounce 1s ease-in-out infinite; }

        /* Mobile topbar */
        .fm-topbar { display: none; background: linear-gradient(135deg, #060b1a, #1e3a8a); padding: 14px 20px; align-items: center; gap: 12px; cursor: pointer; }
        .fm-topbar-mark { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .fm-topbar-mark span { font-weight: 900; font-size: 10px; color: #fff; }
        .fm-topbar-name { font-weight: 900; font-size: 15px; color: #fff; }
        .fm-topbar-sub { font-size: 10px; color: rgba(255,255,255,.4); font-weight: 600; }

        @media (max-width: 900px) {
          .fm-left { display: none; }
          .fm-topbar { display: flex; }
          .fm-root { flex-direction: column; }
          .fm-right { padding: 28px 20px 48px; }
          .fm-card { max-width: 100%; }
          .fm-field-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .fm-right { padding: 20px 16px 40px; }
          .fm-section-title { font-size: 22px; }
        }
      `}</style>

      <div className="fm-root">
        {/* Mobile topbar */}
        <div className="fm-topbar" onClick={() => router.push("/")}>
          <div className="fm-topbar-mark">
            <span>INV</span>
          </div>
          <div>
            <div className="fm-topbar-name">STOCKR</div>
            <div className="fm-topbar-sub">Inventory Management System</div>
          </div>
        </div>

        {/* ── LEFT ── */}
        <div className="fm-left">
          <div className="fm-left-grid" />
          <div className="fm-left-glow" />
          <div className="fm-left-glow2" />

          <div className="fm-ticker-wrap">
            <div className="fm-ticker-track">
              {[...Array(2)].map((_, i) => (
                <span key={i}>
                  {[
                    "PARTNERSHIP PROGRAM",
                    "QRIS PAYMENT",
                    "INSTANT ACTIVATION",
                    "DEDICATED SUPPORT",
                    "GROW YOUR BUSINESS"
                  ].map((t, j) => (
                    <span key={j} className="fm-ticker-item">
                      <span className="fm-ticker-dot" />
                      {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          <div className="fm-brand-area" onClick={() => router.push("/")}>
            <div className="fm-brand-mark">
              <span>INV</span>
            </div>
            <div>
              <div className="fm-brand-name">STOCKR</div>
              <div className="fm-brand-sub">Inventory Management System</div>
            </div>
          </div>

          <div className="fm-hero">
            <div className="fm-hero-tag">
              <span className="fm-hero-tag-dot" />
              <span className="fm-hero-tag-text">Program Mitra 2026</span>
            </div>
            <h1 className="fm-hero-title">
              Bergabung sebagai
              <br />
              <em>Mitra STOCKR</em>
            </h1>
            <p className="fm-hero-desc">
              Daftarkan bisnis kamu dan dapatkan akses penuh ke platform
              manajemen inventori terdepan dengan dukungan mitra eksklusif.
            </p>

            {/* Step visual */}
            <div className="fm-step-visual">
              {STEPS.filter((s) => s.key !== "done").map((s, i) => {
                const cur = stepIndex
                const isActive = s.key === step
                const isDone = i < cur
                const subLabels: Record<string, string> = {
                  identity: "Isi data PIC perusahaan",
                  business: "Info bisnis & lokasi",
                  agreement: "Review & setujui MoU",
                  payment: "Bayar via QRIS DOKU"
                }
                return (
                  <div
                    key={s.key}
                    className={`fm-step-v-item ${isActive ? "active" : ""}`}
                  >
                    <div
                      className={`fm-step-v-circle ${isActive ? "active" : isDone ? "done" : ""}`}
                    >
                      {isDone ? "✓" : s.short}
                    </div>
                    <div className="fm-step-v-label">
                      <div
                        className={`fm-step-v-title ${isActive ? "active" : isDone ? "done" : ""}`}
                      >
                        {s.label}
                      </div>
                      <div className="fm-step-v-sub">{subLabels[s.key]}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="fm-benefits">
              {[
                "Aktivasi instan setelah pembayaran",
                "Dukungan onboarding dedikasi",
                "SLA & garansi uptime 99.9%"
              ].map((b) => (
                <div key={b} className="fm-benefit">
                  <div className="fm-benefit-ico">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div className="fm-bottom-bar">
            <div className="fm-bottom-trust">
              <span className="fm-bottom-trust-dot" />
              Pembayaran aman via DOKU
            </div>
            <span className="fm-bottom-version">v2.4.1 · 2026</span>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="fm-right">
          <div className="fm-card">
            {/* Progress bar */}
            {step !== "done" && (
              <div className="fm-progress">
                {STEPS.filter((s) => s.key !== "done").map((s, i) => (
                  <div
                    key={s.key}
                    className={`fm-progress-step ${i < stepIndex ? "done" : i === stepIndex ? "active" : ""}`}
                  />
                ))}
              </div>
            )}

            {error && <div className="fm-error">⚠ {error}</div>}

            {/* ── STEP 1: IDENTITY ── */}
            {step === "identity" && (
              <>
                <div className="fm-section-title">Data PIC</div>
                <div className="fm-section-sub">
                  Person In Charge yang bertanggung jawab atas kemitraan ini.
                </div>

                <div className="fm-field">
                  <label className="fm-lbl">
                    Nama Lengkap <span>*</span>
                  </label>
                  <div className="fm-inp-wrap">
                    <svg
                      className="fm-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      className="fm-inp"
                      type="text"
                      placeholder="Nama lengkap PIC"
                      value={form.pic_name}
                      onChange={handleChange("pic_name")}
                    />
                  </div>
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">
                      Email <span>*</span>
                    </label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <input
                        className="fm-inp"
                        type="email"
                        placeholder="email@perusahaan.com"
                        value={form.pic_email}
                        onChange={handleChange("pic_email")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="fm-lbl">
                      WhatsApp <span>*</span>
                    </label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <input
                        className="fm-inp"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={form.pic_phone}
                        onChange={handleChange("pic_phone")}
                      />
                    </div>
                  </div>
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">
                      Jabatan <span>*</span>
                    </label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      </svg>
                      <input
                        className="fm-inp"
                        type="text"
                        placeholder="Direktur / Manager"
                        value={form.pic_position}
                        onChange={handleChange("pic_position")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="fm-lbl">No. KTP</label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                      <input
                        className="fm-inp"
                        type="text"
                        placeholder="16 digit NIK"
                        maxLength={16}
                        value={form.pic_ktp}
                        onChange={handleChange("pic_ktp")}
                      />
                    </div>
                  </div>
                </div>

                <div className="fm-btn-row">
                  <button className="fm-btn" onClick={goNext}>
                    Lanjut — Data Bisnis →
                  </button>
                </div>
                <p
                  style={{
                    textAlign: "center",
                    marginTop: 16,
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: 600
                  }}
                >
                  Sudah punya akun?{" "}
                  <Link
                    href="/login"
                    style={{
                      color: "#1e3a8a",
                      fontWeight: 800,
                      textDecoration: "none"
                    }}
                  >
                    Masuk di sini
                  </Link>
                </p>
              </>
            )}

            {/* ── STEP 2: BUSINESS ── */}
            {step === "business" && (
              <>
                <div className="fm-section-title">Data Bisnis</div>
                <div className="fm-section-sub">
                  Informasi perusahaan yang akan menjadi mitra STOCKR.
                </div>

                <div className="fm-field">
                  <label className="fm-lbl">
                    Nama Perusahaan <span>*</span>
                  </label>
                  <div className="fm-inp-wrap">
                    <svg
                      className="fm-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <input
                      className="fm-inp"
                      type="text"
                      placeholder="PT / CV / UD nama perusahaan"
                      value={form.company_name}
                      onChange={handleChange("company_name")}
                    />
                  </div>
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">
                      Jenis Bisnis <span>*</span>
                    </label>
                    <select
                      className="fm-sel"
                      value={form.company_type}
                      onChange={handleChange("company_type")}
                    >
                      <option value="">Pilih jenis bisnis</option>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="fm-lbl">NPWP</label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <input
                        className="fm-inp"
                        type="text"
                        placeholder="00.000.000.0-000.000"
                        value={form.company_npwp}
                        onChange={handleChange("company_npwp")}
                      />
                    </div>
                  </div>
                </div>

                <div className="fm-field">
                  <label className="fm-lbl">
                    Alamat Perusahaan <span>*</span>
                  </label>
                  <textarea
                    className="fm-textarea"
                    placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan..."
                    value={form.company_address}
                    onChange={handleChange("company_address")}
                  />
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">
                      Kota <span>*</span>
                    </label>
                    <input
                      className="fm-inp no-icon"
                      type="text"
                      placeholder="Jakarta"
                      value={form.company_city}
                      onChange={handleChange("company_city")}
                    />
                  </div>
                  <div>
                    <label className="fm-lbl">Provinsi</label>
                    <input
                      className="fm-inp no-icon"
                      type="text"
                      placeholder="DKI Jakarta"
                      value={form.company_province}
                      onChange={handleChange("company_province")}
                    />
                  </div>
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">Kode Pos</label>
                    <input
                      className="fm-inp no-icon"
                      type="text"
                      placeholder="12345"
                      maxLength={5}
                      value={form.company_postal}
                      onChange={handleChange("company_postal")}
                    />
                  </div>
                  <div>
                    <label className="fm-lbl">Website</label>
                    <input
                      className="fm-inp no-icon"
                      type="url"
                      placeholder="https://bisnis.com"
                      value={form.company_website}
                      onChange={handleChange("company_website")}
                    />
                  </div>
                </div>

                <div className="fm-field">
                  <label className="fm-lbl">Jumlah Karyawan</label>
                  <select
                    className="fm-sel"
                    value={form.employee_count}
                    onChange={handleChange("employee_count")}
                  >
                    <option value="">Pilih range</option>
                    <option>1–10</option>
                    <option>11–50</option>
                    <option>51–200</option>
                    <option>201–500</option>
                    <option>{"500+"}</option>
                  </select>
                </div>

                {/* Plan selection */}
                <div
                  className="fm-section-title"
                  style={{ fontSize: 18, marginBottom: 8, marginTop: 4 }}
                >
                  Pilih Paket
                </div>
                <div className="fm-plans">
                  {PLAN_OPTIONS.map((p) => (
                    <div
                      key={p.id}
                      className={`fm-plan ${p.highlight ? "highlight-card" : ""} ${selectedPlan === p.id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedPlan(p.id)
                        setForm((f) => ({ ...f, plan: p.id }))
                      }}
                    >
                      {p.highlight && (
                        <span className="fm-plan-badge">POPULER</span>
                      )}
                      <div className="fm-plan-top">
                        <div className="fm-plan-radio">
                          <div className="fm-plan-radio-dot" />
                        </div>
                        <span className="fm-plan-name">{p.name}</span>
                        <span className="fm-plan-price">
                          {formatRp(p.price)}
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#94a3b8"
                            }}
                          >
                            /bln
                          </span>
                        </span>
                      </div>
                      <div className="fm-plan-desc">{p.desc}</div>
                      <div className="fm-plan-feats">
                        {p.features.map((f) => (
                          <span key={f} className="fm-plan-feat">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fm-btn-row">
                  <button
                    className="fm-btn-ghost"
                    onClick={() => {
                      setStep("identity")
                      setError("")
                    }}
                  >
                    ← Kembali
                  </button>
                  <button className="fm-btn" onClick={goNext}>
                    Lanjut — Perjanjian →
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 3: AGREEMENT ── */}
            {step === "agreement" && (
              <>
                <div className="fm-section-title">Perjanjian Kerjasama</div>
                <div className="fm-section-sub">
                  Baca dan setujui syarat kemitraan STOCKR sebelum melanjutkan
                  pembayaran.
                </div>

                <div className="fm-agreement-box">
                  <h4>PERJANJIAN KERJASAMA MITRA STOCKR</h4>
                  <p>
                    Perjanjian ini dibuat antara{" "}
                    <strong>PT Stockr Teknologi Indonesia</strong>{" "}
                    ("Perusahaan") dan Mitra yang telah mengisi formulir
                    pendaftaran ini ("Mitra"), bersama-sama disebut sebagai
                    "Para Pihak".
                  </p>
                  <ol>
                    <li>
                      <strong>Lingkup Kerjasama.</strong> Perusahaan memberikan
                      akses platform STOCKR kepada Mitra sesuai paket yang
                      dipilih, untuk keperluan manajemen inventori dan
                      operasional bisnis internal Mitra.
                    </li>
                    <li>
                      <strong>Masa Berlaku.</strong> Perjanjian ini berlaku
                      selama 12 (dua belas) bulan sejak tanggal aktivasi dan
                      dapat diperpanjang secara otomatis kecuali salah satu
                      pihak menyatakan penghentian minimal 30 hari sebelum
                      berakhirnya masa berlaku.
                    </li>
                    <li>
                      <strong>Pembayaran.</strong> Mitra wajib membayar biaya
                      langganan sesuai paket yang dipilih. Pembayaran dilakukan
                      di muka setiap bulan melalui metode yang disediakan oleh
                      Perusahaan.
                    </li>
                    <li>
                      <strong>Kerahasiaan Data.</strong> Para Pihak sepakat
                      untuk menjaga kerahasiaan data dan informasi yang
                      diperoleh selama pelaksanaan kerjasama ini.
                    </li>
                    <li>
                      <strong>Hak & Kewajiban Mitra.</strong> Mitra berhak
                      mendapatkan dukungan teknis sesuai paket, pembaruan fitur,
                      dan akses ke dokumentasi. Mitra berkewajiban menggunakan
                      platform sesuai ketentuan penggunaan yang berlaku.
                    </li>
                    <li>
                      <strong>Penghentian Layanan.</strong> Perusahaan berhak
                      menghentikan layanan jika Mitra melanggar ketentuan
                      penggunaan, gagal melakukan pembayaran dalam 7 hari kerja,
                      atau terbukti melakukan tindakan yang merugikan pihak
                      lain.
                    </li>
                    <li>
                      <strong>Hukum yang Berlaku.</strong> Perjanjian ini tunduk
                      pada hukum Republik Indonesia. Setiap sengketa
                      diselesaikan melalui musyawarah atau jalur hukum yang
                      berlaku.
                    </li>
                  </ol>
                </div>

                {/* Summary */}
                <div className="fm-summary">
                  <div className="fm-summary-row">
                    <span>Mitra</span>
                    <span>{form.company_name || "—"}</span>
                  </div>
                  <div className="fm-summary-row">
                    <span>PIC</span>
                    <span>{form.pic_name || "—"}</span>
                  </div>
                  <div className="fm-summary-row">
                    <span>Paket</span>
                    <span>
                      {PLAN_OPTIONS.find((p) => p.id === selectedPlan)?.name}
                    </span>
                  </div>
                  <div className="fm-summary-row">
                    <span>Total Pembayaran</span>
                    <span>{formatRp(plan.price)}/bulan</span>
                  </div>
                </div>

                <div
                  className="fm-checkbox-row"
                  onClick={() => setAgreed((v) => !v)}
                >
                  <div className={`fm-checkbox ${agreed ? "checked" : ""}`}>
                    {agreed && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="fm-checkbox-label">
                    Saya telah membaca dan menyetujui{" "}
                    <strong>Perjanjian Kerjasama Mitra STOCKR</strong> di atas
                    dan bertanggung jawab atas kebenaran data yang diberikan.
                  </span>
                </div>

                <div className="fm-btn-row" style={{ marginTop: 16 }}>
                  <button
                    className="fm-btn-ghost"
                    onClick={() => {
                      setStep("business")
                      setError("")
                    }}
                  >
                    ← Kembali
                  </button>
                  <button
                    className="fm-btn"
                    onClick={goNext}
                    disabled={!agreed}
                  >
                    Lanjut ke Pembayaran →
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 4: PAYMENT ── */}
            {step === "payment" && (
              <>
                <div className="fm-section-title">Pembayaran QRIS</div>
                <div className="fm-section-sub">
                  Scan QR Code di bawah menggunakan aplikasi e-wallet atau
                  mobile banking kamu.
                </div>

                <div className="fm-summary" style={{ marginBottom: 20 }}>
                  <div className="fm-summary-row">
                    <span>Paket</span>
                    <span>{plan.name}</span>
                  </div>
                  <div className="fm-summary-row">
                    <span>Total</span>
                    <span style={{ color: "#1e3a8a" }}>
                      {formatRp(plan.price)}
                    </span>
                  </div>
                </div>

                {qrisLoading ? (
                  <div className="fm-qris-wrap">
                    <div className="fm-spinner" />
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        fontWeight: 600
                      }}
                    >
                      Membuat QRIS...
                    </p>
                  </div>
                ) : paymentStatus === "failed" ? (
                  <div>
                    <div className="fm-error">
                      Pembayaran gagal atau kedaluwarsa. Silakan coba lagi.
                    </div>
                    <button
                      className="fm-btn"
                      style={{ width: "100%" }}
                      onClick={handleRetryPayment}
                    >
                      Buat QRIS Baru
                    </button>
                  </div>
                ) : paymentStatus === "paid" ? (
                  <div
                    className="fm-success"
                    style={{ fontSize: 15, padding: 20, textAlign: "center" }}
                  >
                    ✓ Pembayaran diterima! Menyelesaikan pendaftaran...
                    <div
                      className="fm-spinner"
                      style={{
                        margin: "12px auto 0",
                        borderTopColor: "#16a34a"
                      }}
                    />
                  </div>
                ) : qrisUrl ? (
                  <div className="fm-qris-wrap">
                    {/* Payment method icon */}
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(59,130,246,.3)"
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                      >
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 16,
                          color: "#0f172a",
                          marginBottom: 4
                        }}
                      >
                        Lanjutkan Pembayaran
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          fontWeight: 500,
                          lineHeight: 1.6
                        }}
                      >
                        Klik tombol di bawah untuk membuka halaman pembayaran
                        DOKU.
                        <br />
                        Pilih metode: Virtual Account, OVO, GoPay, ShopeePay,
                        dll.
                      </div>
                    </div>

                    {/* Timer */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#fef9ec",
                        border: "1px solid #fde68a",
                        borderRadius: 8,
                        padding: "8px 14px"
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#d97706"
                        }}
                      >
                        Link berlaku 15 menit · Status diperbarui otomatis
                      </span>
                    </div>

                    {/* CTA Button */}
                    <a
                      href={qrisUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: "100%",
                        height: 50,
                        background:
                          "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                        color: "#fff",
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        textDecoration: "none",
                        boxShadow: "0 8px 24px rgba(59,130,246,.3)"
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2.5"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Bayar Sekarang — {formatRp(plan.price)}
                    </a>

                    {/* Supported methods */}
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          fontWeight: 700,
                          textAlign: "center",
                          marginBottom: 8
                        }}
                      >
                        METODE PEMBAYARAN TERSEDIA
                      </div>
                      <div className="fm-qris-apps">
                        {[
                          "BCA VA",
                          "Mandiri VA",
                          "BNI VA",
                          "BRI VA",
                          "OVO",
                          "ShopeePay",
                          "GoPay",
                          "DANA",
                          "LinkAja",
                          "Indomaret",
                          "Alfamart"
                        ].map((a) => (
                          <span key={a} className="fm-qris-app">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="fm-qris-wrap">
                    <div className="fm-spinner" />
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        fontWeight: 600
                      }}
                    >
                      Memuat QRIS...
                    </p>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 20,
                    textAlign: "center",
                    fontSize: 12,
                    color: "#94a3b8",
                    fontWeight: 600
                  }}
                >
                  Pembayaran diproses secara aman oleh{" "}
                  <span style={{ color: "#1e3a8a", fontWeight: 800 }}>
                    DOKU
                  </span>{" "}
                  · Terenkripsi & berlisensi Bank Indonesia
                </div>

                <div className="fm-btn-row" style={{ marginTop: 16 }}>
                  <button
                    className="fm-btn-ghost"
                    onClick={() => {
                      setStep("agreement")
                      setError("")
                      setQrisUrl("")
                      setPaymentId("")
                    }}
                  >
                    ← Kembali
                  </button>
                </div>
              </>
            )}

            {/* ── DONE ── */}
            {step === "done" && (
              <div className="fm-done-wrap">
                <div className="fm-done-check">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 26,
                    color: "#0f172a",
                    marginBottom: 8
                  }}
                >
                  Pendaftaran Berhasil!
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#64748b",
                    fontWeight: 500,
                    lineHeight: 1.7,
                    maxWidth: 320,
                    marginBottom: 28
                  }}
                >
                  Selamat!{" "}
                  <strong style={{ color: "#0f172a" }}>
                    {form.company_name}
                  </strong>{" "}
                  kini resmi menjadi mitra STOCKR. Tim kami akan menghubungi
                  kamu di{" "}
                  <strong style={{ color: "#0f172a" }}>{form.pic_email}</strong>{" "}
                  dalam 1×24 jam untuk proses onboarding.
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    width: "100%"
                  }}
                >
                  <button
                    className="fm-btn"
                    style={{ width: "100%" }}
                    onClick={() => router.push("/inventory")}
                  >
                    Masuk ke Dashboard →
                  </button>
                  <button
                    className="fm-btn-ghost"
                    style={{ width: "100%", height: 46 }}
                    onClick={() => router.push("/")}
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
