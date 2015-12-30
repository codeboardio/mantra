/**
 * Created by hce on 09/07/15.
 *
 * These tests can only test the behavior if
 * the payload is NOT valid. That is, the payload
 * may contain invalid actions, missing the definition of the language etc.
 *
 * The correct behavior is tested indirectly through larger integration tests.
 *
 */


'use strict';

var app = require('../server/server.js'),
  request = require('supertest'),
  util = require('../server/util.js'),
  path = require('path'),
  should = require('should'),
  config = require('../server/config/env/index');


describe('routes.js: Creating a container with for Java compilation', function () {

  // set the mocha timeout for this test
  this.timeout(5000);

  var payload = {
    action: 'compile',
    language: 'Java-JUnit',
    stream: false,
    files: [
      {filename: 'Root/src/Main.java', content: 'public class Main {' +
      'public static void main (String [] args){' +
      ' while (true) {System.out.println("Hello World");}}}'},
      {
        filename: 'Root/codeboard.json',
        content: JSON.stringify({
          "_comment": "Configuration for this Java-JUnit project.",
          "MainClassForRunning": "Main",
          "ClassPath": "/usr/share/java/*",
          "DirectoryForClassFiles": "./Root/bin",
          "DirectoryForSourceFiles": "./Root/src",
          "DirectoryForTestFiles": "./Root/test",
          "DirectoryForTestSubmissionFiles": "./Root/test_submission"
        })
      }
    ]
  };

  it('Creates a container', function (done) {

    request(app)
      .post('/')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(201)
      .end(function(err, res) {
	      done();
      });
  });

});


