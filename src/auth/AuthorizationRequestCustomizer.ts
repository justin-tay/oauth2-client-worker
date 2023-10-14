export type AuthorizationRequestCustomizer = (
  params: Record<string, string>,
) => Record<string, string>;
