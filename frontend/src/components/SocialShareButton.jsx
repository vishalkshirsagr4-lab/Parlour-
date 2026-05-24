import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

import {
  FaWhatsapp,
  FaTelegramPlane,
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaEnvelope,
} from 'react-icons/fa'

import {
  FiShare2,
  FiCopy,
  FiX,
  FiMessageCircle,
} from 'react-icons/fi'

const SHARE_TEXT =
  'Book your beauty appointment online with our premium salon app 💇✨'

const SHARE_TITLE = 'Parlour Premium Salon App'

const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:5173'

const SHARE_URL = BASE_URL
const REFERRAL_PARAM = 'ref'

const metrics = {
  shareClicks: 'parlour-share-clicks',
  platformShares: 'parlour-platform-shares',
  copyClicks: 'parlour-copy-link-clicks',
}

const socials = [
  {
    name: 'WhatsApp',
    icon: FaWhatsapp,
    href: (url, text) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${text} ${url}`
      )}`,
    color:
      'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20',
  },
  {
    name: 'Telegram',
    icon: FaTelegramPlane,
    href: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`,
    color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  },
  {
    name: 'Instagram',
    icon: FaInstagram,
    href: () => 'https://www.instagram.com/',
    color: 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20',
  },
  {
    name: 'Facebook',
    icon: FaFacebookF,
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
    color:
      'bg-blue-900/10 text-blue-900 hover:bg-blue-900/20',
  },
  {
    name: 'Twitter',
    icon: FaTwitter,
    href: (url, text) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
    color: 'bg-sky-500/10 text-sky-500 hover:bg-sky-500/20',
  },
  {
    name: 'Gmail',
    icon: FaEnvelope,
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent(
        SHARE_TITLE
      )}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  },
  {
    name: 'SMS',
    icon: FiMessageCircle,
    href: (url, text) =>
      `sms:?body=${encodeURIComponent(`${text} ${url}`)}`,
    color:
      'bg-slate-800/10 text-slate-800 hover:bg-slate-800/20',
  },
]

const incrementMetric = (key, platform) => {
  try {
    const current = Number(localStorage.getItem(key) || '0')

    localStorage.setItem(key, String(current + 1))

    if (platform) {
      const platforms = JSON.parse(
        localStorage.getItem(metrics.platformShares) || '{}'
      )

      platforms[platform] = (platforms[platform] || 0) + 1

      localStorage.setItem(
        metrics.platformShares,
        JSON.stringify(platforms)
      )
    }
  } catch {
    // ignore storage errors
  }
}

const buildShareUrl = (user) => {
  const referral = user?.referralCode || user?.id || ''

  if (!referral) return SHARE_URL

  return `${SHARE_URL}?${REFERRAL_PARAM}=${encodeURIComponent(
    referral
  )}`
}

export default function SocialShareButton() {
  const { user, isAuthenticated } = useAuthStore()

  const [open, setOpen] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrVisible, setQrVisible] = useState(false)
  const [shareUrl, setShareUrl] = useState(SHARE_URL)

  const shareMessage = useMemo(() => SHARE_TEXT, [])

  useEffect(() => {
    if (!isAuthenticated) return

    const mobileDevice =
      /android|iphone|ipad|ipod|mobile/i.test(
        navigator.userAgent
      )

    setMobile(mobileDevice)
    setCanNativeShare(Boolean(navigator.share))
    setShareUrl(buildShareUrl(user))
  }, [isAuthenticated, user])

  if (!isAuthenticated) return null

  const handleShareOpen = async () => {
    incrementMetric(metrics.shareClicks)

    if (mobile && canNativeShare) {
      try {
        await navigator.share({
          title: SHARE_TITLE,
          text: shareMessage,
          url: shareUrl,
        })

        toast.success('Shared successfully!')
        incrementMetric(metrics.shareClicks, 'Native')

        return
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error(
            'Native share failed, opening fallback menu.'
          )
        }
      }
    }

    setOpen(true)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)

      setCopied(true)

      incrementMetric(metrics.copyClicks)

      toast.success('Link copied to clipboard')

      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Unable to copy link')
    }
  }

  const handlePlatformShare = (platform) => {
    incrementMetric(metrics.shareClicks, platform)
    setOpen(false)
  }

  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    shareUrl
  )}`

  return (
    <>
      <button
        type="button"
        onClick={handleShareOpen}
        className="fixed parlour-fab-bottom right-[calc(1rem+env(safe-area-inset-right,0px))] z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500 text-white shadow-2xl transition hover:scale-105"
        aria-label="Share"
      >
        <FiShare2 className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-lg rounded-[32px] bg-white p-5 shadow-2xl dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold dark:text-white">
                  Share App
                </h2>

                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FiX />
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {socials.map((platform) => {
                  const Icon = platform.icon

                  return (
                    <a
                      key={platform.name}
                      href={platform.href(
                        shareUrl,
                        SHARE_TEXT
                      )}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        handlePlatformShare(platform.name)
                      }
                      className={`rounded-3xl border p-4 transition hover:scale-[1.02] ${platform.color}`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Icon className="text-2xl" />

                        <span className="text-sm font-semibold">
                          {platform.name}
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={handleCopy}
                  className="rounded-3xl border px-4 py-4 font-semibold"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FiCopy />
                    {copied ? 'Copied!' : 'Copy Link'}
                  </div>
                </button>

                <button
                  onClick={() => setQrVisible(!qrVisible)}
                  className="rounded-3xl bg-gradient-to-r from-fuchsia-500 to-rose-500 px-4 py-4 font-semibold text-white"
                >
                  {qrVisible ? 'Hide QR' : 'Show QR'}
                </button>
              </div>

              {qrVisible && (
                <div className="mt-6 flex justify-center">
                  <img
                    src={qrCodeSrc}
                    alt="QR Code"
                    className="h-48 w-48 rounded-3xl border p-3"
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}