"use client";

import { ImageIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/lib/uploadthing-client";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  fallback?: string;
  disabled?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  fallback = "?",
  disabled,
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        onChange(res[0].url);
        toast.success("Image uploaded");
      }
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startUpload([file]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        <div className="relative size-16 group">
          <Image
            src={value}
            alt="Upload"
            fill
            className="rounded-md object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      ) : (
        <Avatar
          className="size-16 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <AvatarFallback>{isUploading ? "..." : fallback}</AvatarFallback>
        </Avatar>
      )}

      {!value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <ImageIcon className="size-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
      )}
    </div>
  );
};
