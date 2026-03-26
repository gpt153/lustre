export function welcomeEmailHtml(position: number, mode: 'vanilla' | 'spicy'): string {
  const isSpicy = mode === 'spicy'
  const accent = isSpicy ? '#e84393' : '#f39c12'
  const greeting = isSpicy
    ? 'Välkommen till Lustre — Spicy Edition.'
    : 'Välkommen till Lustre.'
  const body = isSpicy
    ? 'Du har tagit första steget mot en plattform som inte dömer, inte gömmer, och inte kompromissar med din säkerhet. Hela du är välkommen.'
    : 'Du har tagit första steget mot dejting som faktiskt fungerar. En plattform byggd på ärlighet, trygghet och riktiga connections.'

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px">
          <tr>
            <td align="center" style="padding:0 0 32px">
              <span style="font-size:28px;font-weight:700;color:${accent};letter-spacing:6px;text-transform:uppercase">LUSTRE</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#1a1a2e;border:1px solid #2a2a3e;border-radius:16px;padding:48px 40px">
              <h1 style="color:#ffffff;font-size:24px;font-weight:600;margin:0 0 16px;line-height:1.3">${greeting}</h1>
              <p style="color:rgba(255,255,255,0.7);font-size:16px;line-height:1.6;margin:0 0 32px">${body}</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#12121f;border:1px solid ${accent}40;border-radius:12px;padding:20px 28px">
                    <span style="color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:2px">Din plats i kön</span>
                    <br>
                    <span style="color:${accent};font-size:32px;font-weight:700">#${position}</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;margin:32px 0 0">
                Ju fler du bjuder in, desto tidigare får du tillgång. Dela länken med någon som förtjänar bättre dejting.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:32px 0 0">
              <span style="color:rgba(255,255,255,0.3);font-size:12px">Never lack Lustre.</span>
              <br>
              <span style="color:rgba(255,255,255,0.2);font-size:11px">Stockholm, Sverige · lovelustre.com</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
