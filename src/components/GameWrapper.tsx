import { Game } from './Game';

export const GameWrapper = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="mb-4 text-white text-center">
        <h1 className="text-2xl font-bold mb-2">Mario Kart</h1>
        <p>Use arrow keys to move and spacebar to accelerate</p>
      </div>
      <div className="relative">
        <Game />
      </div>
    </div>
  );
};
