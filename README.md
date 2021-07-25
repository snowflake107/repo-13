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