describe('routes.js: Creating a container for a Java-JUnit compilation', function () {

  // set the mocha timeout for this test
  this.timeout(5000);

  var payload = {
    "files": [
    {
      "filename": "Root/src/Finder.java",
      "content": "/**\n * This class provides functions to search in arrays.\n * \n */\n \npublic class Finder {\n\n    /**\n     * Finds the maximum element in an integer array.\n     * @param input the array to search in\n     * @return the maximum element of input\n     */\n    public int findMaximumElement(int[] input) {\n\n        // Your task:\n        // - Check if this function works for all possible integers.\n        // - Throw an Error object with message \"Array is empty.\"\n        // if the input array is empty.\n\n        int maxElement = 0;\n\n        // loop through the array and look at each element\n        for (int i = 0; i < input.length; i++) {\n            if (maxElement < input[i]) {\n                // current array element is greater than any we've seen before\n                // so we store it as the new maximum element\n                maxElement = input[i];\n            }\n        }\n\n        return maxElement;\n    }\n\n}\n"
    },
    {
      "filename": "Root/src/Main.java",
      "content": "/**\n * Main class of the Java program. \n * \n */\n\npublic class Main {\n\n    public static void main(String[] args) {\n        \n        // we print a heading and make it bigger using HTML formatting\n        System.out.println(\"<h4>-- Maximun Element Finder --</h4>\");\n        \n        // create the finder and call the function to find the maximum element\n        Finder myFinder = new Finder();\n        int[] myArray = new int[] {2, 3, 42, 12, 7};\n        int maxElement = myFinder.findMaximumElement(myArray);\n        \n        System.out.println(\"The maximum element is: \" + maxElement);\n    }\n}\n"
    },
    {
      "filename": "Root/test/FinderTest.java",
      "content": "/**\n * Tests for class Finder.\n * \n * All tests in the folder \"test\" are executed \n * when the \"Test\" action is invoked.\n * \n */\n\nimport static org.junit.Assert.*;\nimport org.junit.Test;\n\n\npublic class FinderTest {\n\n    @Test\n    public final void testFindMaximumElement1() {\n\n        // we define some test input and what result we would expect\n        int[] testInput = new int[] { 1, 2, 3, 4, 5 };\n        int expectedResult = 5;\n\n        // create a Finder object and call the findMaximumElement function\n        // with test input\n        Finder myFinder = new Finder();\n        int actualResult = myFinder.findMaximumElement(testInput);\n\n        // the actualResult value should be the same as the expectedResult value\n        assertTrue(\"Test input with ascending order\",\n                actualResult == expectedResult);\n    }\n\n    @Test\n    public final void testFindMaximumElement2() {\n\n        int[] testInput = new int[] { 117, 56, 38, 11, 0 };\n        int expectedResult = 117;\n\n        Finder myFinder = new Finder();\n        int actualResult = myFinder.findMaximumElement(testInput);\n\n        assertTrue(\"Test input with descending order\",\n                actualResult == expectedResult);\n    }\n\n    @Test\n    public final void testFindMaximumElement3() {\n\n        int[] testInput = new int[] { 42, 11, 38, 75, 14 };\n        int expectedResult = 75;\n\n        Finder myFinder = new Finder();\n        int actualResult = myFinder.findMaximumElement(testInput);\n\n        assertTrue(\"Test input with random order\",\n                actualResult == expectedResult);\n    }\n\n}\n"
    },
    {
      "filename": "Root/test_submission/SubTest.java",
      "content": "/**\n * Tests used to check a submission.\n * \n * All tests in the \"test_submission\" folder are used for \n * checking a submission and are executed when the \n * \"Submission\" action is invoked.\n * \n */\n\nimport static org.junit.Assert.*;\nimport org.junit.Before;\nimport org.junit.Rule;\nimport org.junit.Test;\nimport org.junit.rules.ExpectedException;\n\n\npublic class SubTest {\n\n    /** the finder instance */\n    Finder finder = new Finder();\n\n    /**\n     * Before running any test, we create a Finder instance which is then used\n     * by all the tests.\n     */\n    @Before\n    public void setUp() {\n        finder = new Finder();\n    }\n\n    /**\n     * Defines a rule that allows in-test specification of expected exception\n     * types and messages.\n     */\n    @Rule\n    public ExpectedException exception = ExpectedException.none();\n\n    /**\n     * Testing the Finder with non-negative numbers.\n     */\n    @Test\n    public final void testNonNegativeValues() {\n        int actualResult = finder.findMaximumElement(\n            new int[] { 115, 54, 3, 0, 76, 665 });\n        assertTrue(\"Testing non-negative inputs\", actualResult == 665);\n    }\n\n    /**\n     * Testing the Finder with negative numbers.\n     */\n    @Test\n    public final void testNegativeValues() {\n\n        int actualResult = finder.findMaximumElement(\n            new int[] { -11, -55, -1, -12 });\n        assertTrue(\"Testing negative inputs\", actualResult == -1);\n    }\n\n    /**\n     * Testing the Finder with an empty array as input. We expect the\n     * findMaximumElement method to throw an error.\n     */\n    @Test\n    public final void testEmptyArray() {\n        exception.expect(Error.class);\n        exception.expectMessage(\"Array is empty.\");\n        int actualResult = finder.findMaximumElement(new int[] {});\n    }\n\n}\n"
    },
    {
      "filename": "Root/codeboard.json",
      "content": "{\n    \"_comment\": \"Configuration for this Java-JUnit project.\",\n    \"MainClassForRunning\": \"Main\",\n    \"ClassPath\": \"/usr/share/java/*\",\n    \"DirectoryForClassFiles\": \"./Root/bin\",\n    \"DirectoryForSourceFiles\": \"./Root/src\",\n    \"DirectoryForTestFiles\": \"./Root/test\",\n    \"DirectoryForTestSubmissionFiles\": \"./Root/test_submission\"\n}\n"
    }
  ],
    "language": "Java-JUnit",
    "action": "compile",
    "stream": false
  };

  it('Creates a container', function (done) {

    request(app)
      .post('/')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(201)
      .end(function(err, res) {
        done();
      });
  });

});
