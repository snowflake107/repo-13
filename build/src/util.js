"use strict";
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = exports.onInit = exports.getExportRequestProto = void 0;
const exporter_collector_1 = require("@opentelemetry/exporter-collector");
const path = require("path");
const types_1 = require("./types");
const protobufjs = require("protobufjs");
const api_1 = require("@opentelemetry/api");


const SnappyJS = require('snappyjs')
const wr = require('../protos/rw/remote_pb')
const https = require('https')
const url = require('url')
const transform = require('./transformTs')




let ExportRequestProto;
function getExportRequestProto() {
    return ExportRequestProto;
}
exports.getExportRequestProto = getExportRequestProto;


function onInit(collector, _config) {
    // const dir = path.resolve(__dirname, '..', 'protos');
    // const root = new protobufjs.Root();
    // root.resolvePath = function (origin, target) {
    //     return `${dir}/${target}`;
    // };
    // if (collector.getServiceClientType() === types_1.ServiceClientType.SPANS) {
    //     const proto = root.loadSync([
    //         'opentelemetry/proto/common/v1/common.proto',
    //         'opentelemetry/proto/resource/v1/resource.proto',
    //         'opentelemetry/proto/trace/v1/trace.proto',
    //         'opentelemetry/proto/collector/trace/v1/trace_service.proto',
    //     ]);
    //     ExportRequestProto = proto === null || proto === void 0 ? void 0 : proto.lookupType('ExportTraceServiceRequest');
    // }
    // else {
    //     const proto = root.loadSync([
    //         'opentelemetry/proto/common/v1/common.proto',
    //         'opentelemetry/proto/resource/v1/resource.proto',
    //         'opentelemetry/proto/metrics/v1/metrics.proto',
    //         'opentelemetry/proto/collector/metrics/v1/metrics_service.proto',
    //         'rw/remote.proto',
    //     ]);
    //     ExportRequestProto = proto === null || proto === void 0 ? void 0 : proto.lookupType('WriteRequest');
    //     // ExportRequestProto = proto === null || proto === void 0 ? void 0 : proto.lookupType('ExportMetricsServiceRequest');
    // }
}
exports.onInit = onInit;

function send(collector, objects, onSuccess, onError) {
    const serviceRequest = collector.convert(objects);
    const write_request = transform.toTimeSeries(serviceRequest)
    const bytes = write_request.serializeBinary();
    const compr = SnappyJS.compress(bytes);
    //Send with htttp
    const parsedUrl = new url.URL(collector.url);
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        method: 'POST',
        agent: collector.agent,
        headers: {
            "Content-Encoding": "snappy",
            "Authorization": "Bearer " + collector.token,
            "Content-Type": "application/x-protobuf",
            "X-Prometheus-Remote-Write-Version": "0.1.0",
        }
    }
    const request = parsedUrl.protocol === 'http:' ? http.request : https.request;
    const req = request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        res.on('data', d => {
            process.stdout.write(d);
        })
    })
    req.on('error', error => {
        console.error(error);
    })
    req.write(compr);
    req.end();

}
exports.send = send;
//# sourceMappingURL=util.js.map