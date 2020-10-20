"use strict";
/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeBasedHandler = void 0;
var events_1 = require("events");
var Http = require("http");
var Url = require("url");
var authorization_request_handler_1 = require("../authorization_request_handler");
var authorization_response_1 = require("../authorization_response");
var logger_1 = require("../logger");
var query_string_utils_1 = require("../query_string_utils");
var crypto_utils_1 = require("./crypto_utils");
// TypeScript typings for `opener` are not correct and do not export it as module
var opener = require("opener");
var ServerEventsEmitter = /** @class */ (function (_super) {
    __extends(ServerEventsEmitter, _super);
    function ServerEventsEmitter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServerEventsEmitter.ON_UNABLE_TO_START = 'unable_to_start';
    ServerEventsEmitter.ON_AUTHORIZATION_RESPONSE = 'authorization_response';
    return ServerEventsEmitter;
}(events_1.EventEmitter));
var NodeBasedHandler = /** @class */ (function (_super) {
    __extends(NodeBasedHandler, _super);
    function NodeBasedHandler(
    // default to port 8000
    httpServerPort, openCallback, utils, crypto) {
        if (httpServerPort === void 0) { httpServerPort = 8000; }
        if (openCallback === void 0) { openCallback = null; }
        if (utils === void 0) { utils = new query_string_utils_1.BasicQueryStringUtils(); }
        if (crypto === void 0) { crypto = new crypto_utils_1.NodeCrypto(); }
        var _this = _super.call(this, utils, crypto) || this;
        _this.httpServerPort = httpServerPort;
        _this.openCallback = openCallback;
        // the handle to the current authorization request
        _this.authorizationPromise = null;
        return _this;
    }
    NodeBasedHandler.prototype.performAuthorizationRequest = function (configuration, request) {
        var _this = this;
        // use opener to launch a web browser and start the authorization flow.
        // start a web server to handle the authorization response.
        var emitter = new ServerEventsEmitter();
        var requestHandler = function (httpRequest, response) {
            if (!httpRequest.url) {
                return;
            }
            var url = Url.parse(httpRequest.url);
            var searchParams = new Url.URLSearchParams(url.query || '');
            var state = searchParams.get('state') || undefined;
            var code = searchParams.get('code');
            var error = searchParams.get('error');
            if (!state && !code && !error) {
                // ignore irrelevant requests (e.g. favicon.ico)
                return;
            }
            logger_1.log('Handling Authorization Request ', searchParams, state, code, error);
            var authorizationResponse = null;
            var authorizationError = null;
            if (error) {
                logger_1.log('error');
                // get additional optional info.
                var errorUri = searchParams.get('error_uri') || undefined;
                var errorDescription = searchParams.get('error_description') || undefined;
                authorizationError = new authorization_response_1.AuthorizationError({ error: error, error_description: errorDescription, error_uri: errorUri, state: state });
            }
            else {
                authorizationResponse = new authorization_response_1.AuthorizationResponse({ code: code, state: state });
            }
            var completeResponse = {
                request: request,
                response: authorizationResponse,
                error: authorizationError
            };
            emitter.emit(ServerEventsEmitter.ON_AUTHORIZATION_RESPONSE, completeResponse);
            response.end('Close your browser to continue');
        };
        this.authorizationPromise = new Promise(function (resolve, reject) {
            emitter.once(ServerEventsEmitter.ON_UNABLE_TO_START, function () {
                reject("Unable to create HTTP server at port " + _this.httpServerPort);
            });
            emitter.once(ServerEventsEmitter.ON_AUTHORIZATION_RESPONSE, function (result) {
                server.close();
                // resolve pending promise
                resolve(result);
                // complete authorization flow
                _this.completeAuthorizationRequestIfPossible();
            });
        });
        var server;
        request.setupCodeVerifier()
            .then(function () {
            server = Http.createServer(requestHandler);
            server.listen(_this.httpServerPort);
            var url = _this.buildRequestUrl(configuration, request);
            logger_1.log('Making a request to ', request, url);
            if (_this.openCallback) {
                _this.openCallback(url);
            }
            else {
                opener(url);
            }
            ;
        })
            .catch(function (error) {
            logger_1.log('Something bad happened ', error);
            emitter.emit(ServerEventsEmitter.ON_UNABLE_TO_START);
        });
    };
    NodeBasedHandler.prototype.completeAuthorizationRequest = function () {
        if (!this.authorizationPromise) {
            return Promise.reject('No pending authorization request. Call performAuthorizationRequest() ?');
        }
        return this.authorizationPromise;
    };
    return NodeBasedHandler;
}(authorization_request_handler_1.AuthorizationRequestHandler));
exports.NodeBasedHandler = NodeBasedHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9yZXF1ZXN0X2hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbm9kZV9zdXBwb3J0L25vZGVfcmVxdWVzdF9oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7O0dBWUc7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCxpQ0FBb0M7QUFDcEMsMkJBQTZCO0FBQzdCLHlCQUEyQjtBQUUzQixrRkFBMkc7QUFDM0csb0VBQW9GO0FBR3BGLG9DQUE4QjtBQUM5Qiw0REFBOEU7QUFDOUUsK0NBQTBDO0FBRzFDLGlGQUFpRjtBQUNqRiwrQkFBa0M7QUFFbEM7SUFBa0MsdUNBQVk7SUFBOUM7O0lBR0EsQ0FBQztJQUZRLHNDQUFrQixHQUFHLGlCQUFpQixDQUFDO0lBQ3ZDLDZDQUF5QixHQUFHLHdCQUF3QixDQUFDO0lBQzlELDBCQUFDO0NBQUEsQUFIRCxDQUFrQyxxQkFBWSxHQUc3QztBQUVEO0lBQXNDLG9DQUEyQjtJQUkvRDtJQUNJLHVCQUF1QjtJQUNoQixjQUFxQixFQUNyQixZQUFtRCxFQUMxRCxLQUFxRCxFQUNyRCxNQUFpQztRQUgxQiwrQkFBQSxFQUFBLHFCQUFxQjtRQUNyQiw2QkFBQSxFQUFBLG1CQUFtRDtRQUMxRCxzQkFBQSxFQUFBLFlBQThCLDBDQUFxQixFQUFFO1FBQ3JELHVCQUFBLEVBQUEsYUFBcUIseUJBQVUsRUFBRTtRQUxyQyxZQU1FLGtCQUFNLEtBQUssRUFBRSxNQUFNLENBQUMsU0FDckI7UUFMVSxvQkFBYyxHQUFkLGNBQWMsQ0FBTztRQUNyQixrQkFBWSxHQUFaLFlBQVksQ0FBdUM7UUFOOUQsa0RBQWtEO1FBQ2xELDBCQUFvQixHQUFvRCxJQUFJLENBQUM7O0lBUzdFLENBQUM7SUFFRCxzREFBMkIsR0FBM0IsVUFDSSxhQUFnRCxFQUNoRCxPQUE2QjtRQUZqQyxpQkE0RUM7UUF6RUMsdUVBQXVFO1FBQ3ZFLDJEQUEyRDtRQUMzRCxJQUFNLE9BQU8sR0FBRyxJ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QixJQUFJLENBQUM7WUFDSixNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNuQyxJQUFNLEdBQUcsR0FBRyxLQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN6RCxZQUFHLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLElBQUksS0FBSSxDQUFDLFlBQVksRUFBRTtnQkFDckIsS0FBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN4QjtpQkFBTTtnQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDYjtZQUFBLENBQUM7UUFDSixDQUFDLENBQUM7YUFDRCxLQUFLLENBQUMsVUFBQyxLQUFLO1lBQ1gsWUFBRyxDQUFDLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7SUFFUyx1REFBNEIsR0FBdEM7UUFDRSxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQzlCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FDakIsd0VBQXdFLENBQUMsQ0FBQztTQUMvRTtRQUVELE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDO0lBQ25DLENBQUM7SUFDSCx1QkFBQztBQUFELENBQUMsQUFuR0QsQ0FBc0MsMkRBQTJCLEdBbUdoRTtBQW5HWSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IDIwMTcgR29vZ2xlIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdFxuICogaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZVxuICogTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXJcbiAqIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBIdHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgVXJsIGZyb20gJ3VybCc7XG5pbXBvcnQge0F1dGhvcml6YXRpb25SZXF1ZXN0fSBmcm9tICcuLi9hdXRob3JpemF0aW9uX3JlcXVlc3QnO1xuaW1wb3J0IHtBdXRob3JpemF0aW9uUmVxdWVzdEhhbmRsZXIsIEF1dGhvcml6YXRpb25SZXF1ZXN0UmVzcG9uc2V9IGZyb20gJy4uL2F1dGhvcml6YXRpb25fcmVxdWVzdF9oYW5kbGVyJztcbmltcG9ydCB7QXV0aG9yaXphdGlvbkVycm9yLCBBdXRob3JpemF0aW9uUmVzcG9uc2V9IGZyb20gJy4uL2F1dGhvcml6YXRpb25fcmVzcG9uc2UnO1xuaW1wb3J0IHtBdXRob3JpemF0aW9uU2VydmljZUNvbmZpZ3VyYXRpb259IGZyb20gJy4uL2F1dGhvcml6YXRpb25fc2VydmljZV9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7Q3J5cHRvfSBmcm9tICcuLi9jcnlwdG9fdXRpbHMnO1xuaW1wb3J0IHtsb2d9IGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQge0Jhc2ljUXVlcnlTdHJpbmdVdGlscywgUXVlcnlTdHJpbmdVdGlsc30gZnJvbSAnLi4vcXVlcnlfc3RyaW5nX3V0aWxzJztcbmltcG9ydCB7Tm9kZUNyeXB0b30gZnJvbSAnLi9jcnlwdG9fdXRpbHMnO1xuXG5cbi8vIFR5cGVTY3JpcHQgdHlwaW5ncyBmb3IgYG9wZW5lcmAgYXJlIG5vdCBjb3JyZWN0IGFuZCBkbyBub3QgZXhwb3J0IGl0IGFzIG1vZHVsZVxuaW1wb3J0IG9wZW5lciA9IHJlcXVpcmUoJ29wZW5lcicpO1xuXG5jbGFzcyBTZXJ2ZXJFdmVudHNFbWl0dGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgc3RhdGljIE9OX1VOQUJMRV9UT19TVEFSVCA9ICd1bmFibGVfdG9fc3RhcnQnO1xuICBzdGF0aWMgT05fQVVUSE9SSVpBVElPTl9SRVNQT05TRSA9ICdhdXRob3JpemF0aW9uX3Jlc3BvbnNlJztcbn1cblxuZXhwb3J0IGNsYXNzIE5vZGVCYXNlZEhhbmRsZXIgZXh0ZW5kcyBBdXRob3JpemF0aW9uUmVxdWVzdEhhbmRsZXIge1xuICAvLyB0aGUgaGFuZGxlIHRvIHRoZSBjdXJyZW50IGF1dGhvcml6YXRpb24gcmVxdWVzdFxuICBhdXRob3JpemF0aW9uUHJvbWlzZTogUHJvbWlzZTxBdXRob3JpemF0aW9uUmVxdWVzdFJlc3BvbnNlfG51bGw+fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLy8gZGVmYXVsdCB0byBwb3J0IDgwMDBcbiAgICAgIHB1YmxpYyBodHRwU2VydmVyUG9ydCA9IDgwMDAsXG4gICAgICBwdWJsaWMgb3BlbkNhbGxiYWNrOiBudWxsIHwgKCh1cmw6IHN0cmluZykgPT4gdm9pZCkgPSBudWxsLFxuICAgICAgdXRpbHM6IFF1ZXJ5U3RyaW5nVXRpbHMgPSBuZXcgQmFzaWNRdWVyeVN0cmluZ1V0aWxzKCksXG4gICAgICBjcnlwdG86IENyeXB0byA9IG5ldyBOb2RlQ3J5cHRvKCkpIHtcbiAgICBzdXBlcih1dGlscywgY3J5cHRvKTtcbiAgfVxuXG4gIHBlcmZvcm1BdXRob3JpemF0aW9uUmVxdWVzdChcbiAgICAgIGNvbmZpZ3VyYXRpb246IEF1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbixcbiAgICAgIHJlcXVlc3Q6IEF1dGhvcml6YXRpb25SZXF1ZXN0KSB7XG4gICAgLy8gdXNlIG9wZW5lciB0byBsYXVuY2ggYSB3ZWIgYnJvd3NlciBhbmQgc3RhcnQgdGhlIGF1dGhvcml6YXRpb24gZmxvdy5cbiAgICAvLyBzdGFydCBhIHdlYiBzZXJ2ZXIgdG8gaGFuZGxlIHRoZSBhdXRob3JpemF0aW9uIHJlc3BvbnNlLlxuICAgIGNvbnN0IGVtaXR0ZXIgPSBuZXcgU2VydmVyRXZlbnRzRW1pdHRlcigpO1xuXG4gICAgY29uc3QgcmVxdWVzdEhhbmRsZXIgPSAoaHR0cFJlcXVlc3Q6IEh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXNwb25zZTogSHR0cC5TZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKCFodHRwUmVxdWVzdC51cmwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB1cmwgPSBVcmwucGFyc2UoaHR0cFJlcXVlc3QudXJsKTtcbiAgICAgIGNvbnN0IHNlYXJjaFBhcmFtcyA9IG5ldyBVcmwuVVJMU2VhcmNoUGFyYW1zKHVybC5xdWVyeSB8fCAnJyk7XG5cbiAgICAgIGNvbnN0IHN0YXRlID0gc2VhcmNoUGFyYW1zLmdldCgnc3RhdGUnKSB8fCB1bmRlZmluZWQ7XG4gICAgICBjb25zdCBjb2RlID0gc2VhcmNoUGFyYW1zLmdldCgnY29kZScpO1xuICAgICAgY29uc3QgZXJyb3IgPSBzZWFyY2hQYXJhbXMuZ2V0KCdlcnJvcicpO1xuXG4gICAgICBpZiAoIXN0YXRlICYmICFjb2RlICYmICFlcnJvcikge1xuICAgICAgICAvLyBpZ25vcmUgaXJyZWxldmFudCByZXF1ZXN0cyAoZS5nLiBmYXZpY29uLmljbylcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2coJ0hhbmRsaW5nIEF1dGhvcml6YXRpb24gUmVxdWVzdCAnLCBzZWFyY2hQYXJhbXMsIHN0YXRlLCBjb2RlLCBlcnJvcik7XG4gICAgICBsZXQgYXV0aG9yaXphdGlvblJlc3BvbnNlOiBBdXRob3JpemF0aW9uUmVzcG9uc2V8bnVsbCA9IG51bGw7XG4gICAgICBsZXQgYXV0aG9yaXphdGlvbkVycm9yOiBBdXRob3JpemF0aW9uRXJyb3J8bnVsbCA9IG51bGw7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgbG9nKCdlcnJvcicpO1xuICAgICAgICAvLyBnZXQgYWRkaXRpb25hbCBvcHRpb25hbCBpbmZvLlxuICAgICAgICBjb25zdCBlcnJvclVyaSA9IHNlYXJjaFBhcmFtcy5nZXQoJ2Vycm9yX3VyaScpIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgZXJyb3JEZXNjcmlwdGlvbiA9IHNlYXJjaFBhcmFtcy5nZXQoJ2Vycm9yX2Rlc2NyaXB0aW9uJykgfHwgdW5kZWZpbmVkO1xuICAgICAgICBhdXRob3JpemF0aW9uRXJyb3IgPSBuZXcgQXV0aG9yaXphdGlvbkVycm9yKFxuICAgICAgICAgICAge2Vycm9yOiBlcnJvciwgZXJyb3JfZGVzY3JpcHRpb246IGVycm9yRGVzY3JpcHRpb24sIGVycm9yX3VyaTogZXJyb3JVcmksIHN0YXRlOiBzdGF0ZX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXV0aG9yaXphdGlvblJlc3BvbnNlID0gbmV3IEF1dGhvcml6YXRpb25SZXNwb25zZSh7Y29kZTogY29kZSEsIHN0YXRlOiBzdGF0ZSF9KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbXBsZXRlUmVzcG9uc2UgPSB7XG4gICAgICAgIHJlcXVlc3QsXG4gICAgICAgIHJlc3BvbnNlOiBhdXRob3JpemF0aW9uUmVzcG9uc2UsXG4gICAgICAgIGVycm9yOiBhdXRob3JpemF0aW9uRXJyb3JcbiAgICAgIH0gYXMgQXV0aG9yaXphdGlvblJlcXVlc3RSZXNwb25zZTtcbiAgICAgIGVtaXR0ZXIuZW1pdChTZXJ2ZXJFdmVudHNFbWl0dGVyLk9OX0FVVEhPUklaQVRJT05fUkVTUE9OU0UsIGNvbXBsZXRlUmVzcG9uc2UpO1xuICAgICAgcmVzcG9uc2UuZW5kKCdDbG9zZSB5b3VyIGJyb3dzZXIgdG8gY29udGludWUnKTtcbiAgICB9O1xuXG4gICAgdGhpcy5hdXRob3JpemF0aW9uUHJvbWlzZSA9IG5ldyBQcm9taXNlPEF1dGhvcml6YXRpb25SZXF1ZXN0UmVzcG9uc2U+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGVtaXR0ZXIub25jZShTZXJ2ZXJFdmVudHNFbWl0dGVyLk9OX1VOQUJMRV9UT19TVEFSVCwgKCkgPT4ge1xuICAgICAgICByZWplY3QoYFVuYWJsZSB0byBjcmVhdGUgSFRUUCBzZXJ2ZXIgYXQgcG9ydCAke3RoaXMuaHR0cFNlcnZlclBvcnR9YCk7XG4gICAgICB9KTtcbiAgICAgIGVtaXR0ZXIub25jZShTZXJ2ZXJFdmVudHNFbWl0dGVyLk9OX0FVVEhPUklaQVRJT05fUkVTUE9OU0UsIChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgLy8gcmVzb2x2ZSBwZW5kaW5nIHByb21pc2VcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQgYXMgQXV0aG9yaXphdGlvblJlcXVlc3RSZXNwb25zZSk7XG4gICAgICAgIC8vIGNvbXBsZXRlIGF1dGhvcml6YXRpb24gZmxvd1xuICAgICAgICB0aGlzLmNvbXBsZXRlQXV0aG9yaXphdGlvblJlcXVlc3RJZlBvc3NpYmxlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGxldCBzZXJ2ZXI6IEh0dHAuU2VydmVyO1xuICAgIHJlcXVlc3Quc2V0dXBDb2RlVmVyaWZpZXIoKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgc2VydmVyID0gSHR0cC5jcmVhdGVTZXJ2ZXIocmVxdWVzdEhhbmRsZXIpO1xuICAgICAgICAgIHNlcnZlci5saXN0ZW4odGhpcy5odHRwU2VydmVyUG9ydCk7XG4gICAgICAgICAgY29uc3QgdXJsID0gdGhpcy5idWlsZFJlcXVlc3RVcmwoY29uZmlndXJhdGlvbiwgcmVxdWVzdCk7XG4gICAgICAgICAgbG9nKCdNYWtpbmcgYSByZXF1ZXN0IHRvICcsIHJlcXVlc3QsIHVybCk7XG4gICAgICAgICAgaWYgKHRoaXMub3BlbkNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW5DYWxsYmFjayh1cmwpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcGVuZXIodXJsKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgbG9nKCdTb21ldGhpbmcgYmFkIGhhcHBlbmVkICcsIGVycm9yKTtcbiAgICAgICAgICBlbWl0dGVyLmVtaXQoU2VydmVyRXZlbnRzRW1pdHRlci5PTl9VTkFCTEVfVE9fU1RBUlQpO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjb21wbGV0ZUF1dGhvcml6YXRpb25SZXF1ZXN0KCk6IFByb21pc2U8QXV0aG9yaXphdGlvblJlcXVlc3RSZXNwb25zZXxudWxsPiB7XG4gICAgaWYgKCF0aGlzLmF1dGhvcml6YXRpb25Qcm9taXNlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXG4gICAgICAgICAgJ05vIHBlbmRpbmcgYXV0aG9yaXphdGlvbiByZXF1ZXN0LiBDYWxsIHBlcmZvcm1BdXRob3JpemF0aW9uUmVxdWVzdCgpID8nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5hdXRob3JpemF0aW9uUHJvbWlzZTtcbiAgfVxufVxuIl19