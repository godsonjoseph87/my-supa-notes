export {};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
            state_cookie_domain?: string;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
            }
          ) => void;
          prompt: (momentListener?: (notification: {
            isDisplayMoment: () => boolean;
            isDisplayed: () => boolean;
            isNotDisplayed: () => boolean;
            getNotDisplayedReason: () => string;
            isDismissedMoment: () => boolean;
            getDismissedReason: () => string;
            getMomentType: () => string;
          }) => void) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
          revoke: (hint: string, done?: (response: { successful: boolean; error?: string }) => void) => void;
        };
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              expires_in?: number;
              scope?: string;
              token_type?: string;
              error?: string;
              error_description?: string;
              error_uri?: string;
            }) => void;
            error_callback?: (error: { type: string; message: string }) => void;
            prompt?: string;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          hasGrantedAllScopes: (
            tokenResponse: { scope?: string },
            firstScope: string,
            ...restScopes: string[]
          ) => boolean;
          revoke: (accessToken: string, done?: () => void) => void;
        };
      };
    };
  }
}
