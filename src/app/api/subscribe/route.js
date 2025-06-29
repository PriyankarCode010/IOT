let subscriptions = [];

export async function POST(req) {
  try {
    const subscription = await req.json();
    // Prevent duplicates
    if (!subscriptions.find((sub) => sub.endpoint === subscription.endpoint)) {
      subscriptions.push(subscription);
    }
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save subscription' }), { status: 500 });
  }
} 