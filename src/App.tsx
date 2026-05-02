import React, { useRef, useEffect, useState } from 'react';
// 修正後（type 明示的なインポート）
import { DIFFICULTY_SETTINGS } from './type';
import type { Scene, Difficulty, Piece } from './type';
const PuzzleGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<Scene>('TITLE');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [timeLeft, setTimeLeft] = useState(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  // ゲームロジック用リファレンス（再レンダリングで初期化されないように保持）
  const piecesRef = useRef<Piece[]>([]);
  const draggingPieceRef = useRef<Piece | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // 1. 画像の読み込み処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setImage(img);
      setScene('TITLE');
    };
  };

  // 2. ゲーム開始
  const startGame = () => {
    if (!image || !canvasRef.current) return;

    const config = DIFFICULTY_SETTINGS[difficulty];
    const canvas = canvasRef.current;
    
    // キャンバスサイズ調整
    const scale = Math.min(1, 800 / image.width);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;

    // ピース生成
    const pw = canvas.width / config.cols;
    const ph = canvas.height / config.rows;
    const newPieces: Piece[] = [];

    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        const p: Piece = {
          id: r * config.cols + c,
          x: c * pw, y: r * ph,
          correctX: c * pw, correctY: r * ph,
          width: pw, height: ph,
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20,
          isLocked: false
        };
        newPieces.push(p);
      }
    }
    
    piecesRef.current = newPieces;
    setTimeLeft(config.timeLimit);
    setScene('PLAYING');
  };
  // ★ 最初から始める（リセット）関数を追加
  const resetGame = () => {
    // 全てのステートを初期状態に戻す
    setScene('TITLE');
    setTimeLeft(0);
    setImage(null); // 画像も消す場合。画像を残したいならここは不要
    piecesRef.current = [];
    draggingPieceRef.current = null;
    
    // input要素の値をクリアして再選択できるようにする（任意）
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  // 3. タイマー処理
  useEffect(() => {
    if (scene !== 'PLAYING' || timeLeft <= 0) {
      if (timeLeft === 0 && scene === 'PLAYING') setScene('GAMEOVER');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [scene, timeLeft]);

  // 4. 描画ループ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d')!;

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 背景ガイド
      ctx.globalAlpha = 0.1;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;

      piecesRef.current.forEach(p => {
        // シャッフル・物理挙動
        if (scene === 'PLAYING') {
          p.x += p.vx; p.y += p.vy;
          p.vx *= 0.95; p.vy *= 0.95;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.drawImage(
          image,
          p.correctX * (image.width / canvas.width), p.correctY * (image.height / canvas.height),
          p.width * (image.width / canvas.width), p.height * (image.height / canvas.height),
          0, 0, p.width, p.height
        );
        ctx.strokeStyle = p.isLocked ? "transparent" : "white";
        ctx.strokeRect(0, 0, p.width, p.height);
        ctx.restore();
      });

      if (scene !== 'PLAYING') {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "40px Bold Arial";
        ctx.textAlign = "center";
        const text = scene === 'CLEAR' ? "CLEAR!" : scene === 'GAMEOVER' ? "GAME OVER" : "READY?";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      }

      requestAnimationFrame(update);
    };

    const animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [image, scene]);

  // 5. マウスイベント
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scene !== 'PLAYING') return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (let i = piecesRef.current.length - 1; i >= 0; i--) {
      const p = piecesRef.current[i];
      if (!p.isLocked && mx > p.x && mx < p.x + p.width && my > p.y && my < p.y + p.height) {
        draggingPieceRef.current = p;
        offsetRef.current = { x: mx - p.x, y: my - p.y };
        // 前面に持ってくる
        piecesRef.current.push(piecesRef.current.splice(i, 1)[0]);
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingPieceRef.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    draggingPieceRef.current.x = e.clientX - rect.left - offsetRef.current.x;
    draggingPieceRef.current.y = e.clientY - rect.top - offsetRef.current.y;
  };

  const handleMouseUp = () => {
    const p = draggingPieceRef.current;
    if (!p) return;

    const dist = Math.sqrt((p.x - p.correctX)**2 + (p.y - p.correctY)**2);
    if (dist < 30) {
      p.x = p.correctX;
      p.y = p.correctY;
      p.isLocked = true;
      if (piecesRef.current.every(p => p.isLocked)) setScene('CLEAR');
    }
    draggingPieceRef.current = null;
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div className="controls" style={{ marginBottom: '10px' }}>
        {/* 画像が未選択の時だけファイル選択を表示する、などの制御も可能 */}
        <input type="file" onChange={handleFileChange} />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
          <option value="EASY">Easy</option>
          <option value="NORMAL">Normal</option>
          <option value="HARD">Hard</option>
        </select>
        
        {/* プレイ中やクリア後に「最初から」ボタンを表示 */}
        {scene === 'TITLE' ? (
          <button onClick={startGame} disabled={!image}>Start Game</button>
        ) : (
          <button onClick={resetGame} style={{ marginLeft: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>
            最初から始める
          </button>
        )}
      </div>

      <div style={{ fontSize: '24px', fontWeight: 'bold', color: timeLeft <= 10 ? 'red' : 'white' }}>
        Time: {timeLeft}s
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ border: '2px solid #333', background: '#eee', cursor: 'grab' }}
      />
    </div>
  );
};

export default PuzzleGame;