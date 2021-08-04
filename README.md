This topic includes instructions on how to send custom metrics to Logz.io from your Node.js application.

The included example uses the [OpenTelemetry JS SDK](https://github.com/open-telemetry/opentelemetry-js) and its based on [OpenTelemetry exporter collector proto](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-exporter-collector-proto).

#### Quick start

**Before you begin, you'll need**:
Node 8 or higher
##### Add instruments to your application:
Set the variables in the following code snippet:

|Environment variable|Description|
|---|---|
|url|  The Logz.io Listener URL for for your region, configured to use port **8052** for http traffic, or port **8053** for https traffic. |
|token| Your Logz.io Prometheus Metrics account token.  |
```js
const { MeterProvider } = require('@opentelemetry/metrics');
const { CollectorMetricExporter } =  require('yotam-js-metrics-test');

const collectorOptions = {
    url: '<<url>>',
    token: '<<token>>',
};
// Initialize the exporter
const metricExporter = new CollectorMetricExporter(collectorOptions);

// Initialize the meter provider
const meter = new MeterProvider({
    exporter: metricExporter,
    interval: 15000, // Push interval in seconds
}).getMeter('example-exporter-collector');

// Create your first counter metric
const requestCounter = meter.createCounter('Counter', {
    description: 'Example of a Counter', 
});

// Define some labels for your metrics
const labels = { environment: 'staging' };

// Record some value
requestCounter.bind(labels).add(1);

// In logzio Metrics you will see the following metric:
// Counter_total{environment: 'staging'} 1.0
```

###### Types of metric instruments
For more information, see the OpenTelemetry [documentation](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md).

| Name | Behavior | Default aggregation |
| ---- | ---------- | ------------------- |
| Counter           | Metric value can only go up or be reset to 0, calculated per `counter.Add(context,value,labels)` request. | Sum |
| UpDownCounter     | Metric value can arbitrarily increment or decrement, calculated per `updowncounter.Add(context,value,labels)` request. | Sum |
| ValueRecorder     | Metric values captured by the `valuerecorder.Record(context,value,labels)` function, calculated per request. | TBD  |
| SumObserver       | Metric value can only go up or be reset to 0, calculated per push interval.| Sum |
| UpDownSumObserver | Metric value can arbitrarily increment or decrement, calculated per push interval.| Sum |
| ValueObserver     | Metric values captured by the callback function, calculated per push interval.| LastValue  |