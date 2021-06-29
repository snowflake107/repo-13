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
exports.CollectorExporterNodeBase = void 0;
const api_1 = require("@opentelemetry/api");
const exporter_collector_1 = require("@opentelemetry/exporter-collector");
/**
 * Collector Metric Exporter abstract base class
 */
class CollectorExporterNodeBase extends exporter_collector_1.CollectorExporterNodeBase {
    _sendPromise(objects, onSuccess, onError) {
        const promise = new Promise(resolve => {
            const _onSuccess = () => {
                onSuccess();
                _onFinish();
            };
            const _onError = (error) => {
                onError(error);
                _onFinish();
            };
            const _onFinish = () => {
                resolve();
                const index = this._sendingPromises.indexOf(promise);
                this._sendingPromises.splice(index, 1);
            };
            this._send(this, objects, _onSuccess, _onError);
        });
        this._sendingPromises.push(promise);
    }
    onInit(config) {
        this._isShutdown = false;
        // defer to next tick and lazy load to avoid loading protobufjs too early
        // and making this impossible to be instrumented
        setImmediate(() => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { onInit } = require('./util');
            onInit(this, config);
        });
    }
    send(objects, onSuccess, onError) {
        if (this._isShutdown) {
            api_1.diag.debug('Shutdown already started. Cannot send objects');
            return;
        }
        if (!this._send) {
            // defer to next tick and lazy load to avoid loading protobufjs too early
            // and making this impossible to be instrumented
            setImmediate(() => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { send } = require('./util');
                this._send = send;
                this._sendPromise(objects, onSuccess, onError);
            });
        }
        else {
            this._sendPromise(objects, onSuccess, onError);
        }
    }
}
exports.CollectorExporterNodeBase = CollectorExporterNodeBase;
//# sourceMappingURL=CollectorExporterNodeBase.js.map