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
  FiLink,
  FiMessageCircle,
} from 'react-icons/fi'

const SHARE_TEXT =
  'Book your beauty appointment online with our premium salon app 💇✨'
const SHARE_TITLE = 'Parlour Premium Salon App'
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''
const SHARE_URL = `${BASE_URL}`
const APP_DOWNLOAD_URL = `${BASE_URL}`
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
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
    color: 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20',
  },
  {
    name: 'Telegram',
    icon: FaTelegramPlane,
    href: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
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
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: 'bg-blue-900/10 text-blue-900 hover:bg-blue-900/20',
  },
  {
    name: 'Twitter',
    icon: FaTwitter,
    href: (url, text) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    color: 'bg-sky-500/10 text-sky-500 hover:bg-sky-500/20',
  },
  {
    name: 'Gmail',
    icon: FaEnvelope,
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent(SHARE_TITLE)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  },
  {
    name: 'SMS',
    icon: FiMessageCircle,
    href: (url, text) =>
      `sms:?body=${encodeURIComponent(`${text} ${url}`)}`,
    color: 'bg-slate-800/10 text-slate-800 hover:bg-slate-800/20',
  },
]

const getMetric = (key) => {
  try {
    return Number(localStorage.getItem(key) || '0')
  } catch {
    return 0
  }
}

const incrementMetric = (key, platform) => {
  try {
    const current = Number(localStorage.getItem(key) || '0')
    localStorage.setItem(key, String(current + 1))
    if (platform) {
      const platforms = JSON.parse(
        localStorage.getItem(metrics.platformShares) || '{}'
      )
      platforms[platform] = (platforms[platform] || 0) + 1
      localStorage.setItem(metrics.platformShares, JSON.stringify(platforms))
    }
  } catch {
    // ignore localStorage issues
  }
}

const buildShareUrl = (user) => {
  const referral = user?.referralCode || user?.id || ''
  if (!referral) return SHARE_URL
  return `${SHARE_URL}?${REFERRAL_PARAM}=${encodeURIComponent(referral)}`
}

export default function SocialShareButton() {
  const { user, isAuthenticated } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrVisible, setQrVisible] = useState(false)
  const [shareUrl, setShareUrl] = useState(SHARE_URL)
  const [appUrl, setAppUrl] = useState(APP_DOWNLOAD_URL)

  const shareMessage = useMemo(
    () => `${SHARE_TEXT}`,
    []
  )

  useEffect(() => {
    if (!isAuthenticated) return
    const mobileDevice = /android|iphone|ipad|ipod|mobile/i.test(
      navigator.userAgent
    )
    setMobile(mobileDevice)
    setCanNativeShare(Boolean(navigator.share))
    setShareUrl(buildShareUrl(user))
    setAppUrl(buildShareUrl(user))
  }, [isAuthenticated, user])

  if (!isAuthenticated) {
    return null
  }

  const handleShareOpen = async () => {
    setOpen(true)
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
        setOpen(false)
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Native share failed, opening fallback menu.')
        }
      }
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      incrementMetric(metrics.copyClicks)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Unable to copy link')
    }
  }

  const handlePlatformShare = (platform) => {
    incrementMetric(metrics.shareClicks)
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
        className="fixed bottom-28 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500 text-white shadow-2xl shadow-fuchsia-500/30 transition-transform duration-300 hover:-translate-y-1 hover:shadow-fuchsia-500/50 sm:bottom-10 sm:right-10"
        aria-label="Share salon app"
      >
        <FiShare2 className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-500">
                    Share the salon app
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
                    Spread premium salon style with friends
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200"
                  aria-label="Close share menu"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Why share?
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li>• Faster booking for your friends</li>
                    <li>• Easy salon appointment access</li>
                    <li>• Reward referrals automatically</li>
                    <li>• Bring elegance to everyone's routine</li>
                  </ul>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Share content
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {SHARE_TEXT}
                  </p>
                  <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Link
                    </p>
                    <p className="mt-2 break-all text-sm font-medium text-slate-900 dark:text-slate-100">
                      {shareUrl}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {socials.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <a
                      key={platform.name}
                      href={platform.href(shareUrl, SHARE_TEXT)}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={() => handlePlatformShare(platform.name)}
                      className={`group rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700 dark:bg-slate-950 ${platform.color}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm dark:bg-slate-900">
                          <Icon />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">
                            {platform.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Share via {platform.name}
                          </p>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <FiCopy className="h-5 w-5" />
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!canNativeShare) {
                      toast('Native sharing is not available on this device.', { icon: '⚠️' })
                      return
                    }
                    navigator
                      .share({
                        title: SHARE_TITLE,
                        text: shareMessage,
                        url: shareUrl,
                      })
                      .then(() => {
                        toast.success('Shared successfully!')
                        incrementMetric(metrics.shareClicks, 'Native')
                      })
                      .catch((error) => {
                        if (error.name !== 'AbortError') {
                          toast.error('Unable to open native share menu')
                        }
                      })
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-fuchsia-500 to-rose-500 px-4 py-4 text-sm font-semibold text-white shadow-xl shadow-fuchsia-500/20 transition hover:scale-[1.01]"
                >
                  <FiShare2 className="h-5 w-5" />
                  Native share
                </button>
              </div>

              <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      QR code sharing
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Scan to visit the salon app or share with a friend.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQrVisible((prev) => !prev)}
                    className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  >
                    {qrVisible ? 'Hide' : 'Show'} QR
                  </button>
                </div>
                {qrVisible && (
                  <div className="mt-4 flex items-center justify-center">
                    <img
                      src={qrCodeSrc}
                      alt="Share QR code"
                      className="h-48 w-48 rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-700"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
