import { collectorTypes, CollectorExporterNodeConfigBase } from '@opentelemetry/exporter-collector';
import { CollectorExporterNodeBase } from './CollectorExporterNodeBase';
import type { Type } from 'protobufjs';
export declare function getExportRequestProto(): Type | undefined;
export declare function onInit<ExportItem, ServiceRequest>(collector: CollectorExporterNodeBase<ExportItem, ServiceRequest>, _config: CollectorExporterNodeConfigBase): void;
export declare function send<ExportItem, ServiceRequest>(collector: CollectorExporterNodeBase<ExportItem, ServiceRequest>, objects: ExportItem[], onSuccess: () => void, onError: (error: collectorTypes.CollectorExporterError) => void): void;
//# sourceMappingURL=util.d.ts.map