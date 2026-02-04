'use client';
import { Button } from 'components/elements/Button';
import { useTranslations } from 'hooks/useTranslations';
import { useEffect } from 'react';
import { initializeCustobar } from 'services/zitac/custobar';

declare global {
  interface Window {
    cstbr: any[];
    cstbrConfig?: any;
  }
}

function Newsletter({ token }: { token: string }) {
  const t = useTranslations();

  useEffect(() => {
    if (!token) {
      console.error('Custobar token is missing.');
      return;
    }
    initializeCustobar(token);

    const form = document.getElementById(
      'mailing-list-form'
    ) as HTMLFormElement;
    const feedbackMessage = document.getElementById(
      'mailing-list-feedback'
    ) as HTMLElement;
    const mailingListInput = document.createElement('input');
    mailingListInput.type = 'hidden';
    mailingListInput.name = 'mailing_lists';
    mailingListInput.id = 'mailinglists';
    mailingListInput.value = 'newsletter,Motor- och segelbåt';
    form.appendChild(mailingListInput);

    const interestRadios = document.querySelectorAll('input[name="tags"]');

    const handleSubmit = (e: Event) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      if (window.cstbr) {
        window.cstbr.push(data);
      }

      form.style.display = 'none';
      feedbackMessage.style.display = 'block';
    };

    form.addEventListener('submit', handleSubmit);

    const handleRadioClick = () => {
      const selectedInterest = (
        document.querySelector('input[name="tags"]:checked') as HTMLInputElement
      ).value;
      mailingListInput.value = `newsletter,${selectedInterest}`;
    };

    interestRadios.forEach((radio) =>
      radio.addEventListener('click', handleRadioClick)
    );

    return () => {
      form.removeEventListener('submit', handleSubmit);
      interestRadios.forEach((radio) =>
        radio.removeEventListener('click', handleRadioClick)
      );
    };
  }, [token]);

  return (
    <>
      <form id="mailing-list-form" className="space-y-4">
        <NewsletterInputField
          type="email"
          id="email"
          label="E-post"
          placeholder="Ange e-post"
        />
        <NewsletterInputField
          type="tel"
          id="phone_number"
          label="Telefon"
          placeholder="Ange telefonnummer"
        />
        <div className="flex justify-between gap-4">
          <NewsletterInputField
            type="text"
            id="first_name"
            label="Förnamn"
            placeholder="Ange förnamn"
          />
          <NewsletterInputField
            type="text"
            id="last_name"
            label="Efternamn"
            placeholder="Ange efternamn"
          />
        </div>
        <NewsletterInputField
          type="text"
          id="street_address"
          label="Adress"
          placeholder="Ange adress"
        />
        <div className="flex justify-between gap-4">
          <NewsletterInputField
            type="text"
            id="zip_code"
            label="Postnummer"
            placeholder="Ange postnummer"
          />
          <NewsletterInputField
            type="text"
            id="city"
            label="Stad"
            placeholder="Ange stad"
          />
        </div>
        <div className="space-y-1">
          <p>Välj ditt båtintresse nedan för mest relevanta erbjudanden:</p>
          <div className="block gap-4 md:flex">
            <div className="flex gap-1">
              <input type="radio" id="engine" name="tags" value="Motorbåt" />
              <label htmlFor="engine">Motorbåt</label>
            </div>
            <div className="flex gap-1">
              <input type="radio" id="sail" name="tags" value="Segelbåt" />
              <label htmlFor="sail">Segelbåt</label>
            </div>
            <div className="flex gap-1">
              <input
                type="radio"
                id="both"
                name="tags"
                value="Motor- och segelbåt"
                defaultChecked
              />
              <label htmlFor="both">Motor- och segelbåt</label>
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          <label htmlFor="privacy_policy">
            <input type="checkbox" id="privacy_policy" required />
          </label>
          <span>
            Jag bekräftar att jag vill ha nyhetsbrev och godkänner att Seasea
            behandlar mina personuppgifter för att kunna skicka
            marknadsföringsmaterial som anpassats till mig enligt Seaseas{' '}
            <a href="/privacy">integritetspolicy</a>.
          </span>
          <input type="hidden" name="type" value="MAIL_SUBSCRIBE" />
          <input
            id="mailinglists"
            type="hidden"
            name="mailing_lists"
            value="newsletter,Motor- och segelbåt"
          />
        </div>
        <div>
          <Button
            type="submit"
            className="af:bg-af-orange rounded-md border-0 bg-seasea-blue p-2 text-white hover:brightness-90"
          >
            {t('zs.NewsletterSubmit')}
          </Button>
        </div>
      </form>
      <h2 id="mailing-list-feedback" style={{ display: 'none' }}>
        {t('zs.NewsletterConfirmation')}
      </h2>
    </>
  );
}

export default Newsletter;

interface NewsLetterInputFieldProps {
  type: string;
  id: string;
  label: string;
  placeholder: string;
}

function NewsletterInputField({
  type,
  id,
  label,
  placeholder,
}: NewsLetterInputFieldProps) {
  return (
    <div className="af:focus-within:ring-af-orange w-full rounded-md px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-seasea-blue">
      <label htmlFor={id} className="block text-xs font-medium text-gray-900">
        {label}*
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        required
        className="block w-full border-0 bg-transparent p-0 text-gray-900 placeholder:text-gray-400 focus:outline-0 focus:ring-0 sm:text-sm/6"
      />
    </div>
  );
}
