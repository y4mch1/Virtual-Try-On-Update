import "./globals.css";

export const metadata = {
  title: 'Layout',
  description: 'A layout component',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
      {children}
      </body>
    </html>
  )
}