"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

interface UploadedImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleFileChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length + files.length > maxImages) {
      toast(`Maximum ${maxImages} images allowed`, "error");
      return;
    }

    setUploading(true);
    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          newImages.push({
            url: data.data.url,
            alt: file.name.split(".")[0],
            isPrimary: images.length === 0 && newImages.length === 0,
            order: images.length + newImages.length,
          });
        } else {
          toast(data.error ?? "Upload failed", "error");
        }
      } catch {
        toast("Upload failed", "error");
      }
    }

    onChange([...images, ...newImages]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    const updated = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({
        ...img,
        isPrimary: i === 0,
        order: i,
      }));
    onChange(updated);
  }

  function setPrimary(index: number) {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
              <Image
                src={img.url}
                alt={img.alt ?? `Image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute top-1 left-1">
                  <span className="px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded-full">
                    Main
                  </span>
                </div>
              )}
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    title="Set as main"
                    className="p-1.5 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  title="Remove"
                  className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Click to upload images</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    JPEG, PNG, WebP up to 5MB · {images.length}/{maxImages} uploaded
                  </p>
                </div>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
