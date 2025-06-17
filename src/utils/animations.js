export function startAnimation(animation) {
  if (animation) {
    animation.play();
  }
}

export function stopAnimation(animation) {
  if (animation) {
    animation.pause();
  }
}

export function resetAnimation(animation) {
  if (animation) {
    animation.restart();
  }
}

export function toggleAnimation(animation, isPlaying) {
  if (animation) {
    if (isPlaying) {
      stopAnimation(animation);
    } else {
      startAnimation(animation);
    }
  }
}