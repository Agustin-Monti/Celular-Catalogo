'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageCircle,
  Navigation,
  Building,
  ChevronRight
} from 'lucide-react';
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter,
  FaWhatsapp 
} from 'react-icons/fa';
import { Modal } from '@/components/ui/Modal';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'loading',
    title: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setModal({
      isOpen: true,
      type: 'loading',
      title: 'Enviando mensaje',
      message: 'Por favor espera, estamos procesando tu mensaje...',
    });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el mensaje');
      }

      setModal({
        isOpen: true,
        type: 'success',
        title: '¡Mensaje enviado!',
        message: 'Nos pondremos en contacto contigo a la brevedad.',
      });
      
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error: any) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Ocurrió un error al enviar el mensaje. Intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { 
      icon: MapPin, 
      title: 'Dirección', 
      text: 'Av. Principal #123, Centro, CDMX',
      details: 'Entre calles Morelos y Juárez',
      color: '#FFC107',
      link: 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3363.2672738267233!2d-59.35609126685707!3d-32.545711404279096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sar!4v1776088092535!5m2!1ses!2sar'
    },
    { 
      icon: Phone, 
      title: 'Teléfono', 
      text: '+52 55 1234 5678',
      details: 'Llamadas y WhatsApp',
      color: '#2E7D32',
      link: 'tel:+521234567890'
    },
    { 
      icon: Mail, 
      title: 'Email', 
      text: 'info@ccreparaciones.com',
      details: 'Respuesta en 24h',
      color: '#0A2B4E',
      link: 'mailto:info@ccreparaciones.com'
    },
    { 
      icon: Clock, 
      title: 'Horario', 
      text: 'Lun-Vie 9am-7pm',
      details: 'Sáb 9am-3pm | Dom cerrado',
      color: '#FFC107'
    },
  ];

  const socialLinks = [
    { icon: MessageCircle, name: 'WhatsApp', href: 'https://wa.me/521234567890', color: '#25D366' },
    { icon: FaInstagram, name: 'Instagram', href: 'https://instagram.com', color: '#E4405F' },
    { icon: FaFacebook, name: 'Facebook', href: 'https://facebook.com', color: '#1877F2' },
    { icon: FaTwitter, name: 'Twitter', href: 'https://twitter.com', color: '#1DA1F2' },
  ];

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#0A2B4E] to-[#1E4A76] rounded-xl mb-4 shadow-lg">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0A2B4E] mb-2">
            Contáctanos
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#FFC107] to-[#2E7D32] mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Información de contacto - 2 columnas */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#0A2B4E]" />
                Información de contacto
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 mb-5">
                {contactInfo.map((info, idx) => (
                  <a
                    key={idx}
                    href={info.link}
                    target={info.link ? '_blank' : undefined}
                    rel={info.link ? 'noopener noreferrer' : undefined}
                    className="group block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${info.color}15` }}
                      >
                        <info.icon className="w-5 h-5" style={{ color: info.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{info.title}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">{info.text}</p>
                        {info.details && (
                          <p className="text-xs text-gray-400 mt-1">{info.details}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFC107] transition-colors" />
                    </div>
                  </a>
                ))}
              </div>

              {/* Redes sociales */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
                <h3 className="font-semibold text-gray-900 mb-3">Síguenos</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
                        style={{ backgroundColor: `${social.color}15` }}
                      >
                        <social.icon className="w-5 h-5" style={{ color: social.color }} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulario de contacto - 3 columnas con mejor aprovechamiento */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#0A2B4E] to-[#1E4A76] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Envíanos un mensaje</h2>
                  <p className="text-gray-300 text-sm mt-0.5">Te responderemos en menos de 24 horas</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent transition-all duration-200"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                        placeholder="juan@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                      placeholder="55 1234 5678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mensaje *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent resize-none"
                      placeholder="¿En qué podemos ayudarte? Cuéntanos tu consulta o solicitud..."
                    ></textarea>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {formData.message.length}/500 caracteres
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#0A2B4E] to-[#1E4A76] text-white py-3 rounded-lg hover:from-[#1E4A76] hover:to-[#0A2B4E] transition-all duration-300 flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    {loading ? 'Enviando mensaje...' : 'Enviar mensaje'}
                  </button>
                  
                  <p className="text-xs text-gray-400 text-center">
                    Tus datos están seguros. No compartiremos tu información con terceros.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
