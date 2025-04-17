"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeToggle from "../../components/ThemeToggle";

export default function ModelForm() {
    type FormFields = {
        name: string;
        dob: string;
        location: string;
        experience: string;
        contact: string;
        marital: string;
        aadhaar: string;
        selfie: string; // fileId only
    };

    const [formData, setFormData] = useState<FormFields>({
        name: "",
        dob: "",
        location: "",
        experience: "",
        contact: "",
        marital: "",
        aadhaar: "",
        selfie: "",
    });

    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, files } = e.target;

        if (id === "selfie" && files && files.length > 0) {
            setSelfieFile(files[0]);
            setFormData((prev) => ({ ...prev, selfie: files[0].name }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let fileId = "";

            // 1. Upload image if selfieFile is present
            if (selfieFile) {
                const base64 = await fileToBase64(selfieFile);

                const imageFormData = new URLSearchParams();
                imageFormData.append("fileName", selfieFile.name);
                imageFormData.append("contentType", selfieFile.type);
                imageFormData.append("data", base64);

                const uploadRes = await fetch("https://script.google.com/macros/s/AKfycbyPxT2Qizovk2VC-NGEc2XketyOn-7EPnt0vKamnYyEbWGE7qpwy14xWLuGLwXLzSG0/exec", {
                    method: "POST",
                    body: imageFormData,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });

                const uploadJson = await uploadRes.json();

                if (uploadJson.status === "success" && uploadJson.fileId) {
                    fileId = uploadJson.url;
                } else {
                    alert("Image upload failed: " + uploadJson.message);
                    setLoading(false);
                    return;
                }
            }

            // 2. Submit full form to your backend API with fileId
            const response = await fetch("/api/submit", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    selfie: fileId,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const json = await response.json();

            if (response.ok && json.status === "success") {
                alert("Application submitted successfully!");
                setFormData({
                    name: "",
                    dob: "",
                    location: "",
                    experience: "",
                    contact: "",
                    marital: "",
                    aadhaar: "",
                    selfie: "",
                });
                setSelfieFile(null);
            } else {
                alert("Form submission failed: " + json.message);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Something went wrong.");
        }

        setLoading(false);
    };

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className="min-h-screen flex items-center justify-center">
                    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                        <Card className="p-8 shadow-none md:shadow-lg">
                            <CardHeader className="space-y-2 text-center">
                                <CardTitle className="text-3xl font-bold">Join R Studio</CardTitle>
                                <p className="text-sm text-gray-500">Fill in your details to start modeling from home.</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { id: "name", label: "Full Name", type: "text" },
                                        { id: "dob", label: "Date of Birth", type: "date" },
                                        { id: "location", label: "Location", type: "text" },
                                        { id: "experience", label: "Streaming Experience", type: "text" },
                                        { id: "contact", label: "Contact Details", type: "text" },
                                        { id: "marital", label: "Marital Status", type: "text" },
                                        { id: "aadhaar", label: "Aadhaar Card Status", type: "text" },
                                        { id: "selfie", label: "Upload Selfie", type: "file" },
                                    ].map(({ id, label, type }) => (
                                        <div key={id} className="space-y-1">
                                            <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                {label}
                                            </Label>
                                            <Input
                                                id={id}
                                                type={type}
                                                value={type === "file" ? undefined : (formData as any)[id]}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 transition duration-200"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-medium py-2 rounded-lg shadow"
                                >
                                    {loading ? "Submitting…" : "Submit Application"}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </div></main>
            <ThemeToggle />
        </div>
    );
}
