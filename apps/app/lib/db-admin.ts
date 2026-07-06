export const createDbAdminClient = () => {
  const chain = () => {
    const obj = {
      select: chain,
      insert: chain,
      update: chain,
      upsert: chain,
      delete: chain,
      eq: chain,
      neq: chain,
      in: chain,
      order: chain,
      limit: chain,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null, count: 0 }),
    };
    return obj;
  };
  
  return {
    from: chain,
    rpc: chain,
    auth: { admin: { deleteUser: async () => ({}) } }
  } as any;
};

export const createActionDb = createDbAdminClient;

export const formatdbActionError = (e: any) => String(e);
