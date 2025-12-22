'use client';

import { useEffect, useRef, useState } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 18;
const CELL_SIZE = 16;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 160;
const SPEED_STEP = 8;
const MIN_SPEED = 80;

const STARTING_SNAKE: Point[] = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 }
];

function nextPosition(direction: Direction, head: Point): Point {
  switch (direction) {
    case 'up':
      return { x: head.x, y: head.y - 1 };
    case 'down':
      return { x: head.x, y: head.y + 1 };
    case 'left':
      return { x: head.x - 1, y: head.y };
    case 'right':
    default:
      return { x: head.x + 1, y: head.y };
  }
}

function randomFood(snake: Point[]): Point {
  const open: Point[] = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) {
        open.push({ x, y });
      }
    }
  }
  return open[Math.floor(Math.random() * open.length)] ?? { x: 0, y: 0 };
}

function draw(ctx: CanvasRenderingContext2D, snake: Point[], food: Point, score: number) {
  const styles = getComputedStyle(document.documentElement);
  ctx.fillStyle = styles.getPropertyValue('--card').trim() || '#fff';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.strokeStyle = styles.getPropertyValue('--border').trim() || '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE + 0.5, 0);
    ctx.lineTo(i * CELL_SIZE + 0.5, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE + 0.5);
    ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE + 0.5);
    ctx.stroke();
  }

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

  snake.forEach((segment, idx) => {
    ctx.fillStyle = idx === 0 ? '#0ea5e9' : '#2563eb';
    ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
  });

  ctx.fillStyle = styles.getPropertyValue('--foreground').trim() || '#000';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.fillText(`Score: ${score}`, 10, 18);
}

export interface SnakeGameProps {
  onScore?: (score: number) => void;
  paused?: boolean;
}

export default function SnakeGame({ onScore, paused }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<number>();
  const directionRef = useRef<Direction>('right');
  const pendingRef = useRef<Direction>('right');

  const [snake, setSnake] = useState<Point[]>(STARTING_SNAKE);
  const [food, setFood] = useState<Point>(() => randomFood(STARTING_SNAKE));
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => setIsPaused(Boolean(paused)), [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, snake, food, score);
  }, [snake, food, score]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const next = keyboardToDirection(event.key);
      if (next) {
        queueDirection(next);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleTouch = createSwipeHandler(queueDirection);
    window.addEventListener('touchstart', handleTouch.onStart, { passive: true });
    window.addEventListener('touchmove', handleTouch.onMove, { passive: true });
    window.addEventListener('touchend', handleTouch.onEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouch.onStart);
      window.removeEventListener('touchmove', handleTouch.onMove);
      window.removeEventListener('touchend', handleTouch.onEnd);
    };
  }, []);

  useEffect(() => {
    if (isPaused || isGameOver) {
      if (loopRef.current) window.clearInterval(loopRef.current);
      return;
    }
    loopRef.current = window.setInterval(() => {
      setSnake((current) => {
        const nextDirection = pendingRef.current;
        if (isOpposite(directionRef.current, nextDirection)) {
          pendingRef.current = directionRef.current;
        } else {
          directionRef.current = nextDirection;
        }

        const newHead = nextPosition(directionRef.current, current[0]);
        const hitWall =
          newHead.x < 0 || newHead.y < 0 || newHead.x >= GRID_SIZE || newHead.y >= GRID_SIZE;
        const hitSelf = current.some((segment) => segment.x === newHead.x && segment.y === newHead.y);
        if (hitWall || hitSelf) {
          persistHighScore(score);
          onScore?.(score);
          setIsGameOver(true);
          return current;
        }

        const extended = [newHead, ...current];
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          persistHighScore(newScore);
          setFood(randomFood(extended));
          const nextSpeed = Math.max(MIN_SPEED, speed - SPEED_STEP);
          if (nextSpeed !== speed) {
            setSpeed(nextSpeed);
          }
          onScore?.(newScore);
          return extended;
        }

        return extended.slice(0, -1);
      });
    }, speed);

    return () => {
      if (loopRef.current) window.clearInterval(loopRef.current);
    };
  }, [speed, isPaused, isGameOver, food, score, onScore]);

  function keyboardToDirection(key: string): Direction | null {
    switch (key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        return 'up';
      case 'arrowdown':
      case 's':
        return 'down';
      case 'arrowleft':
      case 'a':
        return 'left';
      case 'arrowright':
      case 'd':
        return 'right';
      default:
        return null;
    }
  }

  function queueDirection(next: Direction) {
    pendingRef.current = next;
  }

  function handleRestart() {
    setSnake(STARTING_SNAKE);
    setFood(randomFood(STARTING_SNAKE));
    setScore(0);
    setSpeed(INITIAL_SPEED);
    directionRef.current = 'right';
    pendingRef.current = 'right';
    setIsGameOver(false);
    setIsPaused(false);
  }

  return (
    <div className="game-wrapper">
      <div className="section-card">
        <div className="score-row">
          <div className="pill">Score: {score}</div>
          <div className="pill">High: {getLocalHighScore()}</div>
        </div>
        <div className="canvas-shell">
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} aria-label="Snake game board" />
        </div>
        <div className="score-row">
          <button className="cta" onClick={() => setIsPaused((p) => !p)} aria-pressed={isPaused}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button className="cta" onClick={handleRestart}>Restart</button>
        </div>
        {isGameOver && <p className="subtle-text">Game over. Tap restart to try again.</p>}
      </div>

      <div className="dpad-grid" aria-label="Directional pad">
        <div className="dpad-button empty" aria-hidden />
        <button className="dpad-button" onClick={() => queueDirection('up')} aria-label="Move up">
          ↑
        </button>
        <div className="dpad-button empty" aria-hidden />
        <button className="dpad-button" onClick={() => queueDirection('left')} aria-label="Move left">
          ←
        </button>
        <div className="dpad-button" onClick={() => queueDirection('down')} aria-label="Move down">
          ↓
        </div>
        <button className="dpad-button" onClick={() => queueDirection('right')} aria-label="Move right">
          →
        </button>
      </div>
    </div>
  );
}

function createSwipeHandler(onDirection: (direction: Direction) => void) {
  let startX = 0;
  let startY = 0;
  return {
    onStart: (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    },
    onMove: () => {},
    onEnd: (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        onDirection(dx > 0 ? 'right' : 'left');
      } else if (Math.abs(dy) > 12) {
        onDirection(dy > 0 ? 'down' : 'up');
      }
    }
  };
}

function isOpposite(a: Direction, b: Direction) {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  );
}

function getLocalHighScore() {
  if (typeof window === 'undefined') return 0;
  const value = window.localStorage.getItem('snake-high-score');
  return value ? Number(value) : 0;
}

function persistHighScore(value: number) {
  if (typeof window === 'undefined') return;
  const current = getLocalHighScore();
  if (value > current) {
    window.localStorage.setItem('snake-high-score', String(value));
  }
}
