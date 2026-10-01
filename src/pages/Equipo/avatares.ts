/**
 * Avatares por defecto para los miembros sin foto.
 *
 * Son 20 SVG de DiceBear guardados en src/assets/avatares (ver su LEEME.md):
 * van en el bundle y no se hace ninguna petición a la API de DiceBear.
 */

const modulos = import.meta.glob<string>('@/assets/avatares/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const avatares = Object.keys(modulos)
  .sort()
  .map((ruta) => modulos[ruta]);

/**
 * Avatar asignado a un empleado. El reparto parece aleatorio pero es estable:
 * sale de un hash del id, así que cada persona conserva el mismo avatar al
 * recargar y al filtrar la lista.
 */
export function avatarPorDefecto(id: string | number): string {
  const texto = String(id);
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  // Mezcla final (fmix32 de MurmurHash3) para que ids consecutivos no
  // repitan patrón de avatares
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  hash >>>= 0;
  return avatares[hash % avatares.length];
}
