type DatabaseSelection =
  | { mode: "url"; connection: string }
  | { mode: "socket"; connection: { socketPath: string; user: string; database: string; password?: string } }
  | { mode: "disabled"; connection: null };
export function resolveDatabaseConfig(
  env?: Record<string, string | undefined>,
  options?: { allowDisabled?: boolean },
): DatabaseSelection;
