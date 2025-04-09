"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ImageBlock } from "@/types/session";

interface ImageBlockProps {
  block: ImageBlock;
}

export function ImageBlockComponent({ block }: ImageBlockProps) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      const response = await fetch(block.content.url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(blob);
    };
    if (block.content.url) {
      fetchImage();
    }
    fetchImage();
  }, [block]);

  if (!imageUrl) {
    return (
      <div className="relative w-full max-w-[100%] overflow-hidden">
        <Skeleton className="h-[900px] w-[1200px]" />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[100%] overflow-hidden">
      <Image
        src={imageUrl || ""}
        alt={block.content.name || "chart image"}
        width={1200}
        height={900}
        className="object-contain"
      />
    </div>
  );
}
