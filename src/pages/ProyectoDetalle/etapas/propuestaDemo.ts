import type { PropuestaServicio } from '@/services/proyectoEtapaService';

/**
 * Propuesta de servicio de ejemplo, hardcodeada.
 *
 * Es el contenido literal de la presentación de referencia
 * "MMF: Validación y Escalamiento", puesto aquí para poder editar cada campo
 * desde la pestaña Plan de trabajo mientras la generación automática no existe.
 *
 * El día que la etapa 1 hable con la Lambda, esta función se sustituye por esa
 * llamada: la forma de lo que devuelve ya es la definitiva.
 */
export const propuestaDeEjemplo = (nombreProyecto?: string): PropuestaServicio => ({
  titulo: nombreProyecto ? `${nombreProyecto}: Validación y Escalamiento` : 'MMF: Validación y Escalamiento',
  subtitulo:
    'Propuesta de innovación para priorizar features, validar marca y escalar B2B con evidencia de campo',
  contexto: {
    antecedentes: [
      'Experimento pasado para analizar protestas sin resultados concluyentes.',
      'Trabajo previo en préstamos cripto con landing y calculadora ya lanzada.',
      'Migración técnica de Moneyful Flex a SDK en curso por temas fiscales.',
      'Pruebas de branding para cambio de nombre usando agencia o nombres registrados.',
      "Propuesta de colaboración tipo 'colaboratory' para co-crear soluciones B2B.",
      'Requieren priorizar features con data para definir criterios de éxito.',
    ],
    actualidad: [
      'Objetivo explícito: entender qué necesita la unidad de negocio y definir siguientes pasos.',
      'Falta de data y seguimiento para incentivar adopción de pagos cripto.',
      'Necesidad de validar uso real con muchos datos (centenas) para decisiones.',
      'Horizonte temporal de cuatro meses para pruebas e integración de Monato.',
      'Plan paralelo: roadmap basado en data y simultáneamente validación de marca.',
      'Calendario definido: junta marketing lunes, revisión jueves, presentación viernes.',
      'Acordado avanzar con criterios de éxito entregables para tres servicios.',
    ],
    insights: [
      'Necesidad recurrente de pasar de iniciativas sin evidencia a decisiones guiadas por data.',
      'Tensión entre velocidad y disponibilidad de evidencia: requieren comprobar con centenas pero avanzar rápido.',
      'Enfoque en capas: validación, mejora/activación y escalamiento mediante integraciones.',
      'Estrategia B2B depende de evidencia de campo sobre features priorizadas por segmentos.',
      'La validación rápida de marca puede hacerse de forma muy barata en plataformas existentes.',
      'Automatizar reportes semanales habilitaría toma de decisiones sin procesos manuales.',
    ],
  },
  reto:
    '¿Cómo podemos priorizar las necesidades del negocio con evidencia, para acelerar iniciativas de adopción y branding, sin comprometer el presupuesto ni los plazos?',
  etapas: [
    {
      nombre: 'Diagnóstico y Quick Wins',
      etiqueta: 'Clarificación',
      entregables: [
        'Dashboard de insights con datos existentes',
        'Análisis de percepción de marca con recomendaciones',
        'Matriz de priorización de funcionalidades Kano',
      ],
      servicios: [
        { nombre: 'Análisis de marca', precio: 100000 },
        { nombre: 'Análisis descriptivo', precio: 50000 },
        { nombre: 'Kano', precio: 50000 },
      ],
      requerimientos: [
        'Acceso a datos históricos de clientes',
        'Acceso a plataforma de testeo de marca',
        'Lista de usuarios activos para encuestas Kano',
      ],
      criterios_exito: [
        'Obtención de al menos 10 respuestas de test de marca',
        'Dashboard de insights generado y validado',
        'Priorización de al menos 5 features con modelo Kano',
      ],
      decisiones: [
        'Validar si el cambio de nombre mejora percepción',
        'Decidir qué features priorizar según Kano',
        'Determinar si se automatizan reportes',
      ],
    },
    {
      nombre: 'Investigación de Campo y Validación',
      etiqueta: 'Investigación',
      entregables: [
        'Dashboard de insights de campo con perfiles reales',
        'Matriz de oportunidades priorizadas',
        'Perfiles de usuario y necesidades priorizadas',
      ],
      servicios: [
        { nombre: 'Expo quest', precio: 100000 },
        { nombre: 'Problem solution fit', precio: 100000 },
      ],
      requerimientos: [
        'Identificar y contactar al menos 10 usuarios activos',
        'Acceso a eventos o exposiciones relevantes',
        'Apoyo logístico para entrevistas de campo',
      ],
      criterios_exito: [
        'Realizar al menos 10 entrevistas presenciales',
        'Obtener matriz de priorización con al menos 3 segmentos',
        'Validar hipótesis de necesidades con evidencia de campo',
      ],
      decisiones: [
        'Validar si las necesidades detectadas justifican inversión',
        'Decidir segmento objetivo para B2B',
        'Ajustar propuesta de valor basado en entrevistas',
      ],
    },
    {
      nombre: 'Escalamiento y Colaboración B2B',
      etiqueta: 'Alianzas',
      entregables: [
        'Recopilación de iniciativas de colaboración',
        'Plan de alianzas B2B',
        'Seguimiento con administrador de proyecto',
      ],
      servicios: [{ nombre: 'Colaboratory', precio: 150000 }],
      requerimientos: [
        'Identificar unidades de negocio potenciales',
        'Aprobación de presupuesto para colaboración',
        'Disponibilidad de equipo de coordinación',
      ],
      criterios_exito: [
        'Firma de al menos 2 acuerdos de colaboración',
        'Lanzamiento de al menos 1 proyecto transversal',
        'Establecimiento de métricas de seguimiento',
      ],
      decisiones: [
        'Decidir si escalar alianzas B2B',
        'Seleccionar socios estratégicos',
        'Definir roadmap de integración SDK',
      ],
    },
  ],
  brief: {
    titulo: 'Sesión de Brief de Iniciativas de MMF Preview',
    objetivo:
      'Entender las iniciativas actuales del equipo de retail (MMF Preview) para:',
    objetivos: [
      'Incentivar adopción de pagos cripto mediante analytics',
      'Validar cambio de nombre y branding de forma rápida y barata',
      'Construir caso de validación reutilizable para B2B',
    ],
  },
  moneda: 'MXN',
  origen: 'plantilla',
});

/** Propuesta en blanco, con la misma estructura y una etapa para empezar. */
export const propuestaVacia = (nombreProyecto?: string): PropuestaServicio => ({
  titulo: nombreProyecto ?? '',
  subtitulo: '',
  contexto: { antecedentes: [], actualidad: [], insights: [] },
  reto: '',
  etapas: [
    {
      nombre: 'Etapa 1',
      etiqueta: '',
      entregables: [],
      servicios: [],
      requerimientos: [],
      criterios_exito: [],
      decisiones: [],
    },
  ],
  brief: { titulo: '', objetivo: '', objetivos: [] },
  moneda: 'MXN',
  origen: 'plantilla',
});
