"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 text-white font-sans overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
        <div className="particle-layer pointer-events-none"></div>
        <div className="shimmer-layer pointer-events-none"></div>
      </div>

      <header className="relative z-10 flex justify-center items-center py-12 px-4">
        <div
          className={`relative ${
            hasAnimated ? "animate-logo-reveal" : "opacity-0 scale-0"
          }`}
        >
          <Image
            src="/logo/xpose-logo-round.png"
            alt="Xpose Logo"
            width={180}
            height={180}
            className="rounded-full shadow-2xl transform transition-transform duration-500 ease-out border-4 border-blue-600 hover:scale-105 animate-pulse-light"
          />
          <div className="absolute inset-0 rounded-full animate-ripple-effect pointer-events-none"></div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <section className="text-center mb-20">
          <h1
            className={`text-6xl md:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg ${
              hasAnimated ? "animate-text-bounce-in" : "opacity-0 -translate-y-10"
            }`}
          >
            Xpose
          </h1>
          <h2
            className={`text-2xl md:text-3xl font-semibold mb-8 text-gray-200 ${
              hasAnimated ? "animate-slide-in-up delay-300" : "opacity-0 translate-y-10"
            }`}
          >
            AI-Enhanced Crime Reporting with Blockchain Security
          </h2>
          <p
            className={`text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed ${
              hasAnimated ? "animate-fade-in delay-500" : "opacity-0"
            }`}
          >
            A secure, anonymous, and intelligent platform for reporting crimes,
            leveraging AI for swift processing and blockchain for immutable record-keeping.
          </p>

          <div
            className={`flex flex-col sm:flex-row justify-center gap-6 ${
              hasAnimated ? "animate-fade-in delay-700" : "opacity-0"
            }`}
          >
            <Link
              href="/admin/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-70 motion-safe:animate-button-pop"
            >
              Admin Login
            </Link>
            <Link
              href="/police/login"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-70 motion-safe:animate-button-pop delay-150"
            >
              Police Login
            </Link>
          </div>
        </section>

        <section className="mb-20">
          <h3
            className={`text-3xl md:text-4xl font-bold mb-12 text-center text-blue-400 ${
              hasAnimated ? "animate-slide-in-up delay-900" : "opacity-0 translate-y-10"
            }`}
          >
            Core Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🔒",
                title: "Secure & Anonymous",
                description:
                  "OTP authentication ensures security, with options for anonymous reporting.",
              },
              {
                icon: "🤖",
                title: "AI-Powered Analysis",
                description:
                  "Intelligent spam detection and urgency classification using advanced ML.",
              },
              {
                icon: "⛓️",
                title: "Blockchain Integrity",
                description:
                  "Go-based blockchain for tamper-proof, immutable crime records.",
              },
              {
                icon: "📱",
                title: "Intuitive Mobile App",
                description:
                  "Cross-platform reporting via a user-friendly Flutter application.",
              },
              {
                icon: "👮",
                title: "Dedicated Police Portal",
                description:
                  "Streamlined interface for law enforcement to access and manage reports efficiently.",
              },
              {
                icon: "📊",
                title: "Admin Oversight",
                description:
                  "Next.js dashboard for comprehensive report management and insightful analytics.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`bg-gray-800 bg-opacity-60 p-8 rounded-xl border border-gray-700 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 group ${
                  hasAnimated ? `animate-card-fade-in delay-${1100 + index * 100}` : "opacity-0 scale-95"
                }`}
              >
                <div className="text-5xl mb-6 text-center group-hover:animate-bounce-icon">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold mb-3 text-white text-center">
                  {feature.title}
                </h4>
                <p className="text-gray-300 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h3
            className={`text-3xl md:text-4xl font-bold mb-12 text-center text-blue-400 ${
              hasAnimated ? "animate-slide-in-up delay-1500" : "opacity-0 translate-y-10"
            }`}
          >
            How It Works
          </h3>
          <div
            className={`bg-gray-800 bg-opacity-60 p-8 rounded-xl shadow-2xl border border-gray-700 ${
              hasAnimated ? "animate-fade-in delay-1700" : "opacity-0"
            }`}
          >
            <ol className="space-y-8 relative before:absolute before:left-3 before:top-0 before:h-full before:w-0.5 before:bg-blue-600 before:bg-opacity-50">
              {[
                "Citizen submits a detailed report (text, media, location) through the mobile app.",
                "AI microservice instantly processes the report for spam detection and urgency classification.",
                "Validated reports are securely stored on the blockchain, ensuring an immutable record.",
                "Admin dashboard intelligently prioritizes and routes reports to relevant authorities.",
                "Police officers access comprehensive reports with all attached evidence via their portal.",
                "Reporters receive real-time status updates and notifications on their submitted cases.",
              ].map((step, index) => (
                <li
                  key={index}
                  className={`ml-10 text-lg text-gray-200 relative ${
                    hasAnimated ? `animate-list-item-pop delay-${1800 + index * 150}` : "opacity-0 translate-x-[-20px]"
                  }`}
                >
                  <span className="absolute -left-10 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section>
          <h3
            className={`text-3xl md:text-4xl font-bold mb-12 text-center text-blue-400 ${
              hasAnimated ? "animate-slide-in-up delay-2500" : "opacity-0 translate-y-10"
            }`}
          >
            Technology Backbone
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: "Flutter", purpose: "Cross-Platform Mobile App" },
              { name: "Next.js", purpose: "Admin Dashboard & Web Portal" },
              { name: "Spring Boot", purpose: "Robust Backend API" },
              { name: "FastAPI", purpose: "AI & ML Microservice" },
              { name: "Go", purpose: "Decentralized Blockchain" },
              { name: "PostgreSQL", purpose: "Reliable Data Storage" },
              { name: "Firebase", purpose: "Seamless Authentication" },
              { name: "Gemini API", purpose: "Intelligent Text Processing" },
            ].map((tech, index) => (
              <div
                key={index}
                className={`bg-gray-800 bg-opacity-60 p-6 rounded-lg border border-gray-700 text-center shadow-md hover:border-purple-500 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
                  hasAnimated ? `animate-tech-fade-in delay-${2700 + index * 100}` : "opacity-0 scale-90"
                }`}
              >
                <h4 className="font-bold text-xl text-blue-400 mb-1">
                  {tech.name}
                </h4>
                <p className="text-sm text-gray-400">{tech.purpose}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-20 py-8 text-center text-gray-500 text-sm border-t border-gray-800 relative z-10">
        <p className="mb-1">
          &copy; {new Date().getFullYear()} Xpose Crime Reporting System. All rights reserved.
        </p>
        <p>Crafted with purpose by Nibin Joseph</p>
      </footer>

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

        @keyframes logoReveal {
          0% { opacity: 0; transform: scale(0.5) translateY(50px) rotate(-15deg); }
          60% { opacity: 1; transform: scale(1.1) translateY(-10px) rotate(5deg); }
          100% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); }
        }
        .animate-logo-reveal {
          animation: logoReveal 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
        }

        @keyframes textBounceIn {
          0% { opacity: 0; transform: translateY(-50px) scale(0.8); }
          60% { opacity: 1; transform: translateY(10px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-text-bounce-in {
          animation: textBounceIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-up {
          animation: slideInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
          opacity: 0;
        }

        @keyframes buttonPop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-button-pop {
          animation: buttonPop 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          opacity: 0;
        }

        @keyframes cardFadeIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-card-fade-in {
          animation: cardFadeIn 0.7s ease-out forwards;
          opacity: 0;
        }

        @keyframes listItemPop {
          0% { opacity: 0; transform: translateX(-20px) scale(0.9); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-list-item-pop {
          animation: listItemPop 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          opacity: 0;
        }

        @keyframes techFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-tech-fade-in {
          animation: techFadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        @keyframes bounceIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .group:hover .group-hover\:animate-bounce-icon {
          animation: bounceIcon 0.5s ease-in-out;
        }

        @keyframes pulseLight {
          0% { box-shadow: 0 0 0px rgba(59,130,246,0.7), 0 0 0px rgba(139,92,246,0.7); }
          50% { box-shadow: 0 0 20px rgba(59,130,246,0.7), 0 0 30px rgba(139,92,246,0.7); }
          100% { box-shadow: 0 0 0px rgba(59,130,246,0.7), 0 0 0px rgba(139,92,246,0.7); }
        }
        .animate-pulse-light {
          animation: pulseLight 4s infinite ease-in-out;
        }

        @keyframes rippleEffect {
          0% { transform: scale(0.7); opacity: 0.5; border-color: rgba(59,130,246,0.7); }
          100% { transform: scale(1.4); opacity: 0; border-color: rgba(59,130,246,0); }
        }
        .animate-ripple-effect {
          border: 2px solid rgba(59,130,246,0);
          animation: rippleEffect 2s infinite ease-out;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-900 { animation-delay: 0.9s; }
        .delay-1100 { animation-delay: 1.1s; }
        .delay-1200 { animation-delay: 1.2s; }
        .delay-1300 { animation-delay: 1.3s; }
        .delay-1400 { animation-delay: 1.4s; }
        .delay-1500 { animation-delay: 1.5s; }
        .delay-1600 { animation-delay: 1.6s; }
        .delay-1700 { animation-delay: 1.7s; }
        .delay-1800 { animation-delay: 1.8s; }
        .delay-1950 { animation-delay: 1.95s; }
        .delay-2100 { animation-delay: 2.1s; }
        .delay-2250 { animation-delay: 2.25s; }
        .delay-2400 { animation-delay: 2.4s; }
        .delay-2500 { animation-delay: 2.5s; }
        .delay-2700 { animation-delay: 2.7s; }
        .delay-2800 { animation-delay: 2.8s; }
        .delay-2900 { animation-delay: 2.9s; }
        .delay-3000 { animation-delay: 3.0s; }
        .delay-3100 { animation-delay: 3.1s; }
        .delay-3200 { animation-delay: 3.2s; }
        .delay-3300 { animation-delay: 3.3s; }
        .delay-3400 { animation-delay: 3.4s; }
      `}</style>
    </div>
  );
}