function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay is only available in the browser.'))
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay)
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Razorpay))
      existing.addEventListener('error', () => reject(new Error('Could not load Razorpay.')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay)
      else reject(new Error('Razorpay failed to initialize.'))
    }
    script.onerror = () => reject(new Error('Could not load Razorpay checkout.'))
    document.head.appendChild(script)
  })
}

export async function openRazorpayCheckout(razorpayOptions) {
  const Razorpay = await loadRazorpayScript()

  return new Promise((resolve, reject) => {
    const instance = new Razorpay({
      key: razorpayOptions.keyId,
      amount: razorpayOptions.amount,
      currency: razorpayOptions.currency,
      name: razorpayOptions.name,
      description: razorpayOptions.description,
      order_id: razorpayOptions.orderId,
      prefill: razorpayOptions.prefill,
      theme: { color: '#4a3b3d' },
      handler(response) {
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        })
      },
      modal: {
        ondismiss() {
          reject(new Error('Payment was cancelled.'))
        },
      },
    })

    instance.on('payment.failed', (response) => {
      reject(new Error(response?.error?.description || 'Payment failed.'))
    })

    instance.open()
  })
}

export const hasRazorpayClientKey = Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID?.trim())
