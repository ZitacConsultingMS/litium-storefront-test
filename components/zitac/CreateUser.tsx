'use client';
import { Button } from 'components/elements/zitac/Button';
import Link from 'components/Link';
import { useTranslations } from 'hooks/useTranslations';
import { useEffect, useState } from 'react';
import { initializeCustobar } from 'services/zitac/custobar';

export function CreateUser({
  myPagesPageUrl,
  custobarToken,
  serviceAccount,
  customerApiUrl,
}: {
  myPagesPageUrl: string;
  custobarToken: string | undefined;
  serviceAccount: string | undefined;
  customerApiUrl: string;
}) {
  let [isNewsletter, setIsNewsletter] = useState(false);
  let [responsMessage, setResponsMessage] = useState('');
  const t = useTranslations();

  const handleNewsletter = (e: any) => {
    const target = e.target;
    const interest = document.getElementById('interest') as HTMLElement;
    interest.style.display = target.checked ? 'block' : 'none';
    let value = target.type === 'checkbox' ? target.checked : target.value;
    setIsNewsletter(value);
  };

  useEffect(() => {
    const form = document.getElementById(
      'create-account-form'
    ) as HTMLFormElement;
    const feedbackMessage = document.getElementById('feedback') as HTMLElement;
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

      // Send data to Customer API
      submitToApi(data);

      // Send data to Custobar
      if (isNewsletter) {
        if (!custobarToken) {
          console.error('Custobar token is missing.');
          return;
        }
        initializeCustobar(custobarToken);

        if (window.cstbr) {
          window.cstbr.push(data);
        }
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
  });

  return (
    <>
      <form id="create-account-form" className="mt-10 space-y-4">
        <CreateUserInputField
          type="email"
          id="email"
          label="E-post"
          placeholder="Ange e-post"
        />
        <CreateUserInputField
          type="tel"
          id="phone_number"
          label="Telefon"
          placeholder="Ange telefonnummer"
        />
        <div className="flex justify-between gap-4">
          <CreateUserInputField
            type="text"
            id="first_name"
            label="Förnamn"
            placeholder="Ange förnamn"
          />
          <CreateUserInputField
            type="text"
            id="last_name"
            label="Efternamn"
            placeholder="Ange efternamn"
          />
        </div>
        <CreateUserInputField
          type="text"
          id="street_address"
          label="Adress"
          placeholder="Ange adress"
        />
        <div className="flex justify-between gap-4">
          <CreateUserInputField
            type="text"
            id="zip_code"
            label="Postnummer"
            placeholder="Ange postnummer"
          />
          <CreateUserInputField
            type="text"
            id="city"
            label="Stad"
            placeholder="Ange stad"
          />
        </div>
        <CreateUserInputField
          type="password"
          id="password"
          label="Lösenord"
          placeholder="Ange Lösenord"
        />
        <div>
          <label htmlFor="newsletter">
            <input
              type="checkbox"
              id="newsletter"
              className="align-middle"
              onChange={handleNewsletter}
            />
          </label>
          <span className="ml-2">Jag vill ha nyhetsbrev.</span>
          <div
            id="interest"
            className="mt-2 space-y-1"
            style={{ display: 'none' }}
          >
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
        </div>
        <div>
          <label htmlFor="privacy_policy">
            <input
              type="checkbox"
              id="privacy_policy"
              className="align-middle"
              required
            />
          </label>
          <span className="ml-2">
            Jag godkänner att Seasea behandlar mina personuppgifter enligt
            Seaseas <a href="/privacy">integritetspolicy</a>.
          </span>
        </div>
        <div>
          <Button
            type="submit"
            className="mt-2 w-[200px] rounded-md border-0 bg-seasea-blue p-2 text-white hover:brightness-90 af:bg-af-orange"
          >
            Skicka
          </Button>
        </div>
      </form>
      <div id="feedback" style={{ display: 'none' }}>
        <p className="mb-4 mt-10 text-xl">{responsMessage}</p>
        {
          <Link
            href={myPagesPageUrl}
            className="mt-2 rounded-md border-0 bg-seasea-blue px-4 py-2 text-white hover:brightness-90 af:bg-af-orange"
          >
            {t('login.title')}
          </Link>
        }
      </div>
    </>
  );

  async function submitToApi(data: Object) {
    if (!serviceAccount) {
      setResponsMessage(
        'Det uppstod problem när kontot skulle skapas. Försök igen senare.'
      );
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ServiceAccount ${serviceAccount}`,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(customerApiUrl, requestOptions);
    const responseInfo = await response.json();

    if (response.ok) {
      setResponsMessage('Ditt konto är skapat');
    } else {
      setResponsMessage(responseInfo);
    }
  }
}

interface CreateUserInputFieldProps {
  type: string;
  id: string;
  label: string;
  placeholder: string;
}

function CreateUserInputField({
  type,
  id,
  label,
  placeholder,
}: CreateUserInputFieldProps) {
  return (
    <div className="w-full rounded-md px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-seasea-blue af:focus-within:ring-af-orange">
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
