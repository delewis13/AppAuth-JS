/// <reference types="node" />
import { EventEmitter } from 'events';
import { AuthorizationRequest } from '../authorization_request';
import { AuthorizationRequestHandler, AuthorizationRequestResponse } from '../authorization_request_handler';
import { AuthorizationServiceConfiguration } from '../authorization_service_configuration';
import { Crypto } from '../crypto_utils';
import { QueryStringUtils } from '../query_string_utils';
export declare class ServerEventsEmitter extends EventEmitter {
    static ON_UNABLE_TO_START: string;
    static ON_AUTHORIZATION_RESPONSE: string;
}
export declare class NodeBasedHandler extends AuthorizationRequestHandler {
    httpServerPort: number;
    openCallback: null | ((url: string) => void);
    authorizationPromise: Promise<AuthorizationRequestResponse | null> | null;
    emitter: ServerEventsEmitter;
    constructor(httpServerPort?: number, openCallback?: null | ((url: string) => void), utils?: QueryStringUtils, crypto?: Crypto);
    performAuthorizationRequest(configuration: AuthorizationServiceConfiguration, request: AuthorizationRequest): void;
    protected completeAuthorizationRequest(): Promise<AuthorizationRequestResponse | null>;
}
