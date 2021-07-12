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

const SnappyJS = require('snappyjs')
const https = require('https')
const url = require('url')
const transform = require('./transformTs')

// logging
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

const logger = createLogger({
    defaultMeta: { exporter: 'winston-exporter' },
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [new transports.Console()]
})

let ExportRequestProto;
function getExportRequestProto() {
    return ExportRequestProto;
}
exports.getExportRequestProto = getExportRequestProto;


function onInit(collector, _config) {

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
        res.on('data', d => {
            process.stdout.write(d);
        })
        if (res.statusCode == 200) {
            logger.log({
                level: 'info',
                message: 'Export succesed'
            });
    }

    })
    req.on('error', error => {
        logger.log({
            level: 'info',
            message: `Failed to export metrics: ${error}`
        });
    })
    logger.log({
        level: 'info',
        message: `Sending bulk of ${write_request.wrappers_["1"].length} timeseries`
    });
    req.write(compr);
    req.end();
}
exports.send = send;
//# sourceMappingURL=util.js.map