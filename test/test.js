const nock = require('nock');
const assert = require('assert');
const wr = require('../protos/rw/remote_pb')
const util = require('../src/util');
const transform  = require('../src/transformTs');
const rwexporter = require('../src/remoteWriteExporter');
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const sinon = require('sinon');

async function waitForNumberOfExports(exporter, numberOfExports) {
    let totalExports = 0;
    while (totalExports < numberOfExports) {
      await new Promise(resolve => setTimeout(resolve, 20));
      totalExports = exporter.callCount;
    }
  }

describe('TestExporter', function(){
    let testUtil = require('./testUtil');
    let meter;
    let metricExporter;
    let metricReader;

    beforeEach(() => {
        const collectorOptions = {
            url: 'https://listener.logz.io:8053',
            headers: {
                "Authorization": `Bearer ${process.env.METRIC_SHIPPING_TOKEN}`
            }
        };
        metricExporter = new rwexporter.RemoteWriteExporter(collectorOptions);
        metricReader = new PeriodicExportingMetricReader(
            {
                exporter: metricExporter, 
                exportIntervalMillis: 1000
            })
        meter = new MeterProvider({
            readers: [ metricReader ],
        }).getMeter('RemoteWriteExporter', '0.5.0');
    });

    afterEach(async () => {
        await metricReader.shutdown();
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
        it('toTimeSeries()', async function () {
            // generate metrics for function input
            const exporterSpy = sinon.spy(metricExporter, 'export');
            await testUtil.initTestRequest(meter, exporterSpy);
            await waitForNumberOfExports(exporterSpy, 1).catch(e => console.error(e));
            const resourceMetrics = exporterSpy.args[0][0];

            // verify results
            let write_request = transform.toTimeSeries(resourceMetrics);
            assert(write_request, "toTimeSeries() did not return a write request.");

            // verify label values
            const metrics_labels = write_request.f["1"];
            metrics_labels.forEach( metric => {
                const metric_labels = metric.f["1"];
                
                let hasGeneralAttributes = metric_labels.some(item => {
                    return item.u.includes('service.name') && item.u.includes('unknown_service:node');
                });
                let hasPidAttributes = metric_labels.some(item => {
                    return (item.u.includes('pid') && item.u.includes('1'));
                });
                let hasEnvAttributes = metric_labels.some(item => {
                    return (item.u.includes('environment') && item.u.includes('staging'));
                });
                let hasCustomAttributes = hasPidAttributes && hasEnvAttributes;
                let hasNameAttribute = metric_labels.some(item => {
                    return item.u.includes('__name__');
                });
                assert(hasGeneralAttributes, "write_request is missing defualt Collector labels.");
                assert(hasCustomAttributes, "write_request is missing custom labels.");
                assert(hasNameAttribute, "write_request is missing __name__ label.");
                assert.strictEqual(metric_labels.length, 7);
            })

            // verify metric values
            const metrics = write_request.u;
            metrics.forEach( metric => {
                let metricName = metric[0][0][0][1];
                let metricValue = metric[0][1][0][0];

                if (metricName.includes('_total')){
                    assert.strictEqual(metricValue, 5);
                }
                else if (metricName.includes('_sum')){
                    assert.strictEqual(metricValue, 16);
                }
                else if (metricName.includes('_count')){
                    assert.strictEqual(metricValue, 2);
                }
                else if (metricName.includes('_avg')){
                    assert.strictEqual(metricValue, 8);
                }
                else {
                    assert.strictEqual(metricValue, 5);
                }
            })
        });

        it('attachLabel()', function () {
            let labels = [];
            transform.attachLabel({'key': 'testKey', 'value': 'testValue'}, labels)
            assert.strictEqual(labels.length, 2);
            assert.strictEqual(labels[0].u[1], 'testKey');
            assert.strictEqual(labels[1].u[1], 'testValue')
        });

        it('attachSample()', function () {
            let samples = []
            let testSample = {
                "value": 5,
                "timeUnixNano": new Date().getTime(),
            }
            transform.attachSample(testSample, samples)
            assert.strictEqual(samples[0].u[0], 5);
            assert.strictEqual(samples[0].u[1], new Date().getTime());
            samples.pop();
            testSample = {
                "value": {
                    "sum": 44,
                    "count": 2,
                    "timeUnixNano": new Date().getTime(),
                }
            }
            transform.attachSample(testSample, samples, 'sum')
            assert.strictEqual(samples[0].u[0], 44);
            samples.pop();
            transform.attachSample(testSample, samples, 'count')
            assert.strictEqual(samples[0].u[0], 2);
            samples.pop();
            transform.attachSample(testSample, samples, 'avg')
            assert.strictEqual(samples[0].u[0], 22);
        });

        it('convertToTsLabels()', function () {
            let ts = new wr.TimeSeries();
            let testSample = {
                descriptor: {
                  name: 'metric1',
                  type: 'COUNTER',
                  description: 'test counter',
                  unit: '',
                  valueType: 1,
                  advice: {}
                },
                aggregationTemporality: 1,
                dataPointType: 3,
                dataPoints: [
                  {
                    attributes: { pid: '1', environment: 'staging' },
                    startTime: [ 1726476686, 142000000 ],
                    endTime: [ 1726476687, 150000000 ],
                    value: 10
                  }
                ],
                isMonotonic: true
            };
            let testAtt = {
                "att1": "v1",
                "att2": "v2"
            };

            transform.convertToTsLabels(testSample, ts, testAtt, testSample.descriptor.name);
            let labels = testUtil.toLabelDict(ts.f["1"]);
            assert.strictEqual(labels['__name__'], testSample.descriptor.name);
            assert.strictEqual(labels['att1'], 'v1');
            assert.strictEqual(labels['att2'], 'v2');
            assert.strictEqual(labels['pid'], '1');
            assert.strictEqual(labels['environment'], 'staging');
        });

        it('convertToTsLSamples()', function () {
            let testCounterSample = {
                descriptor: {
                  name: 'metric1',
                  type: 'COUNTER',
                  description: 'test counter',
                  unit: '',
                  valueType: 1,
                  advice: {}
                },
                aggregationTemporality: 1,
                dataPointType: 3,
                dataPoints: [
                  {
                    attributes: { pid: '1', environment: 'staging' },
                    startTime: [ 1726476686, 142000000 ],
                    endTime: [ 1726476687, 150000000 ],
                    value: 5
                  }
                ],
                isMonotonic: true
            };
            let testHistogramSample = {
                descriptor: {
                  name: 'metric3',
                  type: 'HISTOGRAM',
                  description: 'Example of a ValueRecorder',
                  unit: '',
                  valueType: 1,
                  advice: {}
                },
                aggregationTemporality: 1,
                dataPointType: 0,
                dataPoints: [{
                    attributes: { pid: '1', environment: 'staging' },
                    startTime: [ 1726557840, 403000000 ],
                    endTime: [ 1726557841, 403000000 ],
                    value: {
                        min: 6,
                        max: 10,
                        sum: 16,
                        buckets: { boundaries: [Array], counts: [Array] },
                        count: 2
                    }
                }]
            };
            let ts = new wr.TimeSeries();
            transform.convertToTsLSamples(testCounterSample, ts);
            assert.strictEqual(ts.u[1][0][0], 5);

            let ts_sum = new wr.TimeSeries();
            transform.convertToTsLSamples(testHistogramSample, ts_sum, 'sum');
            assert.strictEqual(ts_sum.u[1][0][0], 16);
            
            let ts_count = new wr.TimeSeries();
            transform.convertToTsLSamples(testHistogramSample, ts_count, 'count');
            assert.strictEqual(ts_count.u[1][0][0], 2);
            
            let ts_avg = new wr.TimeSeries();
            transform.convertToTsLSamples(testHistogramSample, ts_avg, 'avg');
            assert.strictEqual(ts_avg.u[1][0][0], 8);
        });
    });

    describe('TestExport', function() {
        it('should export metrics successfully', async () => {
            // generate metrics
            const requestCounter = meter.createCounter('randomMetric', {
                description: 'random test counter',
            });
            const labels = {pid: "1", environment: 'staging'};
            requestCounter.add(5, labels);
            requestCounter.add(5, labels);

            // verify details
            const exporterSpy = sinon.spy(metricExporter, 'export');
            await waitForNumberOfExports(exporterSpy, 1).catch(e => console.error(e));
            const resourceMetrics = exporterSpy.args[0];
            const firstResourceMetric = resourceMetrics[0];
            const metric = firstResourceMetric.scopeMetrics[0].metrics[0];
            const dp = metric.dataPoints[0];
            assert.equal(metric.descriptor.name, "randomMetric");
            assert.equal(metric.descriptor.type, "COUNTER");
            assert.equal(metric.descriptor.description, "random test counter");
            assert.equal(dp.attributes, labels);
        });
    });
})

