export const getAppUrl = (path: string = '') => 'http://localhost:3000' + path;
export const getAppDashboardUrl = (accountType?: string) => getAppUrl('/dashboard');
