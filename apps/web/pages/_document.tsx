import NextDocument, { Head, Html, Main, NextScript } from 'next/document'
import { tamaguiConfig } from '@lustre/ui'

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="sv">
        <Head>
          <style
            dangerouslySetInnerHTML={{
              __html: tamaguiConfig.getCSS(),
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
