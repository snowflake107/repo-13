## Logz.io nodejs metrics sdk
This topic includes instructions on how to send custom metrics to Logz.io from your Node.js application.

The included example uses the [OpenTelemetry JS SDK](https://github.com/open-telemetry/opentelemetry-js) and its based on [OpenTelemetry exporter collector proto](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-exporter-collector-proto).

**Before you begin, you'll need**:
Node 8 or higher


**Note** This project works best with logzio as metrics backend, but its compatible with all backends that support `prometheuesrmotewrite` format

## Quick start

Install the package:

```
npm install logzio-nodejs-metrics-sdk@0.0.1
```

Set the variables in the following code snippet:

|Environment variable|Description|
|---|---|
|url|  The Logz.io Listener URL for for your region, configured to use port **8052** for http traffic, or port **8053** for https traffic. |
|token| Your Logz.io Prometheus Metrics account token.  |
```js
const { MeterProvider } = require('@opentelemetry/metrics');
const { RemoteWriteMetricExporter } =  require('logzio-nodejs-metrics-sdk');

const collectorOptions = {
    url: '<<url>>',
    headers: {
        "Authorization":"Bearer <<token>>"
    }
};
// Initialize the exporter
const metricExporter = new RemoteWriteMetricExporter(collectorOptions);

// Initialize the meter provider
const meter = new MeterProvider({
    exporter: metricExporter,
    interval: 15000, // Push interval in seconds
}).getMeter('example-exporter');

// Create your first counter metric
const requestCounter = meter.createCounter('Counter', {
    description: 'Example of a Counter', 
});
// Define some labels for your metrics
const labels = { environment: 'prod' };
// Record some value
requestCounter.bind(labels).add(1);
// In logzio Metrics you will see the following metric:
// Counter_total{environment: 'prod'} 1.0
```

### Types of metric instruments
For more information, see the OpenTelemetry [documentation](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md).

| Name | Behavior |
| ---- | ---------- |
| Counter           | Metric value can only go up or be reset to 0, calculated per `counter.Add(context,value,labels)` request. |
| UpDownCounter     | Metric value can arbitrarily increment or decrement, calculated per `updowncounter.Add(context,value,labels)` request. |
| ValueRecorder     | Metric values captured by the `valuerecorder.Record(context,value,labels)` function, calculated per request. |
| SumObserver       | Metric value can only go up or be reset to 0, calculated per push interval.|
| UpDownSumObserver | Metric value can arbitrarily increment or decrement, calculated per push interval.|
| ValueObserver     | Metric values captured by the callback function, calculated per push interval.|

### More examples
First Initialize the exporter and meter provider:
```js
const { MeterProvider } = require('@opentelemetry/metrics');
const { RemoteWriteMetricExporter } =  require('logzio-nodejs-metrics-sdk');

const collectorOptions = {
    url: '<<url>>',
    headers: {
        "Authorization":"Bearer <<token>>"
    }
};
// Initialize the exporter
const metricExporter = new RemoteWriteMetricExporter(collectorOptions);

// Initialize the meter provider
const meter = new MeterProvider({
    exporter: metricExporter,
    interval: 15000, // Push interval in seconds
}).getMeter('example-exporter');
```
Then create different types of metrics
#### UpDownCounter:
```js
// Create UpDownCounter metric
const upDownCounter = meter.createUpDownCounter('UpDownCounter', {
    description: 'Example of a UpDownCounter',
});
// Define some labels for your metrics
const labels = { environment: 'prod' };
// Record some values
upDownCounter.bind(labels);
upDownCounter.add(5);
upDownCounter.add(-1);
// In logzio you will see the following metric:
// UpDownCounter{environment: 'prod'} 4.0
```

#### ValueRecorder:
```js
// Create ValueRecorder metric
const recorder = meter.createValueRecorder('test_value_recorder', {
    description: 'Example of a ValueRecorder',
});
// Define some labels for your metrics
const labels = { environment: 'prod' };
// Record some values
recorder.bind(labels);
recorder.record(30);
recorder.record(20);
// In logzio you will see the following metrics:
// test_value_recorder_sum{environment: 'prod'} 50.0
// test_value_recorder_count{environment: 'prod'} 2.0
// test_value_recorder_avg{environment: 'prod'} 25.0
```

#### SumObserver:
```js
// Create SumObserver metric
meter.createSumObserver('SumObserver', {
    description: 'Example of a sync sum observer with callback',
}, (observerResult) => {
    const value = getMetrics(); // Calculte your metric value
    const labels = { environment: 'prod' }; // Define some labels
    observerResult.observe(value, labels);
});
// In logzio you will see the following metrics:
// SumObserver_total{environment: 'prod'}
```

#### UpDownSumObserver:
```js
// This function will calculate your metric value
function getAsyncValue() {
    return new Promise((resolve) => {
        setTimeout(()=> {
            resolve(Math.random());
        }, 100);
    });
}
// Create UpDownSumObserver metric
meter.createUpDownSumObserver('UpDownSumObserver', {
    description: 'Example of an async observer with callback',
}, async (observerResult) => {
    const value = await getAsyncValue(); // Calculte your metric value
    const labels = { environment: 'prod' }; // Define some labels
    observerResult.observe(value, labels);
});
// In logzio you will see the following metrics:
// UpDownSumObserver{environment: 'prod'}
```

#### ValueObserver:
```js
// This function will calculate your metric value
function getSomeAsyncMetrics() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                value1: Math.random(),
                value2: Math.random(),
            });
        }, 100)
    });
}

// Create ValueObserver metrics
const valueObserver = meter.createValueObserver('value_observer', {
    description: 'Example of a value observer metric',
});
const anotherValueObserver = meter.createValueObserver('another_value_observer', {
    description: 'Example of a value observer metric',
});

meter.createBatchObserver((observerBatchResult) => {
    getSomeAsyncMetrics().then(metrics => {
        const labels = { environment: 'prod' }; // Define some labels
        observerBatchResult.observe(labels, [
            valueObserver.observation(metrics.value1),
            anotherValueObserver.observation(metrics.value2),
        ]);
    });
});

// In logzio you will see the following metrics:
// value_observer{environment: 'prod'}
// another_value_observer{environment: 'prod'}
```


