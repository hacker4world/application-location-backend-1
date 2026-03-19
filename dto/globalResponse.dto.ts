export function createResponse(status: number, message: string, data?: any) {
  return {
    status,
    message,
    data,
  };
}
