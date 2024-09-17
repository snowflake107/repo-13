const rwexporter = require('../src/remoteWriteExporter');
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
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
    metric.forEach( label => {
        list[label.u[0]] = label.u[1];
    });
    return list;
}
exports.toLabelDict = toLabelDict;

async function initTestRequest(meter){
    const requestCounter = meter.createCounter('metric1', {
        description: 'Example of a Counter',
    });

    const upDownCounter = meter.createUpDownCounter('metric2', {
        description: 'Example of a UpDownCounter',
    });
    const histogram = meter.createHistogram('metric3', {
        description: 'Example of a ValueRecorder',
    });
    const labels = {pid: "1", environment: 'staging'};
    requestCounter.add(5, labels);
    upDownCounter.add(5, labels);
    histogram.record(6, labels);
    histogram.record(10, labels);
}
exports.initTestRequest = initTestRequest;

