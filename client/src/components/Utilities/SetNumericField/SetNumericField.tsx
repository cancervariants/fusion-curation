/**
 * Handle pre-request validation for a numeric input field
 * @param value user-entered value
 * @param warnSetter useState setter function for warning text
 * @param valueSetter useState value setter function
 * @param positive if true, must be >= 0
 */
export const setNumericField = (
  value: string,
  warnSetter: CallableFunction,
  valueSetter: CallableFunction,
  positive: boolean
) => {
  const re = positive ? /^[0-9]*$/ : /^\-?[0-9]*$/;
  if (!value.match(re)) {
    warnSetter(`${positive ? "Nonzero i" : "I"}nteger required`);
  } else {
    warnSetter("");
  }
  valueSetter(value);
};
