'use client';

export function IPaperScript() {
  const scriptContent = `
    (function(i,P,a,p,e,r){
      if(i.getElementById(a=a+'-'+e))return;
      r=i.querySelector(P).parentNode.appendChild(i.createElement(P));
      r.id=a;r.async=1;r.src=p+'/'+e
    })(window.document,'script','ipaper-display-api','https://display.ipaper.io/api/v2','MTY6MmM1NjZjY2UtNzFlYi00OWFmLTljYWUtNGFhOWI0N2E0ZTEx');
  `;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: scriptContent,
        }}
      />
    </>
  );
}
