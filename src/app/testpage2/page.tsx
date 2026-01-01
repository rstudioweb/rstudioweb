"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TestPage2() {
  const [formData, setFormData] = useState({
    receiverName: "",
    bankName: "",
    amount: "",
    narration: "",
    dateTime: "",
  });
  const [transactionId, setTransactionId] = useState("");
  const [jioRefNumber, setJioRefNumber] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);

  const generateNumericId = () => {
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  };

  const generateJioRef = () => {
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return `JIOPN25${result}`;
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      dateTime: prev.dateTime || new Date().toISOString().slice(0, 16),
    }));
    setTransactionId((prev) => prev || generateNumericId());
    setJioRefNumber((prev) => prev || generateJioRef());
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${month} ${day}, ${year} ${time}`;
  };

  const formatTransactionDate = (dateTimeString: string) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const handleSave = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await toPng(receiptRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#f5f5f5",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `jio-receipt-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    }
  };

  const neftReference = `NEFT/${jioRefNumber}/${formData.receiverName.toUpperCase()}/${formData.bankName.toUpperCase()}/`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Jio Payment Receipt Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 h-fit">
            <h2 className="text-2xl font-semibold mb-8 text-gray-800">
              Transaction Details
            </h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="receiverName" className="text-gray-700">
                  Receiver Name
                </Label>
                <Input
                  id="receiverName"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  placeholder="KOYEL GHORUI"
                  className="mt-2 text-gray-900"
                />
              </div>

              <div>
                <Label htmlFor="bankName" className="text-gray-700">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="STATE BANK OF INDIA"
                  className="mt-2 text-gray-900"
                />
              </div>

              <div>
                <Label htmlFor="amount" className="text-gray-700">
                  Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="12936"
                  className="mt-2 text-gray-900"
                />
              </div>

              <div>
                <Label htmlFor="narration" className="text-gray-700">
                  Narration
                </Label>
                <Textarea
                  id="narration"
                  name="narration"
                  value={formData.narration}
                  onChange={handleChange}
                  placeholder="Salary for the month of December 2025"
                  className="mt-2 text-gray-900"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="dateTime" className="text-gray-700">
                  Date & Time
                </Label>
                <Input
                  id="dateTime"
                  name="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={handleChange}
                  className="mt-2 text-gray-900"
                />
              </div>

              <Button 
                onClick={handleSave} 
                className="w-full mt-8 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-base py-3 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2" 
                size="lg"
              >
                <span>💾</span>
                <span>Save as PNG</span>
              </Button>
            </div>
          </div>

          {/* Receipt Preview Section */}
          <div className="flex items-center justify-center">
            <div
              ref={receiptRef}
              className="bg-[#f5f5f5] p-8 rounded-lg"
              style={{ width: "400px" }}
            >
              {/* Receipt Content */}
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-gray-900">
                    ₹{formData.amount || "0"}
                  </h2>
                </div>

                {/* NEFT Reference */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 break-words">
                    {neftReference || "NEFT/JIOPN25XXXXXX/NAME/BANK/"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.narration || "Transaction narration"}
                  </p>
                </div>

                {/* Date Time */}
                <div className="text-center">
                  <p className="text-base font-medium text-gray-900">
                    {formatDateTime(formData.dateTime)}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Debited From Section */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Debited From
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Jio</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Jio Payments Bank
                      </p>
                      <p className="text-sm text-gray-600">JPB****2594</p>
                    </div>
                  </div>
                </div>

                {/* Transaction ID */}
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Transaction ID
                  </p>
                  <p className="text-sm text-gray-900 mt-1">{transactionId}</p>
                </div>

                {/* Transaction Value Date */}
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Transaction value date
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatTransactionDate(formData.dateTime)}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Footer */}
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Offered by Jio Payments Bank Ltd.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
