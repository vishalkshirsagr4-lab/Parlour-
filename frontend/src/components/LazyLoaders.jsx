import React, { lazy, Suspense } from 'react'

const AppInstallPromptComponent = lazy(() =>
  import('./AppInstallPrompt')
)

const SocialShareButtonComponent = lazy(() =>
  import('./SocialShareButton')
)

class SafeErrorBoundary extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
    }
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error) {
    console.error('Lazy component crashed:', error)
  }

  render() {
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}

export function AppInstallWrapper() {
  return (
    <SafeErrorBoundary>
      <Suspense fallback={null}>
        <AppInstallPromptComponent />
      </Suspense>
    </SafeErrorBoundary>
  )
}

export function SocialShareWrapper() {
  return (
    <SafeErrorBoundary>
      <Suspense fallback={null}>
        <SocialShareButtonComponent />
      </Suspense>
    </SafeErrorBoundary>
  )
}