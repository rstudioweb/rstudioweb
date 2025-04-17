"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeToggle from "../../components/ThemeToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FormAnswers = {
    name?: string;
    dob?: string;
    location?: string;
    experience?: string;
    contactMethod?: string;
    contact?: string;
    marital?: string;
    aadhaar?: string;
    selfie?: File;
};

const questions = [
    { id: "name", label: "👩 What's your full name?", type: "text", required: true },
    { id: "dob", label: "🎂 Date of birth?", type: "date", required: true },
    { id: "location", label: "📍 Where are you located?", type: "text", required: false },
    { id: "experience", label: "📹 Any streaming experience?", type: "text", required: false },
    { id: "contactMethod", label: "📞 Preferred contact method?", type: "select", required: true },
    { id: "contact", label: "", type: "text", required: true },
    { id: "marital", label: "💍 Marital status?", type: "text", required: false },
    { id: "aadhaar", label: "🆔 Do you have Aadhaar card?", type: "text", required: true },
    { id: "selfie", label: "📸 Upload a selfie", type: "file", required: true },
];




export default function ChatbotForm() {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<FormAnswers>({});
    const [errors, setErrors] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const currentQuestion = questions[current];
    const dynamicLabel =
        currentQuestion.id === "contact" && answers.contactMethod
            ? `Enter ${answers.contactMethod} Number here:`
            : currentQuestion.label;
    type SubmitPayload = Omit<FormAnswers, "selfie"> & { selfie: string };
    const handleInput = (e: any) => {
        const value = currentQuestion.type === "file" ? e.target.files[0] : e.target.value;
        setAnswers({ ...answers, [currentQuestion.id]: value });
        setErrors([]);
    };

    const handleSelect = (value: string) => {
        setAnswers({ ...answers, [currentQuestion.id]: value });
        setErrors([]);
    };

    const nextQuestion = () => {
        const value = answers[currentQuestion.id as keyof FormAnswers];

        const isEmpty =
            currentQuestion.type === "file"
                ? !value || !(value instanceof File)
                : !value || (typeof value === "string" && value.trim() === "");

        if (currentQuestion.required && isEmpty) {
            const cleanLabel = dynamicLabel.replace(/👩|🎂|📍|📹|📞|💍|🆔|📸/g, "").trim();
            setErrors([`${cleanLabel} is required`]);
            return;
        }

        setErrors([]);

        if (current < questions.length - 1) {
            setCurrent(current + 1);
        } else {
            setSubmitted(true);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        let fileId = "";

        // 1. Upload image if selfieFile is present
        const selfieFile = answers.selfie;
        if (selfieFile) {
            try {
                const base64 = await fileToBase64(selfieFile);  // Convert file to base64

                const imageFormData = new URLSearchParams();
                imageFormData.append("fileName", selfieFile.name);
                imageFormData.append("contentType", selfieFile.type);
                imageFormData.append("data", base64);

                // Send file data to Google Apps Script for upload
                const uploadRes = await fetch("https://script.google.com/macros/s/AKfycbyPxT2Qizovk2VC-NGEc2XketyOn-7EPnt0vKamnYyEbWGE7qpwy14xWLuGLwXLzSG0/exec", {
                    method: "POST",
                    body: imageFormData,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });

                const uploadJson = await uploadRes.json();

                if (uploadJson.status === "success" && uploadJson.fileId) {
                    fileId = uploadJson.url;  // Store the URL returned from the upload
                    console.log("File uploaded successfully: ", fileId);
                } else {
                    alert("Image upload failed: " + uploadJson.message);
                    setLoading(false);
                    return;
                }

                // 2. Proceed with form submission (with the fileId)
                const formData = {
                    ...answers,
                    selfie: fileId,
                };

                const response = await submitFormToBackend({
                    ...answers,
                    selfie: fileId, // replacing the File with the uploaded URL
                });


                // Simulating form submission or API call
                console.log("Form submitted with data:", response);

                setLoading(false);

            } catch (error) {
                console.error("Error during file upload:", error);
                alert("An error occurred while uploading the image.");
                setLoading(false);
                return;
            }
        }


    };

    // Helper function to convert file to base64
    const fileToBase64 = (file: File) => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const submitFormToBackend = async (formData: SubmitPayload) => {
        try {
            const response = await fetch("/api/submit", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to submit form");
            }

            const result = await response.json();
            console.log("Form successfully submitted to backend:", result);

            alert("🎉 Your application was submitted successfully!");
        } catch (error) {
            console.error("Error submitting form to backend:", error);
            alert("❌ Failed to submit form. Please try again.");
        }
    };



    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl space-y-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Join R Studio</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Answer the questions like a chat</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Chat History */}
                    {questions.slice(0, current).map((q) => (
                        <div key={q.id} className="flex flex-col gap-2">
                            <div className="self-start bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-4 py-2 rounded-xl text-sm max-w-xs shadow">
                                {q.id === "contact"
                                    ? `Enter ${answers.contactMethod} Number here:`
                                    : q.label}
                            </div>
                            <div className="self-end bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-4 py-2 rounded-xl text-sm max-w-xs shadow">
                                {q.type === "file"
                                    ? (answers[q.id as keyof FormAnswers] instanceof File
                                        ? (answers[q.id as keyof FormAnswers] as File).name
                                        : "Uploaded")
                                    : answers[q.id as keyof FormAnswers]?.toString()}
                            </div>
                        </div>
                    ))}

                    {/* Current Prompt */}
                    {!submitted && (
                        <div className="flex flex-col gap-2">
                            <div className="self-start bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-4 py-2 rounded-xl text-sm max-w-xs shadow">
                                {dynamicLabel}
                            </div>
                            <div className="self-end w-full">
                                {currentQuestion.type === "select" ? (
                                    <Select onValueChange={handleSelect}>
                                        <SelectTrigger className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-gray-900 dark:text-white">
                                            <SelectValue placeholder="Select contact method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                            <SelectItem value="Telegram">Telegram</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        key={currentQuestion.id}
                                        id={currentQuestion.id}
                                        type={currentQuestion.type}
                                        onChange={handleInput}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-gray-900 dark:text-white"
                                    />
                                )}
                            </div>

                            {errors.map((err, idx) => (
                                <div
                                    key={idx}
                                    className="self-start bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-4 py-2 rounded-xl text-sm max-w-xs shadow"
                                >
                                    ⚠️ {err}
                                </div>
                            ))}

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={nextQuestion}
                                    className="mt-2 bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 text-sm shadow"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Final Submit */}
                    {submitted && (
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-2 rounded-full"
                            >
                                ✅ Submit Application
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
