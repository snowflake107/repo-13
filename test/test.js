const assert = require('assert');
const wr = require('../protos/rw/remote_pb')
const util = require('../src/util');
const { MeterProvider } = require('@opentelemetry/metrics');
const transform  = require('../src/transformTs');
const rwexporter = require('../src/remoteWriteExporter');
const collec = require('@opentelemetry/exporter-collector');

async function convertMetrics (rawMetrics, exporter) {
    let metrics_list = [];
    for (const metric of rawMetrics) {
        await metric.getMetricRecord().then(function (res) {
            metrics_list.push(res[0]);
        });
    }
    let metrics =  await exporter.convert(metrics_list)
    return metrics
}

function toLabelDict(metric) {
    let list = {}
    metric[0].forEach( label => {
        list[label[0]] = label[1];
    });
    return list;
}

async function initTestRequest(){
    const collectorOptions = {
        url: 'fake',
        token: 'token',
    };
    const metricExporter = new rwexporter.CollectorMetricExporter(collectorOptions);
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
    const recorder = meter.createValueRecorder('recorder_metric', {
        description: 'Example of a ValueRecorder',
    });
    const labels = {pid: "1", environment: 'staging'};
    requestCounter.bind(labels).add(5);
    upDownCounter.bind(labels).add(5);
    recorder.bind(labels).record(6);
    recorder.bind(labels).record(10);
    metricExporter.shutdown()
    return await convertMetrics([requestCounter, upDownCounter, recorder], metricExporter);
}


describe('TestExporter', function(){
    describe('TestExporterInit', function() {
        describe('ConfigValues', function() {
            it('Default url', function (){
                let r = new rwexporter.CollectorMetricExporter({token:"fake"});
                assert.strictEqual(r.url,"https://listener.logz.io:8053");
            });
            it('Custom url', function (){
                let r = new rwexporter.CollectorMetricExporter({token:"fake",url:"custom"});
                assert.strictEqual(r.url,"custom");
            });
            it('Missing token', function (){
                try {
                    let r = new rwexporter.CollectorMetricExporter({token:"",url:"custom"});
                }
                catch (e) {
                    assert(e.message == "Token is required")
                }
            });
        });
    });

    describe('TestTransformTS', function () {
        let request;
        let testMetrics;
        let testAtt;
        before(async function () {
            request = await initTestRequest();
            testMetrics = request['resourceMetrics'][0]['instrumentationLibraryMetrics'][0]['metrics'];
            testAtt =[
                {
                    "key": "att1",
                    "value": {
                        "stringValue": "v1"
                    }
                },
                {
                    "key": "att2",
                    "value": {
                        "stringValue": "v2"
                    }
                }
            ]
        });

        it('toTimeSeries()', function () {
            let write_request = transform.toTimeSeries(request);
            write_request.array[0].forEach(metric => {
                let metricLabels = toLabelDict(metric);
                assert.strictEqual(metricLabels['pid'], '1')
                assert.strictEqual(metricLabels['environment'], 'staging')
            })
            let metrics = write_request.array[0];
            assert.strictEqual(metrics.length,5);
            metrics.forEach( metric => {
                let metricName = metric[0][0][1];
                let metricValue = metric[1][0][0];
                if (metricName.includes('_total')){
                    assert.strictEqual(metricValue,5);
                }
                else if (metricName.includes('_sum')){
                    assert.strictEqual(metricValue,16);
                }
                else if (metricName.includes('_count')){
                    assert.strictEqual(metricValue,2);
                }
                else if (metricName.includes('_avg')){
                    assert.strictEqual(metricValue,8);
                }
                else {
                    assert.strictEqual(metricValue,5);
                }
            }),
            console.log("DS")
        });
        it('attachLabel()', function () {
            let labels = [];
            transform.attachLabel({'key': 'testKey', 'value': 'testValue'}, labels)
            assert.strictEqual(labels.length, 1);
            assert.strictEqual(labels[0].array[0], 'testKey');
            assert.strictEqual(labels[0].array[1], 'testValue')
        });

        it('attachSample()', function () {
            let samples = []
            let testSample = {
                "value": 5,
                "startTimeUnixNano": 10000005,
            }
            transform.attachSample(testSample, samples)
            assert.strictEqual(samples[0].array[0], 5);
            assert.strictEqual(samples[0].array[1], 10);
            samples.pop();
            testSample = {
                "sum": 44,
                "count": 2,
                "startTimeUnixNano": 10000005,
            }
            transform.attachSample(testSample, samples, 'sum')
            assert.strictEqual(samples[0].array[0], 44);
            samples.pop();
            transform.attachSample(testSample, samples, 'count')
            assert.strictEqual(samples[0].array[0], 2);
            samples.pop();
            transform.attachSample(testSample, samples, 'avg')
            assert.strictEqual(samples[0].array[0], 22);
        });

        it('convertToTsLabels()', function () {
            let ts = new wr.TimeSeries();
            let metric = testMetrics[2];
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            let labels = toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');
            assert.strictEqual(labels['att1'], 'v1');
            assert.strictEqual(labels['att2'], 'v2');
            assert.strictEqual(labels['pid'], '1');
            assert.strictEqual(labels['environment'], 'staging');

            metric['intSum'] = metric['doubleHistogram'];
            delete metric.doubleHistogram;
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            labels = toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');

            metric['intGauge'] = metric['intSum'];
            delete metric.intSum;
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            labels = toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');

            metric['doubleGauge'] = metric['intGauge'];
            delete metric.intGauge;
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            labels = toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');

            metric['doubleSum'] = metric['doubleGauge'];
            delete metric.doubleGauge;
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            labels = toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');

            metric['intHistogram'] = metric['doubleSum'];
            delete metric.doubleSum;
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            labels = toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');

            metric['doubleHistogram'] = metric['intHistogram'];
            delete metric.intHistogram;
        });

        it('convertToTsLSamples()', function () {
            let ts = new wr.TimeSeries();
            let metric = testMetrics[1];
            transform.convertToTsLSamples(metric,ts);
            assert.strictEqual(ts.array[1][0][0],5);
            metric['intSum'] = metric['doubleSum'];
            ts.array[1].pop();
            transform.convertToTsLSamples(metric,ts);
            assert.strictEqual(ts.array[1][0][0],5);
            metric['doubleSum'] = metric['intSum'];
            ts.array[1].pop();
            metric = testMetrics[2];
            transform.convertToTsLSamples(metric,ts,'sum');
            assert.strictEqual(ts.array[1][0][0],16);
            ts.array[1].pop();
            transform.convertToTsLSamples(metric,ts,'count');
            assert.strictEqual(ts.array[1][0][0],2);
            ts.array[1].pop();
            transform.convertToTsLSamples(metric,ts,'avg');
            assert.strictEqual(ts.array[1][0][0],8);
        });
    });
})

