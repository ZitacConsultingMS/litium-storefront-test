import { render } from '@react-email/render';
import EmailVerificationCode from 'components/emails/EmailVerificationCode';
import { translate } from 'hooks/useTranslations';
import { NextRequest, NextResponse } from 'next/server';
import Mail from 'nodemailer/lib/mailer';
import { sendMail } from 'services/mailService.server';
import { get as getWebsite } from 'services/websiteService.server';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ slug?: string[] }> }
) {
  const params = await props.params;
  const { data } = await request.json();
  const { texts } = await getWebsite(params.slug?.join('/') ?? '/');

  const subject = translate(
    'logindetails.emaildetails.verificationcode.emailsubject',
    texts
  );
  const emailHtml = render(
    await EmailVerificationCode(data.verificationToken, texts)
  );
  const mailOptions: Mail.Options = {
    to: data.email,
    subject,
    html: await emailHtml,
  };

  try {
    console.debug('Sending verification code email...');
    await sendMail(mailOptions, params);
    return NextResponse.json({ message: 'Email sent' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
