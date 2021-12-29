const rwexporter = require('../src/remoteWriteExporter');
const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
async function convertMetrics (rawMetrics, exporter, returnRaw = false) {
    let metrics_list = [];
    for (const metric of rawMetrics) {
        await metric.getMetricRecord().then(function (res) {
            metrics_list.push(res[0]);
        });
    }
    if (returnRaw){
        return metrics_list;
    }
    let metrics =  await exporter.convert(metrics_list);
    return metrics;
}

function toLabelDict(metric) {
    let list = {}
    metric[0].forEach( label => {
        list[label[0]] = label[1];
    });
    return list;
}
exports.toLabelDict = toLabelDict;

async function initTestRequest(returnRaw = false){
    const collectorOptions = {
        url: 'fake',
        headers: {
            "Authorization":"Bearer fakeToken"
        }
    };
    const metricExporter = new rwexporter.RemoteWriteExporter(collectorOptions);
    const meter = new MeterProvider({
        exporter: metricExporter,
        interval: 1,
    }).getMeter('example-exporter-collector');
    const requestCounter = meter.createCounter('metric1', {
        description: 'Example of a Counter',
    });

    const upDownCounter = meter.createUpDownCounter('metric2', {
        description: 'Example of a UpDownCounter',
    });
    const histogram = meter.createHistogram('recorder_metric', {
        description: 'Example of a ValueRecorder',
    });
    const labels = {pid: "1", environment: 'staging'};
    requestCounter.bind(labels).add(5);
    upDownCounter.bind(labels).add(5);
    histogram.bind(labels).record(6);
    histogram.bind(labels).record(10);
    metricExporter.shutdown()
    if (returnRaw) {
        return await convertMetrics([requestCounter, upDownCounter, histogram], metricExporter, returnRaw);
    }
    else {
        return await convertMetrics([requestCounter, upDownCounter, histogram], metricExporter);

    }
}
exports.initTestRequest = initTestRequest;

