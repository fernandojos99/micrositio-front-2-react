"use client"

import * as React from "react"
import { useState, useCallback, useRef } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui-shadcn/button"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  onImageSelect?: (file: File, base64: string) => void
  onUpload?: (file: File, base64: string) => Promise<void>
  maxSizeMB?: number
  acceptedTypes?: string[]
  className?: string
}

export function ImageUploader({
  onImageSelect,
  onUpload,
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  className,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido. Usa: ${acceptedTypes.map(t => t.split("/")[1]).join(", ")}`
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `El archivo es muy grande. Máximo: ${maxSizeMB}MB`
    }
    return null
  }

  const processFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setPreview(base64)
      onImageSelect?.(file, base64)
    }
    reader.readAsDataURL(file)
  }, [onImageSelect, acceptedTypes, maxSizeMB])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }, [processFile])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }, [processFile])

  const handleUpload = async () => {
    if (!file || !preview || !onUpload) return

    setIsUploading(true)
    setError(null)

    try {
      await onUpload(file, preview)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  const clearImage = () => {
    setPreview(null)
    setFile(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("w-full max-w-md", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          "bg-muted/30 border-muted-foreground/25",
          "hover:bg-muted/50 hover:border-muted-foreground/40",
          isDragging && "bg-primary/10 border-primary",
          preview ? "cursor-default" : "cursor-pointer",
          "min-h-[200px]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-[300px] rounded-md object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                clearImage()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            {file && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-muted p-4">
              {isDragging ? (
                <Upload className="h-8 w-8 text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">
                Arrastra una imagen aquí
              </p>
              <p className="text-sm text-muted-foreground">
                o haz clic para seleccionar
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Máximo {maxSizeMB}MB • {acceptedTypes.map(t => t.split("/")[1].toUpperCase()).join(", ")}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}

      {preview && onUpload && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-4 w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir imagen
            </>
          )}
        </Button>
      )}
    </div>
  )
}

// ============================================
// UTILIDADES PARA PREPARAR LA IMAGEN PARA EL BACKEND
// ============================================

/**
 * Convierte un File a Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Ejemplo de función para subir imagen a Express usando FormData (RECOMENDADO)
 */
export async function uploadImageFormData(file: File, endpoint: string): Promise<Response> {
  const formData = new FormData()
  formData.append("image", file)
  
  return fetch(endpoint, {
    method: "POST",
    body: formData,
    // NO pongas Content-Type, el browser lo hace automáticamente con el boundary
  })
}

/**
 * Ejemplo de función para subir imagen a Express usando Base64
 */
export async function uploadImageBase64(file: File, endpoint: string): Promise<Response> {
  const base64 = await fileToBase64(file)
  
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64,
      filename: file.name,
      mimetype: file.type,
    }),
  })
}
