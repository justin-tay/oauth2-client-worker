import { AuthorizationContext } from './AuthorizationContext';
import { AuthorizationRequestContext } from './AuthorizationRequestContext';
import { AuthConfiguration } from './AuthConfiguration';
import isTokenUrl from './isTokenUrl';
import isAuthorizationUrl from './isAuthorizationUrl';
import isRedirectUrl from './isRedirectUrl';
import getEndSessionContext from './getEndSessionContext';
import handleAuthorizationCode from './handleAuthorizationCode';
import handleResourceServer from './handleResourceServer';
import { AuthorizeCallback } from './AuthorizeCallback';
import { EndSessionCallback } from './EndSessionCallback';
import { EndSessionContext } from './EndSessionContext';

/*
 * Authorization requests keyed by state.
 */
const defaultAuthorizationRequests = new Map<
  string,
  AuthorizationRequestContext
>();

/*
 * Authorization context keyed by client registration id
 */
const defaultAuthorizationContexts = new Map<string, AuthorizationContext>();

const FORBIDDEN_RESPONSE = new Response(
  JSON.stringify({ status: '403', title: 'Forbidden' }),
  {
    status: 403,
    statusText: '403',
  },
);

interface FetchListenerOptions {
  authorizationRequests?: Map<string, AuthorizationRequestContext>;
  authorizationContexts?: Map<string, AuthorizationContext>;
  authorizeCallback?: AuthorizeCallback;
  endSessionCallback?: EndSessionCallback;
}

interface OnEndSessionParams {
  endSessionCallback?: EndSessionCallback;
  endSessionContext: EndSessionContext;
}

const onEndSession = (params: OnEndSessionParams) => {
  const { endSessionCallback, endSessionContext } = params;
  if (endSessionCallback) {
    endSessionCallback({
      idToken: endSessionContext.idToken,
      clientRegistrationId: endSessionContext.clientRegistrationId,
      clientConfig: endSessionContext.clientConfig,
      providerConfig: endSessionContext.providerConfig,
    });
  }
};

const fetchListener = (
  authConfiguration: AuthConfiguration,
  options?: FetchListenerOptions,
) => {
  const authorizationRequests =
    options?.authorizationRequests ?? defaultAuthorizationRequests;
  const authorizationContexts =
    options?.authorizationContexts ?? defaultAuthorizationContexts;

  const authorizeCallback = options?.authorizeCallback;
  const endSessionCallback = options?.endSessionCallback;
  return (event: FetchEvent) => {
    const { request } = event;
    const url = new URL(request.url);

    console.log('Handle fetch', url.origin + url.pathname);

    if (
      isTokenUrl(url, authConfiguration) ||
      isAuthorizationUrl(url, authConfiguration)
    ) {
      /*
       * Block authorization and token requests initiating from the frontend application.
       */
      event.respondWith(FORBIDDEN_RESPONSE);
    } else if (isRedirectUrl(url)) {
      /*
       * Intercept the authorization code when the authorization server redirects to the application
       */
      event.respondWith(
        handleAuthorizationCode({
          url,
          authConfiguration,
          authorizationContexts,
          authorizationRequests,
          authorizeCallback,
        }),
      );
    } else {
      /*
       * Intercept calls from the frontend to the resource server
       */
      const resourceServerResponse = handleResourceServer({
        request,
        authConfiguration,
        authorizationContexts,
        authorizationRequests,
        endSessionCallback,
      });
      if (resourceServerResponse) {
        event.respondWith(resourceServerResponse);
      } else {
        /*
         * Process end session requests
         */
        const endSessionContext = getEndSessionContext(
          url,
          authConfiguration,
          authorizationContexts,
        );
        if (endSessionContext) {
          event.respondWith(
            fetch(endSessionContext.url)
              .then(
                (response) => {
                  onEndSession({ endSessionCallback, endSessionContext });
                  return response;
                },
                (error) => {
                  onEndSession({ endSessionCallback, endSessionContext });
                  return error;
                },
              )
              .catch((error) => {
                onEndSession({ endSessionCallback, endSessionContext });
                throw error;
              }),
          );
        }
      }
    }
    return null;
  };
};

export default fetchListener;
