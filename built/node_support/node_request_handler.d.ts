import { AuthorizationRequest } from '../authorization_request';
import { AuthorizationRequestHandler, AuthorizationRequestResponse } from '../authorization_request_handler';
import { AuthorizationServiceConfiguration } from '../authorization_service_configuration';
import { Crypto } from '../crypto_utils';
import { QueryStringUtils } from '../query_string_utils';
export declare class NodeBasedHandler extends AuthorizationRequestHandler {
    httpServerPort: number;
    openCallback: null | ((url: string) => void);
    authorizationPromise: Promise<AuthorizationRequestResponse | null> | null;
    constructor(httpServerPort?: number, openCallback?: null | ((url: string) => void), utils?: QueryStringUtils, crypto?: Crypto);
    performAuthorizationRequest(configuration: AuthorizationServiceConfiguration, request: AuthorizationRequest): void;
    protected completeAuthorizationRequest(): Promise<AuthorizationRequestResponse | null>;
}
