let scriptPromise

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Could not load secure payment. Please try again.'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

/** Opens Razorpay in a modal; the customer remains on the Moonberry storefront. */
export async function openRazorpayCheckout({ order, customer }) {
  await loadRazorpayScript()

  return new Promise((resolve, reject) => {
    let completed = false
    const checkout = new window.Razorpay({
      key: order.razorpayKeyId,
      amount: order.razorpayAmount,
      currency: order.razorpayCurrency || 'INR',
      order_id: order.razorpayOrderId,
      name: 'Moonberry',
      description: `Order ${order.draftOrderName}`,
      prefill: {
        name: customer.fullName,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: '#6e4b52' },
      handler: (response) => {
        completed = true
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        })
      },
      modal: {
        ondismiss: () => {
          if (!completed) reject(new Error('Payment was cancelled. Your order has not been placed.'))
        },
      },
    })
    checkout.open()
  })
}
