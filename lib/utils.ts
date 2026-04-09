// Función para formatear números de manera consistente
export function formatPrice(price: number): string {
  // Usar formato sin separadores de miles para evitar problemas de hidratación
  // o usar una función que sea consistente
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Alternativa: formateo simple sin dependencias locales
export function formatPriceSimple(price: number): string {
  // Formato simple: separador de miles con comas
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}