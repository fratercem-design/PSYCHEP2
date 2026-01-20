import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: 'us1', // Replace 'us1' with your server prefix if different
});

interface MailchimpError {
  response?: {
    body?: {
      title?: string;
    };
  };
}

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID!, {
      email_address: email,
      status: 'subscribed',
    });

    return NextResponse.json({ message: 'Successfully subscribed!' }, { status: 200 });
  } catch (error) {
    console.error('Mailchimp error:', error);
    const mailchimpError = error as MailchimpError;
    return NextResponse.json(
      { error: mailchimpError.response?.body?.title || 'Something went wrong' },
      { status: 500 }
    );
  }
}
