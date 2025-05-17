"use client";

import { useState } from "react";
import Slider from "react-slick";
import styles from "../page.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeToggle from "../../components/ThemeToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from 'next/link';


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
    const [isTyping, setIsTyping] = useState(false);
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
    const nextQuestion = async () => {
        const value = answers[currentQuestion.id as keyof FormAnswers];

        const isFileQuestion = currentQuestion.type === "file";
        const isValueEmpty = isFileQuestion
            ? !value || !(value instanceof File)
            : !value || (typeof value === "string" && value.trim() === "");

        if (currentQuestion.required && isValueEmpty) {
            const cleanLabel = dynamicLabel.replace(/👩|🎂|📍|📹|📞|💍|🆔|📸/g, "").trim();
            setErrors([`${cleanLabel} is required`]);
            return;
        }

        setErrors([]);

        // Simulate AI typing effect
        setIsTyping(true);
        await new Promise((res) => setTimeout(res, 700));
        setIsTyping(false);

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
            if (result.status === 'success') {
                window.location.href = "https://wa.me/918240765589";
            } else {
                alert("❌ Failed to submit form. Please try again.");
            }
            /*  alert("🎉 Your application was submitted successfully!"); */
        } catch (error) {
            console.error("Error submitting form to backend:", error);
            alert("❌ Failed to submit form. Please try again.");
        }
    };

    return (<div className={styles.page}>
        <div className="bg-red-800 bg-[url(/hero-bg.png)] absolute inset-0 bg-cover bg-center brightness-100 bg-blend-multiply z-10">
            <main className={styles.main}>
                {/* Top Heading */}
                <div className="text-white text-4xl md:text-5xl font-extrabold text-center pt-10 pb-4 z-30 relative tracking-widest drop-shadow-md">
                    R STUDIO
                </div>
                {/* Slider Section */}
                {/* <div className="flex justify-center z-30 relative mb-6">
                    <div className="w-[360px] h-[90px]">
                        <Slider
                            dots={false}
                            arrows={false}
                            infinite={true}
                            speed={500}
                            slidesToShow={1}
                            slidesToScroll={1}
                            autoplay={true}
                            autoplaySpeed={3000}
                        >
                            <div>
                                <img src="/slide1.png" alt="Slide 1" className="w-full h-[90px] object-cover rounded-xl" />
                            </div>
                            <div>
                                <img src="/slide2.png" alt="Slide 2" className="w-full h-[90px] object-cover rounded-xl" />
                            </div>
                            <div>
                                <img src="/slide3.png" alt="Slide 3" className="w-full h-[90px] object-cover rounded-xl" />
                            </div>
                        </Slider>
                    </div>
                </div> */}
                {/* Form Section */}
                <div className="">
                    <div className="fixed bottom-20  inset-x-0  z-50">
                        {/* Chat History Section */}
                        <div className="px-4 pt-8 max-w-xl mx-auto space-y-4  h-[300px] overflow-y-auto relative">
                            {questions.slice(0, current).map((q) => (
                                <div key={q.id} className="flex flex-col gap-2">
                                    <div className="self-start bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-4 py-2 rounded-xl text-sm max-w-xs shadow">
                                        {q.id === "contact" ? `Enter ${answers.contactMethod} Number here:` : q.label}
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
                        </div>
                        <div className="">
                            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-3">
                                {/* Fixed Bottom Input Area */}
                                {!submitted && (
                                    <div className="inset-x-0 bg-red-900/80 backdrop-blur-md border-t border-white/20 px-4 py-4 z-50">
                                        {/* Typing Prompt */}
                                        {/* Typing Animation */}
                                        {isTyping && (
                                            <div className="self-start text-sm text-green-500 dark:text-red-300 animate-pulse">
                                                Typing...
                                            </div>
                                        )}
                                        <div className="text-sm text-white font-medium py-4">{dynamicLabel}</div>
                                        {/* Errors */}
                                        {errors.map((err, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-4 rounded-xl text-sm shadow py-2"
                                            >
                                                ⚠️ {err}
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2">
                                            {/* Input */}
                                            {currentQuestion.type === "select" ? (
                                                <div className="relative z-50 overflow-hidden w-100">
                                                    <Select onValueChange={handleSelect} >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select contact method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                                            <SelectItem value="Telegram">Telegram</SelectItem>
                                                        </SelectContent></Select>
                                                </div>
                                            ) : (
                                                <Input
                                                    key={currentQuestion.id}
                                                    id={currentQuestion.id}
                                                    type={currentQuestion.type}
                                                    onChange={handleInput}
                                                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-gray-900 dark:text-white"
                                                />
                                            )}

                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    onClick={nextQuestion}
                                                    className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 text-sm shadow"
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {/* Final Submit */}
                                {submitted && (
                                    <div className="inset-x-0 bg-green-600/90 px-4 py-4 z-50 border-t border-white/20">
                                        <div className="max-w-xl mx-auto flex justify-center">
                                            <Button
                                                type="submit"
                                                className="bg-green-700 hover:bg-green-800 text-white text-sm px-6 py-2 rounded-full"
                                            >
                                                ✅ Submit Application
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </main >
            <ThemeToggle />
        </div >
        <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>
            &copy; {new Date().getFullYear()} R Studio. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <Link href="/privacy" className={styles.footerLink}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={styles.footerLink}>
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div >
    );

}
