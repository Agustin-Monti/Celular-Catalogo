'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, MessageCircle, Smartphone, Package } from 'lucide-react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo', icon: Smartphone },
    { href: '/accesorios', label: 'Accesorios', icon: Package, isNew: true },
    { href: '/reparaciones', label: 'Servicios' },
    { href: '/contacto', label: 'Contacto' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg py-2'
          : 'bg-white/95 backdrop-blur-sm shadow-md py-3'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative">
              <div className={`relative rounded-xl overflow-hidden transition-all duration-300 bg-white ${
                isScrolled 
                  ? 'w-9 h-9 md:w-11 md:h-11' 
                  : 'w-10 h-10 md:w-12 md:h-12'
              } shadow-md group-hover:shadow-lg group-hover:scale-105`}>
                <Image
                  src="/images/logoo2.png"
                  alt="CC Reparaciones Móviles"
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 40px, 48px"
                  priority
                />
              </div>
              <div className={`absolute -top-1 -right-1 w-2 h-2 md:w-2.5 md:h-2.5 bg-[#FFC107] rounded-full animate-pulse ${
                isScrolled ? 'opacity-80' : 'opacity-100'
              }`}></div>
            </div>
            
            <div className="flex flex-col">
              <span className={`font-bold text-[#0A2B4E] leading-tight transition-all duration-300 ${
                isScrolled 
                  ? 'text-xs md:text-base' 
                  : 'text-sm md:text-xl'
              }`}>
                CC Reparaciones
              </span>
              <span className={`text-[#2E7D32] font-semibold -mt-0.5 transition-all duration-300 ${
                isScrolled 
                  ? 'text-[8px] md:text-[10px]' 
                  : 'text-[9px] md:text-xs'
              }`}>
                Móviles
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                  isActive(link.href)
                    ? 'text-[#0A2B4E]'
                    : 'text-gray-600 hover:text-[#0A2B4E]'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
                {link.isNew && (
                  <span className="absolute -top-2 -right-6 text-[10px] font-bold bg-[#FFC107] text-[#0A2B4E] px-1.5 py-0.5 rounded-full animate-pulse">
                    NUEVO
                  </span>
                )}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FFC107] rounded-full animate-slide-in"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Botones de acción - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/cc.reparaciones.moviles" // Reemplaza con tu URL de Instagram
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#F56040] text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
              aria-label="Instagram"
            >
              <FaInstagram className="w-5 h-5" />
              <span className="text-sm font-medium">Instagram</span>
            </a>
            {/* WhatsApp */}
            <a
              href="https://wa.me/521234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20b859] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <FaWhatsapp className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menú"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-[#0A2B4E]" />
            ) : (
              <Menu className="w-5 h-5 text-[#0A2B4E]" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 animate-slide-down">
            <div className="flex flex-col space-y-2">
              
              
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-[#0A2B4E] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                  {link.isNew && (
                    <span className="ml-2 text-[10px] font-bold bg-[#FFC107] text-[#0A2B4E] px-1.5 py-0.5 rounded-full">
                      NUEVO
                    </span>
                  )}
                </Link>
              ))}
              
              <div className="h-px bg-gray-200 my-2"></div>
              
              {/* Instagram - Móvil */}
              <a
                href="https://www.instagram.com/cc.reparaciones.moviles" // Reemplaza con tu URL de Instagram
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#F56040] text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaInstagram className="w-5 h-5" />
                Instagram
              </a>
              {/* WhatsApp - Móvil */}
              <a
                href="https://wa.me/521234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#20b859] hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaWhatsapp className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}