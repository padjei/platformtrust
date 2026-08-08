import { Button } from '@platformtrust/ui';
import { SERVICE_NAMES, SHARED_PACKAGE_VERSION } from '@platformtrust/shared';

const DOCS_URL = 'https://github.com/padjei/platformtrust/tree/main/docs';

export default function HomePage() {
  // NODE_ENV is safe, non-sensitive build/environment information.
  const nodeEnv = process.env.NODE_ENV;

  return (
    <main>
      <h1>PlatformTrust</h1>
      <p>Platform initialization complete. The web surface is running.</p>

      <dl aria-label="Build and environment information">
        <div>
          <dt>Service</dt>
          <dd>{SERVICE_NAMES.WEB}</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>{SHARED_PACKAGE_VERSION}</dd>
        </div>
        <div>
          <dt>Environment</dt>
          <dd>{nodeEnv}</dd>
        </div>
      </dl>

      <p>
        <Button>Learn more</Button>
      </p>

      <p>
        <a href={DOCS_URL} rel="noreferrer">
          Read the documentation
        </a>
      </p>
    </main>
  );
}
