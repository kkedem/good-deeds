"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import OpportunityImage from "@/components/OpportunityImage";
import { Api } from "@/lib/client/api";
import { showToast } from "@/lib/client/format";

const MAX_EDGE = 1200;
const JPEG_QUALITY = 0.8;

/** Downscale to MAX_EDGE on the longest side and re-encode as JPEG (also strips EXIF/location data). */
async function resizeToJpeg(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

type Props = {
  userId: string;
  value: string;
  fallback: string;
  onChange: (url: string) => void;
};

export default function PhotoPicker({ userId, value, fallback, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Choose a photo (JPEG, PNG or WebP)");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await resizeToJpeg(file);
      const { image_url } = await Api.uploadImage(userId, dataUrl);
      onChange(image_url);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't upload that photo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const shown = value || fallback;

  return (
    <div className="photo-picker">
      <div className="photo-picker-preview">
        {shown ? (
          <OpportunityImage src={shown} sizes="(max-width: 480px) 100vw, 440px" />
        ) : (
          <span className="photo-picker-empty">
            <ImagePlus size={28} aria-hidden="true" />
            Pick a category to see a suggested photo
          </span>
        )}
        {!value && shown && <span className="photo-picker-chip">Suggested photo</span>}
        {uploading && (
          <span className="photo-picker-busy" role="status">
            <Loader2 size={24} className="photo-picker-spin" aria-hidden="true" /> Uploading…
          </span>
        )}
      </div>
      <div className="photo-picker-actions">
        <button
          type="button"
          className="cg-btn cg-btn--secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {value ? <RefreshCw size={16} aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
          {value ? "Change photo" : "Upload your own"}
        </button>
        {value && (
          <button type="button" className="cg-btn cg-btn--ghost" onClick={() => onChange("")} disabled={uploading}>
            <Trash2 size={16} aria-hidden="true" /> Use suggested
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="photo-picker-input"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
