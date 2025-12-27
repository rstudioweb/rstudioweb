"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TestPage() {
  const [formData, setFormData] = useState({
    name: "",
    upiId: "",
    amount: "",
    remarks: "",
    dateTime: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [googleTransactionId, setGoogleTransactionId] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const receiptRef = useRef<HTMLDivElement>(null);

  const generateNumericId = () => {
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  };

  const generateId = (prefix: string) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = prefix;
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase() || "R";
  };

  // Client-only initialization to avoid hydration mismatch
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      dateTime: prev.dateTime || new Date().toISOString().slice(0, 16),
    }));

    setUpiTransactionId((prev) => prev || generateNumericId());
    setGoogleTransactionId((prev) => prev || generateId("GTX"));
  }, []);

  const palette =
    theme === "dark"
      ? {
          pageBg: "#0f172a",
          formBg: "#111827",
          formText: "#e5e7eb",
          cardBg: "#000000",
          cardText: "#ffffff",
          subText: "#9ca3af",
          border: "#374151",
          pillBg: "#2B2B2B",
          pillText: "#e5e7eb",
        }
      : {
          pageBg: "#f5f5f5",
          formBg: "#ffffff",
          formText: "#111827",
          cardBg: "#ffffff",
          cardText: "#111827",
          subText: "#4b5563",
          border: "#e5e7eb",
          pillBg: "#e5e7eb",
          pillText: "#111827",
        };

  const inputClass = "mt-2 w-full border rounded px-3 py-2";
  const inputStyle = {
    backgroundColor: "transparent",
    color: palette.formText,
    borderColor: palette.border,
  } as const;

  const exportPng = async () => {
    if (!receiptRef.current) return null;
    const { toPng, toBlob } = await import("html-to-image");
    const node = receiptRef.current;
    const options = {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#000000",
      style: {
        backgroundColor: "#000000",
      },
    } as const;

    const [dataUrl, blob] = await Promise.all([
      toPng(node, options),
      toBlob(node, options),
    ]);

    return { dataUrl, blob };
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const result = await exportPng();
      if (!result) return;
      const link = document.createElement("a");
      link.href = result.dataUrl;
      link.download = `receipt-${Date.now()}.png`;
      link.click();
      
      // Reload page after download
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const result = await exportPng();
      if (!result || !result.blob) return;

      const file = new File([result.blob], `receipt-${Date.now()}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Receipt",
          text: "Payment receipt",
        });
      } else {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = file.name;
        link.click();
      }
    } finally {
      setIsSharing(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${day} ${month} ${year}, ${time}`;
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: palette.pageBg }}
    >
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl font-bold mb-12 text-center"
          style={{ color: palette.cardText }}
        >
          Receipt Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div
            className="rounded-lg p-8 shadow-xl"
            style={{ backgroundColor: palette.formBg, color: palette.formText }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: palette.formText }}>
              Payment Details
            </h2>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="font-semibold" style={{ color: palette.formText }}>
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* UPI ID / Mobile */}
              <div>
                <Label htmlFor="upiId" className="font-semibold" style={{ color: palette.formText }}>
                  UPI ID or Mobile Number
                </Label>
                <Input
                  id="upiId"
                  name="upiId"
                  type="text"
                  placeholder="example@upi or 9876543210"
                  value={formData.upiId}
                  onChange={handleChange}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount" className="font-semibold" style={{ color: palette.formText }}>
                  Amount (₹)
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Remarks */}
              <div>
                <Label htmlFor="remarks" className="font-semibold" style={{ color: palette.formText }}>
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  name="remarks"
                  placeholder="Enter remarks (e.g., XMass Winning Amount)"
                  value={formData.remarks}
                  onChange={handleChange}
                  className={`${inputClass} rounded-lg`}
                  style={inputStyle}
                  rows={3}
                />
              </div>

              {/* Date & Time */}
              <div>
                <Label htmlFor="dateTime" className="font-semibold" style={{ color: palette.formText }}>
                  Date & Time
                </Label>
                <Input
                  id="dateTime"
                  name="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={handleChange}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center gap-4">
                <Label className="font-semibold" style={{ color: palette.formText }}>
                  Theme
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="px-4"
                  >
                    Dark
                  </Button>
                  <Button
                    type="button"
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="px-4"
                  >
                    Light
                  </Button>
                </div>
              </div>

              {/* Save / Share Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-full px-6 py-2 bg-slate-200 text-slate-900 hover:bg-slate-300"
                >
                  {isSaving ? "Saving..." : "Save as PNG"}
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="rounded-full px-6 py-2 bg-slate-700 text-white hover:bg-slate-600"
                >
                  {isSharing ? "Sharing..." : "Share to WhatsApp"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Receipt Preview */}
          <div className="flex items-center justify-center">
            <div
              ref={receiptRef}
              className="w-full max-w-sm rounded-2xl p-8 shadow-2xl text-center"
              style={{ backgroundColor: palette.cardBg, color: palette.cardText }}
            >
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl font-bold">
                  {getInitial(formData.name)}
                </span>
              </div>

              {/* Name */}
              <p className="text-xl font-semibold mb-1">
                {formData.name || "Recipient Name"}
              </p>

              {/* UPI ID */}
              <p className="text-sm mb-6" style={{ color: palette.subText }}>
                {formData.upiId || "upi@address"}
              </p>

              {/* Amount */}
              <p className="text-5xl font-bold mb-8">
                ₹{formData.amount || "500"}
              </p>

              {/* Remarks */}
              <div className="flex justify-center mb-8">
                <span
                  className="px-6 py-3 rounded-full text-sm"
                  style={{ backgroundColor: palette.pillBg, color: palette.pillText }}
                >
                  {formData.remarks || "XMass Winning Amount"}
                </span>
              </div>

              {/* Pay Again Button (plain to avoid OKLCH) */}
              <button
                type="button"
                disabled
                style={{
                  marginBottom: "1.5rem",
                  padding: "0.75rem 2.5rem",
                  borderRadius: "9999px",
                  backgroundColor: "#AEC8FA",
                  color: "#1E3A8A",
                  fontWeight: 600,
                  fontSize: "1rem",
                  border: "none",
                  cursor: "not-allowed",
                }}
              >
                Pay again
              </button>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Image
                  src="/chek_ico.png"
                  alt="Completed"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span className="text-sm">Completed</span>
              </div>

              {/* Divider Line */}
              <div
                className="border-t mb-6"
                style={{ borderColor: palette.border }}
              ></div>

              {/* Date Time */}
              <p className="text-xs mb-6" style={{ color: palette.subText }}>
                {formatDateTime(formData.dateTime)}
              </p>

              {/* Bank Details Section */}
              <div
                className="rounded-lg p-4 mb-6 text-left text-sm space-y-3 border"
                style={{ borderColor: palette.border, color: palette.cardText }}
              >
                <div className="flex justify-between cursor-pointer">
                  <span>Jio Payments Bank 2594</span>
                  <span>▼</span>
                </div>

                <div
                  className="border-t pt-3 space-y-2 text-xs"
                  style={{ borderColor: palette.border, color: palette.subText }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: palette.cardText }}>
                      UPI transaction ID
                    </p>
                    <p>{upiTransactionId}</p>
                  </div>

                  <div>
                    <p className="font-semibold" style={{ color: palette.cardText }}>
                      To: {(formData.name || "NAME").toUpperCase()}
                    </p>
                    <p>Google Pay · {formData.upiId || "upi@address"}</p>
                  </div>

                  <div>
                    <p className="font-semibold" style={{ color: palette.cardText }}>
                      From: S ROY (Jio Payments Bank)
                    </p>
                    <p>Google Pay · rroysroy@okaxis</p>
                  </div>

                  <div>
                    <p className="font-semibold" style={{ color: palette.cardText }}>
                      Google transaction ID
                    </p>
                    <p>{googleTransactionId}</p>
                  </div>
                </div>
              </div>

              {/* Logos */}
              <div className="flex flex-col items-center justify-center gap-8">
                {/* Powered by UPI (small, above) */}
                <Image
                  src="/upi-logo.png"
                  alt="Powered by UPI"
                  width={90}
                  height={26}
                />

                {/* Google Pay (larger, bottom) */}
                <Image
                  src="/google-pay-logo.png"
                  alt="Google Pay"
                  width={120}
                  height={40}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
