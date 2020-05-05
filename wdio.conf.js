const utilities= require("./support/utils/Utilities");
const chai = require('chai');
const allure = require('@wdio/allure-reporter').default;

// Max time for single test case execution
let timeout = process.env.DEBUG ? 99999999 : 120000;
let elementTimeout = 10000;


exports.config = {
    
    runner: 'local',
   
    specs: [
        './test/specs/**/*.spec.js'
    ],
    exclude: [
        'path/to/excluded/files'
    ],
    maxInstances: 15,
    capabilities: [{
        maxInstances: 5,
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--disable-infobars', '--window-size=1920,1440'],
        }
    },
    {
        maxInstances: 5,
        browserName: 'firefox',
        
      }],
    logLevel: 'info',
    
    baseUrl: 'http://uitestingplayground.com',
    waitforTimeout: elementTimeout,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    services: ['selenium-standalone',
    ],
    
    framework: 'mocha',
    reporters: [
      'spec',
      ['allure', {
        outputDir: 'report/allure-results',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
      }],
      ['junit', {
        outputDir: 'report/junit',
        outputFileFormat: function(options) { // optional
          return `test-${options.cid}-results.xml`
        }
      }]
    ],
    mochaOpts: {
        ui: 'bdd',
        timeout: timeout,
        require: ['@babel/register']
    },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    before: function (capabilities, specs) {
        global.allure = allure;
        global.chai = chai;
        global.utilities = utilities;
    },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },
    /**
     * Hook that gets executed before the suite starts
     * @param {Object} suite suite details
     */
    beforeSuite: function (suite) {
        allure.addFeature(suite.name);
    },
    /**
     * Function to be executed before a test (in Mocha/Jasmine) starts.
     */
    beforeTest: function (test, context) {
        allure.addEnvironment("BROWSER", browser.capabilities.browserName);
        allure.addEnvironment("BROWSER_VERSION", browser.capabilities.version);
        allure.addEnvironment("PLATFORM", browser.capabilities.platform);

    },

    /**
     * Function to be executed after a test (in Mocha/Jasmine).
     */
    afterTest: function(test, context, { error, result, duration, passed, retries }) {
        if (error !== undefined) {
            try {
                //TODO: Fix allure reporting on failure
                utilities.takeScreenshot(test.title, true)
            } catch {
                console.log('>> Capture Screenshot Failed!');
            }
        }
    },
}
