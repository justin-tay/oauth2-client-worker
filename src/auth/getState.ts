import getRandomValues from './getRandomValues';

/**
 * Gets the state to prevent CSRF.
 *
 * @returns the state
 */
const getState = () => {
  return getRandomValues();
};

export default getState;
