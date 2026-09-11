/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const { samplingFrequency, deploymentDays, packetSize } = data;
  const durationSec = deploymentDays * 24 * 3600;
  const totalBytes = samplingFrequency * durationSec * packetSize;
  const totalMb = Number((totalBytes / (1024 * 1024)).toFixed(2));

  postMessage({
    totalDataVolumeMb: totalMb,
    isStorageValid: totalMb <= 5000,
  });
});
