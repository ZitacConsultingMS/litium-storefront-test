'use server';
import { gql } from '@apollo/client';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { queryServer } from './dataService.server';

export async function sendMail(mailOptions: Mail.Options, params: any) {
  const hasValue = (val: string | undefined) => val !== undefined;

  if (
    !hasValue(process.env.RUNTIME_SMTP_HOST) ||
    !hasValue(process.env.RUNTIME_SMTP_PORT) ||
    !hasValue(process.env.RUNTIME_SMTP_SECURE)
  ) {
    console.error('Invalid SMTP configuration');
    return NextResponse.json(
      { error: 'Please configure SMTP server variables' },
      { status: 400 }
    );
  }

  let options = {
    host: process.env.RUNTIME_SMTP_HOST,
    port: process.env.RUNTIME_SMTP_PORT,
    secure: process.env.RUNTIME_SMTP_SECURE === 'true',
  } as unknown as SMTPTransport.Options;

  if (
    hasValue(process.env.RUNTIME_SMTP_AUTH_USER) &&
    hasValue(process.env.RUNTIME_SMTP_AUTH_PASS)
  ) {
    options.auth = {
      user: process.env.RUNTIME_SMTP_AUTH_USER,
      pass: process.env.RUNTIME_SMTP_AUTH_PASS,
    };
  }

  const senderEmailAddress = await getSenderEmail(params);
  if (!senderEmailAddress) {
    console.error('senderEmailAddress is missing');
    return NextResponse.json(
      { error: 'senderEmailAddress is missing' },
      { status: 400 }
    );
  } else {
    mailOptions.from = senderEmailAddress;
  }

  const transport = nodemailer.createTransport(options);
  console.debug('Sending email...');
  await transport.sendMail(mailOptions);
  console.debug('Email sent');
}

async function getSenderEmail(params: any) {
  return (
    await queryServer({
      query: GET_SENDER_EMAIL,
      url: params.slug?.join('/') ?? '/',
    })
  ).channel.fields.senderEmailAddress;
}

const GET_SENDER_EMAIL = gql`
  query GetSenderEmail {
    channel {
      ... on DefaultChannelFieldTemplateChannel {
        id
        fields {
          senderEmailAddress
        }
      }
    }
  }
`;
