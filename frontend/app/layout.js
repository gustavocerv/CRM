export const metadata = {
  title: 'CRM',
  description: 'Multi-tenant CRM on GCP'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Arial, sans-serif', padding: 24 }}>{children}</body>
    </html>
  );
}
