export async function initializeCustobar(token: string) {
    const scriptId = 'custobar-script';

    if (document.getElementById(scriptId)) {
        console.log('Custobar script already initialized.');
        return;
    }

    try {
        (function (
            c: typeof window,
            u: typeof document,
            s: string,
            t: string,
            o: string,
            b: string,
            a: { _companyToken: string },
            r: HTMLScriptElement | null
        ) {
            let e: HTMLScriptElement;
            (c as any)[o] = [];
            (c as any)[b] = a;
            e = u.createElement(s) as HTMLScriptElement;
            r = u.getElementsByTagName(s)[0] as HTMLScriptElement;
            e.async = true;
            e.src = t;
            e.id = scriptId;
            r.parentNode?.insertBefore(e, r);
        })(
            window,
            document,
            'script',
            'https://api.custobar.com/js/v1/custobar.js',
            'cstbr',
            'cstbrConfig',
            { _companyToken: token },
            document.getElementsByTagName('script')[0] as HTMLScriptElement
        );
    } catch (error) {
        console.error('Error initializing Custobar:', error);
    }
}
