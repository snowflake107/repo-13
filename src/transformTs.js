const wr = require('../protos/rw/remote_pb')
function attachSample(s, samples, metric_type = 'reg'){
    let sample = new wr.Sample();
    sample.setTimestampmillis(Math.floor(new Date().getTime()));
    if (metric_type == 'reg') {
        sample.setValue(s.value);
    }
    else if (metric_type == 'sum') {
        sample.setValue(s.sum);
    }
    else if (metric_type == 'count') {
        sample.setValue(s.count);
    }
    else if (metric_type == 'avg') {
        sample.setValue(s.sum/s.count);
    }
    samples.push(sample)
}

function attachLabel(l, labels){
    let label = new wr.Label();
    label.setName(l.key);
    label.setValue(l.value);
    labels.push(label)
}

function convertToTsLSamples(metric, ts, metric_type = 'reg'){
    const samples = []
    if ('intSum' in metric){
        metric.intSum.dataPoints.forEach((s) => {
            attachSample(s, samples)
        })
    }
    else if ('doubleSum' in metric){
        metric.doubleSum.dataPoints.forEach((s) => {
            attachSample(s, samples)
        })
    }
    else if ('intGauge' in metric){
        metric.intGauge.dataPoints.forEach((s) => {
            attachSample(s, samples)
        })
    }
    else if ('doubleGauge' in metric){
        metric.doubleGauge.dataPoints.forEach((s) => {
            attachSample(s, samples)
        })
    }
    else if ('intHistogram' in metric){
        metric.intHistogram.dataPoints.forEach((s) => {
            attachSample(s, samples, metric_type)
        })
    }
    else if ('doubleHistogram' in metric){
        metric.doubleHistogram.dataPoints.forEach((s) => {
            attachSample(s, samples, metric_type)
        })
    }
    else {
        throw new Error('Metric type is not supported')
    }
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
    attributes.forEach((att) => {
        let att_label = new wr.Label();
        att_label.setName(att.key);
        att_label.setValue(att.value.stringValue);
        labels.push(att_label);
    })
    // add metric labels
    if ('intSum' in metric){
        let metric_labels = metric.intSum.dataPoints[0].labels;
        metric_labels.forEach((l) => {
            attachLabel(l, labels);
        })
    }
    else if ('doubleSum' in metric){
        let metric_labels = metric.doubleSum.dataPoints[0].labels;
        metric_labels.forEach((l) => {
            attachLabel(l, labels);
        })
    }
    else if ('intGauge' in metric){
        let metric_labels = metric.intGauge.dataPoints[0].labels;
        metric_labels.forEach((l) => {
            attachLabel(l, labels);
        })
    }
    else if ('doubleGauge' in metric){
        let metric_labels = metric.doubleGauge.dataPoints[0].labels;
        metric_labels.forEach((l) => {
            attachLabel(l, labels);
        })
    }
    else if ('intHistogram' in metric){
        let metric_labels = metric.intHistogram.dataPoints[0].labels;
        metric_labels.forEach((l) => {
            attachLabel(l, labels);
        })
    }
    else if ('doubleHistogram' in metric){
        let metric_labels = metric.doubleHistogram.dataPoints[0].labels;
        metric_labels.forEach((l) => {
            attachLabel(l, labels);
        })
    }
    else {
        throw new Error('Metric type is not supported')
    }
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
    const resources = otel_request['resourceMetrics'];
    resources.forEach((_resource) => {
        const _attributes = _resource.resource.attributes;
        _resource.instrumentationLibraryMetrics.forEach((ilm) => {
            let _metrics = ilm.metrics;
            _metrics.forEach((_metric) => {
                if (checkNestedObjectByKeyValue(_metric,'isMonotonic', true)) {
                    let _ts = new wr.TimeSeries();
                    convertToTsLabels(_metric, _ts, _attributes, _metric.name + "_total");
                    convertToTsLSamples(_metric, _ts);
                    write_request.addTimeseries(_ts);
                }
                // Histogram metric
                else if ('doubleHistogram' in _metric || 'intHistogram' in _metric) {
                    let metric_type = (('doubleHistogram' in _metric) ? 'doubleHistogram' : 'intHistogram');
                    // Sum metric
                    let _ts_sum = new wr.TimeSeries();
                    convertToTsLabels(_metric, _ts_sum, _attributes, `${_metric.name}_sum`);
                    convertToTsLSamples(_metric, _ts_sum, 'sum');
                    write_request.addTimeseries(_ts_sum);
                    // Count metric
                    let _ts_count = new wr.TimeSeries();
                    convertToTsLabels(_metric, _ts_count, _attributes, `${_metric.name}_count`);
                    convertToTsLSamples(_metric, _ts_count, 'count');
                    write_request.addTimeseries(_ts_count);
                    // Average metric
                    let _ts_avg = new wr.TimeSeries();
                    convertToTsLabels(_metric, _ts_avg, _attributes, `${_metric.name}_avg`);
                    convertToTsLSamples(_metric, _ts_avg, 'avg');
                    write_request.addTimeseries(_ts_avg);
                }
                else {
                    let _ts = new wr.TimeSeries();
                    convertToTsLabels(_metric, _ts, _attributes, _metric.name);
                    convertToTsLSamples(_metric, _ts);
                    write_request.addTimeseries(_ts);
                }
            })
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


