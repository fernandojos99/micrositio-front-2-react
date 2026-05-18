/* ============================================================================
   TranscriptProcessor.tsx

   COMPONENTE COMPLETO

   Este componente:
   - Procesa transcripts
   - Permite subir .docx
   - Consume APIs
   - Renderiza respuestas
   - Soporta dark/light mode mediante theme.css

   IMPORTANTE:
   El sistema de tema NO usa Tailwind dark directamente.
   Usa variables CSS globales provenientes de:

   <html class="dark">

   y de:

   theme.css

   Variables utilizadas:
   - --theme-bg-primary
   - --theme-bg-secondary
   - --theme-bg-tertiary
   - --theme-text-primary
   - --theme-text-secondary
   - --theme-border
   - --theme-border-hover

   ============================================================================ */

   import { useState, useCallback, useRef } from "react"

   import {
     Card,
     CardContent,
     CardHeader,
     CardTitle,
   } from "@/components/ui-shadcn2/card"
   
   import { Input } from "@/components/ui-shadcn2/input"
   
   import { Textarea } from "@/components/ui-shadcn2/textarea"
   
   import { Button } from "@/components/ui-shadcn2/button"
   
   import { Label } from "@/components/ui-shadcn2/label"
   
   import { Spinner } from "@/components/ui-shadcn2/spinner"
   
   import { cn } from "@/lib/utils"
   
   import {
     Upload,
     X,
     Plus,
     Trash2,
     Copy,
     Check,
     FileText,
     ChevronRight,
     ChevronDown,
     AlertTriangle,
   } from "lucide-react"
   
   /* ============================================================================
      CONFIGURACIÓN API
      ============================================================================ */
   
   const BASE_URL = "https://cfd7pir2qsnt72hx5kgyfl46gi0ligbe.lambda-url.us-east-1.on.aws"
   
   const LAMBDA_URL =
     "https://4qfkozr56fmq4mnlpx67u2eucu0badws.lambda-url.us-east-1.on.aws/transcripts"


     const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000) // 10 min

   
   /* ============================================================================
      TYPES
      ============================================================================ */
   
   interface VariableWithMeaning {
     id: string
     variable: string
     meaning: string
   }
   
   interface ApiResponse {
     id?: string
     url?: string
     [key: string]: unknown
   }
   
   /* ============================================================================
      COMPONENTE PRINCIPAL
      ============================================================================ */
   
   export default function TranscriptProcessor() {
     /* ==========================================================================
        FORM STATE
        ========================================================================== */
   
     const [projectName, setProjectName] = useState("")
   
     const [transcript, setTranscript] = useState("")
   
     const [docxFile, setDocxFile] =
       useState<File | null>(null)
   
     const [templateId, setTemplateId] =
       useState("")
   
     const [variables, setVariables] =
       useState("")
   
     const [variablesWithMeaning, setVariablesWithMeaning] =
       useState<VariableWithMeaning[]>([
         {
           id: crypto.randomUUID(),
           variable: "",
           meaning: "",
         },
       ])
   
     /* ==========================================================================
        UI STATE
        ========================================================================== */
   
     const [isLoading, setIsLoading] =
       useState(false)
   
     const [response, setResponse] =
       useState<ApiResponse | null>(null)
   
     const [lambdaResponse, setLambdaResponse] =
       useState<unknown>(null)
   
     const [error, setError] =
       useState<string | null>(null)
   
     const [copied, setCopied] =
       useState<string | null>(null)
   
     const [isDragging, setIsDragging] =
       useState(false)
   
     /* ==========================================================================
        FILE INPUT REF
        ========================================================================== */
   
     const fileInputRef =
       useRef<HTMLInputElement>(null)
   
     /* ==========================================================================
        DISABLE LOGIC
        ========================================================================== */
   
     const isTextareaDisabled =
       docxFile !== null
   
     const isFileUploadDisabled =
       transcript.trim().length > 0
   
     const isVariablesDisabled =
       variablesWithMeaning.some(
         (v) =>
           v.variable.trim() !== "" ||
           v.meaning.trim() !== ""
       )
   
     const isVariablesWithMeaningDisabled =
       variables.trim().length > 0
   
     /* ==========================================================================
        CLEAN TRANSCRIPT
        ========================================================================== */
   
     const cleanTranscript = (
       text: string
     ): string => {
       return text
         .replace(/\r\n/g, "\n")
         .replace(/\r/g, "\n")
         .replace(
           /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
           ""
         )
         .trim()
     }
   
     /* ==========================================================================
        DRAG & DROP
        ========================================================================== */
   
     const handleDrop = useCallback(
       (e: React.DragEvent) => {
         e.preventDefault()
   
         setIsDragging(false)
   
         const file = e.dataTransfer.files[0]
   
         if (
           file &&
           file.name.endsWith(".docx")
         ) {
           setDocxFile(file)
           setTranscript("")
         }
       },
       []
     )
   
     const handleDragOver = useCallback(
       (e: React.DragEvent) => {
         e.preventDefault()
         setIsDragging(true)
       },
       []
     )
   
     const handleDragLeave = useCallback(
       (e: React.DragEvent) => {
         e.preventDefault()
         setIsDragging(false)
       },
       []
     )
   
     /* ==========================================================================
        FILE SELECT
        ========================================================================== */
   
     const handleFileSelect = (
       e: React.ChangeEvent<HTMLInputElement>
     ) => {
       const file = e.target.files?.[0]
   
       if (
         file &&
         file.name.endsWith(".docx")
       ) {
         setDocxFile(file)
         setTranscript("")
       }
     }
   
     /* ==========================================================================
        REMOVE FILE
        ========================================================================== */
   
     const removeFile = () => {
       setDocxFile(null)
   
       if (fileInputRef.current) {
         fileInputRef.current.value = ""
       }
     }
   
     /* ==========================================================================
        VARIABLES WITH MEANING
        ========================================================================== */
   
     const addVariable = () => {
       setVariablesWithMeaning([
         ...variablesWithMeaning,
         {
           id: crypto.randomUUID(),
           variable: "",
           meaning: "",
         },
       ])
     }
   
     const removeVariable = (id: string) => {
       if (variablesWithMeaning.length > 1) {
         setVariablesWithMeaning(
           variablesWithMeaning.filter(
             (v) => v.id !== id
           )
         )
       }
     }
   
     const updateVariable = (
       id: string,
       field: "variable" | "meaning",
       value: string
     ) => {
       setVariablesWithMeaning(
         variablesWithMeaning.map((v) =>
           v.id === id
             ? { ...v, [field]: value }
             : v
         )
       )
     }
   
     /* ==========================================================================
        COPY TO CLIPBOARD
        ========================================================================== */
   
     const copyToClipboard = async (
       text: string,
       key: string
     ) => {
       await navigator.clipboard.writeText(text)
   
       setCopied(key)
   
       setTimeout(() => {
         setCopied(null)
       }, 2000)
     }
   
     /* ==========================================================================
        SUBMIT
        ========================================================================== */
   
     const handleSubmit = async () => {
       setIsLoading(true)
   
       setError(null)
   
       setResponse(null)
   
       setLambdaResponse(null)
   
       try {

            /* ======================================================================
       BUILD VARIABLES PAYLOAD
       - variables      → string CSV → string[]
       - variablesWithMeaning → {variable, meaning}[] (filter empty rows)
       ====================================================================== */

        const variablesPayload = variables.trim()
        ? {
            variables: variables
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean),
          }
        : variablesWithMeaning.some(
              (v) => v.variable.trim() || v.meaning.trim()
            )
          ? {
              variablesConSignificado: variablesWithMeaning
                .filter(
                  (v) => v.variable.trim() || v.meaning.trim()
                )
                .map(({ variable, meaning }) => ({
                  variable: variable.trim(),
                  meaning: meaning.trim(),
                })),
            }
          : {}

         let result: ApiResponse
   
         /* ======================================================================
            PROCESS FILE
            ====================================================================== */
   
         if (docxFile) {
           const formData = new FormData()
   
           formData.append(
             "archivo",
             docxFile
           )
   
           formData.append(
             "proyecto",
             projectName || "Proyecto1"
           )
   
           formData.append(
             "templateId",
             templateId
           )
   

                 // Append variables as JSON string so the server can parse it
            if (Object.keys(variablesPayload).length > 0) {
              formData.append(
                "variables",
                JSON.stringify(variablesPayload)
              )
            }


           const res = await fetch(
             `${BASE_URL}/api/process-file`,
             {
               method: "POST",
               body: formData,
             }
           )
   
           if (!res.ok) {
             throw new Error(
               `Error: ${res.status} ${res.statusText}`
             )
           }
   
           result = await res.json()
         }
    /* ======================================================================
       PROCESS TEXT
       ====================================================================== */

        else {
          const cleanedTranscript = cleanTranscript(transcript)
    
          const res = await fetch(`${BASE_URL}/api/process-text`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              proyecto: projectName || "Proyecto1",
              templateId: templateId,
              transcript: cleanedTranscript,
              ...variablesPayload,
            }),
          })
    
          if (!res.ok) {
            throw new Error(`Error: ${res.status} ${res.statusText}`)
          }
    
          result = await res.json()
        }
    
        /* ======================================================================
          SAVE RESPONSE
          ====================================================================== */
    
        setResponse(result)
    
        /* ======================================================================
          AUTO FETCH LAMBDA
          ====================================================================== */
    
        if (result.id) {
          const lambdaRes = await fetch(`${LAMBDA_URL}/${result.id}`)
    
          if (lambdaRes.ok) {
            const lambdaData = await lambdaRes.json()
    
            setLambdaResponse(
              lambdaData?.data?.resumen_estructurado ?? null
            )
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error desconocido"
        )
      } finally {
        setIsLoading(false)
      }
    }






     /* ==========================================================================
        RENDER
        ========================================================================== */
   
     return (
       <main
         className="
           min-h-screen
           py-10
           px-4
           transition-colors
         "
         style={{
           background:
             "var(--theme-bg-primary)",
   
           color:
             "var(--theme-text-primary)",
         }}
       >
         <div className="max-w-5xl mx-auto">
           {/* ================================================================
              MAIN CARD
              ================================================================ */}
   
           <Card
             className="
               rounded-2xl
               overflow-hidden
               shadow-xl
               border
             "
             style={{
               background:
                 "var(--theme-bg-secondary)",
   
               borderColor:
                 "var(--theme-border)",
             }}
           >
             {/* ============================================================
                HEADER
                ============================================================ */}
   
             <CardHeader
               className="border-b"
               style={{
                 borderColor:
                   "var(--theme-border)",
               }}
             >
               <CardTitle
                 className="text-3xl font-bold"
                 style={{
                   color:
                     "var(--theme-text-primary)",
                 }}
               >
                 Transcript Processor
               </CardTitle>
             </CardHeader>
   
             {/* ============================================================
                CONTENT
                ============================================================ */}
   
             <CardContent className="space-y-8 p-8">
               {/* ==========================================================
                  PROJECT NAME
                  ========================================================== */}
   
               <div className="space-y-2">
                 <Label>
                   Nombre del proyecto
                 </Label>
   
                 <Input
                   placeholder="Proyecto1"
                   value={projectName}
                   onChange={(e) =>
                     setProjectName(
                       e.target.value
                     )
                   }
                 />
               </div>
   
               {/* ==========================================================
                  TEXT + FILE
                  ========================================================== */}
   
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* ======================================================
                    TEXTAREA
                    ====================================================== */}
   
                 <div
                   className={cn(
                     `
                     rounded-xl
                     border
                     p-5
                     transition-all
                     `,
                     isTextareaDisabled &&
                       `
                       opacity-50
                       pointer-events-none
                       `
                   )}
                   style={{
                     background:
                       "var(--theme-bg-secondary)",
   
                     borderColor:
                       "var(--theme-border)",
                   }}
                 >
                   <div className="space-y-2">
                     <Label>
                       Texto / Transcript
                     </Label>
   
                     <Textarea
                       placeholder="Pega tu transcript aquí..."
                       value={transcript}
                       onChange={(e) =>
                         setTranscript(
                           e.target.value
                         )
                       }
                       disabled={
                         isTextareaDisabled
                       }
                       className="min-h-[220px] resize-y"
                     />
                   </div>
                 </div>
   
                 {/* ======================================================
                    FILE DROP
                    ====================================================== */}
   
                 <div
                   className={cn(
                     `
                     rounded-xl
                     border
                     p-5
                     transition-all
                     `,
                     isFileUploadDisabled &&
                       `
                       opacity-50
                       pointer-events-none
                       `
                   )}
                   style={{
                     background:
                       "var(--theme-bg-secondary)",
   
                     borderColor:
                       "var(--theme-border)",
                   }}
                 >
                   <div className="space-y-2">
                     <Label>
                       Subir archivo .docx
                     </Label>
   
                     <div
                       onDrop={handleDrop}
                       onDragOver={
                         handleDragOver
                       }
                       onDragLeave={
                         handleDragLeave
                       }
                       onClick={() =>
                         !isFileUploadDisabled &&
                         fileInputRef.current?.click()
                       }
                       className={cn(
                         `
                         min-h-[220px]
                         border-2
                         border-dashed
                         rounded-xl
                         flex
                         flex-col
                         items-center
                         justify-center
                         gap-4
                         cursor-pointer
                         transition-all
                         `,
                         isDragging &&
                           "scale-[1.01]"
                       )}
                       style={{
                         borderColor:
                           "var(--theme-border-hover)",
   
                         background:
                           isDragging
                             ? "var(--theme-bg-tertiary)"
                             : "var(--theme-bg-secondary)",
                       }}
                     >
                       {docxFile ? (
                         <>
                           <FileText className="size-12 opacity-70" />
   
                           <p>
                             {docxFile.name}
                           </p>
   
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation()
                               removeFile()
                             }}
                           >
                             <X className="size-4 mr-1" />
                             Eliminar
                           </Button>
                         </>
                       ) : (
                         <>
                           <Upload className="size-12 opacity-70" />
   
                           <div className="text-center">
                             <p>
                               Arrastra un archivo
                               o haz clic
                             </p>
   
                             <p className="text-sm opacity-70">
                               Solo archivos .docx
                             </p>
                           </div>
                         </>
                       )}
                     </div>
   
                     <input
                       ref={fileInputRef}
                       type="file"
                       accept=".docx"
                       onChange={
                         handleFileSelect
                       }
                       className="hidden"
                     />
                   </div>
                 </div>
               </div>
   
               {/* ==========================================================
                  TEMPLATE
                  ========================================================== */}
   
