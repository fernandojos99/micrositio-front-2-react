export interface Colaborador {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  colaboradores: Colaborador[];
  id_categoria: number; // Agregado para manejar la categoría del proyecto
  fecha_inicio: string;
  fecha_fin_estimada: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'COMPLETADO';
  id_lider: number; // Agregado para manejar el líder del proyecto

}

export interface CreateProyectoData {
  nombre: string;
  descripcion: string;
  colaboradores: string[]; // IDs de colaboradores
}