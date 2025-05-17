import type { NextApiRequest, NextApiResponse } from "next";

// utils/uploadImage.ts
interface UploadResult {
  imageUrl: string;
  fileId: string;
}

interface UploadError {
  error: string;
  details?: any;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

export const isValidImageType = (file: File): boolean =>
  ACCEPTED_IMAGE_TYPES.includes(file.type);

export const isFileSizeValid = (file: File): boolean =>
  file.size <= MAX_FILE_SIZE;

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const uploadImageToAppScript = async (
  base64Data: string,
  contentType: string,
  fileName: string,
  appScriptUrl: string
): Promise<UploadResult | UploadError | null> => {
  try {
    if (!base64Data || !contentType || !fileName || !appScriptUrl) {
      console.warn("Missing required parameters for upload.");
      return { error: "Missing required upload parameters." };
    }

    const payload = {
      fileName: fileName,
      contentType: contentType,
      data: base64Data,
    };

    const response = await fetch(appScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Image upload to App Script failed:", errorData);
      return {
        error: "Failed to upload image.",
        details: errorData?.message || "Unknown error from App Script.",
      };
    }

    const result: UploadResult = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error during image upload:", error);
    return {
      error: "An unexpected error occurred during upload.",
      details: error.message,
    };
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { data, contentType, fileName } = req.body;
      const appScriptUrl = process.env.NEXT_PUBLIC_APPSCRIPT_URL;

      if (!appScriptUrl) {
        return res
          .status(500)
          .json({ error: "App Script URL not configured." });
      }

      const uploadResult = await uploadImageToAppScript(
        data,
        contentType,
        fileName,
        appScriptUrl
      );

      if (
        uploadResult &&
        "imageUrl" in uploadResult &&
        "fileId" in uploadResult
      ) {
        return res.status(200).json(uploadResult);
      } else if (uploadResult && "error" in uploadResult) {
        return res.status(500).json(uploadResult);
      } else {
        return res.status(500).json({ error: "Failed to upload image." });
      }
    } catch (error: any) {
      console.error("Error in /api/upload-to-appscript:", error);
      return res.status(500).json({
        error: "Failed to forward image to App Script.",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
