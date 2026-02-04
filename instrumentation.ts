import { Configuration, registerOTel } from '@vercel/otel';

export async function register() {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    process.env.NODE_ENV === 'development' &&
      console.warn(
        'OpenTelemetry is not configured, OTEL_EXPORTER_OTLP_ENDPOINT is not set.'
      );
    return;
  }

  console.log(
    `Registering OpenTelemetry instrumentation for ${process.env.NEXT_RUNTIME} runtime`
  );
  const runtimeConfig = await import(
    `./instrumentation.${process.env.NEXT_RUNTIME}`
  );
  var config =
    typeof runtimeConfig.config === 'function'
      ? (runtimeConfig.config() ?? {})
      : {};

  const configuration: Configuration = {
    ...config,
    serviceName: 'app',
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: ['*'],
      },
    },
    traceSampler: 'always_on',
  };
  registerOTel(configuration);

  if (typeof runtimeConfig.patch === 'function') {
    console.debug(
      `Patching OpenTelemetry instrumentation for ${process.env.NEXT_RUNTIME} runtime`
    );
    runtimeConfig.patch();
    console.debug(
      `Patched OpenTelemetry instrumentation for ${process.env.NEXT_RUNTIME} runtime`
    );
  }

  console.log(
    `Registered OpenTelemetry instrumentation for ${process.env.NEXT_RUNTIME} runtime`
  );
}
