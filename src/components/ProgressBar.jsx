export default function ProgressBar({done, sum}) {
  const progress = Math.floor(done / sum * 100);
  let progressCln
  if (progress > 0 && progress <= 25) {
    progressCln = 'progress low';
  }
  else if (progress > 25 && progress <= 75) {
    progressCln = 'progress medium';
  }
  else if (progress > 75 && progress <= 100) {
    progressCln = 'progress high';
  }
  else {
    progressCln = 'progress empty';
  }
  return (
    <div className={progressCln} style={{width: `${progress}%`}}></div>
  )
}