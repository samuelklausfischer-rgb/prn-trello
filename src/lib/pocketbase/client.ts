import PocketBase from 'pocketbase'

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)
pb.autoCancellation(false)

// Global interceptor for API responses
pb.afterSend = (response, data) => {
  // If unauthorized, clear auth state to force login redirect
  if (response.status === 401) {
    pb.authStore.clear()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pb:auth-error'))
    }
  }
  return data
}

export default pb
