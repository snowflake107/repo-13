import { CollectorExporterNodeBase as CollectorExporterBaseMain, collectorTypes, CollectorExporterNodeConfigBase } from '@opentelemetry/exporter-collector';
import { ServiceClientType } from './types';
/**
 * Collector Metric Exporter abstract base class
 */
export declare abstract class CollectorExporterNodeBase<ExportItem, ServiceRequest> extends CollectorExporterBaseMain<ExportItem, ServiceRequest> {
    private _send;
    private _sendPromise;
    onInit(config: CollectorExporterNodeConfigBase): void;
    send(objects: ExportItem[], onSuccess: () => void, onError: (error: collectorTypes.CollectorExporterError) => void): void;
    abstract getServiceClientType(): ServiceClientType;
}
//# sourceMappingURL=CollectorExporterNodeBase.d.ts.map