Feature: Simple Test

Scenario: Test GET request
  Given url 'https://httpbin.org/get'
  When method GET
  Then status 200
