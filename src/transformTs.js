const wr = require('../protos/rw/remote_pb')
function attachSample(s, samples, metric_type = 'reg'){
    let sample = new wr.Sample();
    sample.setTimestampmillis(Math.floor(new Date().getTime()));
    if (metric_type == 'reg') {
        sample.setValue(s.value);
    }
    else if (metric_type == 'sum') {
        sample.setValue(s.value.sum);
    }
    else if (metric_type == 'count') {
        sample.setValue(s.value.count);
    }
    else if (metric_type == 'avg') {
        sample.setValue(s.value.sum/s.value.count);
    }
    samples.push(sample)
}

function attachLabel(l, labels){
    let label;
    
    Object.entries(l).forEach(([key, value]) => {
        label = new wr.Label();
        label.setName(key);
        label.setValue(value);
        labels.push(label);
    })
}

function convertToTsLSamples(metric, ts, metric_type = 'reg'){
    const samples = []

    metric.dataPoints.forEach((dp) => {
        attachSample(dp, samples, metric_type);
    });

    samples.forEach((s) => {
        ts.addSamples(s);
    })
}

function convertToTsLabels(metric, ts, attributes ,name){
    const labels = []
    // add name label
    let name_label = new wr.Label();
    name_label.setName('__name__');
    name_label.setValue(name);
    labels.push(name_label);
    // add attributes labels
    Object.entries(attributes).forEach(([key, value]) => {
        let att_label = new wr.Label();
        att_label.setName(key);
        att_label.setValue(value);
        labels.push(att_label);
    })
    // add metric labels
    metric.dataPoints.forEach((dp) => {
        metric_labels = dp.attributes;
        attachLabel(metric_labels, labels);
    });
    labels.forEach((l) => {
        ts.addLabels(l);
    })
}

function checkNestedObjectByKeyValue(obj, objKey, objValue) {
    if (typeof obj !== 'object') return false;
    if (obj.hasOwnProperty(objKey)) {

        return JSON.stringify(obj[objKey]) === JSON.stringify(objValue)
    }
    for (const value of Object.values(obj)) {
        if (checkNestedObjectByKeyValue(value, objKey, objValue)) return true
    }
    return false
}


function toTimeSeries(otel_request) {
    const write_request = new wr.WriteRequest();
    const scopeMetrics = otel_request.scopeMetrics;
    const attributes = otel_request.resource._attributes;

    scopeMetrics.forEach((scopeMetric) => {
        const metrics = scopeMetric.metrics;
        metrics.forEach((metric) => {

            if (checkNestedObjectByKeyValue(metric,'isMonotonic', true)) {
                let _ts = new wr.TimeSeries();
                convertToTsLabels(metric, _ts, attributes, metric.descriptor.name + "_total");
                convertToTsLSamples(metric, _ts);
                write_request.addTimeseries(_ts);
            }
            // Histogram metric
            else if (metric.descriptor.type === 'HISTOGRAM') {
                // Sum metric
                let _ts_sum = new wr.TimeSeries();
                convertToTsLabels(metric, _ts_sum, attributes, `${metric.descriptor.name}_sum`);
                convertToTsLSamples(metric, _ts_sum, 'sum');
                write_request.addTimeseries(_ts_sum);
                // Count metric
                let _ts_count = new wr.TimeSeries();
                convertToTsLabels(metric, _ts_count, attributes, `${metric.descriptor.name}_count`);
                convertToTsLSamples(metric, _ts_count, 'count');
                write_request.addTimeseries(_ts_count);
                // Average metric
                let _ts_avg = new wr.TimeSeries();
                convertToTsLabels(metric, _ts_avg, attributes, `${metric.descriptor.name}_avg`);
                convertToTsLSamples(metric, _ts_avg, 'avg');
                write_request.addTimeseries(_ts_avg);
            }
            else {
                let _ts = new wr.TimeSeries();
                convertToTsLabels(metric, _ts, attributes, metric.descriptor.name);
                convertToTsLSamples(metric, _ts);
                write_request.addTimeseries(_ts);
            }
        })
    })
    return write_request;
}
// export
exports.toTimeSeries = toTimeSeries;
exports.convertToTsLabels = convertToTsLabels;
exports.convertToTsLSamples = convertToTsLSamples;
exports.attachSample = attachSample;
exports.convertToTsLSamples = convertToTsLSamples;
exports.attachLabel = attachLabel;


