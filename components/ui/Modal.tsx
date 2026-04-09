'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'loading';
}

export function Modal({ isOpen, onClose, title, message, type = 'success' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200'
    },
    loading: {
      icon: Loader2,
      color: 'text-[#0A2B4E]',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    }
  };

  const Icon = icons[type].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-zoom-in">
        <div className="p-6">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Icono */}
          <div className={`w-16 h-16 ${icons[type].bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {type === 'loading' ? (
              <Icon className={`w-8 h-8 ${icons[type].color} animate-spin`} />
            ) : (
              <Icon className={`w-8 h-8 ${icons[type].color}`} />
            )}
          </div>
          
          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>
          
          {/* Mensaje */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>
          
          {/* Botón */}
          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-300 ${
              type === 'success'
                ? 'bg-[#0A2B4E] text-white hover:bg-[#1E4A76]'
                : type === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-[#0A2B4E] text-white hover:bg-[#1E4A76]'
            }`}
          >
            {type === 'loading' ? 'Enviando...' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
}