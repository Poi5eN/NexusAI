import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

import {
  FaLinkedinIn,
  FaGithub,
  FaRedditAlien,
  FaGlobe,
} from 'react-icons/fa';

import { RiTwitterXFill } from 'react-icons/ri';

import { HiOutlineMail } from 'react-icons/hi';

import usePersonaStore from '../stores/personaStore';
import ThemeToggle from '../components/ThemeToggle';

export default function TeamPage() {
  const navigate = useNavigate();

  const { theme } = usePersonaStore();

  const isDark = theme === 'dark';

  const socials = [
    {
      icon: FaLinkedinIn,
      url: 'https://linkedin.com/in/gouravkumarupadhyay',
      label: 'LinkedIn',
      color: '#0077B5',
      glow: 'rgba(0,119,181,0.35)',
    },

    {
      icon: FaGithub,
      url: 'https://github.com/poi5en',
      label: 'GitHub',
      color: isDark ? '#ffffff' : '#111111',
      glow: 'rgba(255,255,255,0.18)',
    },

    {
      icon: RiTwitterXFill,
      url: 'https://x.com/poi5en',
      label: 'X',
      color: isDark ? '#ffffff' : '#000000',
      glow: 'rgba(255,255,255,0.15)',
    },

    {
      icon: FaRedditAlien,
      url: 'https://reddit.com/u/poi5en',
      label: 'Reddit',
      color: '#FF4500',
      glow: 'rgba(255,69,0,0.35)',
    },

    {
      icon: FaGlobe,
      url: 'https://poi5en.dev',
      label: 'Portfolio',
      color: '#8B5CF6',
      glow: 'rgba(139,92,246,0.35)',
    },

    {
      icon: HiOutlineMail,
      url: 'mailto:contact@poi5en.dev',
      label: 'Mail',
      color: '#EA4335',
      glow: 'rgba(234,67,53,0.35)',
    },
  ];

  return (
    <div
      className={`
        h-screen
        w-full
        overflow-hidden
        flex
        flex-col
        relative
        transition-colors
        duration-700
        font-sans
        ${isDark
          ? 'bg-[#020617] text-white'
          : 'bg-[#fdfdfc] text-[#1a1a1a]'
        }
      `}
    >
      {/* Background Effects */}
      <div
        className={`
          absolute
          inset-0
          pointer-events-none
          transition-all
          duration-700
          ${isDark
            ? 'bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_40%)]'
            : 'bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_40%)]'
          }
        `}
      />

      {/* Navbar */}
      <nav
        className={`
          shrink-0
          h-16
          px-6
          md:px-12
          flex
          items-center
          justify-between
          z-50
          backdrop-blur-xl
          border-b
          transition-colors
          duration-700
          ${isDark
            ? 'bg-black/20 border-white/5'
            : 'bg-white/60 border-black/5'
          }
        `}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div
            className={`
              w-9
              h-9
              rounded-xl
              flex
              items-center
              justify-center
              ${isDark
                ? 'bg-blue-500/10'
                : 'bg-amber-500/10'
              }
            `}
          >
            <LucideIcons.Layers
              className={`
                w-4
                h-4
                ${isDark
                  ? 'text-blue-400'
                  : 'text-amber-600'
                }
              `}
              strokeWidth={2.5}
            />
          </div>

          <span
            className={`
              text-lg
              font-black
              tracking-tight
              ${isDark
                ? 'text-white'
                : 'text-[#1a1a1a]'
              }
            `}
          >
            NEXUS
          </span>
        </div>

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => navigate('/')}
            className={`
              text-xs
              font-medium
              transition-colors
              ${isDark
                ? 'text-white/40 hover:text-white'
                : 'text-black/40 hover:text-black'
              }
            `}
          >
            Home
          </button>

          <button
            onClick={() => navigate('/about')}
            className={`
              text-xs
              font-medium
              transition-colors
              ${isDark
                ? 'text-white/40 hover:text-white'
                : 'text-black/40 hover:text-black'
              }
            `}
          >
            About
          </button>

          <button
            className={`
              text-xs
              font-medium
              ${isDark
                ? 'text-blue-400'
                : 'text-amber-700'
              }
            `}
          >
            Team
          </button>

          <ThemeToggle />

          <button
            onClick={() => navigate('/app')}
            className={`
              px-5
              py-2
              rounded-full
              text-[10px]
              font-black
              uppercase
              tracking-[0.2em]
              transition-all
              ${isDark
                ? 'bg-white text-black hover:bg-blue-500 hover:text-white'
                : 'bg-[#1a1a1a] text-white hover:bg-black'
              }
            `}
          >
            Launch
          </button>
        </div>
      </nav>

      {/* Main */}
      <main
        className="
          flex-1
          flex
          items-center
          justify-center
          px-6
          md:px-12
          py-10
          relative
          z-10
        "
      >
        <div
          className="
            max-w-6xl
            w-full
            flex
            flex-col
            md:flex-row
            items-center
            gap-12
            md:gap-20
          "
        >
          {/* Image Side */}
          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            className="
              relative
              w-full
              md:w-1/2
              max-w-[430px]
              aspect-square
            "
          >
            {/* Glow */}
            <div
              className={`
                absolute
                inset-0
                rounded-[48px]
                blur-[90px]
                opacity-20
                ${isDark
                  ? 'bg-blue-600'
                  : 'bg-amber-600'
                }
              `}
            />

            {/* Image */}
            <div
              className="
                relative
                z-10
                overflow-hidden
                rounded-[48px]
                border
                border-white/10
                shadow-2xl
              "
            >
              <img
                src="https://64.media.tumblr.com/90f9bfbada882e00f20483cacbfa43ad/c3bad9d94a92a363-2c/s1280x1920/c695245e2a2e84d90b79522ed0c2daee6ac43170.jpg"
                alt="Architect"
                className="
                  w-full
                  h-full
                  object-cover
                  transition-transform
                  duration-[3000ms]
                  hover:scale-105
                "
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
            className="
              flex-1
              text-center
              md:text-left
            "
          >
            <p
              className={`
                text-[10px]
                font-black
                uppercase
                tracking-[0.45em]
                mb-5
                ${isDark
                  ? 'text-white/20'
                  : 'text-black/30'
                }
              `}
            >
              Lead System Designer • Poi5eN
            </p>

            <h1
              className={`
                text-5xl
                md:text-7xl
                font-serif
                tracking-tight
                leading-none
                mb-4
                ${isDark
                  ? 'text-white'
                  : 'text-[#1a1a1a]'
                }
              `}
            >
              The{' '}
              <span
                className={`
                  italic
                  ${isDark
                    ? 'text-blue-500'
                    : 'text-amber-700'
                  }
                `}
              >
                Architect.
              </span>
            </h1>

            <h2
              className={`
                text-2xl
                md:text-4xl
                font-serif
                mb-5
                ${isDark
                  ? 'text-white'
                  : 'text-[#1a1a1a]'
                }
              `}
            >
              Gourav Kumar Upadhyay
            </h2>

            <p
              className={`
                max-w-xl
                text-sm
                md:text-base
                leading-relaxed
                mb-10
                ${isDark
                  ? 'text-white/50'
                  : 'text-black/55'
                }
              `}
            >
              Specializing in multi-agent orchestration,
              high-fidelity intelligence systems, and
              next-generation AI infrastructure with
              production-grade user experiences.
            </p>

            {/* Socials */}
            <div
              className="
                flex
                flex-wrap
                justify-center
                md:justify-start
                gap-4
              "
            >
              {socials.map((social) => {
                const Icon = social.icon;

                return (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    title={social.label}
                    whileHover={{
                      y: -4,
                      scale: 1.08,
                    }}
                    whileTap={{
                      scale: 0.94,
                    }}
                    className={`
                      group
                      relative
                      w-14
                      h-14
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      overflow-hidden
                      border
                      transition-all
                      duration-500
                      backdrop-blur-xl
                      ${isDark
                        ? 'bg-white/[0.03] border-white/10'
                        : 'bg-white border-black/5 shadow-lg'
                      }
                    `}
                    style={{
                      boxShadow: `
                        0 8px 32px rgba(0,0,0,0.12)
                      `,
                    }}
                  >
                    {/* Glow */}
                    <div
                      className="
                        absolute
                        inset-0
                        opacity-0
                        group-hover:opacity-100
                        transition-opacity
                        duration-500
                      "
                      style={{
                        background: `
                          radial-gradient(
                            circle at center,
                            ${social.glow} 0%,
                            transparent 70%
                          )
                        `,
                      }}
                    />

                    {/* Overlay */}
                    <div
                      className={`
                        absolute
                        inset-0
                        opacity-0
                        group-hover:opacity-100
                        transition-opacity
                        duration-500
                        ${isDark
                          ? 'bg-white/[0.03]'
                          : 'bg-black/[0.02]'
                        }
                      `}
                    />

                    {/* Icon */}
                    <Icon
                      size={22}
                      className="
                        relative
                        z-10
                        transition-transform
                        duration-500
                        group-hover:scale-110
                      "
                      style={{
                        color: social.color,
                      }}
                    />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`
          shrink-0
          h-14
          flex
          items-center
          justify-center
          text-[8px]
          font-black
          tracking-[0.45em]
          uppercase
          transition-colors
          ${isDark
            ? 'text-white/10'
            : 'text-black/10'
          }
        `}
      >
        Nexus Operational Unit • 2026
      </footer>
    </div>
  );
}