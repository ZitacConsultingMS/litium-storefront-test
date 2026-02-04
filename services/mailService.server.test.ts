import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { queryServer } from './dataService.server';
import { sendMail } from './mailService.server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (error: any, status: any) => ({ ...error, ...status }),
  },
}));

jest.mock('services/dataService.server', () => ({
  queryServer: jest.fn(),
}));

const sendMailMock = jest.fn((params: any) => {});
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: sendMailMock,
  })),
}));

const originalEnv = process.env;
const mailOptions: Mail.Options = {
  to: 'foo@bar',
  subject: `Email subject`,
  html: '',
};
const params = {};

describe('mailService', () => {
  describe('sendMail function', () => {
    beforeEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnv,
        RUNTIME_SMTP_HOST: 'localhost',
        RUNTIME_SMTP_PORT: '1025',
        RUNTIME_SMTP_SECURE: 'false',
        RUNTIME_SMTP_AUTH_USER: 'foo@bar.com',
        RUNTIME_SMTP_AUTH_PASS: 'bar',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('should return error if runtime SMTP host is undefined', async () => {
      console.error = jest.fn();
      process.env.RUNTIME_SMTP_HOST = undefined;
      const result = await sendMail(mailOptions, params);

      expect(console.error).toHaveBeenCalledWith('Invalid SMTP configuration');
      expect(result).toEqual({
        error: 'Please configure SMTP server variables',
        status: 400,
      });
    });

    test('should return error if runtime SMTP port is undefined', async () => {
      console.error = jest.fn();
      process.env.RUNTIME_SMTP_PORT = undefined;
      const result = await sendMail(mailOptions, params);

      expect(console.error).toHaveBeenCalledWith('Invalid SMTP configuration');
      expect(result).toEqual({
        error: 'Please configure SMTP server variables',
        status: 400,
      });
    });

    test('should return error if runtime SMTP secure is undefined', async () => {
      console.error = jest.fn();
      process.env.RUNTIME_SMTP_SECURE = undefined;
      const result = await sendMail(mailOptions, params);

      expect(console.error).toHaveBeenCalledWith('Invalid SMTP configuration');
      expect(result).toEqual({
        error: 'Please configure SMTP server variables',
        status: 400,
      });
    });

    test('should return error if sender email is missing', async () => {
      console.error = jest.fn();
      (queryServer as jest.Mock).mockResolvedValue({
        channel: {
          fields: {
            senderEmailAddress: null,
          },
        },
      });
      const result = await sendMail(mailOptions, params);

      expect(console.error).toHaveBeenCalledWith(
        'senderEmailAddress is missing'
      );
      expect(result).toEqual({
        error: 'senderEmailAddress is missing',
        status: 400,
      });
    });

    test('should be able to send email with correct infomation', async () => {
      console.debug = jest.fn();
      (queryServer as jest.Mock).mockResolvedValue({
        channel: {
          fields: {
            senderEmailAddress: 'foo@bar.com',
          },
        },
      });
      await sendMail(mailOptions, params);
      expect(createTransport).toHaveBeenCalledWith({
        auth: { pass: 'bar', user: 'foo@bar.com' },
        host: 'localhost',
        port: '1025',
        secure: false,
      });
      expect(console.debug).toHaveBeenCalledWith('Sending email...');
      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'foo@bar.com',
        html: '',
        subject: 'Email subject',
        to: 'foo@bar',
      });
      expect(console.debug).toHaveBeenCalledWith('Email sent');
    });
  });
});
