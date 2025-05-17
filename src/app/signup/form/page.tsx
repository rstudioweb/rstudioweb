"use client";

import { useForm } from "react-hook-form";
import { useState } from "react"; // Import useState for loading state
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

const formSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  gender: z.string().min(1, "Gender is required"),
  city: z.string().min(1, "City is required"),
  experience: z.string().optional(),
  contactMethod: z.string().min(1, "Contact method is required"),
  telegramId: z.string().optional(),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  relationship: z.string().min(1, "Relationship status is required"),
  selfie: z
    .instanceof(File, { message: "ID Proof File is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `ID Proof file size must be less than ${
        MAX_FILE_SIZE / (1024 * 1024)
      } MB.`,
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only JPEG or PNG images are allowed for ID Proof.",
    }),
  selfieId: z.string().optional(), // Add selfieId to the schema
  selfieUrl: z.string().optional(), // Add selfieUrl to the schema
});

type FormData = z.infer<typeof formSchema>;
// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function SignupForm() {
  //type SubmitPayload = Omit<FormData, "selfie"> & { selfie: undefined };
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      dob: "",
      gender: "",
      city: "",
      experience: "",
      contactMethod: "",
      telegramId: "",
      whatsappNumber: "",
      relationship: "",
      selfie: undefined,
      selfieId: "", // Initialize with empty string
      selfieUrl: "", // Initialize with empty string
    },
  });

  const [loading, setLoading] = useState(false); // State to manage loading during upload

  const {
    formState: { errors },
    setValue,
  } = form;
  const getInputClass = (fieldName: keyof FormData) =>
    cn(
      "w-full p-3 bg-black/30 border rounded-lg",
      errors[fieldName] ? "border-red-500" : "border-white/20",
      fieldName === "selfie"
        ? "file:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff2a6d] hover:file:bg-[#cc2358]"
        : ""
    );

  // Image Upload Handle form submission
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    let imageUrl = "";
    let imageId = "";
    // 1. Upload image if selfieFile is present
    const selfieFile = data.selfie;
    if (selfieFile) {
      try {
        const base64WithPrefix = await fileToBase64(selfieFile);
        const base64 = base64WithPrefix.split(",")[1];
        const imageFormData = new URLSearchParams();
        imageFormData.append("fileName", data.selfie.name);
        imageFormData.append("contentType", data.selfie.type);
        imageFormData.append("data", base64);

        const uploadResponse = await fetch(
          "https://script.google.com/macros/s/AKfycbxj31AXQQQm8TLhXyMV2x9Rqm61JWxQLVMiFQaAM2lQKtYFjLTWJ2wVkojlkoOUyWKI/exec",
          {
            method: "POST",
            body: imageFormData,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        const uploadResult = await uploadResponse.json();

        if (uploadResult.status === "success") {
          imageUrl = uploadResult.url; // Store the URL
          imageId = uploadResult.fileId;
        } else {
          alert("Image upload failed: " + uploadResult.message);
          setLoading(false);
          return;
        }
        const response = await submitFormToBackend({
          ...data,
          selfieId: imageId, // Store the fileId
          selfieUrl: imageUrl, // Store the URL
        });
      } catch (error: any) {
        alert("Error uploading image: " + error.message);
        setLoading(false);
        return; // Stop form submission if there's an error
      }
    }
  };
  // 2. Submit form data to the backend
  const submitFormToBackend = async (formData: FormData) => {
    try {
      const response = await fetch("/api/mform1", {
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
      setLoading(false);
      console.log("Form successfully submitted to backend:", result);

      if (result.status === "success") {
        window.location.href = "https://wa.me/918240765589";
      } else {
        alert("❌ Failed to submit form. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting form to backend:", error);
      alert("❌ Failed to submit form. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-[#ff2a6d] mb-6">
        Model Signup Form
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 max-w-xl mx-auto mt-10 sm:mt-16"
          encType="multipart/form-data" // Important for file uploads
        >
          {/* Full Name */}
          <FormField
            name="fullName"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    className={getInputClass("fullName")}
                  />
                </FormControl>
                <FormMessage className="bg-red-600 text-white text-sm px-3 py-1 rounded mt-1" />
              </FormItem>
            )}
          />

          {/* Date of Birth */}
          <FormField
            name="dob"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    className={getInputClass("dob")}
                  />
                </FormControl>
                <FormMessage className="bg-red-600 text-white text-sm px-3 py-1 rounded mt-1" />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            name="gender"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={typeof field.value === "string" ? field.value : ""}
                >
                  <FormControl>
                    {/* Use getInputClass here for consistency */}
                    <SelectTrigger className={getInputClass("gender")}>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["Male", "Female", "Trans"].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="bg-red-600 text-white text-sm px-3 py-1 rounded mt-1" />
              </FormItem>
            )}
          />

          {/* Other Text Fields */}
          {[
            { label: "City", name: "city", type: "text" },
            {
              label: "Broadcasting Experience",
              name: "experience",
              type: "textarea",
            },
            {
              label: "Telegram ID (optional)",
              name: "telegramId",
              type: "text",
            },
            {
              label: "WhatsApp Number (Office Contact Only)",
              name: "whatsappNumber",
              type: "text",
            },
          ].map(({ label, name, type }) => (
            <FormField
              key={name}
              name={name as keyof FormData}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    {type === "textarea" ? (
                      <Textarea
                        {...field}
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                        className={getInputClass(name as keyof FormData)}
                      />
                    ) : (
                      <Input
                        {...field}
                        type={type}
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                        className={getInputClass(name as keyof FormData)}
                      />
                    )}
                  </FormControl>
                  <FormMessage className="bg-red-600 text-white text-sm px-3 py-1 rounded mt-1" />
                </FormItem>
              )}
            />
          ))}
          {/* Select Fields (excluding ID Proof) */}
          {[
            {
              label: "Preferred Contact Method",
              name: "contactMethod",
              options: ["Telegram", "WhatsApp"],
            },
            {
              label: "Relationship Status",
              name: "relationship",
              options: ["Single", "Married", "Divorcee"],
            },
          ].map(({ label, name, options }) => (
            <FormField
              key={name}
              name={name as keyof FormData} // Use FormData type
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={typeof field.value === "string" ? field.value : ""}
                  >
                    <FormControl>
                      {/* Use getInputClass here for consistency */}
                      <SelectTrigger
                        className={getInputClass(name as keyof FormData)}
                      >
                        <SelectValue placeholder={label} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="bg-red-600 text-white text-sm px-3 py-1 rounded mt-1" />
                </FormItem>
              )}
            />
          ))}

          {/* Selfie Upload */}
          <FormField
            name="selfie"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Candidate Selfie (JPEG/PNG, Max 8MB)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setValue("selfie", file);
                      }
                    }}
                    className={getInputClass("selfie")}
                  />
                </FormControl>
                <FormMessage className="bg-red-600 text-white text-sm px-3 py-1 rounded mt-1" />
              </FormItem>
            )}
          />
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-[#ff2a6d] hover:bg-[#cc2358] text-white font-semibold rounded-xl py-3"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
