export const getErrorMessage = (err) => {
  if (
    err?.response?.data?.errors &&
    Array.isArray(err?.response?.data?.errors)
  ) {
    // If errors array is present, join the error messages
    return err?.response?.data?.errors?.map((element) => element);
  }
  // Otherwise, use the general error message
  return err?.response?.data?.message || err.message;
};