{/*                <div className="space-y-2">
                 <Label>
                   Template
                 </Label>
   
                 <Input
                   placeholder="id de slide google"
                   value={templateId}
                   onChange={(e) =>
                     setTemplateId(
                       e.target.value
                     )
                   }
                 />
               </div>
    */}


               {/* ==========================================================
                  PPTX DISABLED
                  ========================================================== */}
  {/*  
               <div
                 className="
                   space-y-2
                   rounded-xl
                   p-5
                   opacity-50
                   pointer-events-none
                   border
                 "
                 style={{
                   background:
                     "var(--theme-bg-secondary)",
   
                   borderColor:
                     "var(--theme-border)",
                 }}
               >
                 <Label>
                   Subir archivo .pptx
                   <span className="ml-2 text-xs">
                     (Próximamente)
                   </span>
                 </Label>
   
                 <div
                   className="
                     min-h-[100px]
                     border-2
                     border-dashed
                     rounded-xl
                     flex
                     flex-col
                     items-center
                     justify-center
                     gap-2
                   "
                   style={{
                     borderColor:
                       "var(--theme-border)",
                   }}
                 >
                   <Upload className="size-8 opacity-50" />
   
                   <p className="text-sm opacity-70">
                     Funcionalidad
                     próximamente disponible
                   </p>
                 </div>
               </div>
   */} 
               {/* ==========================================================
                  VARIABLES
                  ========================================================== */}
 {/*   
               <div
                 className={cn(
                   `
                   space-y-2
                   rounded-xl
                   p-5
                   border
                   `,
                   isVariablesDisabled &&
                     `
                     opacity-50
                     pointer-events-none
                     `
                 )}
                 style={{
                   background:
                     "var(--theme-bg-secondary)",
   
                   borderColor:
                     "var(--theme-border)",
                 }}
               >
                 <Label>
                   Variables
                 </Label>
   
                 <p className="text-sm opacity-70">
                   Separa las variables
                   por coma
                 </p>
   
                 <Input
                   placeholder="variable1, variable2"
                   value={variables}
                   onChange={(e) =>
                     setVariables(
                       e.target.value
                     )
                   }
                   disabled={
                     isVariablesDisabled
                   }
                 />
               </div> */}
   
               {/* ==========================================================
                  VARIABLES WITH MEANING
                  ========================================================== */}
   {/* 
               <div
                 className={cn(
                   `
                   space-y-4
                   rounded-xl
                   p-5
                   border
                   `,
                   isVariablesWithMeaningDisabled &&
                     `
                     opacity-50
                     pointer-events-none
                     `
                 )}
                 style={{
                   background:
                     "var(--theme-bg-secondary)",
   
                   borderColor:
                     "var(--theme-border)",
                 }}
               >
                 <Label>
                   Variables con significado
                 </Label>
   
                 <div className="space-y-3">
                   {variablesWithMeaning.map(
                     (item, index) => (
                       <div
                         key={item.id}
                         className="
                           grid
                           grid-cols-[1fr_1fr_auto]
                           gap-3
                           items-end
                         "
                       >
    */}                     
    
                        {/* VARIABLE */}
   
                        {/*  <div className="space-y-1">
                           {index === 0 && (
                             <Label className="text-sm opacity-70">
                               Variable
                             </Label>
                           )}
   
                           <Input
                             placeholder="Variable"
                             value={
                               item.variable
                             }
                             onChange={(e) =>
                               updateVariable(
                                 item.id,
                                 "variable",
                                 e.target.value
                               )
                             }
                           />
                         </div>
 */}   
                         {/* SIGNIFICADO */}
   {/* 
                         <div className="space-y-1">
                           {index === 0 && (
                             <Label className="text-sm opacity-70">
                               Significado
                             </Label>
                           )}
   
                           <Input
                             placeholder="Significado"
                             value={
                               item.meaning
                             }
                             onChange={(e) =>
                               updateVariable(
                                 item.id,
                                 "meaning",
                                 e.target.value
                               )
                             }
                           />
                         </div> */}
   
                         {/* DELETE */}
{/*    
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() =>
                             removeVariable(
                               item.id
                             )
                           }
                           disabled={
                             variablesWithMeaning.length ===
                               1 ||
                             isVariablesWithMeaningDisabled
                           }
                         >
                           <Trash2 className="size-4" />
                         </Button>
                       </div>
                     )
                   )}
                 </div>
 */}   
                 {/* ADD VARIABLE */}
   {/* 
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={addVariable}
                   disabled={
                     isVariablesWithMeaningDisabled
                   }
                   className="w-full"
                 >
                   <Plus className="size-4 mr-2" />
                   Agregar variable
                 </Button>
               </div> */}
   
               {/* ==========================================================
                  SUBMIT
                  ========================================================== */}
   
               <Button
                 onClick={handleSubmit}
                 disabled={
                   isLoading ||
                   !projectName.trim() ||
                   (!transcript.trim() &&
                     !docxFile)
                 }
                 className="
                   w-full
                   h-14
                   text-lg
                   rounded-xl
                 "
                 style={{
                   background:
                     "var(--theme-bg-tertiary)",

                   color:
                     "var(--theme-text-primary)",
                 }}
               >
                 {isLoading ? (
                   <>
                     <Spinner className="size-5 mr-2" />
                     Procesando...
                   </>
                 ) : (
                   "Ejecutar"
                 )}
               </Button>
   
               {/* ==========================================================
                  ERROR
                  ========================================================== */}
   
               {error && (
                 <div
                   className="
                     rounded-xl
                     border
                     p-4
                   "
                   style={{
                     background:
                       "rgba(239,68,68,0.1)",
   
                     borderColor:
                       "rgba(239,68,68,0.3)",
                   }}
                 >
                   <p className="text-red-500 font-medium">
                     {error}
                   </p>
                 </div>
               )}
   
               {/* ==========================================================
                  RESPONSE
                  ========================================================== */}
   
               {response && (
                 <div
                   className="
                     rounded-xl
                     border
                     p-5
                   "
                   style={{
                     background:
                       "var(--theme-bg-secondary)",
   
                     borderColor:
                       "var(--theme-border)",
                   }}
                 >
                   <h3 className="font-semibold mb-4">
                     Respuesta
                   </h3>
   
                   <div className="space-y-3">
                     {response.id && (
                       <ResponseItem
                         label="ID"
                         value={response.id}
                         copied={copied}
                         copyToClipboard={
                           copyToClipboard
                         }
                       />
                     )}
   
                     {response.url && (
                       <ResponseItem
                         label="URL"
                         value={response.url}
                         copied={copied}
                         copyToClipboard={
                           copyToClipboard
                         }
                       />
                     )}
                   </div>
                 </div>
               )}
   
               {/* ==========================================================
                  LAMBDA RESPONSE
                  ========================================================== */}
   
               {!!lambdaResponse && (
                 <div
                   className="rounded-xl border"
                   style={{
                     background: "var(--theme-bg-secondary)",
                     borderColor: "var(--theme-border)",
                   }}
                 >
                   {/* ----------------------------------------------------------
                      AVISO: copiar antes de cerrar
                      ---------------------------------------------------------- */}

                   <div
                     className="
                       flex
                       items-start
                       gap-3
                       rounded-t-xl
                       border-b
                       px-5
                       py-4
                     "
                     style={{
                       background: "rgba(234,179,8,0.08)",
                       borderColor: "rgba(234,179,8,0.35)",
                     }}
                   >
                     <AlertTriangle
                       className="size-5 shrink-0 mt-0.5"
                       style={{ color: "rgb(234,179,8)" }}
                     />

                     <p
                       className="text-sm leading-relaxed"
                       style={{ color: "rgb(234,179,8)" }}
                     >
                       <span className="font-semibold">
                         Copia esta información antes de cerrar.
                       </span>{" "}
                       Por el momento no es posible recuperarla
                       una vez que abandones o recargues esta
                       página.
                     </p>
                   </div>

                   {/* ----------------------------------------------------------
                      HEADER CON BOTÓN COPIAR JSON
                      ---------------------------------------------------------- */}

                   <div
                     className="
                       flex
                       items-center
                       justify-between
                       border-b
                       px-5
                       py-3
                     "
                     style={{
                       borderColor: "var(--theme-border)",
                     }}
                   >
                     <h3 className="font-semibold">
                       Datos del Transcript
                     </h3>

                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() =>
                         copyToClipboard(
                           JSON.stringify(lambdaResponse, null, 2),
                           "lambda-json"
                         )
                       }
                       className="gap-2"
                     >
                       {copied === "lambda-json" ? (
                         <>
                           <Check className="size-4 text-green-500" />
                           <span className="text-green-500">
                             ¡Copiado!
                           </span>
                         </>
                       ) : (
                         <>
                           <Copy className="size-4" />
                           Copiar JSON
                         </>
                       )}
                     </Button>
                   </div>

                   {/* ----------------------------------------------------------
                      JSON VIEWER
                      ---------------------------------------------------------- */}

                   <div className="p-5">
                     <JsonViewer data={lambdaResponse} />
                   </div>
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
       </main>
     )
   }
   
   /* ============================================================================
      RESPONSE ITEM
      ============================================================================ */
   
   function ResponseItem({
     label,
     value,
     copied,
     copyToClipboard,
   }: any) {
     return (
       <div
         className="
           flex
           items-center
           justify-between
           gap-3
           rounded-xl
           border
           p-3
         "
         style={{
           background:
             "var(--theme-bg-primary)",
   
           borderColor:
             "var(--theme-border)",
         }}
       >
         <div className="min-w-0">
           <span className="text-xs opacity-70">
             {label}
           </span>
   
           <p className="font-mono text-sm truncate">
             {value}
           </p>
         </div>
   
         <Button
           variant="ghost"
           size="sm"
           onClick={() =>
             copyToClipboard(value, label)
           }
         >
           {copied === label ? (
             <Check className="size-4 text-green-500" />
           ) : (
             <Copy className="size-4" />
           )}
         </Button>
       </div>
     )
   }
   
   /* ============================================================================
      JSON VIEWER
      ============================================================================ */

function JsonViewer({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2)

  if (data === null) {
    return <span className="text-muted-foreground italic">null</span>
  }

  if (typeof data === "boolean") {
    return <span className="text-primary">{data.toString()}</span>
  }

  if (typeof data === "number") {
    return <span className="text-chart-2">{data}</span>
  }

  if (typeof data === "string") {
    return <span className="text-chart-1">{`"${data}"`}</span>
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-muted-foreground">[]</span>
    }

    return (
      <div className="space-y-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          <span className="text-sm">Array ({data.length})</span>
        </button>
        {expanded && (
          <div className="ml-4 pl-4 border-l border-border space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-muted-foreground text-sm shrink-0">[{index}]</span>
                <JsonViewer data={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (typeof data === "object") {
    const entries = Object.entries(data)
    
    if (entries.length === 0) {
      return <span className="text-muted-foreground">{"{}"}</span>
    }

    return (
      <div className="space-y-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          <span className="text-sm">Object ({entries.length} keys)</span>
        </button>
        {expanded && (
          <div className="ml-4 pl-4 border-l border-border space-y-2">
            {entries.map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="text-foreground font-medium text-sm shrink-0">{key}:</span>
                <JsonViewer data={value} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return <span className="text-muted-foreground">{String(data)}</span>
}
