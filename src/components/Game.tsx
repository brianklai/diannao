import { useEffect, useRef, useState } from 'react';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const PLAYER_SPEED = 5;
const MAX_SPEED = 10;
const ACCELERATION = 0.5;
const DECELERATION = 0.2;
const TRACK_LENGTH = 2000;

interface GameState {
  x: number;
  y: number;
  speed: number;
  isAccelerating: boolean;
  distance: number;
  lap: number;
  gameWon: boolean;
}

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    x: 100,
    y: GAME_HEIGHT - 100,
    speed: 0,
    isAccelerating: false,
    distance: 0,
    lap: 0,
    gameWon: false,
  });
  const keysRef = useRef(new Set<string>());

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    keysRef.current.add(e.code);
    if (e.code === 'Space') {
      setGameState(prev => ({ ...prev, isAccelerating: true }));
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    keysRef.current.delete(e.code);
    if (e.code === 'Space') {
      setGameState(prev => ({ ...prev, isAccelerating: false }));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let running = true;
    
    const gameLoop = (timestamp: number) => {
      if (!running) return;
      const deltaTime = Math.min(timestamp - lastTime, 32); // Cap at ~30 FPS
      lastTime = timestamp;
      
      const newState = {
        ...gameState,
        speed: gameState.isAccelerating
          ? Math.min(gameState.speed + ACCELERATION * 2, MAX_SPEED)
          : Math.max(gameState.speed - DECELERATION, 0),
        y: keysRef.current.has('ArrowUp')
          ? Math.max(0, gameState.y - PLAYER_SPEED * 2)
          : keysRef.current.has('ArrowDown')
          ? Math.min(GAME_HEIGHT - 50, gameState.y + PLAYER_SPEED * 2)
          : gameState.y,
        x: keysRef.current.has('ArrowLeft')
          ? Math.max(0, gameState.x - PLAYER_SPEED * 2)
          : keysRef.current.has('ArrowRight')
          ? Math.min(GAME_WIDTH - 50, gameState.x + (gameState.speed * 2))
          : gameState.x
      };

      const newDistance = gameState.distance + (newState.speed * (deltaTime / 16));
      const newLap = newDistance >= TRACK_LENGTH ? gameState.lap + 1 : gameState.lap;
      
      setGameState({
        ...newState,
        distance: newDistance % TRACK_LENGTH,
        lap: newLap,
        gameWon: newLap >= 1
      });

      // Draw game
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw track
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, GAME_HEIGHT - 80, GAME_WIDTH, 80);

      // Draw track markings
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 10; i++) {
        const x = (i * GAME_WIDTH / 5 + gameState.distance * 2) % GAME_WIDTH;
        ctx.fillRect(x, GAME_HEIGHT - 45, 30, 10);
      }

      // Draw car
      ctx.fillStyle = gameState.isAccelerating ? '#FFAA00' : '#FF0000';
      ctx.save();
      ctx.translate(gameState.x + 25, gameState.y + 15);
      ctx.rotate(gameState.isAccelerating ? 0.1 : 0);
      ctx.fillRect(-25, -15, 50, 30);
      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
    return () => {
      running = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameState]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="bg-sky-400"
      />
      {/* Enhanced UI Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 p-4 rounded-lg text-white">
        <div className="text-xl font-bold mb-2">Race Stats</div>
        <div className="space-y-1">
          <div>Speed: {Math.round(gameState.speed * 10)} mph</div>
          <div>Progress: {Math.round((gameState.distance / TRACK_LENGTH) * 100)}%</div>
          <div>Lap: {gameState.lap}</div>
        </div>
      </div>
      {/* Controls Guide */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 p-4 rounded-lg text-white">
        <div className="text-sm">
          <div>↑↓ Vertical movement</div>
          <div>← → Horizontal movement</div>
          <div>Space Accelerate</div>
        </div>
      </div>
      {gameState.gameWon && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-600 mb-4">You Win!</div>
            <div className="text-gray-700">Lap completed successfully!</div>
          </div>
        </div>
      )}
    </div>
  );
};
