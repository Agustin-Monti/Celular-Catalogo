'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  MessageCircle
} from 'lucide-react';
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter,
  FaWhatsapp 
} from 'react-icons/fa';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/reparaciones', label: 'Servicios' },
    { href: '/contacto', label: 'Contacto' },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook', color: '#1877f2' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram', color: '#e4405f' },
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter', color: '#1da1f2' },
    { icon: FaWhatsapp, href: 'https://wa.me/521234567890', label: 'WhatsApp', color: '#25D366' },
  ];

  const contactInfo = [
    { icon: MapPin, text: 'Av. Principal #123, Centro, Ciudad de México', color: '#FFC107' },
    { icon: Phone, text: '+52 55 1234 5678', color: '#2E7D32' },
    { icon: Mail, text: 'info@ccreparaciones.com', color: '#0A2B4E' },
    { icon: Clock, text: 'Lun-Vie: 9am - 7pm | Sáb: 9am - 3pm', color: '#FFC107' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/images/logoo2.png"
                  alt="CC Reparaciones Móviles"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xl font-bold">CC Reparaciones</span>
                <span className="block text-xs text-[#FFC107]">Móviles</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Reparación de celulares y venta de equipos nuevos y usados. 
              Calidad, garantía y los mejores precios.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: '#1f2937' }}
                >
                  <social.icon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#FFC107]">Enlaces rápidos</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#FFC107] transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-[#FFC107] rounded-full"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#FFC107]">Contacto</h4>
            <ul className="space-y-3">
              {contactInfo.map((info, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-400">
                  <info.icon className="w-5 h-5 mt-0.5" style={{ color: info.color }} />
                  <span className="text-sm">{info.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Horarios y ubicación */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#FFC107]">Ubicación</h4>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="aspect-w-16 aspect-h-9 mb-3">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3363.2672738267233!2d-59.35609126685707!3d-32.545711404279096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sar!4v1776088092535!5m2!1ses!2sar"
                  title="Ubicación de CC Reparaciones Móviles en Google Maps"
                  width="100%"
                  height="120"
                  style={{ border: 0, borderRadius: '0.5rem' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <p className="text-xs text-gray-400 text-center">
                ¡Visítanos! Estamos en el centro de la ciudad
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} CC Reparaciones Móviles. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
