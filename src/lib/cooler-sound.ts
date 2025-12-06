/**
 * "Be a lot cooler if you did" - Dazed and Confused sound effect
 * Plays 3 times when user clicks "Maybe..." in Hello Kitty mode dialog
 */

let playCount = 0;
let audioInstance: HTMLAudioElement | null = null;

export function playCoolerSound() {
  playCount = 0;

  const playNext = () => {
    if (playCount >= 3) {
      console.log('🌿 Finished playing "cooler" sound 3 times');
      return;
    }

    // Create new audio instance for each play
    // Using multiple fallback URLs
    const urls = [
      'https://www.myinstants.com/media/sounds/alright-alright-alright.mp3',
      'https://www.101soundboards.com/sounds/4441229-itd-be-a-lot-cooler-if-you-did',
    ];

    audioInstance = new Audio(urls[0]); // Try Matthew McConaughey "alright alright alright" as backup
    audioInstance.volume = 0.8;

    console.log(`🌿 Attempting to play "Be a lot cooler if you did" - ${playCount + 1}/3`);

    audioInstance.play()
      .then(() => {
        playCount++;
        console.log(`🌿 Successfully playing - ${playCount}/3`);
      })
      .catch((error) => {
        console.error('❌ Failed to play cooler sound:', error);
        console.error('Error details:', error.name, error.message);
      });

    // When this play finishes, play the next one
    audioInstance.onended = () => {
      console.log(`🌿 Sound ${playCount} finished`);
      if (playCount < 3) {
        // Small delay between plays
        setTimeout(playNext, 500);
      }
    };

    // Error handler
    audioInstance.onerror = (e) => {
      console.error('❌ Audio error:', e);
    };
  };

  // Start the sequence
  playNext();
}
