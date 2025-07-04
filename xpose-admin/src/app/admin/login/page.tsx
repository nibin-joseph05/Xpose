'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        router.push('/admin');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Xpose Admin-Login</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
          <div className="particle-layer pointer-events-none"></div>
          <div className="shimmer-layer pointer-events-none"></div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 transform transition-all duration-300 hover:scale-105 relative z-10 animate-fade-in-up"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center">
            <div className="mb-6 relative w-32 h-32 flex items-center justify-center animate-pulse-light">
              <Image
                src="/logo/xpose-logo-round.png"
                alt="Xpose Logo"
                width={120}
                height={120}
                className="rounded-full shadow-lg border-4 border-blue-600 animate-spin-slow z-10"
              />
              <div className="absolute inset-0 rounded-full animate-ripple-effect pointer-events-none"></div>
            </div>

            <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg animate-text-pop">
              Xpose Admin-Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Unlock the dashboard, secure the city
            </p>
          </motion.div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" value="true" />

            {error && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="p-3 bg-red-900 bg-opacity-30 border-l-4 border-red-500 text-red-300 rounded-md flex items-center gap-3 animate-shake"
              >
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-medium text-red-400">Authentication Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200 animate-float">
                  Forgot your password?
                </a>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${loading ? 'opacity-75 cursor-not-allowed' : 'shadow-lg hover:shadow-xl animate-button-glow'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      <style jsx>{`
        .particle-layer, .shimmer-layer {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .particle-layer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 10% 20%, rgba(59,130,246,0.1) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(139,92,246,0.1) 0%, transparent 40%);
          animation: background-move 15s infinite alternate ease-in-out;
        }

        .shimmer-layer::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255,255,255,0.05) 5%,
            rgba(255,255,255,0.1) 10%,
            transparent 15%
          );
          transform: rotate(45deg);
          animation: shimmer-background 8s infinite linear;
        }

        @keyframes background-move {
          0% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          50% {
            transform: translate(5%, 5%);
            opacity: 0.3;
          }
          100% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
        }

        @keyframes shimmer-background {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 8s linear infinite;
        }

        @keyframes pulseLight {
          0% { box-shadow: 0 0 0px rgba(59,130,246,0.7), 0 0 0px rgba(139,92,246,0.7); }
          50% { box-shadow: 0 0 20px rgba(59,130,246,0.7), 0 0 30px rgba(139,92,246,0.7); }
          100% { box-shadow: 0 0 0px rgba(59,130,246,0.7), 0 0 0px rgba(139,92,246,0.7); }
        }
        .animate-pulse-light {
          animation: pulseLight 4s infinite ease-in-out;
        }

        @keyframes textPop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-text-pop {
          animation: textPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }

        @keyframes buttonGlow {
          0% { box-shadow: 0 0 5px rgba(59,130,246,0.5), 0 0 10px rgba(139,92,246,0.5); }
          50% { box-shadow: 0 0 15px rgba(59,130,246,0.8), 0 0 25px rgba(139,92,246,0.8); }
          100% { box-shadow: 0 0 5px rgba(59,130,246,0.5), 0 0 10px rgba(139,92,246,0.5); }
        }
        .animate-button-glow {
          animation: buttonGlow 3s infinite alternate ease-in-out;
        }

        @keyframes fadeInOnLoad {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInOnLoad 1s ease-out forwards;
        }

        @keyframes rippleEffect {
          0% { transform: scale(0.7); opacity: 0.5; border-color: rgba(59,130,246,0.7); }
          100% { transform: scale(1.4); opacity: 0; border-color: rgba(59,130,246,0); }
        }
        .animate-ripple-effect {
          border: 2px solid rgba(59,130,246,0);
          animation: rippleEffect 2s infinite ease-out;
        }
      `}</style>
    </>
  );
}