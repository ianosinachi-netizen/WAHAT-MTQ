export interface EmailPayload {
  type: 'bulk_request' | 'barite_order' | 'product_order' | 'contact_message' | 'chemical_order';
  userEmail: string;
  details: string;
}

export async function sendEmail(payload: EmailPayload) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}
