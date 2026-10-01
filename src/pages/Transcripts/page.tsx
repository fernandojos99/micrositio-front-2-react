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

   import { useState, useCallback, useEffect, useRef } from "react"

   import {
     obtenerBrief,
     guardarBrief,
     subirArchivoBrief,
     subirPptxBrief,
     borrarBrief,
     type ArchivoBrief,
   } from "@/services/proyectoBriefService"

   import { toast } from "@/hooks/use-toast"

   import Modal from "@/components/ui-propios/Modal/Modal"

   import {
     Card,
     CardContent,
     CardHeader,
     CardTitle,
   } from "@/components/ui-shadcn/card"
   
   import { Input } from "@/components/ui-shadcn/input"
   
   import { Textarea } from "@/components/ui-shadcn/textarea"
   
   import { Button } from "@/components/ui-shadcn/button"
   
   import { Label } from "@/components/ui-shadcn/label"
   
   import { Spinner } from "@/components/ui-shadcn/spinner"
   
   import { cn } from "@/lib/utils"
   
   import {
     Upload,
     X,
     Copy,
     Check,
     FileText,
     Trash2,
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


  /**
   * Aquí había un AbortController y un setTimeout de 10 minutos creados a
   * nivel de módulo, es decir una sola vez al cargar el archivo y no por
   * petición. El controller nunca se pasaba como signal a ninguno de los tres
   * fetch, así que no abortaba nada: era un timer colgado que aparentaba ser
   * una protección. Este helper sí aplica el timeout, y uno por llamada.
   */
  const TIMEOUT_PROCESADO_MS = 10 * 60 * 1000 // 10 min

  async function fetchConTimeout(
    url: string,
    options: RequestInit = {},
    ms: number = TIMEOUT_PROCESADO_MS
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), ms)
    try {
      return await fetch(url, { ...options, signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }
  }

   
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
   
   export default function TranscriptProcessor({
     idProyecto,
     nombreProyectoInicial,
   }: {
     /** Con proyecto, lo ejecutado se guarda y se recupera al volver a entrar. */
     idProyecto?: number
     nombreProyectoInicial?: string
   } = {}) {
     /* ==========================================================================
        FORM STATE
        ========================================================================== */

     const [projectName, setProjectName] = useState(nombreProyectoInicial ?? "")
   
     const [transcript, setTranscript] = useState("")
   
     const [docxFile, setDocxFile] =
       useState<File | null>(null)
   
     const [templateId] =
       useState("")
   
     const [variables] =
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
        BRIEF GUARDADO — solo tiene sentido dentro de un proyecto
        ========================================================================== */

     const [archivoGuardado, setArchivoGuardado] =
       useState<ArchivoBrief | null>(null)

     const [pptx, setPptx] =
       useState<ArchivoBrief | null>(null)

     const [guardando, setGuardando] =
       useState(false)

     const [subiendoPptx, setSubiendoPptx] =
       useState(false)

     /** Los datos del transcript arrancan plegados: son largos y casi
      *  siempre basta con el enlace. */
     const [datosAbiertos, setDatosAbiertos] =
       useState(false)

     /** Con un resultado ya hecho, la zona de entrada se oculta. Esto la
      *  devuelve para volver a procesar encima. */
     const [modoEdicion, setModoEdicion] =
       useState(false)

     const [confirmarBorrado, setConfirmarBorrado] =
       useState(false)

     const [borrando, setBorrando] =
       useState(false)

     /** Hay resultado cuando la Lambda ya devolvió algo, no por tener
      *  archivos sueltos: el .pptx se sube aparte y no cuenta. */
     const yaHayResultado = Boolean(response?.url || lambdaResponse)

     const mostrarEntrada = !yaHayResultado || modoEdicion

     /* ==========================================================================
        FILE INPUT REF
        ========================================================================== */

     const fileInputRef =
       useRef<HTMLInputElement>(null)

     const inputPptxRef =
       useRef<HTMLInputElement>(null)

     /* ==========================================================================
        RECUPERAR LO YA GUARDADO
        ========================================================================== */

     useEffect(() => {
       if (!idProyecto) return
       let cancelado = false

       obtenerBrief(idProyecto)
         .then((brief) => {
           if (cancelado) return

           if (brief.nombre_proyecto) setProjectName(brief.nombre_proyecto)

           if (brief.ejecutado) {
             setResponse({
               id: brief.transcript_id ?? undefined,
               url: brief.url ?? undefined,
             })
             setLambdaResponse(brief.resumen_estructurado ?? null)
           }

           setArchivoGuardado(brief.archivo)
           setPptx(brief.pptx)
         })
         .catch((error) =>
           console.error("No se pudo cargar el brief guardado:", error)
         )

       return () => {
         cancelado = true
       }
     }, [idProyecto])

     /* ==========================================================================
        NO PERDER EL PROCESO EN CURSO
        Cambiar de pantalla dentro de la aplicación no aborta nada: handleSubmit
        es async y sigue corriendo aunque el componente se desmonte, incluido el
        guardado. Lo único que sí mata la petición es cerrar o recargar.
        ========================================================================== */

     useEffect(() => {
       if (!isLoading) return

       const avisar = (evento: BeforeUnloadEvent) => {
         evento.preventDefault()
         evento.returnValue = ""
       }

       window.addEventListener("beforeunload", avisar)
       return () => window.removeEventListener("beforeunload", avisar)
     }, [isLoading])

     /* ==========================================================================
        SUBIR LA PRESENTACIÓN — no exige haber ejecutado nada
        ========================================================================== */

     const handleBorrar = async () => {
       setBorrando(true)
       try {
         // Sin proyecto no hay nada guardado: basta con limpiar la pantalla.
         if (idProyecto) await borrarBrief(idProyecto)

         setResponse(null)
         setLambdaResponse(null)
         setArchivoGuardado(null)
         setPptx(null)
         setTranscript("")
         setDocxFile(null)
         if (fileInputRef.current) fileInputRef.current.value = ""
         setError(null)
         setModoEdicion(false)
         setDatosAbiertos(false)
         setConfirmarBorrado(false)

         toast({
           title: "Brief borrado",
           description: "Puedes volver a procesar un transcript desde cero.",
         })
       } catch (errorBorrado) {
         console.error("No se pudo borrar el brief:", errorBorrado)

         toast({
           title: "No se pudo borrar",
           description:
             errorBorrado instanceof Error
               ? errorBorrado.message
               : "Error desconocido",
           variant: "destructive",
         })
       } finally {
         setBorrando(false)
       }
     }

     const handlePptx = async (archivo: File) => {
       if (!idProyecto) return

       setSubiendoPptx(true)
       try {
         const brief = await subirPptxBrief(idProyecto, archivo)
         setPptx(brief.pptx)
       } catch (errorSubida) {
         console.error("No se pudo subir la presentación:", errorSubida)
         setError("No se pudo subir la presentación.")
       } finally {
         setSubiendoPptx(false)
       }
     }
   
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


           const res = await fetchConTimeout(
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
    
          const res = await fetchConTimeout(`${BASE_URL}/api/process-text`, {
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
    
        let resumenEstructurado: unknown = null
        let resumenTexto: string | null = null

        if (result.id) {
          const lambdaRes = await fetchConTimeout(`${LAMBDA_URL}/${result.id}`)

          if (lambdaRes.ok) {
            const lambdaData = await lambdaRes.json()

            resumenEstructurado =
              lambdaData?.data?.resumen_estructurado ?? null

            // La Lambda guarda también el resumen en texto. No se pinta, pero
            // se conserva: es lo que se puede leer o buscar sin desplegar el JSON.
            resumenTexto =
              typeof lambdaData?.data?.resumen === "string"
                ? lambdaData.data.resumen
                : null

            setLambdaResponse(resumenEstructurado)
          }
        }

        /* ======================================================================
          GUARDAR EN EL PROYECTO
          Sin proyecto no hay dónde guardarlo y todo sigue siendo volátil.
          El .docx se sube también a nuestro servidor: a la Lambda ya fue, pero
          de ahí no se puede recuperar.
          ====================================================================== */

        if (idProyecto) {
          setGuardando(true)
          try {
            if (docxFile) {
              const conArchivo = await subirArchivoBrief(idProyecto, docxFile)
              setArchivoGuardado(conArchivo.archivo)
            }

            await guardarBrief(idProyecto, {
              nombre_proyecto: projectName,
              transcript_id: result.id ?? null,
              url: result.url ?? null,
              resumen: resumenTexto,
              resumen_estructurado: resumenEstructurado,
              origen: docxFile ? "docx" : "texto",
            })
          } catch (errorGuardado) {
            console.error("No se pudo guardar el brief:", errorGuardado)
            setError(
              "Se procesó el transcript, pero no se pudo guardar en el proyecto."
            )
          } finally {
            setGuardando(false)
          }
        }

        toast({
          title: "Transcript procesado",
          description: idProyecto
            ? "El resultado quedó guardado en el proyecto."
            : "Listo. Copia lo que necesites antes de salir de la página.",
        })
      } catch (err) {
        const mensaje =
          err instanceof Error ? err.message : "Error desconocido"

        setError(mensaje)

        toast({
          title: "No se pudo procesar el transcript",
          description: mensaje,
          variant: "destructive",
        })
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
                 Procesador de transcript
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
   
               {mostrarEntrada && (
                 <>
                   {/* ======================================================
                      TEXT + FILE
                      ====================================================== */}
   
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

               {isLoading && (
                 <p
                   className="text-sm"
                   style={{ color: "var(--theme-text-secondary)" }}
                 >
                   Esto tarda varios minutos. Puedes seguir usando la aplicación:
                   el proceso continúa y te avisamos al terminar. Lo único que lo
                   interrumpe es cerrar o recargar la pestaña.
                 </p>
               )}
                 </>
               )}
   
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
                  GUARDADO
                  ========================================================== */}

               {guardando && (
                 <p
                   className="text-sm"
                   style={{ color: "var(--theme-text-secondary)" }}
                 >
                   Guardando en el proyecto…
                 </p>
               )}

               {/* ==========================================================
                  DOCUMENTO DEL BRIEF
                  ========================================================== */}

               {archivoGuardado && (
                 <p
                   className="text-sm"
                   style={{ color: "var(--theme-text-secondary)" }}
                 >
                   Documento del brief:{" "}
                   <a
                     href={archivoGuardado.url}
                     target="_blank"
                     rel="noreferrer"
                     className="underline"
                     style={{ color: "var(--theme-text-primary)" }}
                   >
                     {archivoGuardado.nombre}
                   </a>
                 </p>
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
                  PRESENTACIÓN (.pptx)
                  Se puede subir sin haber pulsado Ejecutar.
                  ========================================================== */}

               {idProyecto && (
                 <div
                   className="rounded-xl border p-5"
                   style={{
                     background: "var(--theme-bg-secondary)",
                     borderColor: "var(--theme-border)",
                   }}
                 >
                   <h3 className="font-semibold mb-1">Presentación</h3>

                   <p
                     className="text-sm mb-4"
                     style={{ color: "var(--theme-text-secondary)" }}
                   >
                     Sube el .pptx del proyecto. No hace falta haber ejecutado
                     el transcript.
                   </p>

                   <input
                     ref={inputPptxRef}
                     type="file"
                     accept=".pptx,.ppt"
                     className="hidden"
                     onChange={(e) => {
                       const elegido = e.target.files?.[0]
                       if (elegido) handlePptx(elegido)
                       e.target.value = ""
                     }}
                   />

                   <div className="flex flex-wrap items-center gap-3">
                     <Button
                       variant="outline"
                       disabled={subiendoPptx}
                       onClick={() => inputPptxRef.current?.click()}
                       className="gap-2"
                     >
                       {subiendoPptx ? (
                         <>
                           <Spinner className="size-4" />
                           Subiendo...
                         </>
                       ) : (
                         <>
                           <Upload className="size-4" />
                           {pptx ? "Reemplazar" : "Subir .pptx"}
                         </>
                       )}
                     </Button>

                     {pptx && (
                       <a
                         href={pptx.url}
                         target="_blank"
                         rel="noreferrer"
                         className="text-sm underline"
                         style={{ color: "var(--theme-text-primary)" }}
                       >
                         {pptx.nombre}
                       </a>
                     )}

                     {!pptx && (
                       <span
                         className="text-sm"
                         style={{ color: "var(--theme-text-secondary)" }}
                       >
                         Todavía no hay ninguna.
                       </span>
                     )}
                   </div>
                 </div>
               )}

               {/* ==========================================================
                  DATOS DEL TRANSCRIPT — plegado, porque es largo
                  ========================================================== */}

               {!!lambdaResponse && (
                 <div
                   className="rounded-xl border"
                   style={{
                     background: "var(--theme-bg-secondary)",
                     borderColor: "var(--theme-border)",
                   }}
                 >
                   {/* Dentro de un proyecto el aviso ya no es cierto: esto
                       queda guardado y reaparece al volver a entrar. */}
                   {!idProyecto && (
                     <div
                       className="flex items-start gap-3 rounded-t-xl border-b px-5 py-4"
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
                         Por el momento no es posible recuperarla una vez que
                         abandones o recargues esta página.
                       </p>
                     </div>
                   )}

                   <div className="flex items-center justify-between gap-3 px-5 py-3">
                     <button
                       type="button"
                       onClick={() => setDatosAbiertos((v) => !v)}
                       className="flex items-center gap-2 font-semibold"
                       style={{ color: "var(--theme-text-primary)" }}
                     >
                       {datosAbiertos ? (
                         <ChevronDown className="size-4" />
                       ) : (
                         <ChevronRight className="size-4" />
                       )}
                       Datos del transcript
                     </button>

                     {datosAbiertos && (
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() =>
                           copyToClipboard(
                             resumenComoTexto(lambdaResponse),
                             "resumen"
                           )
                         }
                         className="gap-2"
                       >
                         {copied === "resumen" ? (
                           <>
                             <Check className="size-4 text-green-500" />
                             <span className="text-green-500">¡Copiado!</span>
                           </>
                         ) : (
                           <>
                             <Copy className="size-4" />
                             Copiar
                           </>
                         )}
                       </Button>
                     )}
                   </div>

                   {datosAbiertos && (
                     <div
                       className="border-t p-5"
                       style={{ borderColor: "var(--theme-border)" }}
                     >
                       <ResumenTranscript data={lambdaResponse} />
                     </div>
                   )}
                 </div>
               )}

               {/* ==========================================================
                  YA HAY RESULTADO — se oculta la entrada y se ofrece rehacer
                  ========================================================== */}

               {yaHayResultado && !modoEdicion && (
                 <div
                   className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                   style={{
                     background: "var(--theme-bg-secondary)",
                     borderColor: "var(--theme-border)",
                   }}
                 >
                   <div className="min-w-0">
                     <p
                       className="font-medium"
                       style={{ color: "var(--theme-text-primary)" }}
                     >
                       Ya hay un transcript procesado
                     </p>

                     <p
                       className="text-sm"
                       style={{ color: "var(--theme-text-secondary)" }}
                     >
                       {archivoGuardado
                         ? "A partir de " + archivoGuardado.nombre + "."
                         : "A partir del texto pegado."}{" "}
                       Actualiza para volver a procesarlo, o bórralo para empezar
                       de cero.
                     </p>
                   </div>

                   <div className="flex shrink-0 gap-2">
                     <Button
                       variant="outline"
                       onClick={() => setModoEdicion(true)}
                     >
                       Actualizar
                     </Button>

                     <Button
                       variant="outline"
                       onClick={() => setConfirmarBorrado(true)}
                     >
                       <Trash2 className="size-4 mr-2" />
                       Borrar
                     </Button>
                   </div>
                 </div>
               )}

             </CardContent>
           </Card>
         </div>

         <Modal
           isOpen={confirmarBorrado}
           onClose={() => setConfirmarBorrado(false)}
           title="¿Borrar el resultado?"
           footer={
             <>
               <Button
                 variant="outline"
                 onClick={() => setConfirmarBorrado(false)}
               >
                 Cancelar
               </Button>

               <Button
                 variant="destructive"
                 disabled={borrando}
                 onClick={handleBorrar}
               >
                 {borrando ? "Borrando…" : "Borrar"}
               </Button>
             </>
           }
         >
           <p className="text-sm leading-relaxed">
             Se perderán el enlace, el resumen y los archivos subidos —el
             documento del brief y la presentación—, que se borran del servidor.
             No se puede deshacer, y volver a generarlo tarda varios minutos.
           </p>
         </Modal>
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
   RESUMEN DEL TRANSCRIPT

   La Lambda devuelve un objeto con hasta 22 claves: la mayoría son listas de
   textos, dos son texto suelto (o null) y dos son objetos anidados. No todas
   vienen siempre -unas aparecen en 196 transcripts, otras en 191 y otras en
   71-, así que se recorre lo que llegue en vez de una lista fija: si la Lambda
   añade una clave nueva, se sigue viendo.

   Se esconde lo que no aporta: nulos, listas vacías, textos en blanco y
   objetos con todos sus campos vacíos. En los datos reales eso es mucho
   ("desacuerdos" llega vacío en 158 de 191), y antes se pintaba como una
   sección en blanco.
   ============================================================================ */

const TITULOS: Record<string, string> = {
  cliente: "Cliente",
  antecedentes: "Antecedentes",
  actualidad: "Actualidad",
  problema_central: "Problema central",
  insights: "Insights",
  oportunidades: "Oportunidades",
  riesgos: "Riesgos",
  propuesta_valor: "Propuesta de valor",
  criterios_exito: "Criterios de éxito",
  siguientes_pasos: "Siguientes pasos",
  mensajes_clave: "Mensajes clave",
  momentos_clave: "Momentos clave",
  participantes: "Participantes",
  acuerdos: "Acuerdos",
  desacuerdos: "Desacuerdos",
  compromisos: "Compromisos",
  tono_general: "Tono general",
  kpis_metricas: "KPIs y métricas",
  intentos_previos: "Intentos previos",
  quick_wins: "Victorias rápidas",
  limitaciones: "Limitaciones",
  datos_disponibles: "Datos disponibles",
  nombre: "Nombre",
  tamano: "Tamaño",
  industria: "Industria",
  contexto_clave: "Contexto clave",
  tiempo: "Tiempo",
  politicas: "Políticas",
  presupuesto: "Presupuesto",
  recursos_humanos: "Recursos humanos",
  recursos_tecnicos: "Recursos técnicos",
}

/** Título legible. Con una clave desconocida devuelve algo presentable. */
function titulo(clave: string): string {
  if (TITULOS[clave]) return TITULOS[clave]
  const limpio = clave.replace(/_/g, " ")
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

/** Decide si un valor merece pintarse. Recursivo: un objeto cuyos campos
 *  están todos vacíos tampoco aporta. */
function tieneContenido(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false
  if (typeof valor === "string") return valor.trim() !== ""
  if (Array.isArray(valor)) return valor.some(tieneContenido)
  if (typeof valor === "object") {
    return Object.values(valor as Record<string, unknown>).some(tieneContenido)
  }
  return true
}

/** Lo mismo que se ve, en texto plano, para el botón de copiar. */
function resumenComoTexto(data: unknown, nivel = 0): string {
  if (!tieneContenido(data)) return ""

  const sangria = "  ".repeat(nivel)

  if (typeof data === "string" || typeof data === "number") {
    return sangria + String(data)
  }

  if (Array.isArray(data)) {
    return data
      .filter(tieneContenido)
      .map((v) => sangria + "- " + resumenComoTexto(v).trim())
      .join("\n")
  }

  if (typeof data === "object") {
    return Object.entries(data as Record<string, unknown>)
      .filter(([, v]) => tieneContenido(v))
      .map(([k, v]) => sangria + titulo(k) + "\n" + resumenComoTexto(v, nivel + 1))
      .join("\n\n")
  }

  return ""
}

function ValorResumen({ valor }: { valor: unknown }) {
  if (typeof valor === "string" || typeof valor === "number") {
    return (
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--theme-text-primary)" }}
      >
        {valor}
      </p>
    )
  }

  if (Array.isArray(valor)) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {valor.filter(tieneContenido).map((item, i) => (
          <li
            key={i}
            className="text-sm leading-relaxed"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {item && typeof item === "object" ? (
              <ValorResumen valor={item} />
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    )
  }

  if (valor && typeof valor === "object") {
    const campos = Object.entries(valor as Record<string, unknown>).filter(
      ([, v]) => tieneContenido(v)
    )

    return (
      <div className="space-y-3">
        {campos.map(([clave, v]) => (
          <div key={clave}>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--theme-text-primary)" }}
            >
              {titulo(clave)}
            </p>
            <ValorResumen valor={v} />
          </div>
        ))}
      </div>
    )
  }

  return null
}

function ResumenTranscript({ data }: { data: unknown }) {
  const secciones =
    data && typeof data === "object" && !Array.isArray(data)
      ? Object.entries(data as Record<string, unknown>).filter(([, v]) =>
          tieneContenido(v)
        )
      : []

  if (secciones.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--theme-text-secondary)" }}>
        El resumen llegó sin contenido: todas sus secciones están vacías.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {secciones.map(([clave, valor]) => (
        <section key={clave}>
          <h4
            className="mb-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--theme-text-secondary)" }}
          >
            {titulo(clave)}
          </h4>

          <ValorResumen valor={valor} />
        </section>
      ))}
    </div>
  )
}
