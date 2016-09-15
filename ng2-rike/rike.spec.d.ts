import { Observable } from "rxjs/Rx";
import { Protocol } from "./protocol";
export declare function setupTesting(): void;
export declare function configureHttpTesting(): void;
export declare function configureRikeTesting(): void;
export declare function nextFrom<T>(op: Observable<T>): T | undefined;
export declare function nextErrorFrom<T>(op: Observable<any>): T | undefined;
export declare function expectJsonProtocol(protocol: Protocol<any, any>): void;
