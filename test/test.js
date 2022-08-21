const nock = require('nock');
const assert = require('assert');
const wr = require('../protos/rw/remote_pb')
const util = require('../src/util');
const transform  = require('../src/transformTs');
const rwexporter = require('../src/remoteWriteExporter');


describe('TestExporter', function(){
    let request;
    let testMetrics;
    let testAtt;
    let rawMetricList;
    let testUtil = require('./testUtil');
    before(async function () {
        request = await testUtil.initTestRequest();
        rawMetricList = await testUtil.initTestRequest( true);

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
    describe('TestExporterConfig', function() {
        it('Default url', function (){
            let r = new rwexporter.RemoteWriteExporter({token:"fake"});
            assert.strictEqual(r.url,"https://listener.logz.io:8053");
        });
        it('Custom url', function (){
            let r = new rwexporter.RemoteWriteExporter({token:"fake",url:"custom"});
            assert.strictEqual(r.url,"custom");
        });
    });
    describe('TestTransformTS', function () {
        it('toTimeSeries()', function () {
            let write_request = transform.toTimeSeries(request);
            write_request.array[0].forEach(metric => {
                let metricLabels = testUtil.toLabelDict(metric);
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
            })
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
                "timeUnixNano": new Date().getTime(),
            }
            transform.attachSample(testSample, samples)
            assert.strictEqual(samples[0].array[0], 5);
            assert.strictEqual(samples[0].array[1], new Date().getTime());
            samples.pop();
            testSample = {
                "sum": 44,
                "count": 2,
                "timeUnixNano": new Date().getTime(),
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
            let labels = testUtil.toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');
            assert.strictEqual(labels['att1'], 'v1');
            assert.strictEqual(labels['att2'], 'v2');
            assert.strictEqual(labels['pid'], '1');
            assert.strictEqual(labels['environment'], 'staging');

            metric['intSum'] = metric['doubleHistogram'];
            delete metric.doubleHistogram;
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            labels = testUtil.toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');

            metric['intGauge'] = metric['intSum'];
            delete metric.intSum;
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            labels = testUtil.toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');

            metric['doubleGauge'] = metric['intGauge'];
            delete metric.intGauge;
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            labels = testUtil.toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');

            metric['doubleSum'] = metric['doubleGauge'];
            delete metric.doubleGauge;
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            labels = testUtil.toLabelDict(ts.array);
            assert.strictEqual(labels['__name__'], 'recorder_metric');

            metric['intHistogram'] = metric['doubleSum'];
            delete metric.doubleSum;
            transform.convertToTsLabels(metric,ts,testAtt,metric.name);
            labels = testUtil.toLabelDict(ts.array);
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

    describe('TestExport', function() {
            this.timeout(20000)
            it('Send() should success', async  () => {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                const collectorOptions = {
                    url: 'https://localhost:5555',
                    headers: {
                        "Authorization":"Bearer token"
                    }
                };
                const metricExporter = new rwexporter.RemoteWriteExporter(collectorOptions);
                nock('https://localhost:5555')
                    .post('/')
                    .reply(200, {"message":"hello world"});
                let response = util.send(metricExporter, rawMetricList);
                await sleep(5000)
                assert.strictEqual(response.options.headers['logzio-shipper'],"nodejs-metrics/1.0.0/0/0")
            });
            it('Send() should not retry', async  () => {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                const collectorOptions = {
                    url: 'https://localhost:5555',
                    headers: {
                        "Authorization":"Bearer token"
                    }                };
                const metricExporter = new rwexporter.RemoteWriteExporter(collectorOptions);
                nock('https://localhost:5555')
                    .post('/')
                    .reply(400, {"message":"hello world"});
                let response = util.send(metricExporter, rawMetricList);
                await sleep(5000)
                assert.strictEqual(response.options.headers['logzio-shipper'],"nodejs-metrics/1.0.0/0/0")
                assert.strictEqual(response.attempts,1)
            });
            it('Send() should retry', async  () => {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                const collectorOptions = {
                    url: 'https://localhost:5555',
                    headers: {
                        "Authorization":"Bearer token"
                    }                };
                const metricExporter = new rwexporter.RemoteWriteExporter(collectorOptions);
                nock('https://localhost:5555')
                    .persist()
                    .post('/')
                    .reply(500, {"message":"hello world"});
                let response = util.send(metricExporter, rawMetricList);
                await sleep(8000);
                // should retry 3 times and write header
                assert.strictEqual(response.options.headers['logzio-shipper'],"nodejs-metrics/1.0.0/3/5");
                assert.strictEqual(response.attempts,3);
                // should drop 5 ts
            });
        });

})

