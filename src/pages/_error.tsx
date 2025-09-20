import { NextPageContext } from 'next';

interface ErrorPageProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main
      style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--foreground, #0f172a)',
      }}
    >
      <p>
        {statusCode
          ? `An error ${statusCode} occurred on the server`
          : 'An error occurred on the client'}
      </p>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode =
    res?.statusCode ??
    (err as { statusCode?: number } | undefined)?.statusCode ??
    404;
  return { statusCode } as ErrorPageProps;
};

export default ErrorPage;
