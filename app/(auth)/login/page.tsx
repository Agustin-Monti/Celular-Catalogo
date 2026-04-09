'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Loader2, Smartphone, Eye, EyeOff, Home } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const goToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2B4E] via-[#1E4A76] to-[#0A2B4E] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFC107] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2E7D32] rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo y título */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105">
              <Smartphone className="w-12 h-12 text-[#0A2B4E]" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Panel Administrativo
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            CC Reparaciones Móviles
          </p>
          <div className="w-16 h-0.5 bg-[#FFC107] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1 ml-1">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all duration-200"
                  placeholder="admin@ccreparaciones.com"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#0A2B4E] transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-[#0A2B4E] transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border-2 border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E7D32] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>

          {/* Mensaje de contacto al desarrollador */}
          <div className="mt-6 pt-4 border-t border-gray-600/30">
            <div className="text-center">
              <p className="text-xs text-gray-300">
                ¿Necesitas crear un usuario o restablecer tu contraseña?
              </p>
              <p className="inline-flex items-center gap-2 mt-2 text-sm text-[#FFC107] hover:text-[#FFD700] transition-colors group">
                Contacta con el desarrollador
              </p>
            </div>
          </div>
        </form>

        {/* Botón Home - NUEVO */}
        <div className="flex justify-center pt-4">
          <button
            onClick={goToHome}
            className="group flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:bg-white/20 group-hover:border-white/50 transition-all duration-300">
              <Home className="w-7 h-7 text-white group-hover:text-[#FFC107] transition-colors" />
            </div>
            <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
              Volver al inicio
            </span>
          </button>
        </div>

        {/* Información adicional */}
        <div className="text-center text-xs text-gray-400">
          <p>Acceso restringido - Solo personal autorizado</p>
        </div>
      </div>
    </div>
  );
}