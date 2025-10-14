import JSDOMEnvironment from 'jest-environment-jsdom';
import { VirtualConsole } from 'jsdom';

export default class CustomJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    // Strip any bad virtualConsole flag from both possible locations
    const projectOpts = { ...(config?.projectConfig?.testEnvironmentOptions || {}) };
    if (Object.prototype.hasOwnProperty.call(projectOpts, 'virtualConsole')) {
      delete projectOpts.virtualConsole;
    }
    const topOpts = { ...(config?.testEnvironmentOptions || {}) };
    if (Object.prototype.hasOwnProperty.call(topOpts, 'virtualConsole')) {
      delete topOpts.virtualConsole;
    }
    const newConfig = {
      ...config,
      projectConfig: {
        ...config.projectConfig,
        testEnvironmentOptions: projectOpts,
      },
      testEnvironmentOptions: topOpts,
    };
    super(newConfig, context);
  }
}
