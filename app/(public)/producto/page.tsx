import { redirect } from 'next/navigation';

export default function ProductoIndexPage() {
  // Redirigir al catálogo ya que no hay una página de listado de productos individual
  redirect('/catalogo');
}