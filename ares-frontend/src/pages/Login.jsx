import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff, Shield, Wifi } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AresRobot from "../components/AresRobot";
import { buildErrors, isRequired, isValidEmail } from "../utils/validators";

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]         = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(er => ({ ...er, [key]: undefined }));
    setLoginErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = buildErrors({
      email: [
        { check: isRequired(form.email),   message: "El email es requerido." },
        { check: isValidEmail(form.email), message: "Email no válido."       },
      ],
      password: [
        { check: isRequired(form.password), message: "La contraseña es requerida." },
      ],
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setLoginErr("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setLoginErr(err.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (key) =>
    `w-full px-4 py-3 rounded-xl text-sm bg-white/5 border backdrop-blur-sm
     text-white placeholder-white/30 focus:outline-none focus:ring-2
     focus:ring-white/20 transition-all
     ${errors[key] ? "border-red-500/60" : "border-white/10 hover:border-white/20"}`;

  return (
    <div className="min-h-screen flex bg-[#080808] overflow-hidden">

      {/* ── Panel izquierdo: Spline 3D (70%) ── */}
      <div className="hidden lg:flex lg:w-[70%] relative overflow-hidden">

        {/* Spline ocupa todo */}
        <div className="absolute inset-0 z-10">
          <AresRobot />
        </div>

        {/* Texto inferior sobre la escena */}
        <div className="absolute bottom-10 left-0 right-0 text-center z-20 px-8 pointer-events-none">
          <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-2">
            Sistema de Control Autónomo
          </p>
          <h2 className="text-white/80 text-2xl font-bold tracking-tight">
            Asistente Robótico de{" "}
            <span className="text-white">Exploración y Salvamento</span>
          </h2>

          <div className="flex items-center justify-center gap-6 mt-5">
            {[
              { icon: Wifi,   label: "Sistema conectado", color: "text-emerald-400" },
              { icon: Shield, label: "Protocolo seguro",  color: "text-white/60"    },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse ${color}`} />
                <Icon size={12} className={`${color} opacity-70`} />
                <span className="text-white/40 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Línea divisora con glow blanco sutil */}
        <div className="absolute right-0 top-0 bottom-0 w-px
                        bg-gradient-to-b from-transparent via-white/10 to-transparent z-20" />
      </div>

      {/* ── Panel derecho: Formulario (30%) ── */}
      <div className="w-full lg:w-[30%] flex flex-col items-center justify-center
                      px-8 py-12 relative bg-[#0a0a0a]">

        {/* Glow sutil arriba */}
        <div className="absolute top-0 left-0 right-0 h-px
                        bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 w-full max-w-sm">

          {/* Logo y título */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                            bg-white/5 border border-white/10 mb-4">
              <svg className="fill-white" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
                <path d="M31.956 14.8C31.372 6.92 25.08.628 17.2.044V5.76a9.04 9.04 0 0 0 9.04 9.04h5.716ZM14.8 26.24v5.716C6.92 31.372.63 25.08.044 17.2H5.76a9.04 9.04 0 0 1 9.04 9.04Zm11.44-9.04h5.716c-.584 7.88-6.876 14.172-14.756 14.756V26.24a9.04 9.04 0 0 1 9.04-9.04ZM.044 14.8C.63 6.92 6.92.628 14.8.044V5.76a9.04 9.04 0 0 1-9.04 9.04H.044Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Bienvenido a ARES
            </h1>
            <p className="text-white/30 text-sm mt-1">
              Acceso exclusivo para personal autorizado
            </p>
          </div>

          {/* Error general */}
          {loginErr && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20
                            text-red-400 text-sm text-center">
              {loginErr}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-medium text-white/40
                                uppercase tracking-wider mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange("email", e.target.value)}
                placeholder="admin@ares.pe"
                autoComplete="email"
                className={inputClass("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40
                                uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => handleChange("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${inputClass("password")} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                             text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2
                         bg-white hover:bg-white/90 disabled:opacity-40
                         text-black text-sm font-semibold rounded-xl
                         transition-all duration-200
                         hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin text-black" /> Verificando...</>
                : "Ingresar al sistema"
              }
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-white/15 text-xs mt-10">
            ARES Admin Panel · Acceso restringido
          </p>
        </div>
      </div>

    </div>
  );
}