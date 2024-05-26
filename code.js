const go = async () => {  
  // @param {number} year
  const url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime="+year+"-01-01&endtime="+year+"-12-31&minmagnitude=2&latitude=37.773972&longitude=-122.431297&maxradiuskm=50";
  const resp = await fetch(url).then((response) => response.json());
  const features = resp.features;
  const count = resp.features.length;

  // only sign if more than 10 eligible quakes.
  if (count < 10) {
    return;
  }
  const toSign = { year: year, quakeCount: count, location: "SF Bay Area" };

  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey , sigName });
};
