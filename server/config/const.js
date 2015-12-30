/**
 * Created by hce on 09/07/15.
 *
 * Constants used throughout Mantra.
 *
 */

module.exports = {

  // the actions supported by Mantra
  // Note: all actions are expected to be lowercase with preceding or trailing whitespaces.
  ACTION: {
    COMPILE: 'compile',
    RUN: 'run'
  },

  LANGUAGE_NAME: {
    C: 'C',
    CPP: 'C++',
    HASKELL: 'Haskell',
    HASKELL_HSPEC: 'Haskell-HSpec',
    JAVA: 'Java',
    JAVA_JUNIT: 'Java-JUnit',
    PYTHON: 'Python',
    PYTHON_UNIT_TEST: 'Python-UnitTest',
  }

};
