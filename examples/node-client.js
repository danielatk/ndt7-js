/* eslint-env es6, node */

'use strict';

// People who have this installed as a module (pretty much everyone who is
// reading this) should change this line to:
// const ndt7 = require('@m-lab/ndt7');
const ndt7 = require('../src/ndt7.js');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const myArgs = process.argv.slice(2);

if (myArgs.length != 2) {
  throw new Error('upload server and mac must be provided via command line');
}

const uploadServer = myArgs[0];
const mac = myArgs[1];
let measurementServer = '';

ndt7.test(
    {
      userAcceptedDataPolicy: true,
      // server: 'mlab1-gig03.mlab-oti.measurement-lab.org',
    },
    {
      serverChosen: function(server) {
        console.log('Testing to:', {
          machine: server.machine,
          locations: server.location,
        });
        measurementServer = server.machine;
      },
      downloadComplete: function(data) {
        const filename =
            ''+measurementServer+'_'+mac+'_'+Date.now()+'_ndt.json';
        const xhr = new XMLHttpRequest();
        try {
          xhr.open('POST', uploadServer + '/' + filename, true);
          xhr.setRequestHeader('Content-type', 'application/json');
          xhr.send(JSON.stringify(data));
        } catch (e) {
          console.error('Upload server not reachable.');
        }

        // (bytes/second) * (bits/byte) / (megabits/bit) = Mbps
        const serverBw = data.LastServerMeasurement.BBRInfo.BW * 8 / 1000000;
        const clientGoodput = data.LastClientMeasurement.MeanClientMbps;
        console.log(
            `Download test is complete:
    Instantaneous server bottleneck bandwidth estimate: ${serverBw} Mbps
    Mean client goodput: ${clientGoodput} Mbps`);
      },
      uploadComplete: function(data) {
        // TODO: used actual upload duration for rate calculation.
        // bytes * (bits/byte() * (megabits/bit) * (1/seconds) = Mbps
        const serverBw =
            data.LastServerMeasurement.TCPInfo.BytesReceived * 8 / 1000000 / 10;
        const clientGoodput = data.LastClientMeasurement.MeanClientMbps;
        console.log(
            `Upload test is complete:
    Mean server throughput: ${serverBw} Mbps
    Mean client goodput: ${clientGoodput} Mbps`);
      },
      error: function(err) {
        console.log('Error while running the test:', err.message);
      },
    },
).then((exitcode) => {
  process.exit(exitcode);
});
