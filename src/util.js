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

const SnappyJS = require('snappyjs');
const transform = require('./transformTs');
const retryCodes = [408, 500, 502, 503, 504, 522, 524];
let lost = 0;



// logging
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

const logger = createLogger({
    defaultMeta: { exporter: 'logzio-nodejs-exporter' },
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

function exporterRetryStrategy(err, response, body, options){
    const shouldRetry = retryCodes.includes(response.statusCode);
    if (shouldRetry){
        options.headers['logzio-shipper'] = `modejs-metrics/1.0.0/${response.attempts}`;
        logger.log({level: "warn", message: `Faild to export, attempt number: ${response.attempts}, retrying again in ${options.retryDelay/1000}s`,});
    }
    return {
        mustRetry: shouldRetry,
        options: options,
    }
}


function send(collector, objects) {
    const serviceRequest = collector.convert(objects);
    const write_request = transform.toTimeSeries(serviceRequest)
    const bytes = write_request.serializeBinary();
    const payload = SnappyJS.compress(bytes);
    if (write_request.wrappers_["1"].length > 0) {
        //Send with htttp
        const request = require('requestretry');
        const options = {
            uri: collector.url,
            method: 'POST',
            agent: collector.agent,
            body: payload,
            headers: {
                "Content-Encoding": "snappy",
                "Authorization": "Bearer " + collector.token,
                "Content-Type": "application/x-protobuf",
                "X-Prometheus-Remote-Write-Version": "0.1.0",
                "logzio-shipper": `modejs-metrics/1.0.0/0`,
                "NN": `${lost}`
            },
            maxAttempts: 3,
            retryDelay: 4000,
            retryStrategy: exporterRetryStrategy
        }

        logger.log({level: 'info', message: `Sending bulk of ${write_request.wrappers_["1"].length} timeseries`});
        request(options, function(err, response, body){
            // this callback will only be called when the request succeeded or after maxAttempts or on error
            if (response.statusCode != 200) {
                logger.log({level: "warn", message:`Export failed after ${response.attempts} attempts. Status code: ${response.statusCode}`})
                lost += write_request.wrappers_["1"].length;
            } else {
                logger.log({level: "info", message:`Export Succeeded after ${response.attempts} attempts. Status code: ${response.statusCode}`})
                lost = 0;
            }
        });
    } else {
        logger.log({level: "info", message: "No timeseries to send"})
    }
}
exports.send = send;
