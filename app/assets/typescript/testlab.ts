/*
define('testlab', ['require', 'testlabapp'], function(require, testlabapp) {
    window.TLab = testlabapp;
});
*/
import "testlabapp";

function main(testlabapp) {
    window.TLab = testlabapp;
}